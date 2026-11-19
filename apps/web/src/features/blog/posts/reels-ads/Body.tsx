import { Link } from 'react-router';
import {
  Callout,
  FaqList,
  Figure,
  InlineCta,
  KeyTakeaways,
  Lead,
  Prose,
  PullQuote,
  Section,
} from '../../components/article';
import { Flow } from '../../components/viz';

export function Body() {
  return (
    <>
      <Lead>
        A Reels ad that people enjoy is not the same as a Reels ad that sells. The best ones manage
        both: they feel like content, and they leave no doubt about what to buy and why.
      </Lead>
      <Prose>
        <p>
          Here is a simple structure for short sales videos, and the details that make them feel
          native to Reels instead of like a TV advert squeezed onto a phone.
        </p>
      </Prose>

      <div className="mt-10">
        <KeyTakeaways
          items={[
            'Hook, problem, product, proof, offer: in roughly 15 to 30 seconds.',
            'Shoot vertical, on a phone, with natural sound or a voice.',
            'Add captions. Many people watch with the sound off.',
            'Put the product in the first few seconds, not only at the end.',
          ]}
        />
      </div>

      <Section id="structure" n={1} title="A structure that sells">
        <Figure title="A 20-second sales Reel" example={false}>
          <Flow
            nodes={[
              { title: '0–2s Hook', body: 'Problem, result or surprise' },
              { title: '2–6s Problem', body: 'Show the pain in real life' },
              { title: '6–14s Product', body: 'It in use, close up' },
              { title: '14–18s Proof', body: 'Review, number, demo' },
              { title: '18–20s Offer', body: 'Price, delivery, how to order', highlight: true },
            ]}
          />
        </Figure>
      </Section>

      <Section id="native" n={2} title="Making it feel native">
        <ul>
          <li>
            <strong>Phone over studio.</strong> Slightly imperfect footage often outperforms
            polished video on Reels.
          </li>
          <li>
            <strong>A real face and voice.</strong> Someone talking to camera builds trust fast.
          </li>
          <li>
            <strong>Captions in the safe zone.</strong> Keep text away from the bottom and right
            edges, where buttons cover it.
          </li>
          <li>
            <strong>Fast cuts.</strong> A new shot every one to two seconds keeps attention.
          </li>
        </ul>
        <Callout tone="tip" title="Turn one shoot into many ads">
          Film several hooks and several endings in one session. Mix them in editing and you have
          five or six ads from one afternoon.
        </Callout>
      </Section>

      <PullQuote>Entertain for two seconds. Sell for the next eighteen.</PullQuote>

      <Section id="measure" n={3} title="How to judge a Reels ad">
        <p>
          Look at hook rate (did they stop?), hold rate (did they watch?), then cost per purchase
          (did they buy?). A video can win the first two and still lose the third. We explain these
          in <Link to="/blog/hook-rate-hold-rate-benchmarks">hook rate and hold rate</Link>.
        </p>
      </Section>

      <InlineCta
        title="Want Reels ads made for you?"
        body="Our team scripts, shoots and edits short videos built to sell. Book a free call to talk through your products."
      />

      <Section id="faq" n={4} title="Things people ask us">
        <FaqList
          items={[
            {
              q: 'Should I use trending music in Reels ads?',
              a: 'Be careful: many popular tracks are not licensed for ads. Use Meta’s ad-safe sound library or your own audio.',
            },
            {
              q: 'How long should a Reels ad be?',
              a: 'Long enough to make the case. Many good ones are 15 to 30 seconds. Test shorter and longer cuts.',
            },
          ]}
        />
      </Section>
    </>
  );
}
