import {
  Callout,
  CompareTable,
  FaqList,
  Figure,
  InlineCta,
  KeyTakeaways,
  Lead,
  Prose,
  PullQuote,
  Section,
  Steps,
} from '../../components/article';
import { Checklist, Versus } from '../../components/viz';

export function Body() {
  return (
    <>
      <Lead>
        Hiring someone to run your ads means handing them your money and your growth. A bad choice
        doesn’t just waste the fee. It wastes months. Here’s what to check first.
      </Lead>
      <Prose>
        <p>
          Yes, we’re an agency, so take this with whatever pinch of salt you like. But these are the
          same questions we’d want a friend to ask before hiring anyone, including us. A good agency
          or freelancer will be happy to answer all of them.
        </p>
      </Prose>

      <div className="mt-10">
        <KeyTakeaways
          items={[
            'Make sure you own the ad account, Pixel and Business Manager. Always.',
            'Ask what they will be paid for, and what target they commit to.',
            'Look for clear reporting on real sales, not just clicks and reach.',
            'Start with a trial period, and avoid long lock-in contracts.',
          ]}
        />
      </div>

      <Section id="options" n={1} title="Agency, freelancer or in-house?">
        <CompareTable
          columns={['', 'Freelancer', 'Agency']}
          rows={[
            ['Cost', 'Usually lowest', 'Higher, or performance-based'],
            [
              'Skills',
              'Often one person, one skill set',
              'Media buying, creative and tracking together',
            ],
            ['Availability', 'Depends on one person', 'A team covers holidays and sickness'],
            [
              'Best for',
              'Small budgets, simple setups',
              'Growing brands that need creative and scale',
            ],
          ]}
        />
        <p>
          Building an in-house team is the third option. It gives you the most control, but it’s
          slow and expensive to hire for every skill, so most brands do it later.
        </p>
      </Section>

      <Section id="flags" n={2} title="Green flags and red flags">
        <Figure title="What to look for in the first conversation" example={false}>
          <Versus
            left={{
              title: 'Red flags',
              points: [
                'Wants to run ads from their own ad account',
                'Promises a specific ROAS before seeing your numbers',
                'Reports only reach, clicks and "engagement"',
                'Long contracts with big upfront fees',
                'Can’t explain what they’ll do in plain words',
              ],
            }}
            right={{
              title: 'Green flags',
              points: [
                'Asks about your margins, stock and delivery first',
                'Works in your ad account and gives you full access',
                'Talks about tracking before scaling',
                'Agrees clear targets and how they will be measured',
                'Explains their plan simply and honestly',
              ],
            }}
          />
        </Figure>
        <Callout tone="warning">
          Be very wary of anyone who wants to use their own ad account or Business Manager &quot;to
          make it easier&quot;. If you part ways, you can lose your ad history, Pixel data and
          audiences.
        </Callout>
      </Section>

      <PullQuote>
        The best question to ask any agency: &quot;What exactly do you get paid for?&quot;
      </PullQuote>

      <Section id="trial" n={3} title="How to structure a fair trial">
        <Steps
          steps={[
            {
              title: 'Give access, keep ownership',
              body: 'Add them as a partner to your Business Manager. Never hand over the account itself.',
            },
            {
              title: 'Agree a target in writing',
              body: 'A sales or cost-per-purchase target, measured from your store, not just Ads Manager.',
            },
            {
              title: 'Set a trial period',
              body: 'Long enough to see real results, typically one to three months.',
            },
            {
              title: 'Weekly check-ins',
              body: 'Short updates: what was tested, what was learned, what’s next.',
            },
            {
              title: 'Review honestly at the end',
              body: 'Did they hit the target? Did you learn things about your own business? Decide from there.',
            },
          ]}
        />
      </Section>

      <Section id="questions" n={4} title="Questions to ask before you sign">
        <Figure title="Tick the ones they answered clearly" example={false}>
          <Checklist
            items={[
              'Will we use my ad account and Business Manager?',
              'What will you be paid for?',
              'What target will you commit to?',
              'How will results be measured?',
              'Who will actually work on my account?',
              'How often will we talk, and how?',
              'What happens if targets are missed?',
              'How much notice to end the contract?',
            ]}
            verdicts={[
              'Too many unanswered questions. Keep looking, or push for clear answers.',
              'Promising. Get the rest in writing.',
              'They’re being open with you. That’s a good sign.',
            ]}
          />
        </Figure>
      </Section>

      <InlineCta
        title={
          <>
            Ask us all of these. <em>We’d like that.</em>
          </>
        }
        body="We work in your ad account, agree a sales target upfront, and only get paid when you hit it. Book a free call."
      />

      <Section id="faq" n={5} title="Things people ask us">
        <FaqList
          items={[
            {
              q: 'How do I give someone access without giving away my account?',
              a: 'In Meta Business Settings, add them as a partner, or add people with specific permissions. You stay the owner.',
            },
            {
              q: 'Should I pay for ads through the agency?',
              a: 'We’d recommend paying Meta directly from your own ad account. It’s more transparent and keeps the account in your name.',
            },
            {
              q: 'How long before I should see results?',
              a: 'Some improvements, like tracking fixes, show quickly. Proper testing and scaling usually takes a few weeks to a couple of months. Be wary of anyone promising overnight results.',
            },
          ]}
        />
      </Section>
    </>
  );
}
