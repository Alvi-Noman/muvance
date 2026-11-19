import { CompareTable, FaqList, Figure, InlineCta, Lead, Section } from '../../components/article';
import { BarList } from '../../components/viz';

export function Body() {
  return (
    <>
      <Lead>
        A satisfaction score is only useful if somebody reads the comments and fixes something.
      </Lead>
      <Section id="what" n={1} title="Two common scores">
        <CompareTable
          columns={['Score', 'Question', 'Good for']}
          rows={[
            [
              'NPS',
              '“How likely are you to recommend us to a friend?” (0 to 10)',
              'Overall loyalty and word of mouth',
            ],
            [
              'CSAT',
              '“How satisfied were you with your order?” (1 to 5)',
              'A specific moment, like delivery',
            ],
          ]}
        />
        <p>
          NPS is calculated as the share of 9s and 10s minus the share of 0 to 6s. It ranges from
          −100 to +100.
        </p>
      </Section>
      <Section id="run" n={2} title="Running it cheaply">
        <p>
          Send one short question a few days after delivery, by SMS or WhatsApp, with an optional
          follow-up: “What is the main reason for your score?” That second answer is where the value
          is.
        </p>
        <Figure title="An example month of NPS answers" caption="NPS here = 48 − 20 = 28.">
          <BarList
            items={[
              { label: 'Promoters (9–10)', value: 48, tone: 'accent' },
              { label: 'Passives (7–8)', value: 32, tone: 'muted' },
              { label: 'Detractors (0–6)', value: 20, tone: 'warm' },
            ]}
            format={(v) => `${v}%`}
          />
        </Figure>
      </Section>
      <Section id="act" n={3} title="Acting on it">
        <ul>
          <li>Call detractors within a few days. Many become loyal when someone listens.</li>
          <li>Ask promoters for a review or referral while they are happy.</li>
          <li>
            Tag reasons monthly. If “late delivery” keeps appearing, the fix is operational, not
            marketing.
          </li>
        </ul>
      </Section>
      <InlineCta
        title="Want to hear what customers really think?"
        body="Book a free call. We can help set up simple feedback loops."
      />
      <Section id="faq" n={4} title="Questions people ask">
        <FaqList
          items={[
            {
              q: 'How many answers do I need?',
              a: 'A hundred or so a month gives a steady picture. Below that, read the comments rather than trusting the score.',
            },
            {
              q: 'Is a high NPS enough?',
              a: 'No. It should show up in repeat purchases and referrals too.',
            },
          ]}
        />
      </Section>
    </>
  );
}
