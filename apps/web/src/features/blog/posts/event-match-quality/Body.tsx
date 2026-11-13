import {
  Callout,
  Code,
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
import { Checklist, Funnel } from '../../components/viz';

export function Body() {
  return (
    <>
      <Lead>
        Event Match Quality is a score out of 10 that most people glance at once and forget. It
        quietly decides how many of your sales Meta can actually connect to your ads.
      </Lead>
      <Prose>
        <p>
          When you send Meta a purchase, it has to work out <em>who</em> bought. If it can match the
          purchase to a real Facebook or Instagram account, it can credit the right ad and learn who
          to show your ads to next. If it can’t, that sale is partly wasted as a learning signal.
          EMQ is Meta’s estimate of how well that matching is going.
        </p>
        <p>
          We already covered the basics in our Pixel and Conversions API setup guide. This one is
          for when your score is low and you want to know why.
        </p>
      </Prose>

      <div className="mt-10">
        <KeyTakeaways
          items={[
            'EMQ rates how well your events can be matched to real people, per event, out of 10.',
            'It’s driven by the customer details you send with each event, and how often you send them.',
            'In Bangladesh, a correctly formatted phone number is usually the biggest win.',
            'Fix formatting first. Wrongly formatted data is as bad as no data.',
          ]}
        />
      </div>

      <Section id="where" n={1} title="Where to find it">
        <p>
          In <strong>Events Manager</strong>, open your dataset, click an event (start with
          Purchase), and look for <strong>Event match quality</strong>. Meta also lists which
          customer details you’re sending and suggests which ones to add. That suggestions list is
          your to-do list.
        </p>
      </Section>

      <Section id="why-low" n={2} title="Why scores end up low">
        <p>
          It’s rarely one big problem. It’s usually a chain of small ones, each of which loses a
          slice of your matches.
        </p>
        <Figure
          title="How 100 purchases lose their matching data"
          caption="Each step is a common leak. Fixing them one by one is how scores climb."
        >
          <Funnel
            stages={[
              { label: 'Purchases sent', value: 100, note: 'Every order reaches Meta' },
              {
                label: 'Include a phone number',
                value: 82,
                note: 'Some events go out without customer details at all',
              },
              {
                label: 'Phone formatted correctly',
                value: 61,
                note: 'Missing country code, spaces or leading zero mistakes',
              },
              {
                label: 'Also include fbp / fbc',
                value: 48,
                note: 'Cookies not passed from the browser to the server',
              },
            ]}
          />
        </Figure>
      </Section>

      <Section id="params" n={3} title="The details that matter most">
        <CompareTable
          columns={['Detail', 'What it is', 'How to get it right']}
          rows={[
            [
              'Phone (ph)',
              'The buyer’s mobile number, hashed',
              'Country code, digits only, then hash. Almost every Bangladeshi order has one.',
            ],
            [
              'Email (em)',
              'Hashed email',
              'Lowercase and trimmed before hashing. Send it when you have it.',
            ],
            [
              'fbp',
              'Browser ID cookie set by the Pixel',
              'Read it in the browser and pass it to your server with the order.',
            ],
            [
              'fbc',
              'Click ID from the ad',
              'Comes from the fbclid in the landing URL. Keep it through checkout.',
            ],
            [
              'External ID',
              'Your own customer ID, hashed',
              'Same value for the same customer every time.',
            ],
            [
              'IP and user agent',
              'The buyer’s connection and browser',
              'Capture them from the buyer’s request, not your server.',
            ],
          ]}
        />
      </Section>

      <Section id="phone" n={4} title="Getting Bangladeshi phone numbers right">
        <p>
          This is where most local stores lose points. Customers type numbers every possible way:
          &quot;01712-345678&quot;, &quot;+880 1712 345678&quot;, &quot;8801712345678&quot;. Each
          one hashes to something completely different, and only one of them matches. Normalise
          first, then hash.
        </p>
        <Code title="normalise-phone.js">{`// Turns any common Bangladeshi format into 8801XXXXXXXXX
function normaliseBdPhone(raw) {
  let digits = String(raw).replace(/\\D/g, ''); // keep digits only
  if (digits.startsWith('00')) digits = digits.slice(2);
  if (digits.startsWith('880')) digits = digits.slice(3);
  if (digits.startsWith('0')) digits = digits.slice(1);
  return digits.length === 10 ? '880' + digits : null; // null = not a valid mobile
}

// then: sha256(normaliseBdPhone(order.phone))`}</Code>
        <Callout tone="warning">
          Don’t hash an empty value or a placeholder like &quot;0000&quot;. If there’s no valid
          number, leave the field out.
        </Callout>
      </Section>

      <Section id="fix" n={5} title="A step-by-step fix">
        <Steps
          steps={[
            {
              title: 'Check what you send today',
              body: 'Use the Test Events tool and look at a real purchase. Which fields are there? Which are empty?',
            },
            { title: 'Fix phone formatting', body: 'Normalise to 8801XXXXXXXXX before hashing.' },
            {
              title: 'Pass fbp and fbc to the server',
              body: 'Store them with the order, so your server event includes them.',
            },
            {
              title: 'Send the buyer’s IP and browser',
              body: 'From the customer’s request at checkout, not from your server’s own IP.',
            },
            {
              title: 'Wait a few days and re-check',
              body: 'The score updates over time, so don’t panic if it doesn’t jump immediately.',
            },
          ]}
        />
      </Section>

      <Section id="check" n={6} title="EMQ checklist">
        <Figure title="Tick what’s true for your Purchase event" example={false}>
          <Checklist
            items={[
              'Phone number sent with most purchases',
              'Phone normalised to 8801XXXXXXXXX before hashing',
              'Email sent when available, lowercased',
              'fbp and fbc included in server events',
              'Buyer IP and user agent included',
              'No empty or placeholder values hashed',
            ]}
            verdicts={[
              'There’s a lot of easy improvement here. Start with the phone number.',
              'Good progress. Finish the remaining fields.',
              'Your matching setup is solid.',
            ]}
          />
        </Figure>
      </Section>

      <InlineCta
        title="Low match quality and no developer?"
        body="We fix tracking for every client before scaling. Book a free call and we’ll look at your Events Manager with you."
      />

      <Section id="faq" n={7} title="Things people ask us">
        <FaqList
          items={[
            {
              q: 'What EMQ score should I aim for?',
              a: 'Higher is better, and Meta labels scores from poor to great. Rather than chasing a number, make sure you’re sending every detail you legitimately have, correctly formatted.',
            },
            {
              q: 'Is it safe to send phone numbers?',
              a: 'They’re hashed before sending, so Meta receives a scrambled version. You should still mention advertising data sharing in your privacy policy.',
            },
            {
              q: 'Does EMQ affect my ad costs?',
              a: 'Indirectly. Better matching means more purchases are credited to the right ads, and the algorithm learns from more real buyers.',
            },
          ]}
        />
      </Section>
    </>
  );
}
