import { Link } from 'react-router';
import { Callout, FaqList, InlineCta, Lead, Section } from '../../components/article';
import { Versus } from '../../components/viz';

export function Body() {
  return (
    <>
      <Lead>
        The first marketing hire shapes the next two years. It is worth taking a few extra weeks to
        get right.
      </Lead>
      <Section id="type" n={1} title="Generalist or specialist?">
        <Versus
          left={{
            title: 'Generalist',
            points: [
              'Content, social, basic ads and reporting',
              'Good when you need a bit of everything',
              'Rarely expert in any one channel',
            ],
          }}
          right={{
            title: 'Specialist',
            points: [
              'Deep in one area, like media buying',
              'Good when one channel drives most sales',
              'Needs support for everything else',
            ],
          }}
        />
        <p>
          Many brands combine one in-house generalist with an agency or freelancer for paid ads. See{' '}
          <Link to="/blog/in-house-media-buyer-vs-freelancer-vs-agency">
            in-house vs freelancer vs agency
          </Link>
          .
        </p>
      </Section>
      <Section id="interview" n={2} title="Questions worth asking">
        <ol>
          <li>Walk me through a campaign that failed. What did you learn?</li>
          <li>How do you decide whether an ad is working?</li>
          <li>What would you do in your first 30 days here?</li>
          <li>Show me something you made that you are proud of. Why does it work?</li>
          <li>How do you check if reported numbers match real sales?</li>
        </ol>
        <Callout tone="tip">
          Give a small paid test task: a short ad brief or a review of your store. It shows more
          than any CV.
        </Callout>
      </Section>
      <Section id="setup" n={3} title="Setting them up to succeed">
        <ul>
          <li>One or two clear numbers they own.</li>
          <li>Access to all data: ads, store, courier, inbox.</li>
          <li>A budget for creative, not just ads.</li>
          <li>A weekly 30-minute check-in on numbers and learnings.</li>
        </ul>
      </Section>
      <InlineCta
        title="Hiring for marketing?"
        body="Book a free call. We can help you decide what to hire and what to outsource."
      />
      <Section id="faq" n={4} title="Questions people ask">
        <FaqList
          items={[
            {
              q: 'How much should I pay?',
              a: 'It varies widely by experience. Underpaying for your main growth role is usually a false saving.',
            },
            {
              q: 'Can I train someone myself?',
              a: (
                <>
                  Yes, with time and patience. Our <Link to="/training">training programme</Link> is
                  built for this.
                </>
              ),
            },
          ]}
        />
      </Section>
    </>
  );
}
