import { useMemo, useState } from 'react';
import { ArrowUpRight, Sparkle } from 'lucide-react';
import { Link } from 'react-router';
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

const dateFormat = new Intl.DateTimeFormat('en-GB', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
});

export function BlogPage() {
  usePageMeta({
    title: `Blog: Meta ads playbooks for eCommerce | ${siteConfig.name}`,
    description:
      'Practical guides on Meta ads, tracking, creative and scaling for eCommerce brands, with charts and checklists you can use today.',
    canonical: `${siteConfig.url}/blog`,
    jsonLd: BLOG_JSON_LD,
  });

  const categories = useMemo(() => ['All', ...new Set(posts.map((p) => p.category))], []);
  const [category, setCategory] = useState('All');
  const shown = category === 'All' ? posts : posts.filter((p) => p.category === category);
  const [featured, ...rest] = shown;

  return (
    <div className="pt-8 pb-12 sm:pt-14">
      <Container>
        <header className="mx-auto max-w-3xl text-center">
          <span className="inline-flex animate-fade-up items-center gap-2 rounded-full border border-black/5 bg-white/60 px-3 py-1 text-xs font-medium tracking-[0.14em] text-neutral-600 uppercase">
            <Sparkle className="size-3 fill-neutral-900" aria-hidden />
            The Muvance playbook
          </span>
          <h1 className="mt-5 animate-fade-up font-serif text-[clamp(3rem,9vw,6.5rem)] leading-[0.92] tracking-[-0.02em] [animation-delay:80ms]">
            Meta ads, <em>explained properly.</em>
          </h1>
          <p className="mx-auto mt-6 max-w-xl animate-fade-up text-base text-balance text-neutral-500 [animation-delay:160ms] sm:text-lg">
            Field-tested guides for eCommerce owners and media buyers. Visual, practical and
            straight to the point.
          </p>
        </header>

        <div
          role="group"
          aria-label="Filter by topic"
          className="mt-10 flex animate-fade-up justify-start gap-2 overflow-x-auto pb-2 [animation-delay:240ms] sm:justify-center"
        >
          {categories.map((c) => (
            <button
              key={c}
              type="button"

              aria-pressed={category === c}
              onClick={() => setCategory(c)}
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

        {featured && <FeaturedCard post={featured} />}

        {rest.length > 0 && (
          <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {rest.map((p) => (
              <PostCard key={p.slug} post={p} />
            ))}
          </div>
        )}
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
