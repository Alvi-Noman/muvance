import { useEffect } from 'react';
import {
  CtaSection,
  FaqSection,
  Hero,
  ProblemSection,
  ProcessSection,
  PromiseSection,
  ServicesSection,
} from '@/features/landing';

export function HomePage() {
  // The page renders after the browser's own hash jump, so links like /#book-form
  // (e.g. from ads or emails) would otherwise open at the top. Scroll there once mounted.
  useEffect(() => {
    const id = decodeURIComponent(window.location.hash.slice(1));
    // Jump instantly: a smooth scroll from the top of a long page feels slow on load.
    if (id) document.getElementById(id)?.scrollIntoView({ behavior: 'instant' });
  }, []);

  return (
    <>
      <Hero />
      <ProblemSection />
      <PromiseSection />
      <ServicesSection />
      <ProcessSection />
      <FaqSection />
      <CtaSection />
    </>
  );
}
