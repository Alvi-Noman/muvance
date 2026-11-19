import { Link } from 'react-router';
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
        Search &quot;digital marketing agency Bangladesh&quot; and you will find hundreds. Most of
        them promise the same things: more reach, more sales, a dedicated team. So how do you pick
        one that will actually grow an online store?
      </Lead>
      <Prose>
        <p>
          We run an agency, so take this with the right pinch of salt. But the checks below are the
          same ones we would use if we were hiring someone to run ads for our own money. None of
          them depend on choosing us.
        </p>
      </Prose>

      <div className="mt-10">
        <KeyTakeaways
          items={[
            'Decide first what you need: ads only, or ads plus creative, website and operations.',
            'Judge an agency on the questions it asks you, not on its slide deck.',
            'Ask how they get paid. It tells you what they are really working for.',
            'Run a short, clearly measured trial before any long commitment.',
          ]}
        />
      </div>

      <Section id="what-you-need" n={1} title="Start with what you actually need">
        <p>
          &quot;Digital marketing&quot; covers everything from posting on your page to running a
          full growth team. eCommerce brands usually need one of three things:
        </p>
        <CompareTable
          columns={['You need', 'Signs it is you', 'Look for']}
          rows={[
            [
              'Ads management',
              'Good product, decent store, ads not profitable',
              'Media buyers who talk about delivered orders and profit',
            ],
            [
              'Ads + creative',
              'Ads die fast, no one makes new ones',
              'An in-house creative team with a weekly testing rhythm',
            ],
            [
              'Full growth partner',
              'Ads, store, calls and delivery all need work',
              'A team that covers brand, website, ads and operations',
            ],
          ]}
        />
        <p>
          A social media agency that designs beautiful posts is a different business from one that
          runs sales campaigns. Both are useful. Just make sure you are hiring the right one.
        </p>
      </Section>

      <Section id="signals" n={2} title="Green flags and red flags">
        <Figure title="What good and bad agencies sound like" example={false}>
          <Versus
            left={{
              title: 'Red flags',
              points: [
                'Promises a ROAS before seeing your numbers',
                'Talks mostly about reach, likes and followers',
                'Wants a long contract and money upfront',
                'Will not give you access to your own ad account',
                'Cannot explain what they will test in month one',
              ],
            }}
            right={{
              title: 'Green flags',
              points: [
                'Asks about your margins, returns and delivery first',
                'Judges results on delivered orders and profit',
                'Explains their plan in plain words',
                'Lets you see everything, in real time',
                'Tells you honestly if ads are not the right move yet',
              ],
            }}
          />
        </Figure>
        <Callout tone="warning" title="Be careful with guaranteed results">
          Nobody can guarantee a specific ROAS before they have seen your product, prices and store.
          An agency that does is guessing, or telling you what you want to hear.
        </Callout>
      </Section>

      <PullQuote>
        The best agencies ask more questions than they answer on the first call.
      </PullQuote>

      <Section id="pricing" n={3} title="Look closely at how they get paid">
        <p>
          The way an agency charges shapes how it behaves. A fixed monthly retainer pays the same
          whether your sales grow or not. A percentage of ad spend rewards spending more, not
          spending well. A performance-based fee only pays when you hit an agreed target.
        </p>
        <p>
          None of these is automatically right or wrong, but you should know what each one rewards.
          We wrote a{' '}
          <Link to="/blog/performance-based-agency-vs-retainer">full comparison of the models</Link>{' '}
          if you want the detail.
        </p>
      </Section>

      <Section id="trial" n={4} title="How to run a fair trial">
        <Steps
          steps={[
            {
              title: 'Agree what success means',
              body: 'Pick one main number (for example, delivered orders at a target cost) and write it down.',
            },
            {
              title: 'Fix tracking first',
              body: 'If Pixel and Conversions API are broken, nobody can be judged fairly. Give them a week to fix it.',
            },
            {
              title: 'Give it six to eight weeks',
              body: 'Enough time for several rounds of creative tests. Less than a month rarely tells you much.',
            },
            {
              title: 'Review together, every week',
              body: 'Ask what was tested, what was learned and what happens next. Vague answers are a warning.',
            },
          ]}
        />
      </Section>

      <Section id="checklist" n={5} title="Quick checklist before you sign">
        <p>Tick what the agency has already done or offered:</p>
        <Checklist
          items={[
            'Asked about margins, returns and delivery costs',
            'Explained who will actually work on my account',
            'Shown how they make and test new creative',
            'Given me admin access to my ad account and Pixel',
            'Agreed one clear success number with me',
            'Told me what they will NOT do',
          ]}
          verdicts={[
            'Keep looking. Too much is unclear.',
            'Promising, but ask about the gaps.',
            'This looks like a serious partner.',
          ]}
        />
      </Section>

      <InlineCta
        title="Want to see how we would approach your store?"
        body="Book a free call. We will look at your business, website and products, and tell you honestly what we would do first."
      />

      <Section id="faq" n={6} title="Things people ask us">
        <FaqList
          items={[
            {
              q: 'What is the best digital marketing agency in Bangladesh?',
              a: 'There is no single best one. The right agency depends on what you sell and what you need. Use the checks above, and favour agencies that tie their pay to your results.',
            },
            {
              q: 'Should I hire a big agency or a small one?',
              a: 'Size matters less than who actually works on your account. Ask to meet them, and ask how many other accounts they handle.',
            },
            {
              q: 'How long before I know if an agency is working?',
              a: 'You should see a clear plan in week one and real learning by week four. Judge profit over six to eight weeks.',
            },
          ]}
        />
      </Section>
    </>
  );
}
