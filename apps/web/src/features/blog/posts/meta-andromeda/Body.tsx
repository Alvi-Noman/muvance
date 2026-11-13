import { Boxes, Brain, Gavel, Layers, MonitorSmartphone } from 'lucide-react';
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
  Steps,
} from '../../components/article';
import { BarList, Checklist, Flow, Versus } from '../../components/viz';

export function Body() {
  return (
    <>
      <Lead>
        Meta rebuilt the engine that decides which ad each person sees. If your account is still
        structured for the old engine, you’re paying for it.
      </Lead>
      <Prose>
        <p>
          In late 2024 Meta introduced <strong>Andromeda</strong>, a new system for the first step
          of ad delivery: picking which ads, out of everything eligible, are even considered for a
          person. Since then, media buyers have seen the same pattern: accounts with{' '}
          <strong>fewer campaigns and more varied creative</strong> tend to get cheaper results than
          accounts split into many small, tightly targeted ad sets.
        </p>
        <p>
          This guide explains what changed in plain language, and how to structure campaigns so the
          system works for you instead of against you.
        </p>
      </Prose>

      <div className="mt-10">
        <KeyTakeaways
          items={[
            'Andromeda chooses which ads reach the auction for each person, using signals from the ad itself.',
            'Your creative now does much of the targeting. Different concepts reach different people.',
            'Consolidate: fewer campaigns and ad sets, so each one gets enough data to learn.',
            'Feed the system 8–15 genuinely different concepts per ad set, not 15 colour swaps of one ad.',
          ]}
        />
      </div>

      <Section id="what" n={1} title="What Andromeda actually does">
        <p>
          Every time someone opens Facebook or Instagram, Meta has a huge number of ads that could
          be shown. It can’t run a full prediction on all of them in a fraction of a second, so
          delivery happens in stages. Andromeda is the <strong>retrieval</strong> stage: it narrows
          the pool to a shortlist. Only ads on that shortlist go on to ranking and the auction.
        </p>
        <Figure title="How an ad reaches someone’s feed" example={false}>
          <Flow
            nodes={[
              {
                title: 'All eligible ads',
                body: 'Every ad that could be shown to this person',
                icon: <Boxes className="size-5" />,
              },
              {
                title: 'Retrieval',
                body: 'Andromeda picks a shortlist',
                icon: <Brain className="size-5" />,
                highlight: true,
              },
              {
                title: 'Ranking',
                body: 'Predicts who will click and buy',
                icon: <Layers className="size-5" />,
              },
              {
                title: 'Auction',
                body: 'Bid × predicted value',
                icon: <Gavel className="size-5" />,
              },
              {
                title: 'Shown',
                body: 'One ad lands in the feed',
                icon: <MonitorSmartphone className="size-5" />,
              },
            ]}
          />
        </Figure>
        <p>
          If your ad never makes the shortlist, your bid and audience settings never get a chance to
          matter. That’s why the inputs Andromeda reads, above all the creative, have become so
          important.
        </p>
      </Section>

      <Section id="creative" n={2} title="Why creative is now your targeting">
        <p>
          Retrieval uses what is <em>in</em> the ad (the visuals, the words, the format) to judge
          who it’s likely to suit. A gym-shot video for a supplement and a busy-mum testimonial for
          the same supplement will be matched to different people, even inside the same broad
          audience.
        </p>
        <p>
          The flip side: ads that look and say nearly the same thing are treated as nearly the same
          ad. Ten colour variations of one image don’t give you ten chances. They give you roughly
          one.
        </p>
        <Figure title="The old playbook vs the Andromeda-era playbook" example={false}>
          <Versus
            left={{
              title: 'Old playbook',
              points: [
                'Many ad sets, each with a different interest',
                'One or two ads per ad set',
                'Small variations: new colour, new headline',
                'Targeting decides who sees the ad',
              ],
            }}
            right={{
              title: 'What works now',
              points: [
                'One or two broad ad sets per campaign',
                'Many ads per ad set',
                'Distinct concepts: new angle, person, format',
                'Creative decides who sees the ad',
              ],
            }}
          />
        </Figure>
      </Section>

      <Section id="consolidate" n={3} title="Consolidate so every ad set can learn">
        <p>
          Each ad set goes through a <strong>learning phase</strong>. Meta says an ad set generally
          needs around 50 optimisation events in a week to exit it. Spread the same budget over ten
          ad sets and each one may never get there, so results stay unstable and more expensive.
        </p>
        <Figure
          title="Weekly purchases per ad set, same total budget"
          caption="Splitting a budget across many ad sets means none of them collects enough data to learn."
        >
          <BarList
            items={[
              {
                label: '10 ad sets',
                value: 8,
                tone: 'warm',
                note: 'Around 8 purchases each per week: stuck in learning, results swing day to day.',
              },
              {
                label: '4 ad sets',
                value: 20,
                tone: 'warm',
                note: 'Better, but most ad sets still fall short of the learning threshold.',
              },
              {
                label: '2 ad sets',
                value: 40,
                tone: 'ink',
                note: 'Close to the threshold; delivery starts to stabilise.',
              },
              {
                label: '1 ad set',
                value: 80,
                tone: 'accent',
                note: 'All the data in one place: the fastest way through learning.',
              },
              {
                label: 'Learning target',
                value: 50,
                tone: 'muted',
                note: 'Meta’s guide: about 50 optimisation events in 7 days.',
              },
            ]}
          />
        </Figure>
        <Callout tone="warning">
          Consolidation isn’t &quot;put everything in one ad set forever&quot;. Keep separate
          campaigns when the goal, country, or product line is truly different, or when you need a
          clean read on new customers versus returning ones.
        </Callout>
      </Section>

      <PullQuote>
        You no longer win by finding the right audience. You win by giving Meta the right range of
        ads, and letting it find the audience.
      </PullQuote>

      <Section id="structure" n={4} title="A simple structure that works for most stores">
        <p>A good starting point for an eCommerce brand spending a steady daily budget:</p>
        <Steps
          steps={[
            {
              title: 'One main sales campaign',
              body: 'Advantage+ sales campaign, or a manual campaign with Advantage campaign budget. Optimise for purchases.',
            },
            {
              title: 'One or two broad ad sets',
              body: 'Country, age floor if needed, and nothing else. Let Advantage+ audience do the rest.',
            },
            {
              title: '8–15 distinct concepts per ad set',
              body: 'Mix formats (video, static, carousel), angles (problem, result, comparison) and people (founder, customer, creator).',
            },
            {
              title: 'A steady flow of new concepts',
              body: 'Add new ads every week or two and switch off the ones that never get spend or keep losing.',
            },
            {
              title: 'Optional: a testing campaign',
              body: 'A small separate campaign to try new concepts before they join the main one. Useful above a moderate budget.',
            },
          ]}
        />
      </Section>

      <Section id="diversity" n={5} title="What 'different enough' really means">
        <p>
          Creative diversity is about <strong>who the ad speaks to and how</strong>, not about the
          colour of the button. Use this table when briefing your designer or creators.
        </p>
        <CompareTable
          columns={['', 'Just a variation', 'A genuinely new concept']}
          rows={[
            [
              'Visual',
              'Same video, new background colour',
              'Studio product shot vs customer filming at home',
            ],
            [
              'Angle',
              'Same message, new headline wording',
              '"Saves time" vs "Looks premium" vs "Gift idea"',
            ],
            [
              'Person',
              'Same model, different outfit',
              'Founder story vs student vs working mother',
            ],
            [
              'Format',
              'Same image, square vs vertical crop',
              'Static vs 30-second demo vs carousel of reviews',
            ],
            ['Offer', 'Same offer, new button text', 'Free delivery vs bundle vs limited drop'],
          ]}
        />
        <Callout tone="local">
          For Bangladeshi audiences, testing <strong>Bangla vs English</strong> copy, and creators
          from different cities, often produces bigger differences than any design tweak.
        </Callout>
      </Section>

      <Section id="audit" n={6} title="Quick audit: is your account Andromeda-ready?">
        <p>Tick what is true for your account today.</p>
        <Figure title="Account readiness check" example={false}>
          <Checklist
            items={[
              'Most budget runs through 1–3 sales campaigns',
              'Main ad sets use broad or Advantage+ audience',
              'Each main ad set has at least 8 active ads',
              'Ads include at least 3 different formats',
              'Ads include at least 3 different angles or messages',
              'New concepts are added every 1–2 weeks',
              'Conversions API is set up and deduplicated',
              'Ad sets regularly exit the learning phase',
            ]}
            verdicts={[
              'Your structure is built for the old system. Consolidating could make a real difference.',
              'You’re halfway there. Focus on the unticked items.',
              'Your account is set up the way the current system rewards.',
            ]}
          />
        </Figure>
      </Section>

      <InlineCta
        title="Want a second pair of eyes on your structure?"
        body="On a free call we review your account structure and creative mix, and show you what we would consolidate first."
      />

      <Section id="faq" n={7} title="Things people ask us">
        <FaqList
          items={[
            {
              q: 'Is interest targeting dead?',
              a: 'Not dead, but rarely the main lever now. Interests can still help a brand-new account with little data, or a very niche product. For most stores, broad audiences with strong, varied creative perform as well or better.',
            },
            {
              q: 'How many ads is too many in one ad set?',
              a: 'Meta caps the number of ads per ad set, and spend tends to concentrate on a few winners anyway. Most buyers find 8–15 strong, distinct concepts a practical range. Add more only if they’re genuinely different.',
            },
            {
              q: 'Should I use Advantage+ sales campaigns?',
              a: 'They’re a good default for many eCommerce brands because they consolidate by design. Run a side-by-side test against your current setup for at least two weeks before moving everything.',
            },
            {
              q: 'Do I need to rebuild my account from scratch?',
              a: 'Usually not. Start by moving your best-performing ads into one consolidated campaign, give it most of the budget, and switch off the small ad sets gradually.',
            },
          ]}
        />
      </Section>

      <InlineCta
        title={
          <>
            Build for the system Meta <em>actually</em> runs.
          </>
        }
        body="We restructure accounts for how delivery works today, and only get paid once you hit your sales target."
      />
    </>
  );
}
