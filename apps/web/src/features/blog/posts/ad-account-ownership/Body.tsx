import {
  Callout,
  FaqList,
  InlineCta,
  KeyTakeaways,
  Lead,
  Prose,
  PullQuote,
  Section,
  Steps,
} from '../../components/article';
import { Checklist } from '../../components/viz';

export function Body() {
  return (
    <>
      <Lead>
        It happens more than you would think: a store parts ways with its freelancer or agency, and
        discovers the ad account, the Pixel and sometimes even the Facebook page are not theirs.
      </Lead>
      <Prose>
        <p>
          Months of data, audiences and ad history can vanish overnight. The fix is simple, and it
          takes about twenty minutes. Do it before you need it.
        </p>
      </Prose>

      <div className="mt-10">
        <KeyTakeaways
          items={[
            'Your business should own its Business Portfolio, ad account, Pixel and page.',
            'Agencies should get partner access, not ownership.',
            'Keep at least two trusted admins from your own team.',
            'Check access every few months, and remove people who have left.',
          ]}
        />
      </div>

      <Section id="what" n={1} title="What you should own">
        <ul>
          <li>
            <strong>Business Portfolio</strong> (formerly Business Manager): the home for everything
            else.
          </li>
          <li>
            <strong>Ad account:</strong> holds your campaigns, history and payment method.
          </li>
          <li>
            <strong>Pixel / dataset:</strong> years of learning about who buys from you.
          </li>
          <li>
            <strong>Facebook page and Instagram account:</strong> your audience and reviews.
          </li>
          <li>
            <strong>Product catalogue and domain:</strong> needed for catalogue ads and tracking.
          </li>
        </ul>
        <Callout tone="warning" title="If someone else created them">
          If a freelancer or agency created any of these in their own portfolio, ask them to
          transfer ownership to yours now, while the relationship is good.
        </Callout>
      </Section>

      <PullQuote>Give partners access. Never give away ownership.</PullQuote>

      <Section id="how" n={2} title="How to give an agency access the right way">
        <Steps
          steps={[
            {
              title: 'Create your own Business Portfolio',
              body: 'Use a real person’s profile from your team, with two-factor authentication on.',
            },
            {
              title: 'Add a second admin',
              body: 'Another trusted person from your business, so you are never locked out.',
            },
            {
              title: 'Add the agency as a partner',
              body: 'Share only the assets they need (ad account, Pixel, page) with the right permission level.',
            },
            {
              title: 'Keep the payment method yours',
              body: 'Your card or billing on your ad account means the account stays yours.',
            },
          ]}
        />
      </Section>

      <Section id="check" n={3} title="Five-minute ownership check">
        <Checklist
          items={[
            'The Business Portfolio is in my company’s name',
            'At least two people from my team are admins',
            'The ad account belongs to my portfolio',
            'The Pixel belongs to my portfolio',
            'Agencies have partner access, not ownership',
          ]}
          verdicts={[
            'Fix this today. Your data is at risk.',
            'Mostly fine. Close the gaps.',
            'You are protected.',
          ]}
        />
      </Section>

      <InlineCta
        title="Everything stays in your name"
        body="Your ad account, Pixel and page should always stay in your name. Book a free call and we will check your setup with you."
      />

      <Section id="faq" n={4} title="Things people ask us">
        <FaqList
          items={[
            {
              q: 'Can I move a Pixel to my own Business Portfolio?',
              a: 'The owner can share it with your portfolio or transfer it. Ask them to do it before you end the relationship.',
            },
            {
              q: 'What if my freelancer will not give access back?',
              a: 'You can create a new ad account and Pixel, but you lose the history. That is why it is worth checking now.',
            },
          ]}
        />
      </Section>
    </>
  );
}
