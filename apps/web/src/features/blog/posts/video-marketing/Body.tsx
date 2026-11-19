import { Link } from 'react-router';
import { Callout, CompareTable, FaqList, InlineCta, Lead, Section } from '../../components/article';

export function Body() {
  return (
    <>
      <Lead>
        The best-performing ads in many accounts are shot on a phone. Polish is optional. Clarity is
        not.
      </Lead>
      <Section id="kit" n={1} title="The minimum kit">
        <CompareTable
          columns={['Item', 'Approximate cost', 'Why']}
          rows={[
            ['A recent phone', 'You have one', 'Good enough for social'],
            ['Clip-on microphone', 'Low', 'Bad audio ruins good video'],
            ['Tripod or phone stand', 'Low', 'Steady shots'],
            ['Window light or a ring light', 'Free or low', 'Lighting matters more than camera'],
            ['Free editing app', 'Free', 'CapCut and similar apps are enough'],
          ]}
        />
      </Section>
      <Section id="shots" n={2} title="Shots that sell">
        <ul>
          <li>The product in use, in a real setting.</li>
          <li>Close-ups of texture, stitching, ingredients.</li>
          <li>A person reacting honestly.</li>
          <li>Before and after, where it is real.</li>
          <li>Unboxing, from the customer’s view.</li>
        </ul>
        <Callout tone="tip">
          Shoot vertical (9:16) by default. It works for Reels, Stories, TikTok and Shorts, and can
          be cropped for feeds.
        </Callout>
      </Section>
      <Section id="workflow" n={3} title="A weekly workflow">
        <p>
          One shooting session a week, five to ten short clips, edited in batches. Post the best
          ones organically, then turn the winners into ads. See{' '}
          <Link to="/blog/reels-ads-that-sell">Reels ads that sell</Link>.
        </p>
      </Section>
      <InlineCta
        title="Want video made for you?"
        body="Book a free call. Creative production is part of what we do."
      />
      <Section id="faq" n={4} title="Questions people ask">
        <FaqList
          items={[
            {
              q: 'Do I need a professional videographer?',
              a: 'For brand films, it helps. For ads and social content, phones and good ideas usually win.',
            },
            {
              q: 'How long should videos be?',
              a: 'For ads, 15 to 30 seconds is common. The hook in the first two seconds matters most.',
            },
          ]}
        />
      </Section>
    </>
  );
}
