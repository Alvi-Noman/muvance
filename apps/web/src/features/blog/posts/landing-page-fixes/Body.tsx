import { Star, Truck } from 'lucide-react';
import {
  Callout,
  FaqList,
  Figure,
  InlineCta,
  KeyTakeaways,
  Lead,
  Prose,
  Section,
  Steps,
} from '../../components/article';
import { BarList, Checklist, Funnel } from '../../components/viz';

const ANATOMY = [
  { label: 'Real photo or video', detail: 'Ideally on a person, so size and colour are clear.' },
  { label: 'Name and clear price', detail: 'Visible without scrolling, with any discount.' },
  { label: 'Proof', detail: 'Star rating and number of real reviews.' },
  { label: 'Delivery and COD', detail: 'Cash on delivery and delivery time, near the price.' },
  { label: 'Sticky order button', detail: 'Stays on screen as people scroll.' },
];

/**
 * Points at one part of the phone. On wide screens it’s a label beside the phone;
 * on phones it’s a numbered dot, explained in the list underneath.
 */
function Marker({ n, className }: { n: number; className: string }) {
  const item = ANATOMY[n - 1]!;
  return (
    <>
      <span
        className={`absolute -right-3 grid size-6 place-items-center rounded-full bg-emerald-500 text-[11px] font-semibold text-white shadow-md ring-2 ring-white sm:hidden ${className}`}
        aria-hidden
      >
        {n}
      </span>
      <span
        className={`absolute -right-2 hidden translate-x-full rounded-full bg-neutral-950 px-2.5 py-1 text-xs font-medium whitespace-nowrap text-white sm:block ${className}`}
      >
        {item.label}
      </span>
    </>
  );
}

/** A phone mock-up labelling what belongs on the first screen of a product page. */
function PhoneAnatomy() {
  return (
    <div className="flex flex-col items-center gap-6 py-2 sm:flex-row sm:justify-center sm:pr-40">
      <div className="relative w-60 rounded-[2.2rem] border-[6px] border-neutral-950 bg-white p-3 shadow-2xl shadow-black/20 sm:w-56">
        <div className="mx-auto mb-2 h-1.5 w-14 rounded-full bg-neutral-200" />
        <div className="relative aspect-square rounded-2xl bg-gradient-to-br from-amber-100 to-rose-100">
          <Marker n={1} className="top-1/2" />
        </div>
        <div className="relative mt-3">
          <p className="text-sm font-semibold">Cotton Panjabi, Navy</p>
          <p className="mt-0.5 text-sm">
            <span className="font-semibold">৳1,890</span>{' '}
            <span className="text-xs text-neutral-400 line-through">৳2,400</span>
          </p>
          <Marker n={2} className="top-2" />
        </div>
        <div className="relative mt-2 flex items-center gap-1 text-[11px] whitespace-nowrap text-neutral-600">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star key={i} className="size-3 fill-amber-400 text-amber-400" aria-hidden />
          ))}
          <span>212 reviews</span>
          <Marker n={3} className="top-0" />
        </div>
        <div className="relative mt-2 flex items-center gap-1.5 rounded-lg bg-emerald-50 px-2 py-1.5 text-[11px] text-emerald-900">
          <Truck className="size-3.5 shrink-0" aria-hidden />
          Cash on delivery · Dhaka 1–2 days
          <Marker n={4} className="top-0.5" />
        </div>
        <div className="relative mt-3 rounded-xl bg-neutral-950 py-2.5 text-center text-xs font-semibold text-white">
          Order now
          <Marker n={5} className="top-1.5" />
        </div>
      </div>

      {/* Phone-only key for the numbered dots */}
      <ol className="w-full space-y-2 sm:hidden">
        {ANATOMY.map((item, i) => (
          <li key={item.label} className="flex gap-3 rounded-2xl bg-neutral-50 p-3">
            <span className="grid size-6 shrink-0 place-items-center rounded-full bg-emerald-500 text-[11px] font-semibold text-white">
              {i + 1}
            </span>
            <span className="text-sm leading-snug">
              <strong className="font-semibold text-neutral-950">{item.label}.</strong>{' '}
              <span className="text-neutral-600">{item.detail}</span>
            </span>
          </li>
        ))}
      </ol>
    </div>
  );
}

export function Body() {
  return (
    <>
      <Lead>
        Your ad did its job: people clicked. Then they left without buying. The problem is almost
        never the ad. It’s the page they landed on.
      </Lead>
      <Prose>
        <p>
          A good ad sends interested people to your store. Whether they buy depends on the next ten
          seconds: how fast the page loads, whether they find the price, whether they trust you. Fix
          the page and every taka you spend on ads works harder, without touching the campaigns.
        </p>
      </Prose>

      <div className="mt-10">
        <KeyTakeaways
          items={[
            'Most ad traffic is on phones. Design and test the page on a phone first.',
            'Every extra second of loading time loses visitors.',
            'The first screen must show the product, the price, delivery and a buy button.',
            'The page must match the ad’s promise, or people feel tricked and leave.',
          ]}
        />
      </div>

      <Section id="funnel" n={1} title="Where visitors drop off">
        <Figure
          title="1,000 ad clicks on a typical product page"
          caption="Each drop is a different problem. Find your biggest one and fix that first."
        >
          <Funnel
            stages={[
              {
                label: 'Clicked the ad',
                value: 1000,
                note: 'Some never wait for the page to load',
              },
              { label: 'Page loaded', value: 780, note: 'They saw the product' },
              { label: 'Added to cart', value: 90, note: 'Price, photos and trust convinced them' },
              {
                label: 'Started checkout',
                value: 52,
                note: 'Delivery charge and form length matter here',
              },
              { label: 'Ordered', value: 24, note: 'A 2.4% conversion rate' },
            ]}
          />
        </Figure>
      </Section>

      <Section id="speed" n={2} title="Fix 1: make it load fast on mobile data">
        <p>
          Google’s research on mobile pages found that as load time goes from one second to several,
          the chance of a visitor leaving rises sharply.
        </p>
        <Figure
          title="How much more likely a visitor is to leave, compared with a 1-second load"
          caption="Source: Google / SOASTA research on mobile page speed (2017)."
          example={false}
        >
          <BarList
            items={[
              { label: '1s → 3s', value: 32, tone: 'ink' },
              { label: '1s → 5s', value: 90, tone: 'ink' },
              { label: '1s → 6s', value: 106, tone: 'warm' },
              { label: '1s → 10s', value: 123, tone: 'warm' },
            ]}
            format={(v) => `+${v}%`}
          />
        </Figure>
        <ul>
          <li>Compress product photos (WebP, under about 200 KB each).</li>
          <li>Remove apps, plugins and pop-ups you don’t need.</li>
          <li>Test with Google PageSpeed Insights on the mobile setting.</li>
        </ul>
      </Section>

      <Section
        id="first-screen"
        n={3}
        title="Fix 2: put everything that matters on the first screen"
      >
        <p>
          On a phone, the first screen decides whether people scroll or leave. It should answer:
          what is it, what does it cost, can I trust you, and how do I get it?
        </p>
        <Figure title="What the first screen of a product page needs" example={false}>
          <PhoneAnatomy />
        </Figure>
      </Section>

      <Section id="fixes" n={4} title="Fixes 3–10">
        <Steps
          steps={[
            {
              title: 'Match the ad',
              body: 'Same product, same offer, same photo style. If the ad says "free delivery", the page must say it too.',
            },
            {
              title: 'Show the full price early',
              body: 'Product price and delivery charge, before checkout. Surprises at the end cause abandoned carts.',
            },
            {
              title: 'Add real reviews',
              body: 'Customer photos and WhatsApp screenshots (with permission) build more trust than star ratings alone.',
            },
            {
              title: 'Make the button sticky',
              body: 'An "Order now" button that stays on screen as people scroll.',
            },
            {
              title: 'Shorten the checkout form',
              body: 'Name, phone, address. Remove every field you don’t need to deliver the parcel.',
            },
            {
              title: 'Answer objections on the page',
              body: 'Size chart, fabric, return policy and delivery time, in a short FAQ.',
            },
            {
              title: 'Offer a WhatsApp button',
              body: 'Some buyers want to ask one question first. Make it easy, then close the sale in chat.',
            },
            {
              title: 'Speak your buyer’s language',
              body: 'Test Bangla copy for mass-market products. Many buyers trust and understand it faster.',
            },
          ]}
        />
        <Callout tone="local">
          Show <strong>&quot;Cash on delivery available&quot;</strong> near the price. For many
          first-time buyers in Bangladesh, it’s the single biggest trust signal on the page.
        </Callout>
      </Section>

      <Section id="audit" n={5} title="Score your product page">
        <Figure title="Tick what is true on your page today" example={false}>
          <Checklist
            items={[
              'Loads in under 3 seconds on mobile data',
              'Price visible without scrolling',
              'Delivery charge and time shown before checkout',
              'Cash on delivery clearly mentioned',
              'Real photos, ideally on a person',
              'At least 5 real reviews',
              'Sticky "Order now" button',
              'Checkout asks only name, phone, address',
              'Page matches the ad offer exactly',
              'WhatsApp contact button',
            ]}
            verdicts={[
              'Your page is likely costing you a lot of sales. Start with speed and the first screen.',
              'Decent page. Each unticked item is an easy win.',
              'Strong page. Now test headlines and offers to push it further.',
            ]}
          />
        </Figure>
      </Section>

      <InlineCta
        title="Not sure why visitors aren’t buying?"
        body="On a free call we review your product pages alongside your ads, and show you the fixes that will matter most."
      />

      <Section id="faq" n={6} title="Things people ask us">
        <FaqList
          items={[
            {
              q: 'Should I send ads to my Facebook page or my website?',
              a: 'A fast website with clear pricing usually converts better and gives Meta better purchase data. Messenger or WhatsApp campaigns can work well for products that need questions answered first. Test both.',
            },
            {
              q: 'What is a good conversion rate?',
              a: 'It depends on price, product and traffic quality. Compare with your own history, and focus on improving your biggest drop-off stage.',
            },
            {
              q: 'Do I need a separate landing page for each ad?',
              a: 'Not usually. A strong product page works for most ads. Build special pages for big offers, bundles or very different audiences.',
            },
          ]}
        />
      </Section>
    </>
  );
}
