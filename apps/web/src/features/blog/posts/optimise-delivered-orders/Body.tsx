import { PackageCheck, Server, ShoppingCart, Truck } from 'lucide-react';
import {
  Callout,
  Code,
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
import { Flow, LineChart } from '../../components/viz';

export function Body() {
  return (
    <>
      <Lead>
        By default, Meta learns from everyone who places an order, including the people who never
        pay. For a cash-on-delivery business, that means it’s partly learning to find the wrong
        customers.
      </Lead>
      <Prose>
        <p>
          The Pixel fires a Purchase the moment someone clicks &quot;Place order&quot;. Meta doesn’t
          know that a few days later the parcel was refused. So if one in five of your orders fails,
          Meta keeps looking for people like that one in five too.
        </p>
        <p>
          The fix is to tell Meta what happened next. We covered why in our post on fake COD orders.
          This one is the practical how-to.
        </p>
      </Prose>

      <div className="mt-10">
        <KeyTakeaways
          items={[
            'Send a second event when an order is actually delivered, using the Conversions API.',
            'Start by using it for reporting. Move optimisation to it once you have enough volume.',
            'Website events generally need to reach Meta within 7 days, so send deliveries promptly.',
            'Use the order number as the link between "placed" and "delivered".',
          ]}
        />
      </div>

      <Section id="flow" n={1} title="How it works">
        <Figure title="Two events for one order" example={false}>
          <Flow
            nodes={[
              {
                title: 'Order placed',
                body: 'Pixel + CAPI send Purchase',
                icon: <ShoppingCart className="size-5" />,
              },
              { title: 'Shipped', icon: <Truck className="size-5" /> },
              {
                title: 'Delivered',
                body: 'Courier or your system marks it',
                icon: <PackageCheck className="size-5" />,
              },
              {
                title: 'Server sends "Delivered"',
                body: 'Same order ID, real value',
                icon: <Server className="size-5" />,
                highlight: true,
              },
            ]}
          />
        </Figure>
      </Section>

      <Section id="options" n={2} title="Two ways to use it">
        <CompareTable
          columns={['', 'Report on delivered', 'Optimise for delivered']}
          rows={[
            [
              'What changes',
              'You add a custom conversion and a column for it',
              'Your campaign optimises for the Delivered event',
            ],
            ['Risk', 'Very low', 'Medium: fewer events, slower learning'],
            ['Volume needed', 'Any', 'Ideally ~50 delivered orders a week per ad set'],
            [
              'Best for',
              'Every COD brand, starting today',
              'Brands with steady volume and high failure rates',
            ],
          ]}
        />
        <Callout tone="tip">
          Start with reporting. Within a couple of weeks you’ll see which ads bring buyers who
          actually pay. That alone changes which ads you scale.
        </Callout>
      </Section>

      <Section id="payload" n={3} title="What to send">
        <p>
          When your system marks an order as delivered, send an event like this from your server.
          Same customer details as the original purchase, same order number.
        </p>
        <Code title="Delivered event (Conversions API)">{`{
  "event_name": "Delivered",           // a custom event name
  "event_time": 1763452800,            // when it was delivered
  "event_id": "delivered_1042",        // unique for this event
  "action_source": "website",
  "user_data": {
    "ph": ["<sha256 of 8801XXXXXXXXX>"],
    "fbp": "fb.1.1763100000.123456789",
    "fbc": "fb.1.1763100000.AbCdEf",
    "external_id": ["<sha256 of customer id>"]
  },
  "custom_data": {
    "order_id": "1042",
    "currency": "BDT",
    "value": 2450                      // money actually collected
  }
}`}</Code>
        <Callout tone="warning">
          Website events generally have to reach Meta within about 7 days of the event time. Send
          the Delivered event as soon as you know, not in a weekly batch.
        </Callout>
      </Section>

      <Section id="effect" n={4} title="What changes when Meta learns from real buyers">
        <Figure
          title="Share of orders that get delivered, before and after switching"
          caption="Illustrative. As Meta learns who actually accepts parcels, the delivered share can improve over a few weeks."
        >
          <LineChart
            labels={['Wk 1', 'Wk 2', 'Wk 3', 'Wk 4', 'Wk 5', 'Wk 6', 'Wk 7', 'Wk 8']}
            series={[
              { name: 'Delivered share', values: [76, 75, 77, 76, 79, 81, 83, 84], tone: 'ink' },
            ]}
            format={(v) => `${Math.round(v)}%`}
            yMin={60}
            yMax={95}
            markers={[{ at: 3, label: 'Switched' }]}
          />
        </Figure>
      </Section>

      <Section id="steps" n={5} title="Setting it up">
        <Steps
          steps={[
            {
              title: 'Store fbp, fbc and phone with each order',
              body: 'You’ll need them days later when the order is delivered.',
            },
            {
              title: 'Mark delivery status in one place',
              body: 'From your courier’s dashboard, API or your own order system.',
            },
            {
              title: 'Send the Delivered event automatically',
              body: 'When status changes to delivered, your server sends the event.',
            },
            {
              title: 'Create a custom conversion',
              body: 'In Events Manager, so you can add "Delivered" as a column in Ads Manager.',
            },
            {
              title: 'Compare ads on delivered cost',
              body: 'Cost per delivered order often ranks ads differently from cost per purchase.',
            },
            {
              title: 'Consider optimising for it',
              body: 'Once you have steady delivered volume, test a campaign that optimises for it.',
            },
          ]}
        />
      </Section>

      <InlineCta
        title="Want Meta to find buyers who actually pay?"
        body="We set up delivered-order tracking for COD brands. Book a free call and we’ll check what your system can send."
      />

      <Section id="faq" n={6} title="Things people ask us">
        <FaqList
          items={[
            {
              q: 'Do I need a developer?',
              a: 'Usually, yes, or a tool that connects your order system to the Conversions API. It’s a one-time setup.',
            },
            {
              q: 'Should I remove the original Purchase event?',
              a: 'No. Keep it. It’s your early signal. The Delivered event adds the truth a few days later.',
            },
            {
              q: 'What if delivery takes longer than 7 days?',
              a: 'Those events may be rejected or not used. Most deliveries in Bangladesh are faster, but send events as soon as you can.',
            },
          ]}
        />
      </Section>
    </>
  );
}
