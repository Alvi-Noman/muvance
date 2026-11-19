import { Link } from 'react-router';
import {
  Callout,
  CompareTable,
  FaqList,
  InlineCta,
  KeyTakeaways,
  Lead,
  Prose,
  Section,
} from '../../components/article';
import { Checklist } from '../../components/viz';

export function Body() {
  return (
    <>
      <Lead>
        Shopify, WooCommerce, a local platform, or a custom-built site? The platform matters less
        than people think, but a few things about it matter a lot.
      </Lead>
      <Prose>
        <p>
          What actually decides whether a store sells is speed on mobile, a simple checkout, cash on
          delivery, local payments and proper tracking. Choose the platform that gives you those
          with the least hassle.
        </p>
      </Prose>

      <div className="mt-10">
        <KeyTakeaways
          items={[
            'Hosted platforms (like Shopify) are fastest to launch and easy to keep running.',
            'WooCommerce gives more control, but you manage hosting and speed.',
            'Custom builds make sense when you have unusual needs and a team to maintain them.',
            'Check COD, bKash/Nagad, courier links and Pixel + Conversions API before choosing.',
          ]}
        />
      </div>

      <Section id="compare" n={1} title="The options side by side">
        <CompareTable
          columns={['Option', 'Good for', 'Watch out for']}
          rows={[
            [
              'Shopify',
              'Quick launch, reliable, many apps',
              'Monthly fees in dollars; app costs add up',
            ],
            [
              'WooCommerce',
              'Full control, low software cost',
              'Hosting, speed and security are on you',
            ],
            [
              'Local platforms',
              'Built for COD and local couriers',
              'Fewer integrations; check tracking options',
            ],
            ['Custom build', 'Unique flows, full ownership', 'Cost to build and to maintain'],
          ]}
        />
      </Section>

      <Section id="must" n={2} title="Must-haves for a Bangladeshi store">
        <Checklist
          items={[
            'Cash on delivery at checkout',
            'bKash, Nagad or card payments',
            'Guest checkout with phone number',
            'Fast on mobile data',
            'Meta Pixel and Conversions API support',
            'Easy connection to your courier',
          ]}
          verdicts={[
            'This platform will hold you back.',
            'Workable, with some add-ons.',
            'A solid foundation.',
          ]}
        />
        <Callout tone="tip" title="Speed beats features">
          A simple theme that loads fast will usually sell more than a beautiful one that takes
          eight seconds on 4G. See{' '}
          <Link to="/blog/product-page-speed-mobile">how fast a product page needs to be</Link>.
        </Callout>
      </Section>

      <Section id="switch" n={3} title="Thinking of switching?">
        <ul>
          <li>Keep the same product URLs, or set up redirects, so ads and search do not break.</li>
          <li>Move customer and order history if you can.</li>
          <li>Re-test tracking from scratch on the new site before turning ads back on.</li>
        </ul>
      </Section>

      <InlineCta
        title="Not sure your store is built to sell?"
        body="Our team builds and fixes stores for speed and conversion. Book a free call and we will review yours."
      />

      <Section id="faq" n={4} title="Things people ask us">
        <FaqList
          items={[
            {
              q: 'Is a Facebook page enough instead of a website?',
              a: 'It can be at the start. As you grow, a website helps tracking, trust and ad performance. We compare them in another guide.',
            },
            {
              q: 'Which platform is cheapest?',
              a: 'Compare the total: software, apps, hosting, payment fees and your own time, not just the monthly price.',
            },
          ]}
        />
      </Section>
    </>
  );
}
