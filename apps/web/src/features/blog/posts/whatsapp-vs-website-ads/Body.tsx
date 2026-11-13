import { MessageCircle, MousePointerClick, ShoppingBag, UserRound } from 'lucide-react';
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
import { Calculator, Checklist, Flow } from '../../components/viz';
import { taka } from '../../components/format';

function chatSales(v: Record<string, number>) {
  const chats = v.chats ?? 0;
  const close = (v.close ?? 0) / 100;
  const orders = chats * close;
  return [
    { label: 'Orders a day', value: orders.toFixed(1) },
    { label: 'Revenue a month', value: taka(orders * (v.aov ?? 0) * 30), dark: true },
    {
      label: 'Ad cost per order',
      value: orders ? taka(((v.costPerChat ?? 0) * chats) / orders) : '–',
    },
  ];
}

export function Body() {
  return (
    <>
      <Lead>
        Plenty of Bangladeshi buyers want to ask a question before they pay. &quot;Is it
        original?&quot; &quot;Do you have size 42?&quot; Message ads let them. Website ads don’t. So
        which sells more?
      </Lead>
      <Prose>
        <p>
          Click-to-WhatsApp and Messenger ads open a chat instead of a web page. For a lot of local
          brands they bring in more orders, because the customer gets a real person and a quick
          answer. But they also need people to reply fast, all day, and they’re harder to measure.
          Website ads scale more easily but lose buyers who wanted to talk first.
        </p>
      </Prose>

      <div className="mt-10">
        <KeyTakeaways
          items={[
            'Message ads suit products that raise questions: sizes, authenticity, custom orders.',
            'Website ads suit simple products and scale better, with cleaner tracking.',
            'Message ads only work if someone replies within minutes, not hours.',
            'Many brands do best running both, and letting the numbers set the split.',
          ]}
        />
      </div>

      <Section id="how" n={1} title="How a chat sale works">
        <Figure title="From ad to order through chat" example={false}>
          <Flow
            nodes={[
              { title: 'Sees ad', icon: <UserRound className="size-5" /> },
              { title: 'Taps "Send message"', icon: <MousePointerClick className="size-5" /> },
              {
                title: 'Asks a question',
                body: 'You reply within minutes',
                icon: <MessageCircle className="size-5" />,
                highlight: true,
              },
              { title: 'Orders in chat', icon: <ShoppingBag className="size-5" /> },
            ]}
          />
        </Figure>
        <p>
          The make-or-break step is the third one. A buyer who waits an hour has usually moved on,
          or messaged three other pages.
        </p>
      </Section>

      <Section id="compare" n={2} title="Side by side">
        <CompareTable
          columns={['', 'WhatsApp / Messenger ads', 'Website ads']}
          rows={[
            [
              'Best for',
              'Products with questions; first-time buyers',
              'Simple products; repeat buyers',
            ],
            ['Trust', 'High: a real person answers', 'Depends on your site'],
            [
              'Scaling',
              'Limited by how many chats your team can handle',
              'Easy: the site never sleeps',
            ],
            [
              'Tracking',
              'Harder: sales happen in chat, so you have to report them back',
              'Easier: Pixel and Conversions API',
            ],
            ['Cost per lead', 'Often low', 'No "lead", just visits and orders'],
            ['Staff needed', 'Yes, fast replies all day', 'Less'],
          ]}
        />
      </Section>

      <Section id="calc" n={3} title="What chat ads could bring in">
        <p>
          The maths of chat ads is all about your close rate: how many conversations turn into
          orders. Play with it.
        </p>
        <Figure title="Chat sales calculator" example={false}>
          <Calculator
            inputs={[
              { id: 'chats', label: 'New chats a day', value: 60, step: 5 },
              { id: 'close', label: 'Chats that order', value: 25, suffix: '%' },
              { id: 'aov', label: 'Average order', value: 1500, prefix: '৳', step: 100 },
              { id: 'costPerChat', label: 'Ad cost per chat', value: 40, prefix: '৳', step: 5 },
            ]}
            compute={chatSales}
          />
        </Figure>
        <Callout tone="tip">
          Want to lift your close rate? Reply faster, use quick replies for common questions (price,
          sizes, delivery), and send a photo or short video of the actual product.
        </Callout>
      </Section>

      <PullQuote>
        A message ad without a fast reply is just an expensive way to annoy people.
      </PullQuote>

      <Section id="tracking" n={4} title="Don’t fly blind on tracking">
        <p>
          Because the sale happens in chat, Meta doesn’t automatically know who bought. If you
          optimise only for conversations, you might get lots of chats from people who never order.
          Where possible, mark purchases from chat and send them back to Meta (Meta supports this
          for business messaging through the Conversions API and some messaging tools). At minimum,
          log every chat order in a sheet so you can work out a real cost per order.
        </p>
      </Section>

      <Section id="check" n={5} title="Are you ready for message ads?">
        <Figure title="Tick what’s true" example={false}>
          <Checklist
            items={[
              'Someone can reply within 5 minutes during the day',
              'Quick replies set up for price, sizes and delivery',
              'Product photos and videos ready to send',
              'Chat orders logged so you know your close rate',
              'A plan for messages that arrive at night',
              'Purchases from chat reported back to Meta',
            ]}
            verdicts={[
              'Message ads will likely waste money until replies are fast.',
              'Good start. Tighten the reply process.',
              'You’re set up to make chat ads work.',
            ]}
          />
        </Figure>
      </Section>

      <InlineCta
        title="Not sure whether to sell through chat or your site?"
        body="We’ll look at your products and team on a free call and suggest the right mix."
      />

      <Section id="faq" n={6} title="Things people ask us">
        <FaqList
          items={[
            {
              q: 'WhatsApp or Messenger?',
              a: 'Many Bangladeshi buyers prefer WhatsApp for business chats, but it depends on your audience. Test both if you can staff them.',
            },
            {
              q: 'Can I automate replies with a chatbot?',
              a: 'For simple questions, yes. But a real person closing the sale still tends to convert better, especially for higher-priced items.',
            },
            {
              q: 'Should I send all ads to chat?',
              a: 'Rarely. Most brands do best with a mix: chat for first-time and question-heavy buyers, website for simple products and repeat customers.',
            },
          ]}
        />
      </Section>
    </>
  );
}
