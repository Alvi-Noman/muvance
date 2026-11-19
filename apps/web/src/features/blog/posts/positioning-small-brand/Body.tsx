import {
  Callout,
  Code,
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
        You cannot outspend the big brands. You do not need to. You need to be the obvious choice
        for one specific group of people, for one specific reason.
      </Lead>
      <Prose>
        <p>
          That is positioning. It decides what goes in your ads, on your product pages and in your
          packaging. Small brands that get it right often grow faster than big ones, because every
          message is sharper.
        </p>
      </Prose>

      <div className="mt-10">
        <KeyTakeaways
          items={[
            'Pick a specific customer, not "everyone".',
            'Pick one thing you do better than the alternatives.',
            'Prove it with something real, not adjectives.',
            'Repeat it everywhere until people repeat it back.',
          ]}
        />
      </div>

      <Section id="ways" n={1} title="Ways small brands win">
        <CompareTable
          columns={['Angle', 'Example', 'Why big brands struggle to copy']}
          rows={[
            [
              'Narrower customer',
              'Skincare for oily skin in humid weather',
              'They sell to everyone',
            ],
            [
              'Specialist expertise',
              'Only cotton, only for office wear',
              'Their range is too wide',
            ],
            [
              'Origin or process',
              'Home-made, small batch, from our own farm',
              'They cannot fake it',
            ],
            [
              'Service',
              'Free size exchange, same-day Dhaka delivery',
              'Their operations are slower',
            ],
            ['Personality', 'Founder on camera, a real voice', 'They sound corporate'],
          ]}
        />
      </Section>

      <Section id="statement" n={2} title="Write your positioning in one sentence">
        <p>Fill in this sentence. If you cannot, your ads will struggle too.</p>
        <Code title="positioning.txt">{`For [specific customer]
who [problem or desire],
[brand] is the [category]
that [one clear benefit],
because [real proof].

Example:
For working women in Dhaka
who need office wear that survives the heat,
[Brand] is the clothing label
that stays fresh from commute to evening,
because every piece is breathable cotton, tested in summer.`}</Code>
        <Callout tone="tip" title="Ask your customers">
          The best positioning often comes straight from what happy customers say when they
          recommend you. Ask a few why they chose you.
        </Callout>
      </Section>

      <Section id="use" n={3} title="Put it to work">
        <ul>
          <li>Your ad hooks speak to that customer and that problem.</li>
          <li>Your product page proves the benefit near the top.</li>
          <li>Your packaging and follow-up repeat the same promise.</li>
        </ul>
      </Section>

      <InlineCta
        title="Want help finding your position?"
        body="Brand strategy is where we start with many clients. Book a free call to talk it through."
      />

      <Section id="faq" n={4} title="Things people ask us">
        <FaqList
          items={[
            {
              q: 'Will a narrow focus limit my growth?',
              a: 'Usually the opposite at first. A sharp position wins a group fast. You can widen later from a strong base.',
            },
            {
              q: 'How often should positioning change?',
              a: 'Rarely. Ads and offers change often; the core promise should stay steady for years.',
            },
          ]}
        />
      </Section>
    </>
  );
}
