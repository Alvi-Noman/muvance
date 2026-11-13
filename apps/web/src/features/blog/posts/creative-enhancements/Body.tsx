import {
  Callout,
  CompareTable,
  FaqList,
  Figure,
  InlineCta,
  KeyTakeaways,
  Lead,
  Prose,
  Section,
  Steps,
} from '../../components/article';
import { Checklist, Versus } from '../../components/viz';

export function Body() {
  return (
    <>
      <Lead>
        Meta can now crop, brighten, animate and rewrite your ads automatically. Some of these
        changes lift results. Others put words in your brand’s mouth.
      </Lead>
      <Prose>
        <p>
          <strong>Advantage+ creative</strong> enhancements are optional edits Meta applies to your
          ads, often different for each person who sees them. Many are switched on by default when
          you create an ad. The names and list change often, but they fall into a few groups.
        </p>
      </Prose>

      <div className="mt-10">
        <KeyTakeaways
          items={[
            'Enhancements adapt your ad to each placement and person, sometimes with real gains.',
            'Low-risk ones (brightness, cropping to fit placements) are usually worth keeping.',
            'Higher-risk ones (generated text, backgrounds, music) need checking before you trust them.',
            'Preview every ad with enhancements on, and test them on vs off for your account.',
          ]}
        />
      </div>

      <Section id="types" n={1} title="The main types of enhancements">
        <CompareTable
          columns={['Enhancement type', 'What it does', 'Our default']}
          rows={[
            [
              'Visual touch-ups',
              'Adjusts brightness and contrast, crops to fit placements',
              'Keep on',
            ],
            [
              'Image expansion',
              'Extends the image edges to fit other ratios',
              'Keep on, but preview',
            ],
            [
              'Text improvements',
              'Swaps or reorders your headline and primary text',
              'Test; check wording',
            ],
            [
              'Generated backgrounds',
              'Creates new backgrounds behind product images',
              'Off for fashion; test elsewhere',
            ],
            ['Image animation', 'Adds motion to a still image', 'Test'],
            ['Music', 'Adds a soundtrack to images or video', 'Usually off for videos with voice'],
            [
              'Add catalog items / site links',
              'Shows extra products or links with the ad',
              'Test for stores with catalogs',
            ],
          ]}
        />
        <Callout tone="tip">
          The exact names in your Ads Manager may differ. Look for the creative enhancements or
          Advantage+ creative section when editing an ad.
        </Callout>
      </Section>

      <Section id="risks" n={2} title="Where they help and where they hurt">
        <Figure title="Benefits vs risks" example={false}>
          <Versus
            left={{
              title: 'Risks',
              points: [
                'Text changes can sound off-brand or make claims you didn’t approve',
                'Generated backgrounds can misrepresent the product',
                'Bad crops can cut off faces, prices or your logo',
                'Music can clash with voice-overs or feel cheap',
              ],
            }}
            right={{
              title: 'Benefits',
              points: [
                'Ads fit every placement without extra design work',
                'More variety from the same assets',
                'Small lifts in click rate from better formatting',
                'Less manual resizing for Reels and Stories',
              ],
            }}
          />
        </Figure>
        <Callout tone="warning">
          If you sell fashion, cosmetics or anything where colour and fit matter, be careful with
          any enhancement that changes the image. A product that looks different from the ad leads
          to refused COD parcels.
        </Callout>
      </Section>

      <Section id="test" n={3} title="How to decide for your account">
        <Steps
          steps={[
            {
              title: 'Preview every placement',
              body: 'Before publishing, check the ad preview for Feed, Reels and Stories with enhancements on.',
            },
            {
              title: 'Turn off what you would never approve',
              body: 'If a human designer wouldn’t be allowed to do it, don’t let automation do it.',
            },
            {
              title: 'Test the rest on vs off',
              body: 'Duplicate a proven ad with enhancements off, run both for a week, and compare cost per purchase.',
            },
            {
              title: 'Re-check new ads',
              body: 'Defaults can change, so check the settings each time you create ads.',
            },
          ]}
        />
      </Section>

      <Section id="check" n={4} title="Your review routine">
        <Figure title="Before publishing any ad" example={false}>
          <Checklist
            items={[
              'Previewed in Feed, Reels and Stories',
              'No faces, prices or logos cut off',
              'Product colours look accurate',
              'Any changed text is on-brand and true',
              'Music doesn’t clash with voice',
              'Enhancements you don’t want are off',
            ]}
            verdicts={[
              'Check more before publishing. Automated edits can surprise you.',
              'Nearly there. Finish the remaining checks.',
              'Good to publish.',
            ]}
          />
        </Figure>
      </Section>

      <InlineCta
        title="Want creative that works without surprises?"
        body="We build ads that fit every placement and review every automated change. Book a free call."
      />

      <Section id="faq" n={5} title="Things people ask us">
        <FaqList
          items={[
            {
              q: 'Do enhancements really improve results?',
              a: 'Sometimes. The simple format ones often help a little. The bigger edits vary a lot by brand. The only reliable answer is a test on your own account.',
            },
            {
              q: 'Can I turn them off for the whole account?',
              a: 'Options change over time. Usually you control them per ad, so check each time you create or duplicate ads.',
            },
            {
              q: 'Will turning them off hurt delivery?',
              a: 'Not in a way that should worry you. Strong, well-formatted creative matters far more than any automatic enhancement.',
            },
          ]}
        />
      </Section>
    </>
  );
}
