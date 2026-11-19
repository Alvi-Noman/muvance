// Public API of the feature: import from '@/features/company', not from its internals.
export { PageHero } from './components/PageHero';
export { Faq } from './components/Faq';
export { faqJsonLd, type FaqItem } from './components/faq-json-ld';
export { ServiceVisual } from './components/ServiceVisual';
export { ApplicationForm, type FieldErrors } from './components/ApplicationForm';
export { TextField, TextAreaField, ChoiceField } from './components/form-fields';
export { serviceFields, operationsItems, howSteps } from './content/services';
export { industries, findIndustry, type Industry } from './content/industries';
