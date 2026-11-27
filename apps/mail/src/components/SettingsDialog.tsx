import { useRef, useState, type FormEvent } from 'react';
import { Camera } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { accountsUrl } from '@/lib/account';
import { api, errorMessage } from '@/lib/api';
import { squareAvatar } from '@/lib/avatar-image';
import { useMail } from '@/pages/MailApp';
import { Avatar, Button, Dialog, Spinner } from './ui';

export function SettingsDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { me, toast } = useMail();
  const queryClient = useQueryClient();
  // Which of your addresses you're editing (your own, or a shared one like hr@).
  const [editing, setEditing] = useState(me.address);
  const identity = me.identities.find((i) => i.address === editing) ?? me.identities[0]!;
  const [displayName, setDisplayName] = useState(identity.name);
  const [signature, setSignature] = useState(identity.signature);
  const pick = (address: string) => {
    const next = me.identities.find((i) => i.address === address);
    if (!next) return;
    setEditing(address);
    setDisplayName(next.name);
    setSignature(next.signature);
  };
  const [busy, setBusy] = useState<'profile' | 'picture' | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);

  const changePicture = async (file: File | undefined) => {
    if (!file) return;
    setBusy('picture');
    try {
      await api.put('/avatar', { image: await squareAvatar(file) });
      await queryClient.invalidateQueries({ queryKey: ['me'] });
      await queryClient.invalidateQueries({ queryKey: ['team-avatars'] });
      toast('Picture updated');
    } catch (error) {
      toast(errorMessage(error));
    } finally {
      setBusy(null);
    }
  };

  const removePicture = async () => {
    setBusy('picture');
    try {
      await api.delete('/avatar');
      await queryClient.invalidateQueries({ queryKey: ['me'] });
      await queryClient.invalidateQueries({ queryKey: ['team-avatars'] });
    } catch (error) {
      toast(errorMessage(error));
    } finally {
      setBusy(null);
    }
  };

  const saveProfile = async (e: FormEvent) => {
    e.preventDefault();
    setBusy('profile');
    try {
      await api.put('/identities', { address: editing, name: displayName, signature });
      await queryClient.invalidateQueries({ queryKey: ['me'] });
      toast('Saved');
    } catch (error) {
      toast(errorMessage(error));
    } finally {
      setBusy(null);
    }
  };

  const field =
    'mt-1.5 w-full rounded-xl border border-line bg-white px-3.5 py-2.5 text-sm outline-none transition focus:border-ink focus:ring-4 focus:ring-black/5';

  return (
    <Dialog open={open} onClose={onClose} title="Settings">
      <div className="mb-6 flex items-center gap-4">
        <button
          type="button"
          onClick={() => fileInput.current?.click()}
          className="group relative rounded-full"
          aria-label="Change picture"
        >
          <Avatar
            name={me.displayName}
            seed={me.address}
            src={me.avatarUrl}
            className="size-16 text-lg"
          />
          <span className="absolute inset-0 flex items-center justify-center rounded-full bg-black/45 text-white opacity-0 transition group-hover:opacity-100">
            {busy === 'picture' ? <Spinner /> : <Camera className="size-5" />}
          </span>
        </button>
        <div>
          <p className="text-sm font-medium">Profile picture</p>
          <p className="text-xs text-muted">Your team sees it next to your mail.</p>
          <div className="mt-2 flex gap-2">
            <Button
              variant="secondary"
              className="h-8 px-3"
              onClick={() => fileInput.current?.click()}
              disabled={busy === 'picture'}
            >
              {me.avatarUrl ? 'Change' : 'Upload'}
            </Button>
            {me.avatarUrl && (
              <Button
                variant="ghost"
                className="h-8 px-3"
                onClick={() => void removePicture()}
                disabled={busy === 'picture'}
              >
                Remove
              </Button>
            )}
          </div>
        </div>
        <input
          ref={fileInput}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          hidden
          onChange={(e) => {
            void changePicture(e.target.files?.[0]);
            e.target.value = '';
          }}
        />
      </div>

      <form onSubmit={saveProfile} className="space-y-4">
        {me.identities.length > 1 && (
          <div>
            <p className="text-sm font-medium">Your addresses</p>
            <p className="text-xs text-muted">
              Each has its own name and signature. Choose one to edit.
            </p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {me.identities.map((i) => (
                <button
                  key={i.address}
                  type="button"
                  onClick={() => pick(i.address)}
                  className={
                    i.address === editing
                      ? 'rounded-full bg-ink px-3 py-1.5 text-xs font-medium text-white'
                      : 'rounded-full border border-line px-3 py-1.5 text-xs hover:bg-canvas'
                  }
                >
                  {i.address}
                </button>
              ))}
            </div>
          </div>
        )}
        <label className="block text-sm font-medium">
          {identity.primary ? 'Your name, as people see it' : `Name for ${identity.address}`}
          <input
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            className={field}
            maxLength={80}
          />
        </label>
        <label className="block text-sm font-medium">
          Signature
          <textarea
            value={signature}
            onChange={(e) => setSignature(e.target.value)}
            rows={4}
            placeholder={
              identity.primary ? 'Alvi Noman\nMuvance · muvance.com' : 'Muvance HR\nmuvance.com'
            }
            className={`${field} resize-none`}
          />
          <span className="mt-1 block text-xs font-normal text-muted">
            Added to new messages and replies.
          </span>
        </label>
        <div className="flex justify-end">
          <Button type="submit" disabled={busy === 'profile'}>
            Save
          </Button>
        </div>
      </form>

      <div className="mt-6 flex items-center justify-between gap-4 border-t border-line pt-6">
        <div>
          <h3 className="text-sm font-semibold">Password</h3>
          <p className="text-xs text-muted">
            Your Muvance account password: the same for Mail, Chat, Meet and your phone.
          </p>
        </div>
        <a href={accountsUrl()}>
          <Button type="button" variant="secondary">
            Change it
          </Button>
        </a>
      </div>

      <div className="mt-6 rounded-xl bg-canvas p-4 text-[13px] text-muted">
        <p className="font-medium text-ink">Phone and computer mail apps</p>
        <p className="mt-1">
          Incoming: <span className="font-mono">mail.muvance.com</span>, IMAP, port 993, SSL.
          Outgoing: <span className="font-mono">mail.muvance.com</span>, port 465, SSL. Username:{' '}
          {me.address}.
        </p>
      </div>
    </Dialog>
  );
}
