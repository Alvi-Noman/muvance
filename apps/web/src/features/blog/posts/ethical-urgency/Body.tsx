import { Link } from 'react-router';
import { Callout, CompareTable, FaqList, InlineCta, Lead, Section } from '../../components/article';

export function Body() {
  return (
    <>
      <Lead>A countdown that resets every time you refresh the page fools people once.</Lead>
      <Section id="real" n={1} title="Real reasons to act now">
        <CompareTable
          columns={['Reason', 'Example', 'Why it is honest']}
          rows={[
            [
              'A real deadline',
              '“Order by 20 March for delivery before Eid”',
              'Courier timing is real',
            ],
            [
              'Limited production',
              '“120 pieces in this print, no restock”',
              'True if you keep to it',
            ],
            ['Season', '“Winter collection, while it lasts”', 'Stock does run out'],
            ['A dated offer', '“Free delivery until Sunday”', 'Ends when you said'],
          ]}
        />
      </Section>
      <Section id="fake" n={2} title="Why fake urgency backfires">
        <ul>
          <li>Customers notice and screenshot it.</li>
          <li>It trains people to ignore your deadlines.</li>
          <li>It can break consumer protection rules and ad platform policies.</li>
        </ul>
        <Callout tone="warning">
          If you say a sale ends Sunday, end it Sunday. Extending “by popular demand” every time
          teaches customers to wait.
        </Callout>
      </Section>
      <Section id="better" n={3} title="Often better than urgency">
        <p>
          Many people are not waiting for a reason to hurry. They are waiting to feel sure.
          Answering their doubts often beats any timer. See{' '}
          <Link to="/blog/handle-buyer-objections-before-they-ask">
            the six doubts that stop people buying
          </Link>
          .
        </p>
      </Section>
      <InlineCta
        title="Want offers that sell honestly?"
        body="Book a free call. We will look at your current promotions."
      />
      <Section id="faq" n={4} title="Questions people ask">
        <FaqList
          items={[
            {
              q: 'Are countdown timers ever OK?',
              a: 'Yes, when they count down to a real end time that is the same for everyone.',
            },
            {
              q: 'Is “limited stock” OK to say?',
              a: 'Only if stock really is limited, and you show it accurately.',
            },
          ]}
        />
      </Section>
    </>
  );
}
