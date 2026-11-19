import { FaqList, Figure, InlineCta, Lead, Prose, Section, Steps } from '../../components/article';
import { LineChart } from '../../components/viz';

export function Body() {
  return (
    <>
      <Lead>
        Your total revenue can grow while your customers get worse. Cohorts are how you spot it.
      </Lead>
      <Prose>
        <p>
          A cohort is just a group of customers who started at the same time, usually the same
          month. Instead of looking at everyone mixed together, you follow each group and see how
          much they buy over the following months.
        </p>
      </Prose>
      <Section id="build" n={1} title="Building a simple cohort table">
        <Steps
          steps={[
            {
              title: 'Export orders',
              body: 'Phone number, order date, order value, delivery status.',
            },
            { title: 'Find each customer’s first order month', body: 'That is their cohort.' },
            {
              title: 'Count repeat orders by month since first order',
              body: 'Month 1, month 2, month 3 and so on.',
            },
            {
              title: 'Divide by cohort size',
              body: 'To get the share who came back, or revenue per customer.',
            },
          ]}
        />
        <p>
          A pivot table in Google Sheets or Excel is enough. You do not need special software to
          start.
        </p>
      </Section>
      <Section id="read" n={2} title="Reading it">
        <Figure
          title="Share of each cohort ordering again by month 3 (example)"
          caption="Here, newer customers came back less after ads were scaled. That is common: scaling reaches less committed buyers."
        >
          <LineChart
            labels={['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun']}
            series={[{ name: 'Repeat by month 3', values: [22, 21, 19, 17, 16, 18], tone: 'ink' }]}
            format={(v) => `${v}%`}
            markers={[{ at: 3, label: 'Scaled ads' }]}
          />
        </Figure>
        <p>
          If later cohorts are clearly weaker, ask why. A new product? A heavy discount that
          attracted bargain hunters? A courier change? Cohorts point to the question; your notes on
          what changed give the answer.
        </p>
      </Section>
      <Section id="uses" n={3} title="What it helps you decide">
        <ul>
          <li>Whether a discount campaign brought good customers or one-time buyers.</li>
          <li>How much you can afford to pay for a new customer.</li>
          <li>Whether retention efforts are actually working.</li>
        </ul>
      </Section>
      <InlineCta
        title="Want us to build your cohort table?"
        body="Book a free call. We can set it up from your order export."
      />
      <Section id="faq" n={4} title="Questions people ask">
        <FaqList
          items={[
            { q: 'How much data do I need?', a: 'At least six months of orders to see patterns.' },
            {
              q: 'Monthly or weekly cohorts?',
              a: 'Monthly for most brands. Weekly is noisy unless you have a lot of customers.',
            },
          ]}
        />
      </Section>
    </>
  );
}
