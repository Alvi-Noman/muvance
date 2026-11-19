import { Link } from 'react-router';
import { Callout, FaqList, InlineCta, Lead, Section, Steps } from '../../components/article';
import { Versus } from '../../components/viz';

export function Body() {
  return (
    <>
      <Lead>“High quality, premium, best price.” Every store says it. Nobody believes it.</Lead>
      <Section id="structure" n={1} title="A structure that works">
        <Steps
          steps={[
            {
              title: 'One line: who it is for and what it does',
              body: '“A light everyday backpack for students who carry a laptop and a lunch box.”',
            },
            {
              title: 'Three to five benefits',
              body: 'Each one starting with what it means for the customer.',
            },
            { title: 'The details', body: 'Size, material, care, what is in the box.' },
            { title: 'Answer the main doubt', body: 'Fit, durability, delivery, return.' },
          ]}
        />
      </Section>
      <Section id="example" n={2} title="Before and after">
        <Versus
          left={{
            title: 'Before',
            points: ['Premium quality bag', 'Waterproof', 'Many pockets', 'Best price in BD'],
          }}
          right={{
            title: 'After',
            points: [
              'Fits a 15.6" laptop in a padded sleeve',
              'Water-resistant fabric: fine in a sudden shower',
              'Side bottle pocket and a hidden pocket for your phone',
              'Weighs 650 g, so your shoulders thank you',
            ],
          }}
        />
      </Section>
      <Section id="tips" n={3} title="Small things that help">
        <ul>
          <li>Write for a phone screen: short paragraphs and bullets.</li>
          <li>Use the words customers use (check your inbox).</li>
          <li>Prove claims: “water-resistant” with a video of water rolling off.</li>
          <li>
            Do not copy the supplier text. It also hurts{' '}
            <Link to="/blog/product-page-seo-guide">SEO</Link>.
          </li>
        </ul>
        <Callout tone="local">
          A short Bangla line next to English bullets can help many shoppers, especially for care
          instructions and sizing.
        </Callout>
      </Section>
      <InlineCta
        title="Want your product pages rewritten?"
        body="Book a free call. Website and CRO is one of our service fields."
      />
      <Section id="faq" n={4} title="Questions people ask">
        <FaqList
          items={[
            {
              q: 'How long should a description be?',
              a: 'Long enough to answer the main questions. For most products, 80 to 200 words plus specs.',
            },
            {
              q: 'Can AI write them?',
              a: 'It can draft. Add real details only you know, and check every claim.',
            },
          ]}
        />
      </Section>
    </>
  );
}
