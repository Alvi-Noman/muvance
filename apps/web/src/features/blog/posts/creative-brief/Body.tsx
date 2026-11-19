import {
  Callout,
  Code,
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
        Most bad ads start with a bad brief: &quot;make a video for the new collection&quot;. A good
        brief takes ten minutes and saves days of back-and-forth.
      </Lead>
      <Prose>
        <p>
          Whether you brief a designer, a video editor, a creator or an agency, the same template
          works. Copy the one below and fill it in.
        </p>
      </Prose>

      <div className="mt-10">
        <KeyTakeaways
          items={[
            'One brief, one ad idea. Do not cram five messages into one video.',
            'Say who it is for and what they doubt.',
            'Give hook ideas, not just a topic.',
            'Say how the ad will be judged.',
          ]}
        />
      </div>

      <Section id="template" n={1} title="The template">
        <Code title="creative-brief.txt">{`PRODUCT: Cotton office shirt, ৳1,450
WHO IT'S FOR: Men 24–40 working in offices, hot commutes
WHAT THEY DOUBT: Will it stay crisp? Will the size fit?
ONE MESSAGE: Stays fresh all day in Dhaka heat
HOOK IDEAS (film all):
  1. "Shirt still crisp at 6 pm?"
  2. Sweat test on a rickshaw ride
  3. Ironed vs not ironed, side by side
PROOF: Fabric close-up, size chart, real reviews
OFFER: Free delivery inside Dhaka, 7-day exchange
FORMAT: 9:16 video, 15–25 s, plus 4:5 still
MUST AVOID: Competitor names, "best in BD" claims
SUCCESS: Cost per purchase under ৳400 after ৳10k spend`}</Code>
        <Callout tone="tip" title="The doubts line is gold">
          If you know what stops people buying, the ad can answer it. Ask your call centre or chat
          team: they hear the doubts every day.
        </Callout>
      </Section>

      <Section id="mistakes" n={2} title="Brief mistakes that waste money">
        <ul>
          <li>No audience: the ad tries to speak to everyone, so it speaks to no one.</li>
          <li>Too many messages: price, quality, delivery, a new colour, and a sale.</li>
          <li>No hook ideas: the first seconds are left to chance.</li>
          <li>No success measure: nobody knows whether the ad worked.</li>
        </ul>
      </Section>

      <Section id="loop" n={3} title="Close the loop">
        <p>
          After an ad has run, add one line to the brief: what happened and what you learned. After
          a few months you will have a library of what works for your brand, which makes every next
          brief better.
        </p>
      </Section>

      <InlineCta
        title="Want briefs and ads handled for you?"
        body="Our creative team plans, briefs and produces ads every week. Book a free call to see how it works."
      />

      <Section id="faq" n={4} title="Things people ask us">
        <FaqList
          items={[
            {
              q: 'How long should a brief be?',
              a: 'One page. If it is longer, it probably contains more than one ad idea.',
            },
            {
              q: 'Should I give references?',
              a: 'Yes. One or two ads you like (from any brand) help more than paragraphs of description.',
            },
          ]}
        />
      </Section>
    </>
  );
}
