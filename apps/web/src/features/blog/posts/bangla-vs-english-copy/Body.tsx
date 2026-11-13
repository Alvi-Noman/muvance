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
        Bangla, English, or the Banglish everyone actually types in? For ads aimed at Bangladeshi
        buyers, the language you pick can matter as much as the picture.
      </Lead>
      <Prose>
        <p>
          A lot of brands default to English because it &quot;looks premium&quot;. Sometimes that’s
          right. But plenty of buyers scroll past English copy without reading it, and stop for
          something that sounds like a friend talking. There’s no single right answer, which is
          exactly why it’s worth testing rather than guessing.
        </p>
      </Prose>

      <div className="mt-10">
        <KeyTakeaways
          items={[
            'Match the language to your buyer, not to what feels premium to you.',
            'Bangla often connects better with mass-market and outside-Dhaka audiences.',
            'English (or a mix) can suit premium, younger, urban buyers.',
            'Test the same ad in two languages. Change nothing else.',
          ]}
        />
      </div>

      <Section id="examples" n={1} title="The same message, three ways">
        <p>Here’s what we mean. Same offer, same angle, three different voices.</p>
        <CompareTable
          columns={['English', 'Bangla', 'Banglish']}
          rows={[
            [
              'Free delivery inside Dhaka. Cash on delivery.',
              'ঢাকার ভেতরে ফ্রি ডেলিভারি। ক্যাশ অন ডেলিভারি।',
              'Dhakar vitore free delivery. Cash on delivery available!',
            ],
            [
              'The Eid gift she’ll actually wear.',
              'এই ঈদে এমন উপহার দিন, যা সে সত্যিই পরবে।',
              'Ei Eid e emon gift din, ja she shotti porbe.',
            ],
            [
              'Order by Thursday to get it before Eid.',
              'ঈদের আগে পেতে বৃহস্পতিবারের মধ্যে অর্ডার করুন।',
              'Eid er age pete Thursday er moddhe order korun.',
            ],
          ]}
        />
        <p>
          None of these is wrong. They just speak to different people. Which one feels like your
          customer?
        </p>
      </Section>

      <Section id="who" n={2} title="Who tends to respond to what">
        <Figure title="A rough starting guide" example={false}>
          <Versus
            left={{
              title: 'English or a mix often suits…',
              points: [
                'Premium and international-style brands',
                'Younger, urban buyers in Dhaka and Chattogram',
                'Tech, gadgets and lifestyle products',
                'Buyers who shop on global sites too',
              ],
            }}
            right={{
              title: 'Bangla often suits…',
              points: [
                'Mass-market and everyday products',
                'Buyers outside the big cities',
                'Older buyers and family purchases',
                'Anything where trust and clarity matter most',
              ],
            }}
          />
        </Figure>
        <Callout tone="warning">
          These are starting points, not rules. A &quot;premium&quot; brand can easily do better in
          Bangla, and an everyday brand can do fine in English. Your test results beat any guide.
        </Callout>
      </Section>

      <Section id="test" n={3} title="How to run a language test">
        <Steps
          steps={[
            {
              title: 'Take a proven ad',
              body: 'Use one that already works, so you are only testing the language.',
            },
            {
              title: 'Translate it properly',
              body: 'Not word for word. Ask someone who writes the way your buyers talk. A stiff, textbook translation will lose.',
            },
            {
              title: 'Change only the words',
              body: 'Same video or image, same offer. Captions and on-screen text change too.',
            },
            {
              title: 'Run them together',
              body: 'Same ad set, so they compete for the same people. Give it a week.',
            },
            {
              title: 'Look past clicks',
              body: 'Compare cost per purchase and returns. Clear Bangla copy can mean fewer surprised customers at the door.',
            },
          ]}
        />
      </Section>

      <Section id="craft" n={4} title="Getting Bangla copy right">
        <ul>
          <li>
            <strong>Write how people speak.</strong> Formal সাধু-style Bangla feels like a
            government notice. Everyday Bangla feels like a recommendation.
          </li>
          <li>
            <strong>Keep English where people use English.</strong> Words like &quot;delivery&quot;,
            &quot;order&quot; and &quot;size&quot; are normal in Bangla sentences. Forcing a pure
            Bangla word can actually confuse.
          </li>
          <li>
            <strong>Check the font.</strong> Some fonts render Bangla badly on phones. Test your
            captions on a real Android phone before publishing.
          </li>
          <li>
            <strong>Put the key info in text, not just voice.</strong> Lots of people watch with
            sound off.
          </li>
        </ul>
      </Section>

      <Section id="check" n={5} title="Before you publish">
        <Figure title="Language checklist" example={false}>
          <Checklist
            items={[
              'Written by someone who talks like your buyers',
              'Read aloud and sounds natural',
              'Bangla text checked on a real phone',
              'Captions match the voice-over',
              'Price and offer clear in both versions',
              'Landing page language matches the ad',
            ]}
            verdicts={[
              'Not ready. A rushed translation can do more harm than good.',
              'Nearly there.',
              'Ready to test.',
            ]}
          />
        </Figure>
        <p>
          That last point is easy to miss. If the ad speaks Bangla and the product page is all
          English, some people will feel lost the moment they click.
        </p>
      </Section>

      <InlineCta
        title="Want ads that sound like your customers?"
        body="We write and test ad copy in Bangla, English and everything in between. Book a free call."
      />

      <Section id="faq" n={6} title="Things people ask us">
        <FaqList
          items={[
            {
              q: 'Should I run both languages forever?',
              a: 'If both work, yes. Different people respond to different versions, and Meta will show each one to whoever it suits.',
            },
            {
              q: 'Is Banglish unprofessional?',
              a: 'Not on social media. It’s how a lot of people type. Use it where it fits your brand’s voice.',
            },
            {
              q: 'What about Meta targeting by language?',
              a: 'Language targeting exists, but we’d rather let the ad copy do it. People respond to the language they understand best, and delivery picks up on that.',
            },
          ]}
        />
      </Section>
    </>
  );
}
