export type FaqItem = { question: string; answer: string };

/** Structured data for a list of questions, so search and AI tools can quote the answers. */
export function faqJsonLd(items: FaqItem[]) {
  return {
    '@type': 'FAQPage',
    mainEntity: items.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: { '@type': 'Answer', text: item.answer },
    })),
  };
}
