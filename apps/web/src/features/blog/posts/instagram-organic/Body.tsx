import { Link } from 'react-router';
import {
  Callout,
  CompareTable,
  FaqList,
  Figure,
  InlineCta,
  Lead,
  Prose,
  Section,
} from '../../components/article';
import { BarList } from '../../components/viz';

export function Body() {
  return (
    <>
      <Lead>
        Organic reach on Instagram is not dead. It just rewards different things than it did a few
        years ago.
      </Lead>
      <Prose>
        <p>
          Instagram has said many times that it looks at signals like watch time, likes, shares and
          saves when deciding what to show. In practice, that means content people find useful or
          entertaining enough to send to a friend.
        </p>
      </Prose>
      <Section id="what-works" n={1} title="What tends to work">
        <ul>
          <li>
            <strong>Reels</strong> with a strong first second, for reaching new people.
          </li>
          <li>
            <strong>Carousels</strong> that teach something, for saves. See{' '}
            <Link to="/blog/carousel-posts-that-sell">carousel posts</Link>.
          </li>
          <li>
            <strong>Stories</strong> for people who already follow you: polls, questions, behind the
            scenes.
          </li>
          <li>
            <strong>Replies</strong> to comments and DMs, quickly. Conversations keep you visible.
          </li>
          <li>
            <strong>Collabs</strong> with creators and partner brands, which show your post to both
            audiences.
          </li>
        </ul>
      </Section>
      <Section id="measure" n={2} title="Measuring the right things">
        <Figure
          title="Which signals to watch (example account)"
          caption="Track these weekly. Likes alone tell you little."
        >
          <BarList
            items={[
              {
                label: 'Shares per post',
                value: 9,
                note: 'Strongest sign of reach to come',
                tone: 'accent',
              },
              { label: 'Saves per post', value: 14, note: 'Useful content', tone: 'accent' },
              { label: 'Profile visits', value: 40, tone: 'ink' },
              { label: 'Link clicks', value: 12, note: 'Closest to sales', tone: 'ink' },
            ]}
          />
        </Figure>
      </Section>
      <Section id="routine" n={3} title="A weekly routine">
        <CompareTable
          columns={['Activity', 'How often', 'Why']}
          rows={[
            ['Reels', '3 per week', 'Reach new people'],
            ['Carousel', '1–2 per week', 'Saves and authority'],
            ['Stories', 'Most days', 'Stay top of mind for followers'],
            ['Reply and engage', '15 minutes a day', 'Relationships and signals'],
          ]}
        />
        <Callout tone="tip">
          Pin your three best posts to the top of your profile. New visitors decide in seconds
          whether to follow.
        </Callout>
      </Section>
      <InlineCta
        title="Want an organic plan alongside your ads?"
        body="Book a free call. We will look at your profile and suggest what to change."
      />
      <Section id="faq" n={4} title="Questions people ask">
        <FaqList
          items={[
            {
              q: 'Do hashtags still matter?',
              a: 'A few relevant ones can help with discovery, but content quality matters far more.',
            },
            {
              q: 'Should I post every day?',
              a: 'Only if you can keep quality up. Consistent and good beats daily and rushed.',
            },
          ]}
        />
      </Section>
    </>
  );
}
