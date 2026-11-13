import {
  Callout,
  CompareTable,
  FaqList,
  Figure,
  InlineCta,
  KeyTakeaways,
  Lead,
  Prose,
  Section,
  Steps,
} from '../../components/article';
import { Checklist, LineChart, Versus } from '../../components/viz';

export function Body() {
  return (
    <>
      <Lead>
        Advantage+ promises to do the media buyer’s job automatically. Sometimes it does it better.
        Sometimes it quietly spends your budget on the wrong people. Here’s how to tell.
      </Lead>
      <Prose>
        <p>
          <strong>Advantage+ sales campaigns</strong> (once called Advantage+ shopping campaigns)
          hand most decisions to Meta: who sees the ads, where they appear, and how the budget is
          spread. <strong>Manual campaigns</strong> let you set those yourself. Meta keeps folding
          more automation into its standard setup, so the menus in your account may look slightly
          different, but the choice underneath is the same: control versus automation.
        </p>
      </Prose>

      <div className="mt-10">
        <KeyTakeaways
          items={[
            'Advantage+ automates audience, placements and budget. You mostly control creative and the offer.',
            'It tends to win for eCommerce brands with steady purchase data and plenty of varied creative.',
            'Manual still wins when you need tight control: new accounts, strict geography, separate offers.',
            'Never switch everything at once. Run a fair side-by-side test for at least two weeks.',
          ]}
        />
      </div>

      <Section id="difference" n={1} title="What you control in each">
        <CompareTable
          columns={['', 'Advantage+ sales', 'Manual campaign']}
          rows={[
            [
              'Audience',
              'Automatic, with optional suggestions',
              'You choose, from broad to detailed',
            ],
            [
              'Placements',
              'Automatic across Facebook, Instagram and more',
              'Automatic or chosen by you',
            ],
            ['Ad sets', 'Simplified structure', 'As many as you build'],
            [
              'Existing customers',
              'You can cap spend on them or define them',
              'Include or exclude with audiences',
            ],
            [
              'Creative',
              'You supply it; enhancements optional',
              'You supply it; enhancements optional',
            ],
            ['Learning speed', 'Fast: data stays in one place', 'Depends on how you split budget'],
          ]}
        />
      </Section>

      <Section id="when" n={2} title="When each one wins">
        <Figure title="Choose by your situation" example={false}>
          <Versus
            left={{
              title: 'Manual is better when…',
              points: [
                'Your pixel has few purchases so far',
                'You sell only in certain districts or cities',
                'You run different offers that must not mix',
                'You need clean tests of one audience against another',
              ],
            }}
            right={{
              title: 'Advantage+ is better when…',
              points: [
                'You get steady purchases every week',
                'You have many different creative concepts',
                'You sell nationwide or broadly',
                'You want less day-to-day management',
              ],
            }}
          />
        </Figure>
      </Section>

      <Section id="results" n={3} title="What a typical head-to-head looks like">
        <p>
          Automated campaigns usually start uneven while they explore, then settle. That’s why
          judging after three days leads to the wrong answer.
        </p>
        <Figure
          title="Cost per purchase over four weeks"
          caption="Advantage+ starts higher, then often settles lower once it has learned. Your result may differ, which is exactly why you test."
        >
          <LineChart
            labels={['Week 1', 'Week 2', 'Week 3', 'Week 4']}
            series={[
              { name: 'Manual', values: [560, 570, 585, 600], tone: 'warm' },
              { name: 'Advantage+', values: [650, 560, 500, 480], tone: 'ink' },
            ]}
            format={(v) => `৳${Math.round(v)}`}
            yMin={350}
            yMax={750}
          />
        </Figure>
      </Section>

      <Section id="watch" n={4} title="What to watch inside Advantage+">
        <ul>
          <li>
            <strong>Existing customers.</strong> Automation loves people who already know you,
            because they buy easily. If you want growth, check how much spend goes to existing
            customers and cap it if needed.
          </li>
          <li>
            <strong>Placements.</strong> Look at the breakdown by placement. If a placement eats
            budget with no sales, raise it with your creative (formats that suit it) before
            excluding it.
          </li>
          <li>
            <strong>Creative concentration.</strong> Spend often piles onto one ad. That’s fine
            while it works; keep new concepts coming so there’s a replacement when it tires.
          </li>
        </ul>
        <Callout tone="warning">
          Automation can only optimise for what you measure. If your Purchase event counts fake or
          cancelled COD orders, Advantage+ will happily find more of them.
        </Callout>
      </Section>

      <Section id="test" n={5} title="How to test it fairly">
        <Steps
          steps={[
            {
              title: 'Pick your best current campaign',
              body: 'That’s the benchmark Advantage+ has to beat.',
            },
            {
              title: 'Use the same creative and budget',
              body: 'Copy your best ads into the Advantage+ campaign so you test the setup, not the ads.',
            },
            {
              title: 'Split the audience properly',
              body: 'Use Meta’s A/B test or comparison tools so the two don’t bid against each other.',
            },
            {
              title: 'Run at least 14 days',
              body: 'Long enough for learning, and for both weekday and weekend patterns.',
            },
            {
              title: 'Decide on business results',
              body: 'Cost per purchase, new customers and MER, not on clicks or CPM.',
            },
          ]}
        />
      </Section>

      <Section id="ready" n={6} title="Is your account ready?">
        <Figure title="Tick what is true for you" example={false}>
          <Checklist
            items={[
              'At least 50 purchases a month from ads',
              'Conversions API set up and deduplicated',
              'At least 8 different ads ready to use',
              'One main offer across the store',
              'You sell across most of the country',
              'You can leave the campaign alone for 2 weeks',
            ]}
            verdicts={[
              'Stay manual for now and build data and creative first.',
              'You can test Advantage+, but keep your manual campaign running.',
              'You’re a strong fit. Advantage+ is well worth testing.',
            ]}
          />
        </Figure>
      </Section>

      <InlineCta
        title="Not sure which setup fits your store?"
        body="On a free call we look at your data, creative and offers, and recommend a structure you can test."
      />

      <Section id="faq" n={7} title="Things people ask us">
        <FaqList
          items={[
            {
              q: 'Can I run Advantage+ and manual campaigns together?',
              a: 'Yes, many brands do: Advantage+ for the bulk of spend, and a smaller manual campaign for tests or specific offers. Watch that they aren’t chasing the same small audience.',
            },
            {
              q: 'Can I exclude a city or district?',
              a: 'You can set locations, but fine control is limited compared with manual campaigns. If geography matters a lot (for example delivery zones), manual may be simpler.',
            },
            {
              q: 'Does Advantage+ work with a small budget?',
              a: 'It can, but small budgets give it little data to learn from. Make sure the budget can buy at least several purchases a week.',
            },
          ]}
        />
      </Section>
    </>
  );
}
