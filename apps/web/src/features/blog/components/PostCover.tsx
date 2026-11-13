import { cn } from '@/lib/cn';
import type { BlogPost, CoverGlyph } from '../types';

type PostCoverProps = {
  post: Pick<BlogPost, 'cover' | 'category'>;
  size?: 'card' | 'hero';
  className?: string;
};

/** Generated cover art: a soft gradient with a small abstract chart, no photo needed. */
export function PostCover({ post, size = 'card', className }: PostCoverProps) {
  const hero = size === 'hero';
  return (
    <div
      className={cn(
        'relative isolate overflow-hidden bg-gradient-to-br',
        post.cover.tone,
        hero ? 'aspect-[16/9] rounded-[32px] sm:aspect-[21/9]' : 'aspect-[16/10] rounded-[22px]',
        className,
      )}
      aria-hidden
    >
      {/* Grain-free soft light blobs */}
      <div className="absolute -top-1/3 -left-1/4 -z-10 size-[80%] rounded-full bg-white/50 blur-3xl" />
      <div className="absolute -right-1/4 -bottom-1/2 -z-10 size-[70%] rounded-full bg-white/40 blur-3xl" />
      {/* Fine dot grid */}
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(rgb(0_0_0/0.09)_1px,transparent_1px)] [background-size:18px_18px] [mask-image:linear-gradient(to_bottom,#000,transparent)]" />

      <span
        className={cn(
          'absolute top-4 left-4 rounded-full border border-white/80 bg-white/70 px-3 py-1 font-medium text-neutral-800 backdrop-blur',
          hero ? 'text-xs sm:top-6 sm:left-6' : 'text-[11px]',
        )}
      >
        {post.category}
      </span>

      <div
        className={cn(
          'absolute inset-x-0 bottom-0 flex items-end justify-center',
          hero ? 'top-14 px-[12%] pb-0' : 'top-12 px-[14%]',
        )}
      >
        <Glyph glyph={post.cover.glyph} label={post.cover.label} hero={hero} />
      </div>
    </div>
  );
}

function Glyph({ glyph, label, hero }: { glyph: CoverGlyph; label: string; hero: boolean }) {
  const card =
    'rounded-t-2xl border border-b-0 border-white/90 bg-white/75 shadow-2xl shadow-black/10 backdrop-blur';
  if (glyph === 'split') {
    return (
      <div className={cn(card, 'flex h-[82%] w-full max-w-md items-end gap-[8%] px-[9%] pt-[6%]')}>
        <Bar h="100%" tone="bg-neutral-950" caption="Meta" hero={hero} />
        <Bar h="68%" tone="bg-neutral-950/25" caption="Store" hero={hero} />
        <div className="mb-auto ml-auto self-start text-right">
          <p className={cn('font-serif leading-none', hero ? 'text-5xl sm:text-7xl' : 'text-4xl')}>
            {label}
          </p>
          <p className={cn('mt-1 text-neutral-500', hero ? 'text-xs sm:text-sm' : 'text-[10px]')}>
            missing sales
          </p>
        </div>
      </div>
    );
  }
  const big = (
    <p
      className={cn(
        'absolute top-[8%] right-[7%] font-serif leading-none text-neutral-950',
        hero ? 'text-5xl sm:text-7xl' : 'text-4xl',
      )}
    >
      {label}
    </p>
  );
  if (glyph === 'line') {
    return (
      <div className={cn(card, 'relative h-[80%] w-full max-w-md px-[6%] pt-[18%]')}>
        {big}
        <svg viewBox="0 0 200 80" preserveAspectRatio="none" className="h-[80%] w-full">
          <path
            d="M0 70 C 30 66, 45 58, 70 52 S 110 40, 130 30 S 170 14, 200 6"
            fill="none"
            stroke="#0a0a0a"
            strokeWidth="3"
            vectorEffect="non-scaling-stroke"
          />
          <path
            d="M0 70 C 30 66, 45 58, 70 52 S 110 40, 130 30 S 170 14, 200 6 L200 80 L0 80 Z"
            fill="#0a0a0a"
            fillOpacity="0.07"
          />
        </svg>
      </div>
    );
  }
  if (glyph === 'funnel') {
    return (
      <div
        className={cn(
          card,
          'relative flex h-[80%] w-full max-w-md flex-col justify-end gap-[5%] px-[8%] pb-[7%]',
        )}
      >
        {big}
        {[100, 78, 58, 40].map((w, i) => (
          <span
            key={w}
            className={cn('h-[13%] rounded-full', i === 3 ? 'bg-emerald-500' : 'bg-neutral-950/80')}
            style={{ width: `${w}%` }}
          />
        ))}
      </div>
    );
  }
  if (glyph === 'grid') {
    return (
      <div className={cn(card, 'relative h-[80%] w-full max-w-md p-[6%] pt-[20%]')}>
        {big}
        <div className="grid h-full grid-cols-4 gap-[6%]">
          {Array.from({ length: 8 }).map((_, i) => (
            <span
              key={i}
              className={cn(
                'rounded-lg',
                i === 5
                  ? 'bg-emerald-500'
                  : i % 3 === 0
                    ? 'bg-neutral-950/80'
                    : 'bg-neutral-950/15',
              )}
            />
          ))}
        </div>
      </div>
    );
  }
  // 'bars': rising bars.
  return (
    <div
      className={cn(card, 'relative flex h-[80%] w-full max-w-md items-end gap-2 px-[8%] pt-[20%]')}
    >
      {big}
      {[35, 52, 44, 70, 62, 88, 100].map((h, i) => (
        <span
          key={i}
          className={cn('flex-1 rounded-t-md', i === 6 ? 'bg-emerald-500' : 'bg-neutral-950/80')}
          style={{ height: `${h}%` }}
        />
      ))}
    </div>
  );
}

function Bar({
  h,
  tone,
  caption,
  hero,
}: {
  h: string;
  tone: string;
  caption: string;
  hero: boolean;
}) {
  return (
    <div className="flex h-full w-[22%] flex-col justify-end">
      <span className={cn('w-full rounded-t-lg', tone)} style={{ height: h }} />
      <span
        className={cn(
          'border-t border-black/10 py-2 text-center text-neutral-500',
          hero ? 'text-xs sm:text-sm' : 'text-[10px]',
        )}
      >
        {caption}
      </span>
    </div>
  );
}
