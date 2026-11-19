import {
  Callout,
  FaqList,
  Figure,
  InlineCta,
  KeyTakeaways,
  Lead,
  Prose,
  Section,
  Steps,
} from '../../components/article';
import { Versus } from '../../components/viz';

export function Body() {
  return (
    <>
      <Lead>
        Catalogue ads (now called Advantage+ catalog ads) build themselves from your product feed.
        Meta picks which product to show each person. For stores with many products, they can do a
        lot of the heavy lifting.
      </Lead>
      <Prose>
        <p>
          They are not a replacement for great creative, though. Here is when a feed beats hand-made
          ads, when it does not, and how to set one up properly.
        </p>
      </Prose>

      <div className="mt-10">
        <KeyTakeaways
          items={[
            'Catalogue ads shine for stores with many products and repeat visitors.',
            'They depend entirely on feed quality: photos, titles, prices, stock.',
            'Hand-made ads still win for one hero product or a new brand.',
            'The best setups use both.',
          ]}
        />
      </div>

      <Section id="when" n={1} title="When a feed beats hand-made ads">
        <Figure title="Catalogue ads vs hand-made creative" example={false}>
          <Versus
            left={{
              title: 'Hand-made ads win when',
              points: [
                'You sell one or a few hero products',
                'Nobody knows your brand yet',
                'The product needs explaining or demonstrating',
              ],
            }}
            right={{
              title: 'Catalogue ads win when',
              points: [
                'You have dozens or hundreds of products',
                'Many people browse without buying',
                'Prices and stock change often',
              ],
            }}
          />
        </Figure>
      </Section>

      <Section id="setup" n={2} title="Setting it up properly">
        <Steps
          steps={[
            {
              title: 'Create a catalogue in Commerce Manager',
              body: 'Connect it to your store (most platforms have a plugin) so it updates automatically.',
            },
            {
              title: 'Connect it to your Pixel',
              body: 'Your product IDs in the Pixel events must match the IDs in the feed.',
            },
            {
              title: 'Clean up the feed',
              body: 'Clear titles, correct prices in taka, real stock levels and good photos.',
            },
            {
              title: 'Create product sets',
              body: 'Group products (best sellers, new arrivals, under ৳1,000) to advertise them separately.',
            },
          ]}
        />
        <Callout tone="tip" title="Dress up your feed">
          Plain white-background photos look like everyone else. Catalogue templates and lifestyle
          images can make feed ads feel less like a price list.
        </Callout>
      </Section>

      <Section id="mistakes" n={3} title="Common mistakes">
        <ul>
          <li>Feed out of date: ads for products that are sold out.</li>
          <li>Pixel product IDs that do not match the feed, so retargeting cannot work.</li>
          <li>Titles written for the warehouse (&quot;SKU-2231 BLK M&quot;) instead of buyers.</li>
        </ul>
      </Section>

      <InlineCta
        title="Many products, not sure where to start?"
        body="Book a free call. We will check your catalogue and tell you whether feed ads would help."
      />

      <Section id="faq" n={4} title="Things people ask us">
        <FaqList
          items={[
            {
              q: 'Do catalogue ads only work for retargeting?',
              a: 'No. They can also find new buyers, showing each person the products they are most likely to want.',
            },
            {
              q: 'Can I use catalogue ads without a website?',
              a: 'It is much harder. They work best with a website that sends product views and purchases to your Pixel.',
            },
          ]}
        />
      </Section>
    </>
  );
}
