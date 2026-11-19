import { Link } from 'react-router';
import { Callout, FaqList, InlineCta, Lead, Section, Steps } from '../../components/article';

export function Body() {
  return (
    <>
      <Lead>
        A good blog post answers one question better than anything else online. That is the whole
        strategy.
      </Lead>
      <Section id="topic" n={1} title="Pick a question, not a topic">
        <p>
          “Skincare” is a topic. “Can I use vitamin C and niacinamide together?” is a question
          someone types. Start from real questions: your inbox, Google’s “People also ask”, your
          sales calls.
        </p>
      </Section>
      <Section id="structure" n={2} title="A structure that works for people and machines">
        <Steps
          steps={[
            {
              title: 'Answer first',
              body: 'One or two sentences that directly answer the question.',
            },
            { title: 'Then explain', body: 'Why, when, exceptions.' },
            { title: 'Use clear headings', body: 'Each one a sub-question.' },
            {
              title: 'Add something original',
              body: 'Your experience, a photo, a calculator, a real example.',
            },
            { title: 'Finish with an FAQ', body: 'Short answers to follow-up questions.' },
          ]}
        />
        <Callout tone="tip">
          Write each section so it makes sense on its own. AI tools often quote one section, not the
          whole article.
        </Callout>
      </Section>
      <Section id="quality" n={3} title="What makes it trustworthy">
        <ul>
          <li>A real author or brand with relevant experience.</li>
          <li>Specific facts rather than general claims.</li>
          <li>Dates, and updates when things change.</li>
          <li>Links to related posts and products that genuinely help.</li>
        </ul>
        <p>
          See also <Link to="/blog/get-found-in-chatgpt-ai-search">getting found in AI search</Link>
          .
        </p>
      </Section>
      <InlineCta
        title="Want a content plan for search and AI?"
        body="Book a free call. We will find the questions your customers ask."
      />
      <Section id="faq" n={4} title="Questions people ask">
        <FaqList
          items={[
            {
              q: 'How long should a post be?',
              a: 'As long as it takes to answer well. Padding makes it worse, not better.',
            },
            {
              q: 'How often should I publish?',
              a: 'Consistency beats volume. One genuinely useful post a week is a strong pace for a small brand.',
            },
          ]}
        />
      </Section>
    </>
  );
}
