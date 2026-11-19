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

export function Body() {
  return (
    <>
      <Lead>
        Google Analytics 4 can feel like a cockpit with a thousand switches. For an online store,
        five reports answer almost every question that matters.
      </Lead>
      <Prose>
        <p>
          GA4 is free, independent of Meta, and sees every visitor to your site, wherever they came
          from. That makes it a useful second opinion on what your ads are really doing, as long as
          eCommerce events are set up.
        </p>
      </Prose>

      <div className="mt-10">
        <KeyTakeaways
          items={[
            'Make sure purchase and add-to-cart events are tracked first.',
            'Use UTMs on every ad so GA4 can tell campaigns apart.',
            'GA4 and Meta will not match. They count differently. Watch trends.',
            'Check five reports weekly; ignore the rest until you need them.',
          ]}
        />
      </div>

      <Section id="setup" n={1} title="Check the setup first">
        <ul>
          <li>The GA4 tag is on every page (most store platforms have a built-in option).</li>
          <li>eCommerce events fire: view_item, add_to_cart, begin_checkout, purchase.</li>
          <li>Purchase events include the order value in taka.</li>
          <li>
            Your ads carry UTM parameters. See{' '}
            <Link to="/blog/utm-parameters-for-meta-ads">UTMs for Meta ads</Link>.
          </li>
        </ul>
      </Section>

      <Section id="reports" n={2} title="The five reports that matter">
        <CompareTable
          columns={['Report', 'Where', 'What it answers']}
          rows={[
            [
              'Traffic acquisition',
              'Reports → Acquisition',
              'Which sources bring visitors and sales',
            ],
            [
              'Campaigns (by UTM)',
              'Acquisition, session campaign',
              'Which ad campaigns bring buyers',
            ],
            [
              'Purchase journey',
              'Reports → Monetisation',
              'Where people drop between product and purchase',
            ],
            ['Landing pages', 'Engagement → Landing page', 'Which pages convert, which leak'],
            ['Device category', 'Tech → Overview', 'Whether mobile converts worse than desktop'],
          ]}
        />
        <Callout tone="tip" title="The purchase journey is the money report">
          If many people view products but few add to cart, look at price and the product page. If
          many add to cart but few buy, look at checkout and delivery charges.
        </Callout>
      </Section>

      <Section id="vs-meta" n={3} title="Why GA4 and Meta disagree">
        <p>
          Meta counts a sale if someone saw or clicked an ad within its attribution window, even on
          another device. GA4 usually credits the last click before the purchase. Neither is
          &quot;wrong&quot;. Use GA4 to check direction: if Meta says sales doubled and GA4 shows no
          change, dig deeper.
        </p>
      </Section>

      <InlineCta
        title="Want your numbers to make sense?"
        body="Book a free call. We will check your GA4, Pixel and Conversions API and show you what to trust."
      />

      <Section id="faq" n={4} title="Things people ask us">
        <FaqList
          items={[
            {
              q: 'Do I need GA4 if I have Meta Ads Manager?',
              a: 'It helps a lot. It is your independent view of all traffic and sales, not just what one platform claims.',
            },
            {
              q: 'Why does GA4 show fewer purchases than my store?',
              a: 'Ad blockers, consent settings and pages that load slowly can stop the tag firing. Your store’s order count is the truth.',
            },
          ]}
        />
      </Section>
    </>
  );
}
