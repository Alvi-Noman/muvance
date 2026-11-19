import { useEffect, useRef } from 'react';
import { ArrowLeft, ArrowRight, ArrowUpRight, Sparkle } from 'lucide-react';
import { Link, useSearchParams } from 'react-router';
import { Container } from '@/components/ui/Container';
import { siteConfig } from '@/config/site';
import { PostCover, posts, usePageMeta, type BlogPost } from '@/features/blog';
import { cn } from '@/lib/cn';

/** The blog as a list of articles, for search engines. Built once from the post list. */
const BLOG_JSON_LD = {
  '@context': 'https://schema.org',
  '@type': 'Blog',
  '@id': `${siteConfig.url}/blog#blog`,
  url: `${siteConfig.url}/blog`,
  name: `${siteConfig.name} blog`,
  publisher: { '@id': `${siteConfig.url}/#organization` },
  blogPost: posts.map((p) => ({
    '@type': 'BlogPosting',
    headline: p.title,
    url: `${siteConfig.url}/blog/${p.slug}`,
    datePublished: p.published,
  })),
};

/** Cards per page (the featured post on page one is extra). */
const PAGE_SIZE = 12;

/** Topics, biggest first, so the filter row leads with the richest ones. */
const CATEGORIES = (() => {
  const counts = new Map<string, number>();
  for (const p of posts) counts.set(p.category, (counts.get(p.category) ?? 0) + 1);
  return ['All', ...[...counts].sort((a, b) => b[1] - a[1]).map(([c]) => c)];
})();

const dateFormat = new Intl.DateTimeFormat('en-GB', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
});

export function BlogPage() {
  const [params, setParams] = useSearchParams();
  const topic = params.get('topic');
  const category = topic && CATEGORIES.includes(topic) ? topic : 'All';
  const shown = category === 'All' ? posts : posts.filter((p) => p.category === category);
  // Page one leads with the newest post as a large featured card.
  const [featured, ...rest] = shown;
  const pageCount = Math.max(1, Math.ceil(rest.length / PAGE_SIZE));
  const requested = Number.parseInt(params.get('page') ?? '1', 10);
  const page = Number.isFinite(requested) ? Math.min(Math.max(requested, 1), pageCount) : 1;
  const cards = rest.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  usePageMeta({
    title: `Blog: digital marketing playbooks for eCommerce${page > 1 ? ` (page ${page})` : ''} | ${siteConfig.name}`,
    description:
      'Practical guides on ads, audiences, metrics, SEO, content and retention for eCommerce brands, with charts and checklists you can use today.',
    // Filtered views are not separate pages; numbered pages are.
    canonical: `${siteConfig.url}/blog${page > 1 && category === 'All' ? `?page=${page}` : ''}`,
    jsonLd: BLOG_JSON_LD,
  });

  // When the page or topic changes, bring the reader back to the top of the list, not the hero.
  const listRef = useRef<HTMLDivElement>(null);
  const firstRender = useRef(true);
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    listRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [page, category]);

  const hrefFor = (n: number) => {
    const next = new URLSearchParams();
    if (category !== 'All') next.set('topic', category);
    if (n > 1) next.set('page', String(n));
    const q = next.toString();
    return q ? `?${q}` : '/blog';
  };

  const chooseCategory = (c: string) => {
    setParams(c === 'All' ? {} : { topic: c }, { preventScrollReset: true });
  };

  return (
    <div className="pt-8 pb-12 sm:pt-14">
      <Container>
        <header className="mx-auto max-w-3xl text-center">
          <span className="inline-flex animate-fade-up items-center gap-2 rounded-full border border-black/5 bg-white/60 px-3 py-1 text-xs font-medium tracking-[0.14em] text-neutral-600 uppercase">
            <Sparkle className="size-3 fill-neutral-900" aria-hidden />
            The Muvance playbook
          </span>
          <h1 className="mt-5 animate-fade-up font-serif text-[clamp(3rem,9vw,6.5rem)] leading-[0.92] tracking-[-0.02em] [animation-delay:80ms]">
            Digital marketing, <em>explained properly.</em>
          </h1>
          <p className="mx-auto mt-6 max-w-xl animate-fade-up text-base text-balance text-neutral-500 [animation-delay:160ms] sm:text-lg">
            {posts.length} field-tested guides on ads, audiences, metrics, SEO, content and
            retention. Visual, practical and straight to the point.
          </p>
        </header>

        <div
          ref={listRef}
          role="group"
          aria-label="Filter by topic"
          className="mt-10 flex scroll-mt-24 animate-fade-up justify-start gap-2 overflow-x-auto pb-2 [animation-delay:240ms] sm:justify-center"
        >
          {CATEGORIES.map((c) => (
            <button
              key={c}
              type="button"

              aria-pressed={category === c}
              onClick={() => chooseCategory(c)}
              className={cn(
                'shrink-0 rounded-full px-4 py-2 text-sm font-medium transition',
                category === c
                  ? 'bg-neutral-950 text-white'
                  : 'border border-black/5 bg-white/70 text-neutral-600 hover:bg-white',
              )}
            >
              {c}
            </button>
          ))}
        </div>

        {featured && page === 1 && <FeaturedCard post={featured} />}

        {cards.length > 0 && (
          <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {cards.map((p) => (
              <PostCard key={p.slug} post={p} />
            ))}
          </div>
        )}

        {pageCount > 1 && <Pagination page={page} pageCount={pageCount} hrefFor={hrefFor} />}
      </Container>
    </div>
  );
}

function Meta({ post }: { post: BlogPost }) {
  return (
    <p className="flex items-center gap-2 text-xs text-neutral-500">
      <time dateTime={post.published}>
        {dateFormat.format(new Date(`${post.published}T00:00:00`))}
      </time>
      <span aria-hidden>·</span>
      {post.readMinutes} min read
    </p>
  );
}

function FeaturedCard({ post }: { post: BlogPost }) {
  return (
    <Link
      to={`/blog/${post.slug}`}
      // Start downloading the article as soon as the reader shows interest.
      onPointerEnter={() => void post.preload()}
      onFocus={() => void post.preload()}
      className="group mt-10 grid animate-fade-up gap-6 rounded-[36px] border border-white/80 bg-white/70 p-3 shadow-[0_30px_80px_-40px_rgba(0,0,0,0.35)] backdrop-blur transition hover:bg-white [animation-delay:300ms] lg:grid-cols-[1.3fr_1fr] lg:items-center"
    >
      <PostCover
        post={post}
        className="transition-transform duration-700 group-hover:scale-[1.01]"
      />
      <div className="p-4 sm:p-6 lg:pr-10">
        <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-medium text-emerald-800">
          Latest
        </span>
        <h2 className="mt-4 font-serif text-[clamp(2rem,4vw,3.25rem)] leading-[1] tracking-[-0.015em] text-balance">
          {post.title}
        </h2>
        <p className="mt-4 text-[15px] leading-relaxed text-neutral-600">{post.description}</p>
        <div className="mt-6 flex items-center justify-between">
          <Meta post={post} />
          <span className="grid size-11 place-items-center rounded-full bg-neutral-950 text-white transition group-hover:rotate-45">
            <ArrowUpRight className="size-5" aria-hidden />
          </span>
        </div>
      </div>
    </Link>
  );
}

function PostCard({ post }: { post: BlogPost }) {
  return (
    <Link
      to={`/blog/${post.slug}`}
      // Start downloading the article as soon as the reader shows interest.
      onPointerEnter={() => void post.preload()}
      onFocus={() => void post.preload()}
      className="group flex flex-col rounded-[30px] border border-white/80 bg-white/70 p-2.5 shadow-[0_24px_60px_-36px_rgba(0,0,0,0.3)] transition hover:-translate-y-1 hover:bg-white"
    >
      <PostCover post={post} />
      <div className="flex flex-1 flex-col p-4">
        <h3 className="font-serif text-2xl leading-[1.08] text-balance">{post.title}</h3>
        <p className="mt-2 line-clamp-2 text-sm text-neutral-600">{post.description}</p>
        <div className="mt-auto pt-5">
          <Meta post={post} />
        </div>
      </div>
    </Link>
  );
}

/** Page numbers to show: first, last, the current page and its neighbours; null marks a gap. */
function pageList(page: number, count: number): (number | null)[] {
  const keep = [...new Set([1, count, page - 1, page, page + 1])]
    .filter((n) => n >= 1 && n <= count)
    .sort((a, b) => a - b);
  const out: (number | null)[] = [];
  let previous = 0;
  for (const n of keep) {
    if (previous && n - previous > 1) out.push(null);
    out.push(n);
    previous = n;
  }
  return out;
}

function Pagination({
  page,
  pageCount,
  hrefFor,
}: {
  page: number;
  pageCount: number;
  hrefFor: (n: number) => string;
}) {
  const arrow =
    'inline-flex h-11 items-center gap-2 rounded-full border border-black/5 bg-white/70 px-4 text-sm font-medium text-neutral-700 transition hover:bg-white';
  const disabled = cn(arrow, 'pointer-events-none opacity-40');
  return (
    <nav aria-label="Blog pages" className="mt-12 flex items-center justify-center gap-2">
      {page > 1 ? (
        <Link to={hrefFor(page - 1)} preventScrollReset rel="prev" className={arrow}>
          <ArrowLeft className="size-4" aria-hidden />
          <span className="hidden sm:inline">Newer</span>
        </Link>
      ) : (
        <span className={disabled} aria-hidden>
          <ArrowLeft className="size-4" />
          <span className="hidden sm:inline">Newer</span>
        </span>
      )}

      <ol className="flex items-center gap-1">
        {pageList(page, pageCount).map((n, i) =>
          n === null ? (
            <li key={`gap-${i}`} aria-hidden className="px-1 text-sm text-neutral-400">
              …
            </li>
          ) : (
            <li key={n}>
              <Link
                to={hrefFor(n)}
                preventScrollReset
                aria-label={`Page ${n}`}
                aria-current={n === page ? 'page' : undefined}
                className={cn(
                  'grid size-11 place-items-center rounded-full text-sm font-medium transition',
                  n === page ? 'bg-neutral-950 text-white' : 'text-neutral-600 hover:bg-white',
                )}
              >
                {n}
              </Link>
            </li>
          ),
        )}
      </ol>

      {page < pageCount ? (
        <Link to={hrefFor(page + 1)} preventScrollReset rel="next" className={arrow}>
          <span className="hidden sm:inline">Older</span>
          <ArrowRight className="size-4" aria-hidden />
        </Link>
      ) : (
        <span className={disabled} aria-hidden>
          <span className="hidden sm:inline">Older</span>
          <ArrowRight className="size-4" />
        </span>
      )}
    </nav>
  );
}
