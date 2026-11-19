import {
  Callout,
  CompareTable,
  FaqList,
  InlineCta,
  KeyTakeaways,
  Lead,
  Prose,
  Section,
} from '../../components/article';
import { Checklist } from '../../components/viz';

export function Body() {
  return (
    <>
      <Lead>
        Plenty of Bangladeshi brands have a product people love and no money to grow it. Stock, ad
        spend and staff all need cash before sales come in. Here is how funding for eCommerce brands
        usually works, and how to prepare.
      </Lead>
      <Prose>
        <p>
          There is no single right type of funding. The best fit depends on how proven your product
          is, how fast you want to grow and how much control you want to keep.
        </p>
      </Prose>

      <div className="mt-10">
        <KeyTakeaways
          items={[
            'Investors back products with proof: reorders, reviews, growing sales.',
            'Know your numbers: margins, cost per customer, cash cycle.',
            'Money is only part of it. The right partner brings skills too.',
            'Understand what you give up: equity, a share of revenue, or repayments.',
          ]}
        />
      </div>

      <Section id="types" n={1} title="Common types of funding">
        <CompareTable
          columns={['Type', 'How it works', 'Suits']}
          rows={[
            [
              'Your own savings and profits',
              'Grow from what the business earns',
              'Steady, slower growth with full control',
            ],
            ['Loans', 'Borrow and repay with interest', 'Proven businesses with steady cash flow'],
            ['Equity investment', 'Sell a share of the business', 'Brands aiming to grow fast'],
            [
              'Strategic partner',
              'Capital plus skills or services',
              'Brands that need a team as much as money',
            ],
          ]}
        />
        <Callout tone="tip" title="Ask what comes with the money">
          A partner who also brings creative, ads or operations can be worth more than a bigger
          cheque with nothing else attached.
        </Callout>
      </Section>

      <Section id="ready" n={2} title="Are you investment-ready?">
        <Checklist
          items={[
            'I know my gross margin and profit per order',
            'I can show sales by month for at least a few months',
            'Some customers have reordered or recommended us',
            'I know what I would do with the money, in detail',
            'I understand what I am willing to give in return',
          ]}
          verdicts={[
            'Get your numbers in order first.',
            'Close. Fill the gaps before you pitch.',
            'You are ready to talk to investors.',
          ]}
        />
      </Section>

      <Section id="pitch" n={3} title="What investors want to see">
        <ul>
          <li>The product, and why customers love it, in your own words.</li>
          <li>Real numbers: sales, margins, costs, reorders.</li>
          <li>What is holding growth back, and how money fixes it.</li>
          <li>You: why you will see it through when it gets hard.</li>
        </ul>
      </Section>

      <InlineCta
        title="We invest in great products"
        body="Investing in brands is one of the main things we do: capital plus our whole team. Apply at muvance.com/get-funded, or book a free call."
      />

      <Section id="faq" n={4} title="Things people ask us">
        <FaqList
          items={[
            {
              q: 'Do I need a big business to get investment?',
              a: 'No. Many investors look at the product and early proof more than size. A small brand with loyal customers can be attractive.',
            },
            {
              q: 'Should I take the first offer?',
              a: 'Take time to understand the terms and the partner. The wrong investor can cost more than no investor.',
            },
          ]}
        />
      </Section>
    </>
  );
}
