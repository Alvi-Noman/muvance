import { Callout, FaqList, Figure, InlineCta, Lead, Section } from '../../components/article';
import { LineChart, Versus } from '../../components/viz';
import { taka } from '../../components/format';

export function Body() {
  return (
    <>
      <Lead>
        CPM is the price of showing your ad 1,000 times. It is the raw cost of attention, and it is
        set by an auction you do not control.
      </Lead>
      <Section id="why" n={1} title="Why it changes">
        <p>
          Meta runs an auction for every ad slot. When more advertisers want the same people at the
          same time, prices go up. That is why CPMs usually rise before big shopping events.
        </p>
        <Figure
          title="CPM through a year (example)"
          caption="Timing of Eid moves every year. The pattern, not the exact months, is the point."
        >
          <LineChart
            labels={[
              'Jan',
              'Feb',
              'Mar',
              'Apr',
              'May',
              'Jun',
              'Jul',
              'Aug',
              'Sep',
              'Oct',
              'Nov',
              'Dec',
            ]}
            series={[
              { name: 'CPM', values: [140, 150, 190, 170, 150, 160, 145, 150, 155, 170, 210, 180] },
            ]}
            format={taka}
            markers={[
              { at: 2, label: 'Eid' },
              { at: 10, label: '11.11' },
            ]}
          />
        </Figure>
      </Section>
      <Section id="control" n={2} title="What you can influence">
        <Versus
          left={{
            title: 'You can influence',
            points: [
              'Ad quality and engagement',
              'Broad audiences (more people to choose from)',
              'Placements (automatic is usually cheaper)',
              'When you push budget',
            ],
          }}
          right={{
            title: 'You cannot control',
            points: [
              'Competition in the auction',
              'Seasonal demand',
              'Platform-wide changes',
              'Other advertisers’ budgets',
            ],
          }}
        />
      </Section>
      <Section id="cheap" n={3} title="Cheap CPM is not the goal">
        <p>
          A low CPM can mean you are reaching people nobody else wants to pay for. Some cheap
          placements bring few buyers. What matters is the full chain: CPM, click-through,
          conversion rate, delivery rate. A higher CPM with better buyers often wins.
        </p>
        <Callout tone="tip">
          When CPMs spike in a festival period, it is often smart to start pushing a little earlier,
          before competition peaks.
        </Callout>
      </Section>
      <InlineCta
        title="Ad costs climbing and not sure why?"
        body="Book a free call. We will check whether it is the market or your account."
      />
      <Section id="faq" n={4} title="Questions people ask">
        <FaqList
          items={[
            {
              q: 'Is CPM the same as cost per reach?',
              a: 'No. CPM is per 1,000 impressions, which can include the same person more than once. Cost per 1,000 people reached is a separate number.',
            },
            {
              q: 'Why do my CPMs differ between campaigns?',
              a: 'Different audiences, placements, objectives and creative quality all change the price.',
            },
          ]}
        />
      </Section>
    </>
  );
}
