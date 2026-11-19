import { Link } from 'react-router';
import { FaqList, Figure, InlineCta, Lead, Section } from '../../components/article';
import { BarList } from '../../components/viz';

export function Body() {
  return (
    <>
      <Lead>20,000 page likes, 300 people reached. It is not just you.</Lead>
      <Section id="why" n={1} title="Why reach is low">
        <p>
          Facebook shows people what it predicts they will engage with, from friends, groups,
          creators and recommended content. Business page posts compete with all of it. Many page
          posts reach only a small share of followers.
        </p>
      </Section>
      <Section id="what-works" n={2} title="What still gets seen">
        <Figure title="Reach by post type on a page (example)" caption="Indexed to Reels = 100.">
          <BarList
            items={[
              { label: 'Reels', value: 100, tone: 'accent' },
              { label: 'Photo with a question', value: 45, tone: 'ink' },
              { label: 'Live video', value: 40, tone: 'ink' },
              { label: 'Plain product photo', value: 18, tone: 'muted' },
              { label: 'Link post', value: 10, tone: 'warm' },
            ]}
          />
        </Figure>
      </Section>
      <Section id="instead" n={3} title="Where to put effort instead">
        <ul>
          <li>Use your page for trust: reviews, replies, a clear about section.</li>
          <li>Post Reels for reach.</li>
          <li>
            Build your own list (phone, WhatsApp, email). See{' '}
            <Link to="/blog/first-party-data-small-brands">first-party data</Link>.
          </li>
          <li>Use ads to reach people reliably, and let organic posts support them.</li>
        </ul>
      </Section>
      <InlineCta
        title="Want to know where your effort pays off?"
        body="Book a free call. We will look at your page and ads together."
      />
      <Section id="faq" n={4} title="Questions people ask">
        <FaqList
          items={[
            {
              q: 'Does boosting posts help organic reach?',
              a: (
                <>
                  Not directly. Boosted reach is paid. See{' '}
                  <Link to="/blog/boost-post-vs-ads-manager">boost vs Ads Manager</Link>.
                </>
              ),
            },
            {
              q: 'Should I invite people to like the page?',
              a: 'It does little harm, but likes are not the goal.',
            },
          ]}
        />
      </Section>
    </>
  );
}
