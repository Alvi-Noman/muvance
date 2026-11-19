import {
  Callout,
  FaqList,
  InlineCta,
  KeyTakeaways,
  Lead,
  Prose,
  Section,
  Steps,
} from '../../components/article';
import { Checklist } from '../../components/viz';

export function Body() {
  return (
    <>
      <Lead>
        Few things stop a store faster than the message &quot;Your ad account has been
        restricted&quot;. Sales drop overnight. Here is what to do, calmly and in the right order.
      </Lead>
      <Prose>
        <p>
          Restrictions happen for many reasons: a policy issue in an ad, a payment problem, a
          security flag on someone’s profile, or sometimes an automated mistake. The steps below
          cover the common cases.
        </p>
      </Prose>

      <div className="mt-10">
        <KeyTakeaways
          items={[
            'Find out exactly what is restricted: an ad, the account, a profile or the page.',
            'Read the reason in Account Quality before doing anything else.',
            'Request a review once, clearly and honestly. Do not spam appeals.',
            'Prevention is cheaper: clean ads, a backup admin, and a healthy payment method.',
          ]}
        />
      </div>

      <Section id="first" n={1} title="First, find out what is actually restricted">
        <Steps
          steps={[
            {
              title: 'Open Account Quality',
              body: 'It lists every restricted asset and the reason Meta gives.',
            },
            {
              title: 'Check which asset',
              body: 'An ad, an ad account, a person’s profile, the page or the whole Business Portfolio. Each has a different fix.',
            },
            {
              title: 'Note the policy named',
              body: 'For example, prohibited content, payment issues or unusual activity.',
            },
          ]}
        />
      </Section>

      <Section id="fix" n={2} title="Fix the cause, then ask for a review">
        <Steps
          steps={[
            {
              title: 'For a rejected ad',
              body: 'Edit the ad to remove the problem (claims, before-and-after images, wording) or request a review if you believe it was a mistake.',
            },
            {
              title: 'For a payment problem',
              body: 'Pay any balance, update the card, and make sure billing details match.',
            },
            {
              title: 'For a profile security flag',
              body: 'Confirm identity, turn on two-factor authentication and check recent logins.',
            },
            {
              title: 'For the ad account',
              body: 'Use the review request in Account Quality. Explain briefly and honestly. One request is enough.',
            },
          ]}
        />
        <Callout tone="warning" title="Do not create new accounts to get around it">
          Opening fresh accounts to dodge a restriction can get the whole business banned. Fix the
          cause and use the official review.
        </Callout>
      </Section>

      <Section id="prevent" n={3} title="How to avoid it next time">
        <Checklist
          items={[
            'Two-factor authentication on every admin profile',
            'At least two admins from my own team',
            'Ads avoid health claims and before-and-after images',
            'Landing pages match what the ads promise',
            'A payment method that rarely fails',
          ]}
          verdicts={[
            'High risk. Fix these first.',
            'Some risk. Close the gaps.',
            'Low risk. Well protected.',
          ]}
        />
      </Section>

      <InlineCta
        title="Stuck with a restriction?"
        body="Book a free call. We will look at what happened and help you plan the cleanest way back."
      />

      <Section id="faq" n={4} title="Things people ask us">
        <FaqList
          items={[
            {
              q: 'How long does a review take?',
              a: 'It varies from hours to weeks. Keep other sales channels running in the meantime.',
            },
            {
              q: 'Can an agency get my account back faster?',
              a: 'Nobody can guarantee that. Be careful with anyone who sells "unban" services.',
            },
          ]}
        />
      </Section>
    </>
  );
}
