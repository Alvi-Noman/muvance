import type { BlogPost } from '../types';
import { advantagePlusVsManual } from './advantage-plus-vs-manual';
import { cboVsAbo } from './cbo-vs-abo';
import { adSetsAndAdsCount } from './ad-sets-and-ads-count';
import { creativeEnhancements } from './creative-enhancements';
import { creativesPerWeek } from './creatives-per-week';
import { ugcStudioAi } from './ugc-studio-ai';
import { aiVsHumanCreatives } from './ai-vs-human-creatives';
import { banglaVsEnglishCopy } from './bangla-vs-english-copy';
import { eventMatchQuality } from './event-match-quality';
import { attributionSettings } from './attribution-settings';
import { merVsRoas } from './mer-vs-roas';
import { dailyBudgetNewBrand } from './daily-budget-new-brand';
import { goodRoasBangladesh } from './good-roas-bangladesh';
import { seasonalPerformanceBangladesh } from './seasonal-performance-bangladesh';
import { whatsappVsWebsiteAds } from './whatsapp-vs-website-ads';
import { optimiseDeliveredOrders } from './optimise-delivered-orders';
import { websiteVsFacebookPage } from './website-vs-facebook-page';
import { pageSpeedMobile } from './page-speed-mobile';
import { hiringAdsAgencyChecklist } from './hiring-ads-agency-checklist';
import { broadTargeting } from './broad-targeting';
import { capiSetup } from './capi-setup';
import { codFakeOrders } from './cod-fake-orders';
import { creativeTesting } from './creative-testing';
import { hookHoldRate } from './hook-hold-rate';
import { landingPageFixes } from './landing-page-fixes';
import { metaAndromeda } from './meta-andromeda';
import { metaVsStoreSales } from './meta-vs-store-sales';
import { performanceVsRetainer } from './performance-vs-retainer';
import { risingCpa } from './rising-cpa';
import { scaling } from './scaling';

/** Every published post, in the order shown on the blog page (first one is featured). */
export const posts: BlogPost[] = [
  metaAndromeda,
  metaVsStoreSales,
  creativeTesting,
  risingCpa,
  codFakeOrders,
  broadTargeting,
  capiSetup,
  hookHoldRate,
  scaling,
  landingPageFixes,
  performanceVsRetainer,
  advantagePlusVsManual,
  cboVsAbo,
  adSetsAndAdsCount,
  creativeEnhancements,
  creativesPerWeek,
  ugcStudioAi,
  aiVsHumanCreatives,
  banglaVsEnglishCopy,
  eventMatchQuality,
  attributionSettings,
  merVsRoas,
  dailyBudgetNewBrand,
  goodRoasBangladesh,
  seasonalPerformanceBangladesh,
  whatsappVsWebsiteAds,
  optimiseDeliveredOrders,
  websiteVsFacebookPage,
  pageSpeedMobile,
  hiringAdsAgencyChecklist,
];

export function findPost(slug: string | undefined) {
  return posts.find((p) => p.slug === slug);
}
