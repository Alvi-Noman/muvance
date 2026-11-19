import {
  Callout,
  FaqList,
  InlineCta,
  KeyTakeaways,
  Lead,
  Prose,
  PullQuote,
  Section,
  Steps,
} from '../../components/article';
import { Versus } from '../../components/viz';

export function Body() {
  return (
    <>
      <Lead>
        Online, buyers cannot touch your product. Reviews from people like them are the closest
        thing. But only real ones work, and only if you collect them on purpose.
      </Lead>
      <Prose>
        <p>
          Most stores have happy customers and almost no reviews to show for it, because nobody
          asked at the right moment. Here is a simple system.
        </p>
      </Prose>

      <div className="mt-10">
        <KeyTakeaways
          items={[
            'Ask a few days after delivery, when the product has been used.',
            'Make it one tap: a link, a voice note or a photo on WhatsApp.',
            'Photo and video reviews beat star ratings.',
            'Never fake reviews. One discovered fake undoes a hundred real ones.',
          ]}
        />
      </div>

      <Section id="collect" n={1} title="How to collect reviews">
        <Steps
          steps={[
            {
              title: 'Time it right',
              body: 'Ask three to seven days after delivery, depending on the product.',
            },
            {
              title: 'Ask on the channel they use',
              body: 'WhatsApp or SMS usually gets far more replies than email in Bangladesh.',
            },
            {
              title: 'Make it easy',
              body: 'One question: "How are you finding it? A photo would help other buyers."',
            },
            {
              title: 'Say thank you',
              body: 'A small thank-you (a discount on the next order) is fine. Paying for positive reviews is not.',
            },
          ]}
        />
      </Section>

      <Section id="show" n={2} title="Where and how to show them">
        <Versus
          left={{
            title: 'Weak social proof',
            points: [
              '"100% satisfied customers!"',
              'Five stars with no names or details',
              'All reviews buried at the bottom',
            ],
          }}
          right={{
            title: 'Strong social proof',
            points: [
              'Real photos from real customers',
              'Specific comments about fit, taste or quality',
              'A few reviews near the order button, more below',
            ],
          }}
        />
        <Callout tone="tip" title="Use them in ads too">
          With permission, customer photos and short video reviews make some of the most believable
          ads you can run.
        </Callout>
      </Section>

      <PullQuote>One honest three-star review can sell more than ten perfect five-stars.</PullQuote>

      <Section id="bad" n={3} title="Handling bad reviews">
        <p>
          Reply politely and publicly, fix the problem privately, and leave the review up. Buyers
          trust a store with a few imperfect reviews more than one with only perfect ones. A calm,
          helpful reply shows how you treat customers when something goes wrong.
        </p>
      </Section>

      <InlineCta
        title="Want proof built into your ads and pages?"
        body="Book a free call. We will look at how you collect and show reviews, and where they could do more work."
      />

      <Section id="faq" n={4} title="Things people ask us">
        <FaqList
          items={[
            {
              q: 'Can I use screenshots of customer messages?',
              a: 'Yes, with permission. Hide personal details like phone numbers.',
            },
            {
              q: 'Are fake reviews illegal?',
              a: 'They break platform rules and can mislead customers. Beyond the risk, they simply stop working once people notice.',
            },
          ]}
        />
      </Section>
    </>
  );
}
