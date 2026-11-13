import { Camera, Smartphone, Sparkles, type LucideIcon } from 'lucide-react';
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
import { Checklist } from '../../components/viz';

type Style = {
  icon: LucideIcon;
  name: string;
  cost: string;
  speed: string;
  good: string[];
  watch: string;
  best: string;
};

const STYLES: Style[] = [
  {
    icon: Smartphone,
    name: 'UGC',
    cost: 'Low to medium',
    speed: 'Days',
    good: ['Feels real, so people trust it', 'Fits right into the feed', 'Easy to make lots of'],
    watch: 'Quality varies a lot between creators.',
    best: 'Building trust and explaining the product',
  },
  {
    icon: Camera,
    name: 'Studio',
    cost: 'High',
    speed: 'Weeks',
    good: ['Makes the product look premium', 'Consistent with your brand', 'Great for launches'],
    watch: 'Can look like "an ad", and people scroll past ads.',
    best: 'Premium products and brand image',
  },
  {
    icon: Sparkles,
    name: 'AI-made',
    cost: 'Very low',
    speed: 'Hours',
    good: [
      'Fast variations and resizes',
      'Cheap backgrounds and statics',
      'Good for testing angles',
    ],
    watch: 'Can misrepresent the product, and real people trust it less.',
    best: 'Variations, statics and quick tests',
  },
];

function StyleCards() {
  return (
    <div className="grid gap-3 lg:grid-cols-3">
      {STYLES.map((s, i) => (
        <div
          key={s.name}
          className={
            i === 0
              ? 'rounded-3xl bg-neutral-950 p-5 text-white'
              : 'rounded-3xl border border-black/5 bg-neutral-50 p-5'
          }
        >
          <s.icon
            className={i === 0 ? 'size-5 text-emerald-300' : 'size-5 text-neutral-500'}
            aria-hidden
          />
          <p className="mt-3 font-serif text-3xl leading-none">{s.name}</p>
          <dl
            className={
              i === 0
                ? 'mt-4 space-y-1 text-xs text-neutral-400'
                : 'mt-4 space-y-1 text-xs text-neutral-500'
            }
          >
            <div className="flex justify-between gap-3">
              <dt>Cost</dt>
              <dd className={i === 0 ? 'text-white' : 'text-neutral-900'}>{s.cost}</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt>Turnaround</dt>
              <dd className={i === 0 ? 'text-white' : 'text-neutral-900'}>{s.speed}</dd>
            </div>
          </dl>
          <ul
            className={
              i === 0
                ? 'mt-4 space-y-1.5 text-sm text-neutral-200'
                : 'mt-4 space-y-1.5 text-sm text-neutral-700'
            }
          >
            {s.good.map((g) => (
              <li key={g}>+ {g}</li>
            ))}
          </ul>
          <p className={i === 0 ? 'mt-3 text-sm text-amber-300' : 'mt-3 text-sm text-amber-700'}>
            ! {s.watch}
          </p>
          <p
            className={
              i === 0
                ? 'mt-4 border-t border-white/10 pt-3 text-xs text-neutral-400'
                : 'mt-4 border-t border-black/5 pt-3 text-xs text-neutral-500'
            }
          >
            Best for: <span className={i === 0 ? 'text-white' : 'text-neutral-900'}>{s.best}</span>
          </p>
        </div>
      ))}
    </div>
  );
}

export function Body() {
  return (
    <>
      <Lead>
        Phone-filmed creator videos, polished studio shoots, or ads made with AI in an afternoon.
        Which one actually sells? Annoyingly, the answer is usually &quot;a mix&quot;. But not an
        even one.
      </Lead>
      <Prose>
        <p>
          Every few months someone declares one style dead. First it was &quot;studio ads don’t work
          anymore&quot;, then &quot;UGC is saturated&quot;, now &quot;AI will replace
          everything&quot;. In practice, each style is good at a different job. The brands that do
          well know which job they’re hiring each one for.
        </p>
      </Prose>

      <div className="mt-10">
        <KeyTakeaways
          items={[
            'UGC (content from real customers or creators) is usually the workhorse, because it feels like the feed.',
            'Studio content earns its cost for premium products, launches and brand image.',
            'AI is brilliant for speed and variations, and weaker where trust matters most.',
            'Don’t pick one. Test each style on the same idea and let your numbers decide the mix.',
          ]}
        />
      </div>

      <Section id="compare" n={1} title="The three styles at a glance">
        <Figure title="UGC vs studio vs AI" example={false}>
          <StyleCards />
        </Figure>
      </Section>

      <Section id="ugc" n={2} title="Why UGC tends to carry the account">
        <p>
          People open Facebook and Instagram to see people, not adverts. A video of someone in their
          kitchen, talking about why they reordered, looks like everything else in the feed. That
          buys you the two or three seconds you need.
        </p>
        <p>
          It’s also cheap enough to make in volume, which matters more than any single ad being
          perfect. (We go into the maths of that in our post on how many creatives you need per
          week.)
        </p>
        <Callout tone="local">
          In Bangladesh, creators who speak the way your buyers speak, with the right mix of Bangla
          and English, often beat bigger names. Relatability beats follower count.
        </Callout>
      </Section>

      <Section id="studio" n={3} title="When the studio shoot is worth it">
        <p>
          If you’re selling something where looks are the product (jewellery, premium fashion, home
          decor), a beautiful shot does work that a shaky phone video can’t. Studio content also
          gives you assets for your website and launches, so the cost goes further.
        </p>
        <p>
          Our advice: shoot once, and get loads out of it. Ask for short clips and stills as well as
          the &quot;hero&quot; video, so one shoot feeds weeks of ads.
        </p>
      </Section>

      <Section id="ai" n={4} title="Where AI fits">
        <p>
          AI is fantastic at the boring parts: resizing for every placement, new backgrounds for
          product photos, ten headline variations, quick static ads to test an angle before you
          spend on filming it. Where it struggles is trust. People are getting good at spotting it,
          and a product that looks different in real life leads to returns.
        </p>
        <p>
          We wrote a whole post on whether AI ads can beat human-made ones, if you want the longer
          version.
        </p>
      </Section>

      <Section id="test" n={5} title="How to find your mix">
        <Steps
          steps={[
            {
              title: 'Pick one strong idea',
              body: 'For example "it survives the monsoon" for a waterproof bag.',
            },
            {
              title: 'Make it in each style',
              body: 'A creator video, a studio version and an AI-made static, all with the same message.',
            },
            {
              title: 'Run them side by side',
              body: 'Same ad set, similar budget. Give them a week.',
            },
            {
              title: 'Compare cost per purchase',
              body: 'Not likes. A beautiful ad that doesn’t sell is just a beautiful ad.',
            },
            {
              title: 'Shift your budget',
              body: 'Put more of next month’s creative budget into whatever wins, and repeat every quarter.',
            },
          ]}
        />
      </Section>

      <Section id="brief" n={6} title="A quick creator brief checklist">
        <p>
          Most bad UGC comes from a bad brief. Before you send a creator anything, tick these off.
        </p>
        <Figure title="Creator brief" example={false}>
          <Checklist
            items={[
              'One clear message, not five',
              'What to say in the first 3 seconds',
              'Must-show shots (product in use, close-up)',
              'Words and claims to avoid',
              'Vertical 9:16, natural light, clear audio',
              'Raw clips included, not just the final edit',
              'Usage rights agreed in writing',
              'Deadline and number of revisions',
            ]}
            verdicts={[
              'This brief will get you random results. Fill in the gaps first.',
              'Getting there. Tighten the remaining points.',
              'That’s a brief creators can actually deliver on.',
            ]}
          />
        </Figure>
      </Section>

      <InlineCta
        title="Need a steady flow of ads that sell?"
        body="We mix creator, studio and AI content for our clients and test it every week. Book a free call to talk through your brand."
      />

      <Section id="faq" n={7} title="Things people ask us">
        <FaqList
          items={[
            {
              q: 'Where do I find UGC creators in Bangladesh?',
              a: 'Start with your own customers. Then look at small creators who already post about your category. They’re often happy to make content for a fee or free product.',
            },
            {
              q: 'Do I need permission to use a customer video in ads?',
              a: 'Yes. Always get written permission, and agree how long you can use it.',
            },
            {
              q: 'Is professional editing worth it for UGC?',
              a: 'Light editing helps: captions, a tight cut, a clear end screen. Over-editing can remove the natural feel that made it work.',
            },
          ]}
        />
      </Section>
    </>
  );
}
