import { Link } from 'react-router';
import {
  Callout,
  CompareTable,
  FaqList,
  Figure,
  InlineCta,
  Lead,
  Section,
} from '../../components/article';
import { BarList } from '../../components/viz';

export function Body() {
  return (
    <>
      <Lead>
        Many brands spend 95% on ads and 5% on the creative that makes the ads work. Then wonder why
        results fade.
      </Lead>
      <Section id="split" n={1} title="A starting split">
        <Figure
          title="An example monthly marketing budget split"
          caption="A starting point, not a rule. Adjust to your stage and strengths."
        >
          <BarList
            items={[
              { label: 'Ad spend', value: 70, tone: 'ink' },
              { label: 'Creative (photo, video, design)', value: 15, tone: 'accent' },
              { label: 'People or agency', value: 10, tone: 'ink' },
              { label: 'Tools and software', value: 3, tone: 'muted' },
              { label: 'Tests and experiments', value: 2, tone: 'warm' },
            ]}
            format={(v) => `${v}%`}
          />
        </Figure>
      </Section>
      <Section id="creative" n={2} title="Why creative deserves more">
        <p>
          Ad platforms reward fresh, varied creative. Without a steady supply, costs creep up as ads
          tire. See{' '}
          <Link to="/blog/how-many-new-creatives-per-week">how many new creatives per week</Link>.
        </p>
      </Section>
      <Section id="stage" n={3} title="How it changes with growth">
        <CompareTable
          columns={['Stage', 'Focus', 'Shift']}
          rows={[
            ['Starting out', 'Find what sells', 'More testing, less scaling spend'],
            ['Growing', 'Scale winners', 'More ad spend and creative volume'],
            ['Established', 'Efficiency and loyalty', 'More on retention, SEO and brand'],
          ]}
        />
        <Callout tone="tip">
          Set the total as a share of revenue target, then split. Many eCommerce brands spend
          somewhere around 10 to 30% of revenue on marketing, depending on margins and stage.
        </Callout>
      </Section>
      <InlineCta
        title="Want a second opinion on your budget?"
        body="Book a free call. We will look at your split and suggest changes."
      />
      <Section id="faq" n={4} title="Questions people ask">
        <FaqList
          items={[
            {
              q: 'Should I spend more when sales are slow?',
              a: 'Only if the unit economics work. Spending more on a losing setup loses more.',
            },
            {
              q: 'Is an agency fee part of marketing budget?',
              a: 'Yes. Count it, so you see the real cost of a customer.',
            },
          ]}
        />
      </Section>
    </>
  );
}
