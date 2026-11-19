import { Link } from 'react-router';
import { FaqList, Figure, InlineCta, Lead, Section, Steps } from '../../components/article';
import { BarList } from '../../components/viz';

export function Body() {
  return (
    <>
      <Lead>
        A growing share of what happens on your site is invisible to browser-based tracking.
        Pretending otherwise leads to bad decisions.
      </Lead>
      <Section id="why" n={1} title="Why tracking got weaker">
        <ul>
          <li>iPhone users can ask apps not to track them across other apps and sites.</li>
          <li>Browsers like Safari and Firefox limit cookies.</li>
          <li>Ad blockers stop many tracking scripts.</li>
          <li>People switch devices between seeing an ad and buying.</li>
        </ul>
        <Figure title="Share of orders a browser pixel sees (example)">
          <BarList
            items={[
              { label: 'Store orders', value: 100, tone: 'accent' },
              { label: 'Pixel only', value: 72, tone: 'warm' },
              { label: 'Pixel + Conversions API', value: 91, tone: 'ink' },
            ]}
            format={(v) => `${v}%`}
          />
        </Figure>
      </Section>
      <Section id="works" n={2} title="What still works">
        <Steps
          steps={[
            {
              title: 'Server-side events',
              body: (
                <>
                  Send purchases from your server with Conversions API. See{' '}
                  <Link to="/blog/meta-pixel-conversions-api-setup">Pixel and CAPI setup</Link>.
                </>
              ),
            },
            {
              title: 'First-party data',
              body: (
                <>
                  Customer phone and email, collected with consent. See{' '}
                  <Link to="/blog/first-party-data-small-brands">first-party data</Link>.
                </>
              ),
            },
            {
              title: 'Blended numbers',
              body: 'Total revenue ÷ total spend, which no blocker can hide.',
            },
            { title: 'Asking customers', body: 'Post-purchase surveys.' },
            { title: 'Tests', body: 'Turn spend on and off to see the real effect.' },
          ]}
        />
      </Section>
      <Section id="respect" n={3} title="Respecting privacy">
        <p>
          Tell customers in a clear privacy policy what you collect and why. Only message people who
          agreed. Hash personal data before sending it to ad platforms (Conversions API does this).
          Trust is part of the brand.
        </p>
      </Section>
      <InlineCta
        title="Want to check what your tracking misses?"
        body="Book a free call. We will compare your tracking with real orders."
      />
      <Section id="faq" n={4} title="Questions people ask">
        <FaqList
          items={[
            {
              q: 'Is server-side tracking legal?',
              a: 'Yes, when you follow the platform rules and your privacy policy, and respect consent where required.',
            },
            {
              q: 'Will tracking ever be perfect?',
              a: 'No. Aim for good enough to make decisions, checked against real sales.',
            },
          ]}
        />
      </Section>
    </>
  );
}
