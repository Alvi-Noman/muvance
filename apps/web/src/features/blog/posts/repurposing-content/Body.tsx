import { Link } from 'react-router';
import { Callout, FaqList, InlineCta, Lead, Section } from '../../components/article';
import { Flow } from '../../components/viz';

export function Body() {
  return (
    <>
      <Lead>Making content is expensive. Using it once is the expensive part.</Lead>
      <Section id="system" n={1} title="From one long video">
        <p>
          Record one five to ten minute video: a founder explaining a product, a customer interview,
          a how-to. Then cut it up.
        </p>
        <Flow
          nodes={[
            { title: 'Long video', body: 'YouTube or Facebook', highlight: true },
            { title: '3–5 short clips', body: 'Reels, TikTok, Shorts' },
            { title: 'Quotes', body: 'Image posts, Stories' },
            { title: 'Carousel', body: 'Key steps as slides' },
            { title: 'Text', body: 'Blog post, email, captions' },
          ]}
        />
      </Section>
      <Section id="list" n={2} title="The ten pieces">
        <ol>
          <li>The full video, uploaded natively.</li>
          <li>Three short clips with strong hooks.</li>
          <li>A carousel of the key points.</li>
          <li>Two quote graphics.</li>
          <li>A Story poll based on a question in the video.</li>
          <li>A blog post written from the transcript.</li>
          <li>An email to customers.</li>
          <li>One or two ad versions using the best clip.</li>
        </ol>
        <Callout tone="tip">
          Use auto-captions, then fix them by hand. Most social video is watched with sound off.
        </Callout>
      </Section>
      <Section id="ads" n={3} title="Organic first, then ads">
        <p>
          Post clips organically first and watch which ones hold attention. The winners become ads.
          It is cheap creative testing. See{' '}
          <Link to="/blog/how-to-test-meta-ad-creatives">testing ad creatives</Link>.
        </p>
      </Section>
      <InlineCta
        title="Want a content day planned for you?"
        body="Book a free call. Our creative team plans shoots with repurposing in mind."
      />
      <Section id="faq" n={4} title="Questions people ask">
        <FaqList
          items={[
            {
              q: 'Will people get bored of the same content?',
              a: 'Most followers see only a small share of your posts. Different formats reach different people.',
            },
            {
              q: 'Can AI help with repurposing?',
              a: 'Yes, for transcripts, first drafts and clip ideas. A person should still choose and edit.',
            },
          ]}
        />
      </Section>
    </>
  );
}
