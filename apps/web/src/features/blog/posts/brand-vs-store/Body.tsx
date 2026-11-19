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
import { Legend, LineChart, Versus } from '../../components/viz';
import { taka } from '../../components/format';

export function Body() {
  return (
    <>
      <Lead>
        A store sells products. A brand sells a reason to choose it over the store next door. Both
        can make money, but only one tends to get cheaper to grow over time.
      </Lead>
      <Prose>
        <p>
          Many Bangladeshi pages sell the same products as dozens of others, competing on price and
          speed. That works until ad costs rise or someone sells it cheaper. Building a brand is how
          you step out of that race.
        </p>
      </Prose>

      <div className="mt-10">
        <KeyTakeaways
          items={[
            'A brand is a promise people remember, not just a logo.',
            'Brands can charge more and spend less to win each customer over time.',
            'Small brands start with one clear promise to one clear group.',
            'Consistency (look, voice, quality) is what makes a brand stick.',
          ]}
        />
      </div>

      <Section id="difference" n={1} title="Store vs brand">
        <Versus
          left={{
            title: 'A store',
            points: [
              'Sells what is trending this month',
              'Competes mostly on price',
              'Customers do not remember the name',
              'Every sale has to be bought with ads',
            ],
          }}
          right={{
            title: 'A brand',
            points: [
              'Stands for something specific',
              'Can charge for trust and quality',
              'People search for it by name',
              'Repeat buyers and referrals lower ad costs',
            ],
          }}
        />
      </Section>

      <Section id="cost" n={2} title="Why brands get cheaper to grow">
        <Figure title="Cost to win a customer over time">
          <Legend
            items={[
              { name: 'Generic store', tone: 'warm' },
              { name: 'Recognised brand', tone: 'accent' },
            ]}
          />
          <div className="mt-4">
            <LineChart
              labels={['M1', 'M3', 'M6', 'M9', 'M12', 'M18']}
              series={[
                { name: 'Generic store', values: [420, 450, 490, 520, 560, 610], tone: 'warm' },
                {
                  name: 'Recognised brand',
                  values: [480, 450, 410, 380, 360, 340],
                  tone: 'accent',
                },
              ]}
              format={taka}
            />
          </div>
        </Figure>
        <p>
          Brand work costs more at first. Over time, people recognise you, trust you and come back,
          which lowers what each new customer costs.
        </p>
      </Section>

      <PullQuote>Price gets the first sale. Brand gets the next ten.</PullQuote>

      <Section id="start" n={3} title="Where a small brand starts">
        <ul>
          <li>One clear promise: what you do better, for whom.</li>
          <li>A name, look and voice you use everywhere, consistently.</li>
          <li>Quality and service that live up to the promise.</li>
          <li>Packaging and follow-up that make people remember you.</li>
        </ul>
        <Callout tone="tip">
          Read our guide on{' '}
          <Link to="/blog/position-a-small-brand-against-bigger-competitors">
            positioning a small brand
          </Link>{' '}
          to work out your one clear promise.
        </Callout>
      </Section>

      <InlineCta
        title="Ready to build a brand, not just a store?"
        body="Brand strategy is one of our five fields. Book a free call to talk about where your brand could go."
      />

      <Section id="faq" n={4} title="Things people ask us">
        <FaqList
          items={[
            {
              q: 'Can I build a brand while reselling products?',
              a: 'Yes, through curation, service, packaging and expertise. Over time, adding your own products makes it much stronger.',
            },
            {
              q: 'Does a brand need a big budget?',
              a: 'No. It needs consistency and a clear promise. Budget speeds it up, but it does not create it.',
            },
          ]}
        />
      </Section>
    </>
  );
}
