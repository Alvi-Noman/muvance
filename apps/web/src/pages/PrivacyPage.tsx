import type { ReactNode } from 'react';
import { ShieldCheck } from 'lucide-react';
import { Container } from '@/components/ui/Container';
import { siteConfig } from '@/config/site';
import { PageHero } from '@/features/company';
import { usePageMeta } from '@/hooks/use-page-meta';

const URL = `${siteConfig.url}/privacy`;
const CONTACT = 'privacy@muvance.com';
const UPDATED = '27 November 2026';

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="border-t border-black/5 py-10">
      <h2 className="text-2xl font-semibold tracking-tight text-neutral-950">{title}</h2>
      <div className="mt-4 space-y-4 text-[17px] leading-relaxed text-neutral-600 [&_a]:font-medium [&_a]:text-neutral-950 [&_a]:underline [&_a]:underline-offset-4 [&_li]:pl-1 [&_strong]:font-medium [&_strong]:text-neutral-950 [&_ul]:list-disc [&_ul]:space-y-2 [&_ul]:pl-5">
        {children}
      </div>
    </section>
  );
}

export function PrivacyPage() {
  usePageMeta({
    title: `Privacy policy | ${siteConfig.name}`,
    description:
      'What Muvance collects on muvance.com and in Muvance Chat, why, who it is shared with, and how to ask us to see or delete it.',
    canonical: URL,
  });

  return (
    <>
      <PageHero
        eyebrow="Privacy policy"
        icon={ShieldCheck}
        title={
          <>
            Your information, <em>plainly explained.</em>
          </>
        }
        lead={`What we collect, why, and what you can ask us to do with it. Last updated ${UPDATED}.`}
      />

      <Container className="max-w-3xl pb-24">
        <Section title="Who we are">
          <p>
            Muvance is an eCommerce growth company at House 22, Road 1B, Nikunja 2, Khilkhet, Dhaka
            1229, Bangladesh. This policy covers our website (muvance.com) and the apps we use with
            clients, including Muvance Chat (chat.muvance.com) and Muvance Meet (meet.muvance.com).
            Questions about your information: email <a href={`mailto:${CONTACT}`}>{CONTACT}</a>.
          </p>
        </Section>

        <Section title="What we collect">
          <ul>
            <li>
              <strong>When you book a call:</strong> your name, phone number, business name,
              website, monthly sales and anything you write to us.
            </li>
            <li>
              <strong>When you apply for investment or training:</strong> the details you enter in
              the form.
            </li>
            <li>
              <strong>When you visit the website:</strong> the pages you see and how you use them
              (clicks, scrolling, and what you type into our forms), so we can see what works and
              fix what doesn't. We keep a random visitor ID in your browser to connect pages of the
              same visit.
            </li>
            <li>
              <strong>In Muvance Chat (clients):</strong> your email address, name, company if you
              add it, picture if you add one, and the messages and files you send. If you turn on
              notifications, the address your browser gives us to deliver them.
            </li>
            <li>
              <strong>When you continue with Google:</strong> Google tells us your name and email
              address. We use them only to check that you were invited and to sign you in. We don't
              receive your Google password, contacts, or anything else from your Google account.
            </li>
            <li>
              <strong>In video calls:</strong> the name you join with. Calls may be recorded, and
              everyone in the call can see when they are.
            </li>
          </ul>
        </Section>

        <Section title="How we use it">
          <ul>
            <li>To call you back, answer your messages and do the work you hired us for.</li>
            <li>To sign you in to Muvance Chat and send you sign-in codes and message alerts.</li>
            <li>To see how our website and ads perform, and improve them.</li>
          </ul>
          <p>We never sell your information.</p>
        </Section>

        <Section title="Who we share it with">
          <ul>
            <li>
              <strong>Meta (Facebook and Instagram):</strong> when you visit or book a call, we tell
              Meta about it (with your phone number and name scrambled, or "hashed") so we can
              measure our ads. Meta's own policy covers what Meta does with it, and you can change
              your ad settings in your Facebook or Instagram account.
            </li>
            <li>
              <strong>Brevo:</strong> sends our emails, such as Muvance Chat sign-in codes.
            </li>
            <li>
              <strong>Google:</strong> only if you choose "Continue with Google", to sign you in.
            </li>
            <li>When the law requires it.</li>
          </ul>
          <p>
            Everything else, including chats, files and call recordings, stays on servers we run
            ourselves.
          </p>
        </Section>

        <Section title="Google user data">
          <p>
            Muvance Chat's use of information received from Google APIs adheres to the{' '}
            <a href="https://developers.google.com/terms/api-services-user-data-policy">
              Google API Services User Data Policy
            </a>
            , including the Limited Use requirements. We use only your name and email address, only
            to sign you in, never for advertising, and we don't share them with anyone.
          </p>
        </Section>

        <Section title="How long we keep it">
          <ul>
            <li>
              Booking and application details: as long as we work together, or until you ask us to
              delete them.
            </li>
            <li>
              Chat messages and files: until you or we remove them, or your access ends and you ask
              us to delete them.
            </li>
            <li>Sign-in codes: 10 minutes. Call recordings: at most 180 days.</li>
          </ul>
        </Section>

        <Section title="Your choices">
          <p>
            You can ask to see the information we have about you, correct it, or delete it. Email{' '}
            <a href={`mailto:${CONTACT}`}>{CONTACT}</a> and we will reply within 30 days. You can
            also block cookies in your browser; the website still works.
          </p>
        </Section>

        <Section title="Keeping it safe">
          <p>
            Everything travels over an encrypted connection (HTTPS), passwords are stored only in a
            scrambled form, and only our team can open our admin tools.
          </p>
        </Section>

        <Section title="Changes">
          <p>If we change this policy, we will update it here and change the date at the top.</p>
        </Section>
      </Container>
    </>
  );
}
