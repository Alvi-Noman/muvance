import { MessageCircle, PackageCheck, PhoneCall, ShieldCheck, ShoppingBag } from 'lucide-react';
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
  Steps,
} from '../../components/article';
import { Calculator, Checklist, Flow, Funnel } from '../../components/viz';
import { taka } from '../../components/format';

function returnLoss(v: Record<string, number>) {
  const failed = (v.orders ?? 0) * ((v.rate ?? 0) / 100);
  const perFail = (v.courier ?? 0) + (v.ad ?? 0);
  return [
    { label: 'Failed orders a month', value: String(Math.round(failed)) },
    { label: 'Money lost a month', value: taka(failed * perFail), dark: true },
    { label: 'Money lost a year', value: taka(failed * perFail * 12) },
  ];
}

export function Body() {
  return (
    <>
      <Lead>
        Every parcel that comes back costs you twice: the courier charge, and the ad money you spent
        to get that order. Here’s how Bangladeshi brands cut fake and refused orders.
      </Lead>
      <Prose>
        <p>
          Cash on delivery is how most people in Bangladesh prefer to buy online. It builds trust,
          but it also means placing an order costs the customer nothing. Prank orders, wrong
          numbers, duplicate orders and buyers who change their mind at the door are part of every
          COD business. The goal isn’t zero, it’s{' '}
          <strong>fewer, caught earlier, and cheaper</strong>.
        </p>
      </Prose>

      <div className="mt-10">
        <KeyTakeaways
          items={[
            'Confirm every order by phone or WhatsApp before it ships.',
            'Check a customer’s past delivery record by phone number before sending risky orders.',
            'Ask for a small advance (such as the delivery charge) on high-risk orders.',
            'Tell Meta which orders were actually delivered, so it finds more buyers who pay.',
          ]}
        />
      </div>

      <Section id="cost" n={1} title="What failed orders really cost you">
        <p>Put your own numbers in. Most owners are surprised by the yearly figure.</p>
        <Figure title="Failed-order cost calculator" example={false}>
          <Calculator
            inputs={[
              { id: 'orders', label: 'Orders a month', value: 1500, step: 100 },
              { id: 'rate', label: 'Orders that fail (%)', value: 18, suffix: '%' },
              {
                id: 'courier',
                label: 'Courier + packaging per failed order',
                value: 120,
                prefix: '৳',
                step: 10,
              },
              { id: 'ad', label: 'Ad cost per order', value: 250, prefix: '৳', step: 10 },
            ]}
            compute={returnLoss}
          />
        </Figure>
        <Figure
          title="From orders placed to money received"
          caption="Each step is a chance to catch a bad order before it costs you a courier fee."
        >
          <Funnel
            stages={[
              { label: 'Orders placed', value: 100, note: 'What Meta counts as a purchase' },
              { label: 'Confirmed', value: 85, note: 'Fake numbers and duplicates removed' },
              { label: 'Shipped', value: 82, note: 'Stock or address problems' },
              { label: 'Delivered and paid', value: 74, note: 'Real revenue' },
            ]}
          />
        </Figure>
      </Section>

      <Section id="confirm" n={2} title="Step 1: confirm every order before it ships">
        <p>
          A quick call or WhatsApp message catches most fake and accidental orders for the cost of a
          minute. It also reminds genuine buyers that the parcel is coming, which reduces refusals
          at the door.
        </p>
        <Figure title="A simple order verification flow" example={false}>
          <Flow
            nodes={[
              {
                title: 'Order placed',
                body: 'Phone number checked for format',
                icon: <ShoppingBag className="size-5" />,
              },
              {
                title: 'History check',
                body: 'Past deliveries for this number',
                icon: <ShieldCheck className="size-5" />,
              },
              {
                title: 'Confirm',
                body: 'Call, SMS or WhatsApp',
                icon: <PhoneCall className="size-5" />,
                highlight: true,
              },
              {
                title: 'Remind',
                body: 'Message on dispatch day',
                icon: <MessageCircle className="size-5" />,
              },
              {
                title: 'Deliver',
                body: 'Mark delivered or returned',
                icon: <PackageCheck className="size-5" />,
              },
            ]}
          />
        </Figure>
        <Callout tone="tip">
          Confirm within an hour of the order. The longer you wait, the more likely the buyer has
          ordered elsewhere or forgotten.
        </Callout>
      </Section>

      <Section id="history" n={3} title="Step 2: check delivery history by phone number">
        <p>
          Several couriers and third-party tools in Bangladesh let you look up how many past parcels
          a phone number accepted or refused. A number with a long record of refusals is a strong
          warning sign.
        </p>
        <ul>
          <li>
            <strong>Good record:</strong> ship as normal.
          </li>
          <li>
            <strong>No record:</strong> new buyer. Confirm by call before shipping.
          </li>
          <li>
            <strong>Poor record:</strong> ask for an advance, or politely decline.
          </li>
        </ul>
        <Callout tone="warning">
          Keep your own list too. Customers who refuse parcels repeatedly should need an advance
          before you ship again. You can also exclude them from your ads using a customer list.
        </Callout>
      </Section>

      <Section id="advance" n={4} title="Step 3: a small advance for risky orders">
        <p>
          Asking every customer to pay upfront kills conversion. Asking <strong>some</strong>{' '}
          customers for a small advance, usually the delivery charge through bKash or Nagad, filters
          out most non-serious orders while keeping trust.
        </p>
        <p>Good times to ask for an advance:</p>
        <ul>
          <li>Outside your main delivery city, where return costs are higher.</li>
          <li>High-value orders, or several units of the same product.</li>
          <li>Phone numbers with a poor or missing delivery record.</li>
          <li>Repeated orders from the same number in a short time.</li>
        </ul>
      </Section>

      <PullQuote>The cheapest returned parcel is the one you never shipped.</PullQuote>

      <Section id="prevent" n={5} title="Step 4: prevent refusals before they happen">
        <p>
          Many refusals aren’t fraud. The buyer got something different from what they expected.
        </p>
        <Steps
          steps={[
            {
              title: 'Show real photos and videos',
              body: 'Including on a real person, so colour and size aren’t a surprise.',
            },
            {
              title: 'Add a clear size chart',
              body: 'In centimetres and with a "how to measure" image. Size is the biggest cause of fashion refusals.',
            },
            {
              title: 'State the total price',
              body: 'Product plus delivery, before checkout. A surprise charge at the door is a common reason to refuse.',
            },
            {
              title: 'Give a delivery time',
              body: '"Inside Dhaka: 1–2 days. Outside: 3–5 days." Late parcels are refused more often.',
            },
            {
              title: 'Match the ad to the product',
              body: 'Over-edited ad photos win clicks and lose deliveries.',
            },
          ]}
        />
      </Section>

      <Section id="meta" n={6} title="Step 5: tell Meta which orders were real">
        <p>
          By default, Meta learns from <strong>orders placed</strong>. If a third of those are fake,
          it learns to find more people who place fake orders. Sending confirmed or delivered orders
          back through the Conversions API lets you report, and in some setups optimise, on buyers
          who actually pay.
        </p>
        <Callout tone="local">
          This is one of the most valuable improvements a Bangladeshi COD brand can make, and very
          few do it. It needs your order system to send an event when an order is marked delivered.
        </Callout>
      </Section>

      <Section id="checklist" n={7} title="Your anti-fake-order checklist">
        <Figure title="How protected is your store?" example={false}>
          <Checklist
            items={[
              'Every order confirmed before shipping',
              'Phone numbers checked for delivery history',
              'Advance taken on high-risk orders',
              'Repeat refusers tracked in a list',
              'Size chart and real photos on product pages',
              'Total price including delivery shown before checkout',
              'Delivery time shown on the product page',
              'Delivered orders sent back to Meta',
            ]}
            verdicts={[
              'You’re likely losing a lot to failed orders. Start with confirmation calls.',
              'Good foundations. The unticked items are your next savings.',
              'Your store is well protected. Keep tracking your failure rate monthly.',
            ]}
          />
        </Figure>
      </Section>

      <InlineCta
        title="Want ads that bring buyers who actually pay?"
        body="We set up delivered-order tracking for COD brands so Meta learns from real sales. Book a free call."
      />

      <Section id="faq" n={8} title="Things people ask us">
        <FaqList
          items={[
            {
              q: 'Will asking for an advance reduce my sales?',
              a: 'If you ask everyone, yes. If you only ask high-risk orders, the drop in genuine sales is usually small compared to the courier fees you save. Test it for a month.',
            },
            {
              q: 'Should I add OTP verification at checkout?',
              a: 'It stops wrong and fake numbers, but adds a step. Many brands use OTP only for first-time buyers or orders outside their main city.',
            },
            {
              q: 'What is a normal COD failure rate?',
              a: 'It varies widely by product category, price and region. Fashion and higher-priced items tend to see more refusals. Track your own rate monthly and aim to bring it down steadily.',
            },
          ]}
        />
      </Section>
    </>
  );
}
