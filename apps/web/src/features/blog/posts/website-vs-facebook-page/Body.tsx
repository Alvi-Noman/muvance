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
        Lots of great Bangladeshi brands started as a Facebook page and a phone number. At some
        point, though, the page starts holding you back. The question is when.
      </Lead>
      <Prose>
        <p>
          Selling straight from a Facebook page (often called f-commerce) is cheap, fast and
          familiar to buyers. A website costs more to set up but gives you things a page never will:
          proper tracking, your own customer data, and a shop that works while you sleep. This isn’t
          an either-or forever. It’s about what fits the stage you’re at.
        </p>
      </Prose>

      <div className="mt-10">
        <KeyTakeaways
          items={[
            'A page is perfect for starting: no setup cost, and buyers already trust chat.',
            'A website wins once you want to scale ads, track sales properly and own your customer list.',
            'Most growing brands end up using both: the page for trust and chat, the site for orders.',
            'Move to a website before you hit the limits of manual chat selling, not after.',
          ]}
        />
      </div>

      <Section id="compare" n={1} title="Page vs website">
        <CompareTable
          columns={['', 'Facebook page only', 'Your own website']}
          rows={[
            ['Setup cost', 'Free', 'Domain, hosting and build or a platform fee'],
            ['Ordering', 'Through chat, by hand', 'Checkout, any time of day'],
            ['Ad tracking', 'Limited; sales happen in chat', 'Full Pixel and Conversions API'],
            ['Customer data', 'Lives in your inbox', 'Yours, in your order system'],
            ['Trust', 'Familiar, but anyone can open a page', 'Looks established when done well'],
            ['Risk', 'Page restricted or hacked = business gone', 'You control it'],
          ]}
        />
        <Callout tone="warning">
          If your whole business lives on one Facebook page, a restriction or a hacked account can
          shut it down overnight. That risk alone is a good reason to have your own website and
          customer list.
        </Callout>
      </Section>

      <Section id="when" n={2} title="Signs it’s time for a website">
        <Figure title="If several of these sound familiar…" example={false}>
          <Versus
            left={{
              title: 'Still fine on a page',
              points: [
                'A handful of orders a day',
                'One or two products',
                'You can reply to every message quickly',
                'Small, local ad budget',
              ],
            }}
            right={{
              title: 'Time for a website',
              points: [
                'Messages pile up and orders get missed',
                'A catalogue that is hard to show in chat',
                'You want to scale ads with proper tracking',
                'You want a customer list you own',
              ],
            }}
          />
        </Figure>
      </Section>

      <PullQuote>
        Your Facebook page is rented land. Your website and customer list are yours.
      </PullQuote>

      <Section id="move" n={3} title="How to move without losing sales">
        <Steps
          steps={[
            {
              title: 'Start with your best sellers',
              body: 'You don’t need the full catalogue on day one. Get your top products live and working.',
            },
            {
              title: 'Keep chat open',
              body: 'Add WhatsApp and Messenger buttons to the site. Some buyers will always want to ask first.',
            },
            {
              title: 'Set up tracking before ads',
              body: 'Pixel and Conversions API, tested, before you send paid traffic.',
            },
            {
              title: 'Send some ads to the site',
              body: 'Run website ads alongside your message ads and compare cost per order.',
            },
            {
              title: 'Shift gradually',
              body: 'Move budget towards whichever brings more delivered orders.',
            },
          ]}
        />
        <Callout tone="local">
          Show <strong>cash on delivery</strong>, delivery times and a phone number clearly on the
          site. Buyers used to ordering through a page want the same reassurance.
        </Callout>
      </Section>

      <Section id="check" n={4} title="Website launch checklist">
        <Figure title="Before you send ads to the site" example={false}>
          <Checklist
            items={[
              'Loads fast on a phone with mobile data',
              'Clear prices, delivery charges and times',
              'Cash on delivery available at checkout',
              'WhatsApp or Messenger button visible',
              'Pixel and Conversions API tested',
              'Simple checkout: name, phone, address',
            ]}
            verdicts={[
              'Not ready for paid traffic yet.',
              'Close. Finish these before spending on ads.',
              'Ready to start sending ads to your site.',
            ]}
          />
        </Figure>
      </Section>

      <InlineCta
        title="Thinking about moving to a website?"
        body="We’ll help you decide what to send where, and set up tracking so ads can scale. Book a free call."
      />

      <Section id="faq" n={5} title="Things people ask us">
        <FaqList
          items={[
            {
              q: 'Shopify, WooCommerce or a custom site?',
              a: 'Any of them can work. Choose based on budget, payment and courier integrations, and who will maintain it. What matters more is speed and tracking.',
            },
            {
              q: 'Will a website lower my sales at first?',
              a: 'Possibly for a few weeks while buyers get used to it. Keep chat open alongside, and the dip is usually small.',
            },
            {
              q: 'Do I still need my Facebook page?',
              a: 'Yes. It’s where people check you’re real, read comments and message you. It just shouldn’t be the only place your business lives.',
            },
          ]}
        />
      </Section>
    </>
  );
}
