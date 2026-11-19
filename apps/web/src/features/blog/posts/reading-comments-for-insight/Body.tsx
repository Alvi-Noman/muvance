import {
  Callout,
  FaqList,
  Figure,
  InlineCta,
  KeyTakeaways,
  Lead,
  Prose,
  Section,
} from '../../components/article';
import { BarList } from '../../components/viz';

export function Body() {
  return (
    <>
      <Lead>
        Every “price?” and “delivery koto din?” in your inbox is a customer telling you what your ad
        left out.
      </Lead>
      <Prose>
        <p>
          Big brands pay research firms to learn what people think. Small brands have something just
          as good, for free: hundreds of comments and messages a week. Most of it gets answered and
          forgotten.
        </p>
      </Prose>
      <div className="mt-10">
        <KeyTakeaways
          items={[
            'Tag one week of messages by topic. It takes an hour.',
            'The top three questions belong in your ads and product page.',
            'Copy customers’ exact phrases. They write better hooks than we do.',
          ]}
        />
      </div>
      <Section id="collect" n={1} title="Collect a week of messages">
        <p>
          Export or screenshot one normal week of comments, Messenger, WhatsApp and Instagram DMs.
          Skip festival weeks, they are not typical.
        </p>
        <p>
          Then put each message into a simple sheet with three columns: what they asked, the exact
          words, and whether they ended up ordering.
        </p>
      </Section>
      <Section id="tag" n={2} title="Tag it by topic">
        <Figure
          title="What a week of messages often looks like"
          caption="Your own split will differ. The point is to know your top three."
        >
          <BarList
            items={[
              { label: 'Price', value: 31, note: 'Ad did not show the price', tone: 'ink' },
              { label: 'Delivery time', value: 22, note: 'Especially outside Dhaka', tone: 'ink' },
              { label: 'Size or fit', value: 17, note: 'Missing size guide', tone: 'accent' },
              { label: 'Is it original?', value: 12, note: 'Trust gap', tone: 'warm' },
              { label: 'COD available?', value: 10, tone: 'muted' },
              { label: 'Other', value: 8, tone: 'muted' },
            ]}
            format={(v) => `${v}%`}
          />
        </Figure>
      </Section>
      <Section id="act" n={3} title="Fix the gap, then make the ad">
        <p>Each top question points to a fix:</p>
        <ul>
          <li>
            <strong>Price questions:</strong> show the price on the creative or the first line of
            copy. Hiding it rarely builds curiosity, it just adds a step.
          </li>
          <li>
            <strong>Delivery questions:</strong> state the days for inside and outside Dhaka on the
            product page and in the ad.
          </li>
          <li>
            <strong>Trust questions:</strong> add real customer photos, an unboxing video, your
            return policy.
          </li>
        </ul>
        <p>
          Then turn the best phrases into hooks. If people keep writing “ei shoe ta ki narrow?”, an
          ad that opens with “Worried these run narrow?” will feel like it read their mind.
        </p>
        <Callout tone="local">
          Many customers ask in Banglish. Keep their spelling when you test hooks. It often
          outperforms polished Bangla or English.
        </Callout>
      </Section>
      <InlineCta
        title="Want a fresh set of hooks from your inbox?"
        body="Book a free call. We will show you how we turn customer messages into ad angles."
      />
      <Section id="faq" n={4} title="Questions we get about this">
        <FaqList
          items={[
            {
              q: 'How often should I do this?',
              a: 'Once a month is enough for most brands, plus after any big launch.',
            },
            {
              q: 'What if I get very few messages?',
              a: 'Use reviews, competitor comments and Facebook group posts in your niche instead.',
            },
          ]}
        />
      </Section>
    </>
  );
}
