import { Link } from 'react-router';
import { CompareTable, FaqList, Figure, InlineCta, Lead, Section } from '../../components/article';
import { BarList } from '../../components/viz';

export function Body() {
  return (
    <>
      <Lead>
        A skincare brand that explains how to read an ingredient list will sell more serum than one
        that shouts “50% OFF”. Eventually.
      </Lead>
      <Section id="why" n={1} title="Why teaching works">
        <p>
          When you help someone understand their problem, you become the expert in their eyes. When
          they are ready to buy, you are the obvious choice. It also gives people a reason to follow
          you that is not just discounts.
        </p>
      </Section>
      <Section id="ideas" n={2} title="Ideas by category">
        <CompareTable
          columns={['Category', 'Teach this', 'Format']}
          rows={[
            ['Fashion', 'How to choose the right fit for your body', 'Carousel, Reel'],
            ['Skincare', 'Which ingredients do not mix', 'Carousel'],
            ['Electronics', 'What mAh really means for a power bank', 'Short video'],
            ['Food', 'How to store it so it lasts', 'Story, card in the box'],
            ['Home', 'How to measure before buying a curtain', 'Guide, video'],
          ]}
        />
      </Section>
      <Section id="balance" n={3} title="Getting the balance right">
        <Figure
          title="Organic reach and saves by post type (example)"
          caption="Indexed to the best post type = 100."
        >
          <BarList
            items={[
              {
                label: 'How-to carousel',
                value: 100,
                note: 'Most saved and shared',
                tone: 'accent',
              },
              { label: 'Behind the scenes', value: 70, tone: 'ink' },
              { label: 'Product photo', value: 45, tone: 'ink' },
              { label: 'Discount post', value: 30, tone: 'warm' },
            ]}
          />
        </Figure>
        <p>
          Teaching does not replace selling. It earns the attention you sell to. Mix the two in your{' '}
          <Link to="/blog/content-pillars-for-brands">content pillars</Link>.
        </p>
      </Section>
      <InlineCta
        title="Want help planning educational content?"
        body="Book a free call. We will suggest topics your customers want to learn."
      />
      <Section id="faq" n={4} title="Questions people ask">
        <FaqList
          items={[
            {
              q: 'Will teaching give away too much?',
              a: 'Rarely. Knowing how something works makes people more likely to buy it from the one who explained it.',
            },
            {
              q: 'Can educational posts be ads?',
              a: 'Yes, and they often work well with cold audiences.',
            },
          ]}
        />
      </Section>
    </>
  );
}
