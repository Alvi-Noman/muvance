import { FaqList, InlineCta, Lead, Section, Steps } from '../../components/article';

export function Body() {
  return (
    <>
      <Lead>
        A carousel lives or dies on slide one. If it does not make people swipe, the other nine
        slides never existed.
      </Lead>
      <Section id="structure" n={1} title="A structure that keeps people swiping">
        <Steps
          steps={[
            {
              title: 'Slide 1: the hook',
              body: 'A clear promise: “5 mistakes that ruin leather shoes”.',
            },
            { title: 'Slide 2: why it matters', body: 'One line of stakes.' },
            {
              title: 'Slides 3–8: the value',
              body: 'One idea per slide, big text, a simple visual.',
            },
            { title: 'Slide 9: summary', body: 'The list in one view, worth saving.' },
            { title: 'Slide 10: next step', body: 'Follow, save, or see the product.' },
          ]}
        />
      </Section>
      <Section id="design" n={2} title="Design tips">
        <ul>
          <li>Big text: it must be readable on a phone without zooming.</li>
          <li>Consistent layout, so swiping feels smooth.</li>
          <li>A visual cue to swipe on the first slide (an arrow or a cut-off element).</li>
          <li>4:5 portrait size takes more screen space in the feed.</li>
        </ul>
      </Section>
      <Section id="ads" n={3} title="Carousel ads">
        <p>
          Carousel ads work well to show a range, compare options or tell a step-by-step story. Each
          card can link to a different product. Test them against video, especially for catalogues
          with many similar items.
        </p>
      </Section>
      <InlineCta
        title="Want carousel templates for your brand?"
        body="Book a free call. Our design team makes these for clients every week."
      />
      <Section id="faq" n={4} title="Questions people ask">
        <FaqList
          items={[
            { q: 'How many slides?', a: 'As many as needed and no more. Five to ten is common.' },
            {
              q: 'Do carousels still reach people?',
              a: 'They tend to do well because people spend time swiping, and some apps reshow them with a later slide.',
            },
          ]}
        />
      </Section>
    </>
  );
}
