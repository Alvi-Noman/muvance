import { Link } from 'react-router';
import { Callout, FaqList, InlineCta, Lead, Section } from '../../components/article';
import { Flow } from '../../components/viz';

export function Body() {
  return (
    <>
      <Lead>
        “We are committed to quality and customer satisfaction” is not a story. “My mother couldn’t
        find a sari blouse that fit, so we started making them” is.
      </Lead>
      <Section id="structure" n={1} title="A simple structure">
        <Flow
          nodes={[
            { title: 'A person', body: 'Someone real' },
            { title: 'A problem', body: 'Something that frustrated them' },
            { title: 'A struggle', body: 'What they tried' },
            { title: 'A change', body: 'What made it better', highlight: true },
            { title: 'The result', body: 'Life now' },
          ]}
        />
        <p>
          The customer is usually the hero, not the brand. Your product is the helpful tool that
          made the change possible.
        </p>
      </Section>
      <Section id="sources" n={2} title="Where good stories come from">
        <ul>
          <li>How and why the brand started.</li>
          <li>A customer whose life got a little easier.</li>
          <li>The people who make the product.</li>
          <li>A hard decision you made, like refusing a cheaper material.</li>
          <li>Something that went wrong, and how you fixed it.</li>
        </ul>
        <Callout tone="tip">
          Specific details make stories believable. A street name, a time of day, a number. Vague
          stories feel invented.
        </Callout>
      </Section>
      <Section id="use" n={3} title="Where to use them">
        <p>
          About page, product page sections, founder videos, ad hooks, packaging inserts. One good
          story can run for years in different shapes. See{' '}
          <Link to="/blog/founder-led-content">founder-led content</Link>.
        </p>
        <Callout tone="warning">
          Only tell true stories, with permission from any customer you feature. Invented stories
          get found out, and trust is hard to win back.
        </Callout>
      </Section>
      <InlineCta
        title="Want help finding your brand’s story?"
        body="Book a free call. Brand strategy is one of the things we do."
      />
      <Section id="faq" n={4} title="Questions people ask">
        <FaqList
          items={[
            {
              q: 'Do small brands need a story?',
              a: 'Especially small brands. It is one of the few things a bigger competitor cannot copy.',
            },
            {
              q: 'Can a story be too long?',
              a: 'Yes. Have a one-line, a one-paragraph and a full version.',
            },
          ]}
        />
      </Section>
    </>
  );
}
