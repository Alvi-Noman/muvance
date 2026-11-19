import { Link } from 'react-router';
import {
  FaqList,
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
        “Which is the best skincare brand for oily skin in Bangladesh?” More people are asking an AI
        assistant that question instead of scrolling through search results.
      </Lead>
      <Prose>
        <p>
          Generative engine optimisation (GEO) is the effort to get your brand mentioned and cited
          in answers from AI tools like ChatGPT, Gemini, Perplexity and Google’s AI Overviews. It is
          new, the rules are still forming, and anyone promising guaranteed results is guessing. But
          some things clearly help.
        </p>
      </Prose>
      <div className="mt-10">
        <KeyTakeaways
          items={[
            'AI tools mostly draw on what is already published and indexed on the web.',
            'Clear, factual, quotable pages get cited more easily.',
            'Being mentioned on other trusted sites matters, not just your own.',
            'Good SEO is still the foundation.',
          ]}
        />
      </div>
      <Section id="how" n={1} title="How AI answers are put together">
        <p>
          Many AI assistants search the web in real time, read several pages and summarise them,
          often with links. Others rely on what they learned in training. Either way, they lean on
          content that is easy to find, easy to understand and repeated across trustworthy sources.
        </p>
        <Flow
          nodes={[
            { title: 'Question', body: 'User asks' },
            { title: 'Search', body: 'Tool finds pages' },
            { title: 'Read', body: 'Picks clear sources' },
            { title: 'Answer', body: 'Summarises, may cite', highlight: true },
          ]}
        />
      </Section>
      <Section id="helps" n={2} title="What helps">
        <ul>
          <li>
            <strong>Direct answers.</strong> Start key pages with a one or two sentence answer, then
            the detail.
          </li>
          <li>
            <strong>Specific facts.</strong> Who you serve, where, how you work, what it costs or
            how pricing works.
          </li>
          <li>
            <strong>FAQ sections</strong> written in the way people ask.
          </li>
          <li>
            <strong>Structured data</strong> that labels your organisation, products and FAQs. See{' '}
            <Link to="/blog/structured-data-online-store">structured data</Link>.
          </li>
          <li>
            <strong>Mentions elsewhere.</strong> Reviews, press, directories, partner sites,
            community discussions.
          </li>
          <li>
            <strong>Fresh, consistent information.</strong> The same name, address and details
            everywhere.
          </li>
        </ul>
        <PullQuote>
          If a stranger could not quote your website in one sentence, an AI probably cannot either.
        </PullQuote>
      </Section>
      <Section id="hype" n={3} title="What is hype">
        <ul>
          <li>
            Hidden text or “prompt injections” aimed at AI. It can get you penalised and does not
            reliably work.
          </li>
          <li>Mass-producing AI-written pages. Thin content is easy to ignore.</li>
          <li>Paying for “guaranteed ChatGPT rankings”. Nobody controls these answers.</li>
        </ul>
      </Section>
      <Section id="check" n={4} title="Checking where you stand">
        <p>
          Ask a few AI assistants the questions your customers would ask, with and without your
          brand name. Note who gets mentioned and which pages are cited. Repeat every month or two.
          It is rough, but it shows direction.
        </p>
      </Section>
      <InlineCta
        title="Want to show up when customers ask AI?"
        body="Book a free call. We will check how AI tools describe your brand today."
      />
      <Section id="faq" n={5} title="Questions people ask">
        <FaqList
          items={[
            {
              q: 'Is GEO replacing SEO?',
              a: 'No. Most AI search tools rely on the same web content. Strong SEO usually makes GEO easier.',
            },
            {
              q: 'Should I block AI crawlers?',
              a: 'If you want to be cited, generally no. Blocking them makes it harder for those tools to read your pages.',
            },
          ]}
        />
      </Section>
    </>
  );
}
