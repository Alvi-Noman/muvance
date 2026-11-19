import { Link } from 'react-router';
import { Callout, FaqList, Figure, InlineCta, Lead, Section } from '../../components/article';
import { BarList } from '../../components/viz';

export function Body() {
  return (
    <>
      <Lead>
        Click-through rate is one of the first numbers people look at, and one of the easiest to
        misread.
      </Lead>
      <Section id="which" n={1} title="Which CTR to look at">
        <p>
          Meta shows more than one. “CTR (all)” counts any click, including clicks to see more text
          or open the profile. “CTR (link click-through rate)” counts only clicks to your site or
          chat. For selling, link CTR is the one that matters.
        </p>
      </Section>
      <Section id="tells" n={2} title="What it tells you">
        <p>
          Link CTR tells you whether the ad created enough interest to make someone act. Very low
          CTR after decent spend usually means the hook or offer is not landing.
        </p>
        <Figure
          title="Two ads, same budget (example)"
          caption="Ad A got more clicks. Ad B got more orders, because its clicks came from people closer to buying."
        >
          <BarList
            items={[
              { label: 'Ad A, link CTR', value: 2.4, note: 'Curiosity hook', tone: 'ink' },
              { label: 'Ad B, link CTR', value: 1.1, note: 'Shows price upfront', tone: 'accent' },
            ]}
            format={(v) => `${v}%`}
          />
        </Figure>
      </Section>
      <Section id="doesnt" n={3} title="What it doesn’t tell you">
        <ul>
          <li>Whether people buy. A clickbait hook can drive clicks and no sales.</li>
          <li>
            Whether the right people clicked. Showing the price upfront often lowers CTR and raises
            conversion.
          </li>
          <li>Anything on its own for message ads, where the click is opening a chat.</li>
        </ul>
        <Callout tone="tip">
          Use CTR to compare ads for the same product and offer. Use cost per delivered order to
          make the final call.
        </Callout>
      </Section>
      <Section id="improve" n={4} title="If CTR is genuinely low">
        <p>
          Work on the first two seconds:{' '}
          <Link to="/blog/ad-hooks-that-stop-the-scroll">hooks that stop the scroll</Link>. Make the
          offer or benefit clear. Test vertical video for Reels and Stories. And check frequency:
          tired ads lose clicks first.
        </p>
      </Section>
      <InlineCta
        title="Want to know which of your numbers matter?"
        body="Book a free call. We will walk through your ad metrics in plain words."
      />
      <Section id="faq" n={5} title="Questions people ask">
        <FaqList
          items={[
            {
              q: 'What is a good CTR on Meta?',
              a: 'It varies widely by product, placement and audience. Compare ads within your own account rather than chasing a benchmark.',
            },
            {
              q: 'Why is my CTR high but sales low?',
              a: 'Usually a mismatch between the ad and the page, a price surprise, or a hook that attracts the curious rather than buyers.',
            },
          ]}
        />
      </Section>
    </>
  );
}
