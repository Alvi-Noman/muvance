import {
  Callout,
  FaqList,
  InlineCta,
  KeyTakeaways,
  Lead,
  Prose,
  Section,
  Steps,
} from '../../components/article';
import { Checklist } from '../../components/viz';

export function Body() {
  return (
    <>
      <Lead>
        You do not need a studio to take product photos that sell. A modern phone, a window and a
        bit of planning will get you most of the way.
      </Lead>
      <Prose>
        <p>
          What makes a product photo sell is not perfection. It is clarity: the buyer can see what
          they are getting, how big it is, what it is made of, and how it would fit into their life.
        </p>
      </Prose>

      <div className="mt-10">
        <KeyTakeaways
          items={[
            'Soft daylight from a window beats most cheap lights.',
            'Shoot a set: front, back, detail, scale, and in use.',
            'Show real size with a hand, a person or a common object.',
            'Keep colours true. Returns start with photos that lie.',
          ]}
        />
      </div>

      <Section id="setup" n={1} title="The simple setup">
        <Steps
          steps={[
            {
              title: 'Light',
              body: 'Stand next to a big window, out of direct sun. Turn off room lights so colours do not mix.',
            },
            {
              title: 'Background',
              body: 'Plain white or neutral for the main shot. A real setting for lifestyle shots.',
            },
            {
              title: 'Phone',
              body: 'Clean the lens. Use the main camera, not the wide one. Tap to focus and lower exposure slightly.',
            },
            { title: 'Steady', body: 'Lean on something or use a cheap tripod. Blur kills trust.' },
          ]}
        />
      </Section>

      <Section id="shots" n={2} title="The shots every product needs">
        <Checklist
          items={[
            'Clean main shot on a plain background',
            'Back and sides',
            'Close-up of material, texture or stitching',
            'Scale: in a hand, on a person or next to something familiar',
            'In use: worn, applied, cooked, placed in a room',
            'What is in the box',
          ]}
          verdicts={[
            'Buyers will have too many doubts.',
            'Good start. Add the missing angles.',
            'A complete set that answers questions.',
          ]}
        />
        <Callout tone="tip" title="Shoot for vertical too">
          Ads now show mostly in vertical formats. Leave space around the product so you can crop to
          4:5 and 9:16 without cutting anything off.
        </Callout>
      </Section>

      <Section id="mistakes" n={3} title="Common mistakes">
        <ul>
          <li>
            Heavy filters that change the colour, leading to &quot;not as shown&quot; returns.
          </li>
          <li>Only one photo, so buyers cannot judge size or quality.</li>
          <li>Busy backgrounds that compete with the product.</li>
          <li>Copying photos from suppliers that every other seller also uses.</li>
        </ul>
      </Section>

      <InlineCta
        title="Want photos and ads made for you?"
        body="Our creative team shoots product photos and videos made for ads. Book a free call to talk through your products."
      />

      <Section id="faq" n={4} title="Things people ask us">
        <FaqList
          items={[
            {
              q: 'Should I use supplier photos?',
              a: 'Only as a stopgap. Your own photos build trust and set you apart from every other page selling the same item.',
            },
            {
              q: 'Do I need to edit the photos?',
              a: 'Light edits only: crop, straighten, small brightness fixes. Keep colours true to the real product.',
            },
          ]}
        />
      </Section>
    </>
  );
}
