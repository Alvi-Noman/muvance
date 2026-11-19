import { Link } from 'react-router';
import {
  Callout,
  FaqList,
  Figure,
  InlineCta,
  KeyTakeaways,
  Lead,
  Prose,
  Section,
  Steps,
} from '../../components/article';
import { Checklist, Flow } from '../../components/viz';

export function Body() {
  return (
    <>
      <Lead>
        Your first real Meta campaign does not need to be clever. It needs to be set up so it can
        learn, and so you can tell whether it worked. Here is a simple, honest way to do it.
      </Lead>
      <Prose>
        <p>
          This is written for a Bangladeshi online store running its first proper sales campaign,
          not boosted posts. It assumes you have a product people already want and a way to take
          orders, ideally a website.
        </p>
      </Prose>

      <div className="mt-10">
        <KeyTakeaways
          items={[
            'Set up tracking before you spend a single taka.',
            'Use a Sales campaign with the Purchase event as the goal.',
            'Start simple: one campaign, broad audience, three to five different ads.',
            'Do not judge or change anything for the first few days.',
          ]}
        />
      </div>

      <Section id="before" n={1} title="Before you start">
        <Checklist
          items={[
            'I have a Business Portfolio and ad account in my own name',
            'My Pixel is installed and fires a Purchase event',
            'Conversions API is set up (or planned)',
            'I know my profit per order before ads',
            'I have at least three different ads ready',
          ]}
          verdicts={[
            'Hold off. Fix the basics first.',
            'Nearly ready. Close the gaps.',
            'Ready to launch.',
          ]}
        />
        <p>
          If tracking is new to you, read{' '}
          <Link to="/blog/meta-pixel-conversions-api-setup">
            how to set up Pixel and Conversions API
          </Link>{' '}
          first.
        </p>
      </Section>

      <Section id="setup" n={2} title="Setting up the campaign">
        <Figure title="The simple first structure" example={false}>
          <Flow
            nodes={[
              { title: 'Campaign', body: 'Objective: Sales' },
              { title: 'Ad set', body: 'Purchase event, Bangladesh, broad audience' },
              { title: 'Ads', body: '3–5 genuinely different ads', highlight: true },
            ]}
          />
        </Figure>
        <Steps
          steps={[
            {
              title: 'Choose Sales as the objective',
              body: 'Not Traffic or Engagement. You want buyers, not clickers.',
            },
            { title: 'Pick the Purchase event', body: 'Meta will look for people likely to buy.' },
            {
              title: 'Keep the audience broad',
              body: 'Country, age range if your product needs it. Let the ads do the targeting.',
            },
            {
              title: 'Leave placements on automatic',
              body: 'Meta will find the cheapest places to show your ads.',
            },
            {
              title: 'Add different ads',
              body: 'A video, a photo and a carousel, each with a different angle.',
            },
          ]}
        />
      </Section>

      <Section id="budget" n={3} title="How much to spend at first">
        <p>
          A rough rule: enough per day to get a few purchases a week, so Meta has something to learn
          from. If you are unsure, our guide on{' '}
          <Link to="/blog/how-much-to-spend-on-meta-ads-per-day">daily budgets for new brands</Link>{' '}
          walks through the maths.
        </p>
        <Callout tone="warning" title="Do not touch it for a few days">
          Every big edit restarts learning. Give a new campaign at least three to four days before
          you change budgets or turn ads off.
        </Callout>
      </Section>

      <Section id="read" n={4} title="Reading the first results">
        <ul>
          <li>
            <strong>Cost per purchase:</strong> is it below your profit per order?
          </li>
          <li>
            <strong>Click-through rate:</strong> are people interested in the ad at all?
          </li>
          <li>
            <strong>Add to carts vs purchases:</strong> if many add but few buy, the problem is your
            page or price, not the ad.
          </li>
        </ul>
      </Section>

      <InlineCta
        title="Want a second pair of eyes before launch?"
        body="Book a free call. We will check your setup and tell you what we would change before you spend."
      />

      <Section id="faq" n={5} title="Things people ask us">
        <FaqList
          items={[
            {
              q: 'Can I run Meta ads without a website?',
              a: 'Yes, with message ads to Messenger or WhatsApp. But tracking sales is harder, so a simple website is worth it as you grow.',
            },
            {
              q: 'Should I target interests as a beginner?',
              a: 'You can, but broad targeting with good creative usually does as well or better now. Start broad, then test.',
            },
            {
              q: 'How many ads should I start with?',
              a: 'Three to five genuinely different ones. Small changes to the same ad do not teach you much.',
            },
          ]}
        />
      </Section>
    </>
  );
}
