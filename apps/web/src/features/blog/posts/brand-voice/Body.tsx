import { Link } from 'react-router';
import { Callout, CompareTable, FaqList, InlineCta, Lead, Section } from '../../components/article';

export function Body() {
  return (
    <>
      <Lead>If you covered your logo, would anyone know a post was yours?</Lead>
      <Section id="define" n={1} title="Define it in three pairs">
        <p>
          Pick three words that describe your voice, and for each, what it does not mean. The second
          half is what keeps a team consistent.
        </p>
        <CompareTable
          columns={['We are', 'But not', 'Example']}
          rows={[
            ['Friendly', 'Childish', '“Your order’s on the way!” not “Yayyy omg!!”'],
            ['Confident', 'Arrogant', '“Built to last” not “The best in Bangladesh”'],
            ['Simple', 'Boring', 'Short sentences, still with personality'],
          ]}
        />
      </Section>
      <Section id="apply" n={2} title="Where it shows up">
        <ul>
          <li>Ad copy and captions.</li>
          <li>Replies to comments and messages.</li>
          <li>Order confirmation SMS and calls.</li>
          <li>Packaging inserts and thank-you notes.</li>
          <li>Error messages and out-of-stock notices.</li>
        </ul>
        <Callout tone="tip">
          Write ten example sentences in your voice and share them with anyone who writes for you,
          including AI tools.
        </Callout>
      </Section>
      <Section id="language" n={3} title="Choosing your language">
        <p>
          Bangla, English or Banglish is part of voice too. Match your customers, and be consistent.
          See <Link to="/blog/bangla-vs-english-ad-copy">Bangla vs English ad copy</Link>.
        </p>
      </Section>
      <InlineCta
        title="Want help defining how your brand sounds?"
        body="Book a free call. We help brands get this clear."
      />
      <Section id="faq" n={4} title="Questions people ask">
        <FaqList
          items={[
            {
              q: 'Should voice change by platform?',
              a: 'Tone can flex a little; the voice should stay recognisable.',
            },
            {
              q: 'Is “professional” a voice?',
              a: 'Not really. It is a minimum. Pick words that make you distinct.',
            },
          ]}
        />
      </Section>
    </>
  );
}
