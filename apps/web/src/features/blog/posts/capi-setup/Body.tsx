import { Globe, Server, ShieldCheck, ShoppingCart } from 'lucide-react';
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
import { BarList, Checklist, Flow } from '../../components/viz';

export function Body() {
  return (
    <>
      <Lead>
        The Pixel alone now misses a real share of your buyers. The Conversions API fills the gap.
        Here’s how to set up both properly, step by step.
      </Lead>
      <Prose>
        <p>
          Meta can only optimise for the purchases it can see. Ad blockers, iPhone privacy settings
          and slow mobile connections all stop the browser <strong>Pixel</strong> from reporting
          some sales. The <strong>Conversions API (CAPI)</strong> sends the same events from your
          server, where those blockers can’t reach. Run both, connected by one event ID, and Meta
          sees more of your real customers.
        </p>
      </Prose>

      <div className="mt-10">
        <KeyTakeaways
          items={[
            'Use both: the Pixel in the browser and CAPI from your server.',
            'Every event needs the same event ID from both sources, so Meta can remove duplicates.',
            'Send customer details (hashed phone and email, fbp, fbc) to raise Event Match Quality.',
            'Use the Test Events tool before going live, then check deduplication in Events Manager.',
          ]}
        />
      </div>

      <Section id="how" n={1} title="How the two work together">
        <Figure title="One purchase, two messages, one count" example={false}>
          <Flow
            nodes={[
              {
                title: 'Customer buys',
                body: 'Order #1042 is placed',
                icon: <ShoppingCart className="size-5" />,
              },
              {
                title: 'Browser Pixel',
                body: 'Sends Purchase with event_id 1042',
                icon: <Globe className="size-5" />,
              },
              {
                title: 'Your server (CAPI)',
                body: 'Sends Purchase with event_id 1042',
                icon: <Server className="size-5" />,
              },
              {
                title: 'Meta deduplicates',
                body: 'Same name + same ID = one purchase',
                icon: <ShieldCheck className="size-5" />,
                highlight: true,
              },
            ]}
          />
        </Figure>
        <p>
          If the browser event is blocked, the server event still arrives. If both arrive, Meta
          keeps one. Either way, the purchase is counted exactly once.
        </p>
      </Section>

      <Section id="options" n={2} title="Pick your setup method">
        <p>You don’t need to be a developer. Choose the option that matches your store.</p>
        <CompareTable
          columns={['Method', 'Best for', 'Effort']}
          rows={[
            [
              'Shopify Meta app',
              'Shopify stores. Set data sharing to the highest level.',
              'Low: a few clicks',
            ],
            [
              'Meta for WooCommerce plugin',
              'WooCommerce stores. Official plugin with CAPI built in.',
              'Low to medium',
            ],
            [
              'Conversions API Gateway',
              'Any site, without writing code. Runs on your own cloud account.',
              'Medium',
            ],
            [
              'Server-side Google Tag Manager',
              'Brands already using GTM who want full control.',
              'Medium to high',
            ],
            [
              'Direct API integration',
              'Custom-built stores, apps, or offline events like delivered COD orders.',
              'High: needs a developer',
            ],
          ]}
        />
        <Callout tone="local">
          Many Bangladeshi stores run on custom builds or WooCommerce. For cash-on-delivery, the
          direct API route has a big advantage: you can also send{' '}
          <strong>confirmed or delivered</strong> orders later, which teaches Meta to find buyers
          who actually pay.
        </Callout>
      </Section>

      <Section id="steps" n={3} title="Step-by-step setup">
        <Steps
          steps={[
            {
              title: 'Open Events Manager',
              body: 'Select your dataset (pixel). Note its ID; every method needs it.',
            },
            {
              title: 'Generate an access token',
              body: (
                <>
                  Under <strong>Settings → Conversions API</strong>. Keep it secret, like a
                  password. Never put it in front-end code.
                </>
              ),
            },
            {
              title: 'Install your chosen method',
              body: 'App, plugin, Gateway, server GTM or code. Send at least PageView, ViewContent, AddToCart, InitiateCheckout and Purchase.',
            },
            {
              title: 'Use one event ID for both',
              body: 'Your order number is perfect for Purchase. For other events, generate a random ID in the browser and pass it to the server.',
            },
            {
              title: 'Send customer information',
              body: 'Hashed phone and email, the fbp and fbc cookies, IP address and user agent. More matching data means more purchases attributed.',
            },
            {
              title: 'Test before going live',
              body: (
                <>
                  Use the <strong>Test Events</strong> tab with a test code, place a test order, and
                  check that both Browser and Server events appear.
                </>
              ),
            },
            {
              title: 'Confirm deduplication',
              body: 'In the dataset overview, Purchase should show both sources and say events are being deduplicated.',
            },
          ]}
        />
      </Section>

      <Section id="payload" n={4} title="What a good Purchase event looks like">
        <p>
          If a developer is building it, this is the shape to ask for. Personal data is hashed with
          SHA-256 before it’s sent; Meta never receives the raw phone number.
        </p>
        <Code title="POST /{dataset-id}/events">{`{
  "data": [{
    "event_name": "Purchase",
    "event_time": 1763107200,
    "event_id": "order_1042",
    "action_source": "website",
    "event_source_url": "https://yourstore.com/thank-you",
    "user_data": {
      "ph": ["<sha256 of 8801XXXXXXXXX>"],
      "em": ["<sha256 of email, if you have it>"],
      "fbp": "fb.1.1763100000.123456789",
      "fbc": "fb.1.1763100000.AbCdEf",
      "client_ip_address": "103.0.0.1",
      "client_user_agent": "Mozilla/5.0 ..."
    },
    "custom_data": {
      "currency": "BDT",
      "value": 2450,
      "content_ids": ["SKU-221"],
      "content_type": "product"
    }
  }]
}`}</Code>
        <Callout tone="warning">
          Format phone numbers with the country code and no symbols (for Bangladesh, starting with
          880) <strong>before</strong> hashing. A different format produces a different hash, and
          Meta can’t match it.
        </Callout>
      </Section>

      <Section id="emq" n={5} title="Raise your Event Match Quality">
        <p>
          Event Match Quality (EMQ) is Meta’s score, out of 10, for how well it can connect your
          events to real people. Each extra piece of customer information helps.
        </p>
        <Figure
          title="How EMQ typically grows as you send more customer data"
          caption="Illustrative. Your score depends on how many of your events include each field."
        >
          <BarList
            items={[
              {
                label: 'IP + user agent only',
                value: 3.5,
                tone: 'warm',
                note: 'The bare minimum. Meta can match some people, but many purchases will be modelled or lost.',
              },
              {
                label: '+ fbp and fbc cookies',
                value: 5.5,
                tone: 'ink',
                note: 'Connects the event to the browser and the ad click. A big jump for little effort.',
              },
              {
                label: '+ hashed phone',
                value: 7.2,
                tone: 'ink',
                note: 'The most important field in Bangladesh, where almost every order has a phone number.',
              },
              {
                label: '+ hashed email',
                value: 8.0,
                tone: 'accent',
                note: 'Adds matches for people who signed up to Facebook with email.',
              },
              {
                label: '+ name, city, external ID',
                value: 8.6,
                tone: 'accent',
                note: 'Smaller gains, but they add up across thousands of events.',
              },
            ]}
            max={10}
            format={(v) => v.toFixed(1)}
          />
        </Figure>
      </Section>

      <Section id="golive" n={6} title="Go-live checklist">
        <Figure title="Tick each item once it’s verified" example={false}>
          <Checklist
            items={[
              'Purchase arrives from both Browser and Server',
              'Deduplication shows as working for Purchase',
              'Purchase value and currency are correct',
              'Phone numbers include 880 before hashing',
              'Access token is stored only on the server',
              'Test Events shows no errors or warnings',
              'Purchase fires once, not on page refresh',
              'Event Match Quality for Purchase is 6 or higher',
            ]}
            verdicts={[
              'Not ready yet. Fix these before you scale spend.',
              'Close. Finish the remaining items this week.',
              'Your tracking is solid. Meta is getting the data it needs.',
            ]}
          />
        </Figure>
      </Section>

      <InlineCta
        title="Want us to set up your tracking properly?"
        body="Tracking is the first thing we fix for every client, before spending a single taka on scaling. Book a free call."
      />

      <Section id="faq" n={7} title="Things people ask us">
        <FaqList
          items={[
            {
              q: 'Do I still need the Pixel if I have CAPI?',
              a: 'Yes. Meta recommends running both. The Pixel captures browser signals CAPI can’t, and CAPI catches what the Pixel misses.',
            },
            {
              q: 'Why does Events Manager say my events aren’t deduplicated?',
              a: 'Usually the event IDs don’t match exactly between browser and server, or the event names differ (for example "purchase" vs "Purchase"). Both must be identical.',
            },
            {
              q: 'Is sending customer data legal?',
              a: 'Data is hashed before sending, and Meta has its own terms for its use. You should still mention advertising and analytics in your privacy policy, and follow the data protection rules where you operate.',
            },
            {
              q: 'Can I send delivered COD orders?',
              a: 'Yes, through the API with an appropriate action source. Many COD brands send a separate event for delivered orders and use it for reporting or optimisation.',
            },
          ]}
        />
      </Section>
    </>
  );
}
