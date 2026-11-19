import { Link } from 'react-router';
import {
  Callout,
  FaqList,
  Figure,
  InlineCta,
  KeyTakeaways,
  Lead,
  Prose,
  PullQuote,
  Section,
} from '../../components/article';
import { Flow, Versus } from '../../components/viz';

export function Body() {
  return (
    <>
      <Lead>
        &quot;Performance marketing&quot; gets used for almost anything with ads in it. Here is what
        it actually means, how it differs from brand marketing, and why online stores need both.
      </Lead>
      <Prose>
        <p>
          In short: performance marketing is marketing you can measure against a clear action, like
          a purchase, a lead or a booked call. You pay to get that action, you measure what each one
          cost, and you keep doing what works.
        </p>
      </Prose>

      <div className="mt-10">
        <KeyTakeaways
          items={[
            'Performance marketing is judged on actions: purchases, leads, sign-ups.',
            'Brand marketing builds the trust that makes those actions cheaper later.',
            'On Meta, good performance ads usually do some brand work too.',
            'The key numbers are cost per result, ROAS, and above all profit.',
          ]}
        />
      </div>

      <Section id="definition" n={1} title="What it means, in plain words">
        <p>
          A performance campaign has one job you can count. For an online store that is usually a
          purchase. Every taka is tracked to a result, and budgets move towards what produces
          results at a cost you can afford.
        </p>
        <Figure title="The performance loop" example={false}>
          <Flow
            nodes={[
              { title: 'Spend', body: 'Run ads with a clear goal' },
              { title: 'Measure', body: 'Track purchases and cost' },
              { title: 'Learn', body: 'See which ads and offers work' },
              { title: 'Reinvest', body: 'Move budget to winners', highlight: true },
            ]}
          />
        </Figure>
      </Section>

      <Section id="vs-brand" n={2} title="Performance vs brand marketing">
        <Versus
          left={{
            title: 'Brand marketing',
            points: [
              'Goal: be known and trusted',
              'Measured by reach, recall, search for your name',
              'Pays off slowly, over months',
              'Hard to tie to one sale',
            ],
          }}
          right={{
            title: 'Performance marketing',
            points: [
              'Goal: a specific action now',
              'Measured by cost per purchase and profit',
              'Pays off in days or weeks',
              'Every result is tracked',
            ],
          }}
        />
        <Callout tone="tip" title="You need a bit of both">
          People buy faster from brands they recognise. A store that only runs hard-sell ads often
          sees costs rise, because nobody has heard of it. A little brand work makes performance ads
          cheaper.
        </Callout>
      </Section>

      <PullQuote>Brand makes people willing to buy. Performance asks them to buy now.</PullQuote>

      <Section id="numbers" n={3} title="The numbers that matter">
        <ul>
          <li>
            <strong>Cost per purchase (CPA):</strong> what you paid in ads for each sale.
          </li>
          <li>
            <strong>ROAS:</strong> sales from ads divided by ad spend.
          </li>
          <li>
            <strong>MER:</strong> all sales divided by all marketing spend. Harder to fool.
          </li>
          <li>
            <strong>Profit after ads:</strong> the one that pays the bills.
          </li>
        </ul>
        <p>
          If you want to go deeper, start with <Link to="/blog/mer-vs-roas">MER vs ROAS</Link> and{' '}
          <Link to="/blog/what-is-a-good-roas-bangladesh">working out your break-even ROAS</Link>.
        </p>
      </Section>

      <Section id="agencies" n={4} title="What a performance-based agency is">
        <p>
          Not the same thing. A performance <em>marketing</em> agency runs measurable campaigns. A
          performance-<em>based</em> agency is one that gets paid on results. Many performance
          marketing agencies still charge a fixed retainer. Ask which one you are talking to.
        </p>
      </Section>

      <InlineCta
        title="Performance marketing, paid on performance"
        body="We agree a sales target with you and only get paid once you hit it. Book a free call to see how it would work for your store."
      />

      <Section id="faq" n={5} title="Things people ask us">
        <FaqList
          items={[
            {
              q: 'Is performance marketing the same as digital marketing?',
              a: 'No. Digital marketing is everything online, including social posts and content. Performance marketing is the part judged on measurable actions like sales.',
            },
            {
              q: 'Which platforms are used for performance marketing in Bangladesh?',
              a: 'Mostly Facebook and Instagram (Meta), plus Google for search. Meta is usually the biggest for online stores.',
            },
            {
              q: 'Can a small store do performance marketing?',
              a: 'Yes. Start small, track properly, and only scale what is profitable. Budget matters less than discipline.',
            },
          ]}
        />
      </Section>
    </>
  );
}
