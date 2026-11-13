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
import {
  AttributionSwitcher,
  CodFunnel,
  DashboardsDisagree,
  DedupDiagram,
  GapWaterfall,
  MerCalculator,
  OneCustomerTwoDates,
} from './visuals';

export function Body() {
  return (
    <>
      <Lead>
        Ads Manager says 142 sales. Your store says 97. Somebody is wrong, and your budget decisions
        depend on knowing who.
      </Lead>
      <Prose>
        <p>
          Almost every brand running Meta ads hits this moment. You open Ads Manager, see a healthy
          number of purchases, then open Shopify or WooCommerce and find far fewer orders. The good
          news: in most cases nobody is lying. The two systems are answering{' '}
          <strong>different questions</strong>, on <strong>different dates</strong>, with{' '}
          <strong>different rules</strong>. Once you know those rules, you can close most of the gap
          and make decisions on numbers you trust.
        </p>
      </Prose>

      <Figure
        title="Same week, same ads, two different answers"
        caption="A typical week for a fashion brand. The rest of this article explains where the missing sales went."
      >
        <DashboardsDisagree />
      </Figure>

      <div className="mt-10">
        <KeyTakeaways
          items={[
            <>
              Meta counts sales it <strong className="text-white">influenced</strong>; your store
              counts orders it <strong className="text-white">received</strong>. They will never
              match exactly.
            </>,
            <>
              The biggest causes are view-through credit, different booking dates, modelled
              conversions, duplicate events and cancelled cash-on-delivery orders.
            </>,
            <>
              Compare on <strong className="text-white">7-day click</strong>, in the same time zone,
              with Pixel and Conversions API sharing one event ID.
            </>,
            <>
              For the big decisions, trust <strong className="text-white">MER</strong>: total
              revenue divided by total ad spend.
            </>,
          ]}
        />
      </div>

      <Section id="the-gap" n={1} title="A gap is normal. A huge gap is a warning.">
        <p>
          Meta’s job is to show you which sales your ads <em>helped cause</em>. Your store’s job is
          to record every order that actually arrived. Those are different things, so some
          difference is built in.
        </p>
        <p>
          What matters is the size and the direction of the gap. A modest, stable gap you can live
          with. A gap that suddenly widens, or Meta reporting{' '}
          <strong>more sales than your whole store received</strong>, means something is broken,
          usually tracking.
        </p>
        <Figure
          title="Where the 45 missing sales usually go"
          caption="Each amber bar is one cause. The exact split is different for every store; the causes are the same."
        >
          <GapWaterfall />
        </Figure>
      </Section>

      <Section id="how-each-counts" n={2} title="How Meta and your store each count a sale">
        <p>Put the two side by side and the gap stops being mysterious.</p>
        <CompareTable
          columns={['', 'Meta Ads Manager', 'Your store']}
          rows={[
            [
              'What counts',
              'Purchases by people who clicked or saw an ad within the attribution window',
              'Every order placed, from any source',
            ],
            ['Which date', 'The day of the ad click or view', 'The day the order was placed'],
            [
              'Who gets credit',
              'Meta, even if Google or WhatsApp also played a part',
              'Nobody: it just records the order (UTMs show the source)',
            ],
            ['Estimated sales', 'Yes, modelled for people it can’t track', 'No, only real orders'],
            [
              'Cancelled orders',
              'Still counted once the Purchase event fired',
              'Usually marked cancelled or refunded',
            ],
          ]}
        />
      </Section>

      <Section id="attribution" n={3} title="Reason 1: Meta counts people who only saw your ad">
        <p>
          Meta’s default <strong>attribution setting</strong> is 7-day click and 1-day view. A sale
          counts if the buyer clicked your ad in the last 7 days, <em>or</em> simply saw it in the
          last 24 hours without clicking.
        </p>
        <p>
          That view-through credit is the single biggest source of &quot;extra&quot; sales. Someone
          scrolls past your Reel, later searches your brand on Google, and buys. Meta counts it. So
          does Google. Your store counts one order.
        </p>
        <Figure
          title="Try it: switch the attribution setting"
          caption="Comparing on 7-day click removes view-through credit, which is usually the fairest like-for-like view."
        >
          <AttributionSwitcher />
        </Figure>
        <Callout tone="tip">
          In Ads Manager, open <strong>Columns → Compare attribution settings</strong>. You can see
          click-only and view-only results side by side without changing your campaigns.
        </Callout>
      </Section>

      <Section id="dates" n={4} title="Reason 2: the same sale lands on different days">
        <p>
          Meta reports a conversion on the date of the <strong>ad interaction</strong>, not the
          purchase. Your store reports it on the date of the <strong>order</strong>. A customer who
          clicks on Monday and buys on Thursday shows up on Monday in Ads Manager and Thursday in
          your store.
        </p>
        <Figure title="One customer, two booking dates" example={false}>
          <OneCustomerTwoDates />
        </Figure>
        <p>
          Over a month this mostly evens out. Over a single day or a short sale, it can make a
          campaign look brilliant or broken. Time zones add to it: if your ad account is set to a
          different time zone from your store, sales near midnight jump from one day to the next.
        </p>
        <Callout tone="warning">
          Never judge a campaign on one day of data. Compare at least 7 days, and only after the
          attribution window has closed for the period you’re looking at.
        </Callout>
      </Section>

      <Section id="modelled" n={5} title="Reason 3: some of Meta’s sales are estimates">
        <p>
          Since Apple’s App Tracking Transparency and the rise of ad blockers, Meta can’t follow
          every buyer. To fill the holes, it uses <strong>modelled conversions</strong>: statistical
          estimates of sales it believes happened. They’re often directionally right, but they will
          never appear as orders in your store because they aren’t tied to a specific one.
        </p>
        <p>
          <strong>Cross-device</strong> journeys add to this. Meta knows who you’re on every device
          you’re logged in on, so it can connect an ad seen on a phone to a purchase made on a
          laptop. Your store just sees a new visitor typing your URL.
        </p>
      </Section>

      <PullQuote>
        Meta answers &ldquo;what did my ads influence?&rdquo; Your store answers &ldquo;what money
        came in?&rdquo; Both are useful. Neither is the whole truth.
      </PullQuote>

      <Section id="duplicates" n={6} title="Reason 4: the same purchase is sent twice">
        <p>
          Most serious setups send purchases two ways: from the browser with the{' '}
          <strong>Meta Pixel</strong>, and from your server with the{' '}
          <strong>Conversions API (CAPI)</strong>. That’s good, because the server copy survives ad
          blockers and iPhone restrictions. But Meta only knows the two are the same order if both
          carry the same <strong>event ID</strong>.
        </p>
        <Figure title="How Meta removes duplicates" example={false}>
          <DedupDiagram />
        </Figure>
        <p>Other common causes of double counting:</p>
        <ul>
          <li>The Purchase event fires again when a buyer refreshes the thank-you page.</li>
          <li>A plugin and a theme both install the Pixel, so every event fires twice.</li>
          <li>Purchase fires on &quot;Place order&quot; and again on payment confirmation.</li>
        </ul>
        <Callout tone="tip">
          Open <strong>Events Manager → your dataset → Overview</strong> and check that Purchase
          shows both Browser and Server with deduplication working. Then check{' '}
          <strong>Event Match Quality</strong>: higher scores mean Meta can match more of your real
          buyers.
        </Callout>
      </Section>

      <Section id="cod" n={7} title="Reason 5: cash-on-delivery orders that never complete">
        <p>
          This one hits Bangladeshi brands hardest. Your Pixel fires Purchase the moment someone
          places an order. But with cash on delivery, a share of those orders are fake numbers,
          duplicates, or buyers who refuse the parcel at the door.
        </p>
        <Figure
          title="From 100 orders placed to real money"
          caption="Meta sees the top bar. Your bank sees the bottom one."
        >
          <CodFunnel />
        </Figure>
        <Callout tone="local">
          If you compare Ads Manager with <strong>delivered</strong> orders instead of placed
          orders, the gap grows again. Worse, Meta learns to find people who <em>place</em> orders,
          not people who <em>pay</em>. Sending delivered orders back to Meta through the Conversions
          API, and optimising for them, is one of the biggest wins available to COD brands.
        </Callout>
      </Section>

      <InlineCta
        title={<>Not sure which of these is costing you?</>}
        body="On a free call we look at your store, your tracking and your ad account, and show you where the numbers stop adding up."
      />

      <Section id="fix" n={8} title="How to close the gap: a 7-step checklist">
        <p>Work through these in order. Most stores close the bulk of the gap by step 4.</p>
        <Steps
          steps={[
            {
              title: 'Match the time zones',
              body: 'Set your ad account and your store to the same time zone, then always compare the same date range.',
            },
            {
              title: 'Compare on 7-day click',
              body: (
                <>
                  Use <strong>Compare attribution settings</strong> and look at click-only results
                  when you check against your store.
                </>
              ),
            },
            {
              title: 'Send every purchase with an event ID',
              body: 'Make sure the Pixel and the Conversions API send the same event ID (your order number works well) so Meta can deduplicate.',
            },
            {
              title: 'Fire Purchase once',
              body: 'Remove duplicate Pixel installs, and stop the event firing again on page refresh or on payment confirmation.',
            },
            {
              title: 'Tag every ad with UTMs',
              body: (
                <>
                  Add <strong>utm_source=facebook</strong> and campaign UTMs so your store and
                  analytics can see which orders came from Meta clicks.
                </>
              ),
            },
            {
              title: 'Raise Event Match Quality',
              body: 'Send hashed phone numbers and emails (where you have them) with each server event. Better matching means fewer modelled guesses.',
            },
            {
              title: 'Feed back delivered orders',
              body: 'For cash-on-delivery stores, send confirmed or delivered orders to Meta and build reporting around them.',
            },
          ]}
        />
      </Section>

      <Section id="mer" n={9} title="The number to trust for big decisions: MER">
        <p>
          Even with perfect tracking, Meta’s number is Meta’s opinion. For decisions like
          &quot;should we double the budget?&quot;, look at <strong>MER</strong>, the marketing
          efficiency ratio: total revenue divided by total ad spend, across every channel.
        </p>
        <p>
          MER can’t be inflated by attribution windows or modelled sales, because it only uses money
          that actually arrived and money that actually left. If you raise Meta spend and MER holds
          steady while revenue climbs, the ads are working, whatever Ads Manager says.
        </p>
        <Figure title="Work out your MER" example={false}>
          <MerCalculator />
        </Figure>
        <Callout tone="tip" title="How to use both numbers">
          Use <strong>Ads Manager</strong> to compare ads and audiences <em>against each other</em>{' '}
          (which creative wins). Use <strong>MER</strong> to decide how much to spend in total.
        </Callout>
      </Section>

      <Section id="faq" n={10} title="Things people ask us">
        <FaqList
          items={[
            {
              q: 'How big a gap between Meta and my store is normal?',
              a: 'There’s no single right number; it depends on your attribution setting, how many other channels you run, and your share of iPhone users. Watch the trend instead. A stable gap is fine. A sudden jump, or Meta reporting more sales than your store received in total, points to a tracking problem.',
            },
            {
              q: 'Should I switch my campaigns to 7-day click only?',
              a: 'Not necessarily. The attribution setting also affects what Meta optimises for. Many brands keep the default for delivery and use "Compare attribution settings" for reporting. Test changes on one campaign before rolling them out.',
            },
            {
              q: 'Can Meta ever show fewer sales than my store?',
              a: 'Yes, and it’s common when tracking is weak: the Pixel is blocked, the Conversions API is missing, or the Purchase event isn’t firing on every checkout path. If Meta shows far fewer sales than your Meta-tagged UTM orders, fix tracking first.',
            },
            {
              q: 'Is Google Analytics more accurate than Meta?',
              a: 'It’s differently biased. Google Analytics usually favours the last click before purchase, which under-credits Meta ads that start the journey. Treat it as a third opinion, not the judge.',
            },
            {
              q: 'Do I need the Conversions API if the Pixel is already installed?',
              a: 'Yes, for almost every store today. The browser Pixel misses buyers with ad blockers and strict privacy settings. The server-side Conversions API fills those gaps, as long as both share an event ID.',
            },
          ]}
        />
      </Section>

      <InlineCta
        title={
          <>
            Get numbers you can <em>actually</em> trust.
          </>
        }
        body="We fix tracking for every client before spending a single taka on scaling. Book a free call and we’ll check yours."
      />
    </>
  );
}
