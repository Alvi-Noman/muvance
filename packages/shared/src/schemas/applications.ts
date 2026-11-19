import { z } from 'zod';
import { isWebsite, WEBSITE_ERROR, withTaka } from './booking';
import { metaEventIdSchema } from './tracking';

/**
 * Applications sent from the website's own forms (not bookings): businesses asking Muvance to
 * invest in them, and people who want to join the training program.
 */
export const applicationTypes = ['investment', 'training'] as const;
export type ApplicationType = (typeof applicationTypes)[number];

export const applicationTypeLabels: Record<ApplicationType, string> = {
  investment: 'Investment',
  training: 'Training',
};

export const applicationStatuses = ['new', 'contacted', 'closed'] as const;
export type ApplicationStatus = (typeof applicationStatuses)[number];

export const applicationStatusLabels: Record<ApplicationStatus, string> = {
  new: 'New',
  contacted: 'Contacted',
  closed: 'Closed',
};

const name = z.string().trim().min(1, 'Please enter your name').max(100);
const phone = z
  .string()
  .trim()
  .regex(/^\+?[\d\s\-().]{7,20}$/, 'Please enter a valid phone number');
const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .optional()
    .transform((v) => v || undefined);

/** Sent alongside either form: links the application to the visitor's recorded visit. */
const tracking = {
  visitorId: z.uuid().optional(),
  recordingId: z.uuid().optional(),
  eventId: metaEventIdSchema.optional(),
};

export const investmentNeeds = ['inventory', 'ads', 'operations', 'team'] as const;
export type InvestmentNeed = (typeof investmentNeeds)[number];
export const investmentNeedLabels: Record<InvestmentNeed, string> = {
  inventory: 'Stock and production',
  ads: 'Ad spend',
  operations: 'Operations (warehouse, call centre, delivery)',
  team: 'Brand, creative and team',
};

export const investmentApplicationSchema = z.object({
  type: z.literal('investment'),
  name,
  phone,
  businessName: z.string().trim().min(1, 'Please enter your business name').max(150),
  website: z
    .string()
    .trim()
    .min(1, 'Please enter your website or page')
    .max(200)
    .refine(isWebsite, WEBSITE_ERROR),
  category: z.string().trim().min(1, 'What kind of product is it?').max(100),
  product: z
    .string()
    .trim()
    .min(20, 'Tell us a little more (at least a sentence or two)')
    .max(2000),
  monthlySales: z
    .string()
    .trim()
    .min(1, 'Please enter your average monthly sales (0 is fine)')
    .max(100)
    .transform(withTaka),
  sellingSince: z.string().trim().min(1, 'When did you start selling?').max(60),
  needs: z.array(z.enum(investmentNeeds)).min(1, 'Pick at least one'),
  message: optionalText(2000),
  ...tracking,
});

export const trainingRoles = ['owner', 'media-buyer', 'marketer', 'student'] as const;
export type TrainingRole = (typeof trainingRoles)[number];
export const trainingRoleLabels: Record<TrainingRole, string> = {
  owner: 'I run my own business',
  'media-buyer': 'I run ads for clients',
  marketer: 'I work in a marketing team',
  student: "I'm starting out",
};

export const trainingLevels = ['none', 'some', 'regular'] as const;
export type TrainingLevel = (typeof trainingLevels)[number];
export const trainingLevelLabels: Record<TrainingLevel, string> = {
  none: 'Never run an ad',
  some: 'Boosted posts or a few campaigns',
  regular: 'Run campaigns every week',
};

export const trainingApplicationSchema = z.object({
  type: z.literal('training'),
  name,
  phone,
  role: z.enum(trainingRoles, 'Pick the one closest to you'),
  level: z.enum(trainingLevels, 'Pick your experience'),
  goal: optionalText(1000),
  ...tracking,
});

export const applicationInputSchema = z.discriminatedUnion('type', [
  investmentApplicationSchema,
  trainingApplicationSchema,
]);
export type ApplicationInput = z.input<typeof applicationInputSchema>;
export type Application = z.output<typeof applicationInputSchema>;
export type InvestmentApplicationInput = z.input<typeof investmentApplicationSchema>;
export type TrainingApplicationInput = z.input<typeof trainingApplicationSchema>;

export const applicationStatusSchema = z.object({ status: z.enum(applicationStatuses) });

/** One application as the admin sees it: the form's answers already turned into labels. */
export interface ApplicationDto {
  id: string;
  type: ApplicationType;
  status: ApplicationStatus;
  name: string;
  phone: string;
  /** Answers in form order, e.g. { label: 'Monthly sales', value: '5 lac Taka' }. */
  details: { label: string; value: string; href?: string }[];
  recordingId: string | null;
  createdAt: string;
  updatedAt: string;
}

/** Readable answers for the admin, in the order the form asks them. */
export function applicationDetails(app: Application): ApplicationDto['details'] {
  if (app.type === 'investment') {
    return [
      { label: 'Business', value: app.businessName },
      { label: 'Website', value: app.website, href: app.website },
      { label: 'Category', value: app.category },
      { label: 'Selling since', value: app.sellingSince },
      { label: 'Monthly sales', value: app.monthlySales },
      { label: 'Needs help with', value: app.needs.map((n) => investmentNeedLabels[n]).join(', ') },
      { label: 'The product', value: app.product },
      ...(app.message ? [{ label: 'Anything else', value: app.message }] : []),
    ];
  }
  return [
    { label: 'Who they are', value: trainingRoleLabels[app.role] },
    { label: 'Experience', value: trainingLevelLabels[app.level] },
    ...(app.goal ? [{ label: 'What they want to learn', value: app.goal }] : []),
  ];
}
