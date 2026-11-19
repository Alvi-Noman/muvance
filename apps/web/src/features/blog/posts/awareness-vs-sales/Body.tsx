import { Link } from 'react-router';
import { Callout, FaqList, InlineCta, Lead, Section } from '../../components/article';
import { Versus } from '../../components/viz';

export function Body() {
  return (
    <>
      <Lead>
        Small brands are often told to “build awareness first”. Usually, it is better to build
        awareness while selling.
      </Lead>
      <Section id="compare" n={1} title="What each campaign does">
        <Versus
          left={{
            title: 'Awareness campaign',
            points: [
              'Shows ads to many people cheaply',
              'Optimises for reach or recall',
              'Hard to tie to sales',
              'Useful for launches and big moments',
            ],
          }}
          right={{
            title: 'Sales campaign',
            points: [
              'Shows ads to people likely to buy',
              'Optimises for purchases',
              'Easier to measure',
              'Also builds awareness among buyers',
            ],
          }}
        />
      </Section>
      <Section id="when" n={2} title="When awareness makes sense">
        <ul>
          <li>A launch or a store opening with a fixed date.</li>
          <li>A big festival when you want to be remembered before people are ready to buy.</li>
          <li>You already sell profitably and want to grow the pool of future buyers.</li>
        </ul>
      </Section>
      <Section id="both" n={3} title="Building brand inside sales campaigns">
        <p>
          Every sales ad is seen by far more people than buy. Make those ads memorable: a consistent
          look, your name in the first seconds, a story worth remembering. That is brand building
          for free. See{' '}
          <Link to="/blog/build-a-brand-not-just-a-store">build a brand, not just a store</Link>.
        </p>
        <Callout tone="tip">
          Watch branded searches and direct traffic over months. If they grow, your brand is too.
        </Callout>
      </Section>
      <InlineCta
        title="Want help balancing brand and sales?"
        body="Book a free call. We will look at your stage and goals."
      />
      <Section id="faq" n={4} title="Questions people ask">
        <FaqList
          items={[
            {
              q: 'Are awareness ads a waste of money?',
              a: 'Not always, but they are hard to judge. Small brands should use them sparingly and with a clear purpose.',
            },
            {
              q: 'What about video views campaigns?',
              a: 'Useful for building retargeting audiences cheaply, but views alone do not pay bills.',
            },
          ]}
        />
      </Section>
    </>
  );
}
