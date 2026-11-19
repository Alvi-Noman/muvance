import { Callout, CompareTable, FaqList, InlineCta, Lead, Section } from '../../components/article';

export function Body() {
  return (
    <>
      <Lead>
        In a market full of anonymous Facebook shops, a real person standing behind the product is a
        powerful signal.
      </Lead>
      <Section id="why" n={1} title="Why it works">
        <ul>
          <li>Trust: people believe someone who shows their face and takes responsibility.</li>
          <li>Differentiation: competitors can copy products, not you.</li>
          <li>Content supply: founders have opinions, stories and expertise to share.</li>
        </ul>
      </Section>
      <Section id="topics" n={2} title="What to talk about">
        <CompareTable
          columns={['Topic', 'Example', 'Why it works']}
          rows={[
            [
              'Behind the decision',
              '“Why we switched to a thicker fabric”',
              'Shows care and quality',
            ],
            [
              'Honest answers',
              '“Is our serum good for sensitive skin? Here is the truth”',
              'Builds trust',
            ],
            ['The journey', '“Our first 100 orders”', 'People root for underdogs'],
            [
              'Customer moments',
              'Reading a review, packing a special order',
              'Proof without bragging',
            ],
          ]}
        />
      </Section>
      <Section id="time" n={3} title="Keeping it to an hour a week">
        <p>
          Record five short clips in one sitting, on a phone, near a window. Answer five customer
          questions. Let someone else edit and post. That is a week of content.
        </p>
        <Callout tone="tip">
          Founder videos often make strong ads too. Test one against your usual product ad.
        </Callout>
      </Section>
      <InlineCta
        title="Want help planning founder content?"
        body="Book a free call. We will turn your knowledge into a simple posting plan."
      />
      <Section id="faq" n={4} title="Questions people ask">
        <FaqList
          items={[
            {
              q: 'What if I am camera-shy?',
              a: 'Start with voiceovers over product footage, or behind-the-scenes clips of your hands at work.',
            },
            {
              q: 'Will it matter if I speak Bangla?',
              a: 'Speak the language your customers speak. Natural beats polished.',
            },
          ]}
        />
      </Section>
    </>
  );
}
