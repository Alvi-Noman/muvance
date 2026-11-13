import { Brain, PenTool, ScanEye, Sparkles, TestTube2 } from 'lucide-react';
import {
  Callout,
  CompareTable,
  FaqList,
  Figure,
  InlineCta,
  KeyTakeaways,
  Lead,
  Prose,
  PullQuote,
  Section,
} from '../../components/article';
import { Checklist, Flow } from '../../components/viz';

export function Body() {
  return (
    <>
      <Lead>
        Can an ad made with AI in ten minutes beat one a person spent two days on? Sometimes, yes.
        But probably not in the way you’d expect.
      </Lead>
      <Prose>
        <p>
          It’s tempting to frame this as a fight. It isn’t really. The question that matters is
          which parts of making an ad AI does well, and which parts still need a human who
          understands your customer. Get that split right and you make more ads, faster, without
          them all looking the same.
        </p>
      </Prose>

      <div className="mt-10">
        <KeyTakeaways
          items={[
            'AI wins on speed, variations and static formats. It loses on trust and product accuracy.',
            'The idea still matters most, and good ideas still mostly come from knowing your buyers.',
            'The best results usually come from a human concept, AI production, and a human check.',
            'Test AI and human versions of the same idea. Don’t compare a great human ad with a lazy AI one.',
          ]}
        />
      </div>

      <Section id="split" n={1} title="Who’s better at what">
        <CompareTable
          columns={['Task', 'AI', 'A person']}
          rows={[
            [
              'Coming up with the angle',
              'Generic unless you guide it closely',
              'Better: knows the customer',
            ],
            ['Writing 20 headline options', 'Excellent, in seconds', 'Slow'],
            ['Resizing for every placement', 'Excellent', 'Tedious'],
            ['Product backgrounds and statics', 'Very good', 'Good, but slower'],
            ['Showing the real product accurately', 'Risky: it can alter details', 'Reliable'],
            ['Faces, emotion, trust', 'Improving, still noticeable', 'Better'],
            ['Bangla text inside images', 'Often broken or misspelled', 'Reliable'],
          ]}
        />
        <Callout tone="local">
          That last row matters here. Many AI image tools still mangle Bangla script. Add any Bangla
          text yourself in a design tool rather than letting the AI draw it.
        </Callout>
      </Section>

      <Section id="workflow" n={2} title="The hybrid workflow we’d recommend">
        <Figure title="Human idea, AI speed, human check" example={false}>
          <Flow
            nodes={[
              {
                title: 'Insight',
                body: 'From reviews and real conversations',
                icon: <Brain className="size-5" />,
              },
              {
                title: 'Concept',
                body: 'A person writes the angle and hook',
                icon: <PenTool className="size-5" />,
              },
              {
                title: 'Production',
                body: 'AI makes variations and sizes',
                icon: <Sparkles className="size-5" />,
                highlight: true,
              },
              {
                title: 'Review',
                body: 'A person checks accuracy and tone',
                icon: <ScanEye className="size-5" />,
              },
              { title: 'Test', body: 'Live ads decide', icon: <TestTube2 className="size-5" /> },
            ]}
          />
        </Figure>
      </Section>

      <PullQuote>
        AI is a fast pair of hands. It still needs someone to tell it what’s worth saying.
      </PullQuote>

      <Section id="test" n={3} title="How to test it fairly">
        <p>
          The mistake we see most is comparing a carefully made human video against a quick AI
          static, then concluding &quot;AI doesn’t work&quot; (or the reverse). Test like for like:
          the same idea and the same offer, in the same format where possible, with similar budgets.
          Then let it run for at least a week.
        </p>
        <p>
          Also, read the comments. If people are calling an ad fake, that’s a cost that won’t show
          up in click rate but will show up in trust.
        </p>
      </Section>

      <Section id="rules" n={4} title="Ground rules for AI ads">
        <ul>
          <li>
            <strong>Never change the product.</strong> Colour, size, texture and packaging must
            match what arrives at the door.
          </li>
          <li>
            <strong>No fake people saying fake things.</strong> An AI &quot;customer&quot; praising
            your product is a made-up testimonial. Don’t.
          </li>
          <li>
            <strong>Expect labels.</strong> Meta may show an &quot;AI info&quot; label on content it
            detects as AI-made or heavily edited. Make sure the ad still works if it does.
          </li>
          <li>
            <strong>Keep a human final check.</strong> Spelling, claims, prices, and anything legal.
          </li>
        </ul>
      </Section>

      <Section id="check" n={5} title="AI ad quality check">
        <Figure title="Before an AI-made ad goes live" example={false}>
          <Checklist
            items={[
              'Product looks exactly like the real thing',
              'No distorted hands, faces or text',
              'Any Bangla text added by a person',
              'No invented reviews or customers',
              'Price and offer are correct',
              'Still makes sense with an "AI info" label',
            ]}
            verdicts={[
              'Not ready. Fix these before it goes live.',
              'Close. A few more checks.',
              'Good to test.',
            ]}
          />
        </Figure>
      </Section>

      <InlineCta
        title="Want more ads without losing the human touch?"
        body="We use AI where it saves time and people where it matters. Book a free call to see how we’d do it for your brand."
      />

      <Section id="faq" n={6} title="Things people ask us">
        <FaqList
          items={[
            {
              q: 'Will Meta penalise AI-generated ads?',
              a: 'Not for being AI-made as such. But ads still have to follow Meta’s policies, and misleading content gets rejected whoever made it.',
            },
            {
              q: 'Which AI tools should I use?',
              a: "Tools change every few months, so we won’t name a 'best' one. Pick whichever lets you keep the product accurate and export in the sizes you need.",
            },
            {
              q: 'Can AI write my ad copy?',
              a: 'It is great for first drafts and variations. Edit it so it sounds like your brand, and check every claim.',
            },
          ]}
        />
      </Section>
    </>
  );
}
