import request from 'supertest';
import { describe, expect, it } from 'vitest';
import type {
  MailAccountDto,
  MailAccountsDto,
  WebmailContact,
  WebmailMeDto,
  WebmailTeamAvatars,
} from '@muvance/shared';
import { collections } from '@/db/client';
import { app, muvancePerson, signedIn } from './helpers';

/** A person with Mail, signed in to their Muvance account; and the admin who added them. */
async function newMailbox(localPart: string) {
  const { agent: admin } = await signedIn('admin');
  const { agent: web } = await muvancePerson(admin, localPart);
  const user = await collections.users().findOne({ usernameKey: localPart.toLowerCase() });
  const list = (await admin.get('/api/mail-accounts')).body as MailAccountsDto;
  const account = list.accounts.find((m) => m.id === user!.mailAccountId!.toHexString())!;
  return { admin, account, web };
}

describe('Muvance Mail', () => {
  it('opens with the Muvance account sign-in', async () => {
    const { web } = await newMailbox('sara');
    const me = (await web.get('/api/webmail/me')).body as WebmailMeDto;
    expect(me.address).toBe('sara@muvance.com');
    expect(me.displayName).toBe('Sara Khan');

    // An account without Mail can't open it; signed out, nobody can.
    const { agent: noMail } = await signedIn('owner');
    expect((await noMail.get('/api/webmail/me')).status).toBe(403);
    expect((await request(app).get('/api/webmail/me')).status).toBe(401);
    // Mail's own sign-in is gone.
    expect(
      (await request(app).post('/api/webmail/login').send({ email: 'sara', password: 'x' })).status,
    ).toBe(401);

    await web.post('/api/auth/logout');
    expect((await web.get('/api/webmail/me')).status).toBe(401);
  });

  it('saves the display name and signature', async () => {
    const { web } = await newMailbox('lina');
    expect(
      (
        await web
          .put('/api/webmail/settings')
          .send({ displayName: 'Lina K.', signature: '<p>Lina</p>' })
      ).status,
    ).toBe(204);
    const me = (await web.get('/api/webmail/me')).body as WebmailMeDto;
    expect(me).toMatchObject({ displayName: 'Lina K.', signature: '<p>Lina</p>' });
  });

  it('suggests teammates as recipients', async () => {
    const { web } = await newMailbox('aria');
    await newMailbox('omar2');
    const found = (await web.get('/api/webmail/contacts?q=omar')).body as WebmailContact[];
    expect(found.map((c) => c.address)).toContain('omar2@muvance.com');
  });

  it('profile pictures: admins set them, people change their own, teammates see them', async () => {
    // A real 1x1 PNG.
    const png =
      'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';
    const { admin, account, web } = await newMailbox('pia');
    expect(account.avatarUrl).toBeNull();

    // Admin sets it.
    const set = await admin.put(`/api/mail-accounts/${account.id}/avatar`).send({ image: png });
    expect(set.status).toBe(200);
    const url = (set.body as MailAccountDto).avatarUrl!;
    expect(url).toMatch(/\/avatar\?v=\d+$/);
    const img = await admin.get(url);
    expect(img.status).toBe(200);
    expect(img.headers['content-type']).toBe('image/png');

    // A file that only claims to be a picture is refused.
    const fake =
      'data:image/png;base64,' + Buffer.from('<script>alert(1)</script>').toString('base64');
    expect(
      (await admin.put(`/api/mail-accounts/${account.id}/avatar`).send({ image: fake })).status,
    ).toBe(400);

    // The person sees it, and can remove or replace it.
    const me = (await web.get('/api/webmail/me')).body as WebmailMeDto;
    expect(me.avatarUrl).toMatch(/^\/api\/webmail\/avatars\/pia%40muvance\.com\?v=/);
    expect((await web.get(me.avatarUrl!)).status).toBe(200);
    expect((await web.delete('/api/webmail/avatar')).status).toBe(204);
    expect(((await web.get('/api/webmail/me')).body as WebmailMeDto).avatarUrl).toBeNull();
    expect((await web.put('/api/webmail/avatar').send({ image: png })).status).toBe(204);

    // A realistic picture (~150 KB as base64) gets through; the general 100 KB limit doesn't apply.
    const big =
      'data:image/png;base64,' +
      Buffer.concat([
        Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
        Buffer.alloc(110_000),
      ]).toString('base64');
    expect((await web.put('/api/webmail/avatar').send({ image: big })).status).toBe(204);

    // Teammates get everyone's pictures; strangers get nothing.
    const { web: mate } = await newMailbox('quinn');
    const team = (await mate.get('/api/webmail/team-avatars')).body as WebmailTeamAvatars;
    expect(Object.keys(team)).toContain('pia@muvance.com');
    expect((await request(app).get('/api/webmail/team-avatars')).status).toBe(401);
  });

  it('lists the addresses you can send as, each with its own name, and only those', async () => {
    const { admin, account, web } = await newMailbox('cara');
    await admin.patch(`/api/mail-accounts/${account.id}`).send({ senderName: 'Cara from Muvance' });
    await admin
      .post('/api/mail-addresses')
      .send({ localPart: 'accounts', displayName: 'Muvance Accounts', ownerIds: [account.id] });
    const other = await newMailbox('dev');
    await admin
      .post('/api/mail-addresses')
      .send({ localPart: 'careers', displayName: 'Muvance Careers', ownerIds: [other.account.id] });

    const me = (await web.get('/api/webmail/me')).body as WebmailMeDto;
    expect(me.identities.map((i) => [i.address, i.name, i.primary])).toEqual([
      ['cara@muvance.com', 'Cara from Muvance', true],
      ['accounts@muvance.com', 'Muvance Accounts', false],
    ]);

    // She can rename and sign each of her addresses, but not someone else's.
    expect(
      (
        await web.put('/api/webmail/identities').send({
          address: 'accounts@muvance.com',
          name: 'Muvance Billing',
          signature: 'Billing team',
        })
      ).status,
    ).toBe(204);
    expect(
      (
        await web
          .put('/api/webmail/identities')
          .send({ address: 'careers@muvance.com', name: 'X', signature: '' })
      ).status,
    ).toBe(403);
    const after = (await web.get('/api/webmail/me')).body as WebmailMeDto;
    expect(after.identities[1]).toMatchObject({
      name: 'Muvance Billing',
      signature: 'Billing team',
    });

    // Sending as an address that isn't hers is refused before anything is sent.
    const send = await web.post('/api/webmail/send').send({
      from: 'careers@muvance.com',
      to: ['x@example.com'],
      subject: 'Hi',
      html: '<p>Hi</p>',
    });
    expect(send.status).toBe(403);
  });
});
