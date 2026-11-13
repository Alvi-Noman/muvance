import { Suspense, useEffect, useMemo, useRef } from 'react';
import { ArrowLeft, ArrowRight, Clock } from 'lucide-react';
import { Link, useParams } from 'react-router';
import { buttonStyles } from '@/components/ui/Button';
import { Container } from '@/components/ui/Container';
import { siteConfig } from '@/config/site';
import {
  MobileContents,
  PostCover,
  ReadingProgress,
  ShareBar,
  TableOfContents,
  findPost,
  posts,
  usePageMeta,
  type BlogPost,
} from '@/features/blog';
import { RiskNote } from '@/features/landing';
import { NotFoundPage } from './NotFoundPage';

const dateFormat = new Intl.DateTimeFormat('en-GB', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
});

export function BlogPostPage() {
  const { slug } = useParams();
  const post = findPost(slug);
  if (!post) return <NotFoundPage />;
  return <Article post={post} />;
}

function Article({ post }: { post: BlogPost }) {
  const articleRef = useRef<HTMLElement>(null);
  const canonical = `${siteConfig.url}/blog/${post.slug}`;
  const jsonLd = useMemo(
    () => ({
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'BlogPosting',
          '@id': `${canonical}#article`,
          headline: post.title,
          description: post.description,
          datePublished: post.published,
          dateModified: post.published,
          articleSection: post.category,
          inLanguage: 'en',
          url: canonical,
          mainEntityOfPage: canonical,
          // Same organisation as the site-wide data in index.html.
          author: { '@id': `${siteConfig.url}/#organization` },
          publisher: { '@id': `${siteConfig.url}/#organization` },
          isPartOf: { '@id': `${siteConfig.url}/#website` },
        },
        {
          '@type': 'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Home', item: `${siteConfig.url}/` },
            { '@type': 'ListItem', position: 2, name: 'Blog', item: `${siteConfig.url}/blog` },
            { '@type': 'ListItem', position: 3, name: post.title, item: canonical },
          ],
        },
      ],
    }),
    [post, canonical],
  );
  usePageMeta({
    title: `${post.title} | ${siteConfig.name}`,
    description: post.description,
    canonical,
    jsonLd,
  });

  const { Body } = post;

  return (
    <>
      <ReadingProgress target={articleRef} />
      <article ref={articleRef} className="pt-6 pb-12 sm:pt-10">
        <Container>
          <header className="mx-auto max-w-4xl text-center">
            <Link
              to="/blog"
              className="inline-flex animate-fade-up items-center gap-1.5 text-sm text-neutral-500 transition hover:text-neutral-950"
            >
              <ArrowLeft className="size-4" aria-hidden />
              All articles
            </Link>
            <h1 className="mt-6 animate-fade-up font-serif text-[clamp(2.6rem,6.5vw,5.25rem)] leading-[0.98] tracking-[-0.02em] text-balance [animation-delay:80ms]">
              {post.title}
            </h1>
            <p className="mx-auto mt-6 max-w-2xl animate-fade-up text-base text-balance text-neutral-500 [animation-delay:160ms] sm:text-lg">
              {post.description}
            </p>
            <div className="mt-8 flex animate-fade-up flex-wrap items-center justify-center gap-x-5 gap-y-3 text-sm text-neutral-500 [animation-delay:220ms]">
              <span className="flex items-center gap-2">
                <span className="grid size-8 place-items-center rounded-full bg-neutral-950 font-logo text-xs text-white">
                  M
                </span>
                <span className="text-neutral-800">{siteConfig.name} team</span>
              </span>
              <time dateTime={post.published}>
                {dateFormat.format(new Date(`${post.published}T00:00:00`))}
              </time>
              <span className="flex items-center gap-1.5">
                <Clock className="size-4" aria-hidden />
                {post.readMinutes} min read
              </span>
            </div>
          </header>

          <div className="mx-auto mt-10 max-w-6xl animate-fade-up [animation-delay:300ms] sm:mt-14">
            <PostCover post={post} size="hero" />
          </div>

          <div className="mx-auto mt-12 grid max-w-6xl gap-12 lg:mt-16 lg:grid-cols-[minmax(0,1fr)_17rem] xl:gap-20">
            <div className="mx-auto w-full max-w-[44rem]">
              <MobileContents toc={post.toc} />
              <div className="mt-8 lg:mt-0">
                <Suspense fallback={<ArticleSkeleton />}>
                  <Body />
                  <ScrollToHash />
                </Suspense>
              </div>
              <div className="mt-14 flex flex-col gap-4 border-t border-black/10 pt-8 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm font-medium text-neutral-800">Found this useful? Share it.</p>
                <ShareBar title={post.title} />
              </div>
            </div>

            <aside className="hidden lg:block">
              <div className="sticky top-28 space-y-6">
                <TableOfContents toc={post.toc} />
                <div className="rounded-3xl border border-white/80 bg-white/70 p-5 shadow-[0_24px_60px_-32px_rgba(0,0,0,0.25)]">
                  <p className="font-serif text-2xl leading-tight">
                    Want us to check your numbers?
                  </p>
                  <p className="mt-2 text-sm text-neutral-500">Free 30-minute call.</p>
                  <Link to={siteConfig.bookingHref} className={`${buttonStyles()} mt-4 w-full`}>
                    Book a call
                    <ArrowRight
                      className="size-4 transition-transform group-hover:translate-x-0.5"
                      aria-hidden
                    />
                  </Link>
                  <RiskNote className="mt-3 items-start text-xs sm:text-xs" />
                </div>
                <ShareBar title={post.title} />
              </div>
            </aside>
          </div>
        </Container>
      </article>
      <RelatedPosts post={post} />
    </>
  );
}

/** Shown for the split second while the article text loads. */
function ArticleSkeleton() {
  return (
    <div className="animate-pulse space-y-4" aria-label="Loading article">
      <div className="h-8 w-4/5 rounded-xl bg-black/5" />
      <div className="h-4 rounded bg-black/5" />
      <div className="h-4 rounded bg-black/5" />
      <div className="h-4 w-2/3 rounded bg-black/5" />
      <div className="mt-8 h-64 rounded-[28px] bg-black/5" />
    </div>
  );
}

/**
 * Links like /blog/post#fix point at a chapter that only exists once the article has loaded,
 * so the browser cannot jump there itself. This renders with the article and jumps then.
 */
function ScrollToHash() {
  useEffect(() => {
    const id = decodeURIComponent(window.location.hash.slice(1));
    if (id) document.getElementById(id)?.scrollIntoView({ behavior: 'instant' });
  }, []);
  return null;
}

/** Three more posts to read next: same topic first, then the newest others. */
function RelatedPosts({ post }: { post: BlogPost }) {
  const sameTopic = posts.filter((p) => p.slug !== post.slug && p.category === post.category);
  const others = posts.filter((p) => p.slug !== post.slug && p.category !== post.category);
  const picks = [...sameTopic, ...others].slice(0, 3);

  return (
    <section aria-labelledby="keep-reading" className="pb-8">
      <Container>
        <div className="mx-auto max-w-6xl border-t border-black/10 pt-12">
          <h2 id="keep-reading" className="font-serif text-4xl leading-none sm:text-5xl">
            Keep <em>reading</em>
          </h2>
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {picks.map((p) => (
              <Link
                key={p.slug}
                to={`/blog/${p.slug}`}
                onPointerEnter={() => void p.preload()}
                onFocus={() => void p.preload()}
                className="group flex flex-col rounded-[28px] border border-white/80 bg-white/70 p-2.5 shadow-[0_24px_60px_-36px_rgba(0,0,0,0.3)] transition hover:-translate-y-1 hover:bg-white"
              >
                <PostCover post={p} />
                <div className="p-4">
                  <h3 className="font-serif text-2xl leading-[1.08] text-balance">{p.title}</h3>
                  <p className="mt-3 text-xs text-neutral-500">{p.readMinutes} min read</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}
