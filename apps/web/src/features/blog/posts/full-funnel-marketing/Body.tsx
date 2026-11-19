import { Link } from 'react-router';
import { CompareTable, FaqList, Figure, InlineCta, Lead, Section } from '../../components/article';
import { LineChart } from '../../components/viz';
import { taka } from '../../components/format';

export function Body() {
  return (
    <>
      <Lead>
        If every ad you run says “order now”, you are only talking to people who were already going
        to buy.
      </Lead>
      <Section id="stages" n={1} title="The stages">
        <CompareTable
          columns={['Stage', 'Goal', 'Examples']}
          rows={[
            [
              'Top: awareness',
              'New people discover you',
              'Reels, creator content, educational videos',
            ],
            [
              'Middle: consideration',
              'They learn and compare',
              'Reviews, demos, retargeting, guides',
            ],
            ['Bottom: conversion', 'They order', 'Offers, product ads, checkout fixes'],
            [
              'After: retention',
              'They come back and recommend',
              'WhatsApp, email, loyalty, referrals',
            ],
          ]}
        />
      </Section>
      <Section id="why" n={2} title="Why bottom-only stops working">
        <Figure
          title="Cost per order when only running bottom-funnel ads (example)"
          caption="The pool of ready buyers runs dry. Without new people entering at the top, costs climb."
        >
          <LineChart
            labels={['M1', 'M2', 'M3', 'M4', 'M5', 'M6']}
            series={[
              { name: 'Cost per order', values: [320, 340, 380, 430, 490, 560], tone: 'warm' },
            ]}
            format={taka}
          />
        </Figure>
      </Section>
      <Section id="today" n={3} title="Full funnel with today’s ad platforms">
        <p>
          With broad targeting, you often do not need separate campaigns per stage. You need ads for
          every stage running together, so the platform can match the right message to the right
          person. See <Link to="/blog/customer-awareness-levels-ads">awareness levels</Link>.
        </p>
      </Section>
      <InlineCta
        title="Is your marketing only fishing at the bottom?"
        body="Book a free call. We will map your current ads to the funnel."
      />
      <Section id="faq" n={4} title="Questions people ask">
        <FaqList
          items={[
            {
              q: 'How do I measure top-of-funnel?',
              a: 'Watch new reach, branded searches and total sales over time, not just direct clicks.',
            },
            {
              q: 'What share should go to top-of-funnel?',
              a: 'It varies. Many brands keep a meaningful part of creative aimed at people who do not know them yet.',
            },
          ]}
        />
      </Section>
    </>
  );
}
