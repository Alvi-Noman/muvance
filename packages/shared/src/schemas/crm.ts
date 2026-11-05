import { z } from 'zod';
import { isWebsite, WEBSITE_ERROR, withTaka } from './booking';

/* ------------------------------------------------------------------ */
/* Roles & permissions                                                 */
/* ------------------------------------------------------------------ */

export const roles = ['owner', 'admin', 'member', 'viewer'] as const;
export type Role = (typeof roles)[number];

export const permissions = [
  'leads:read',
  'leads:write',
  'leads:delete',
  'leads:export',
  'team:manage',
  'settings:manage',
] as const;
export type Permission = (typeof permissions)[number];

/** What each role may do. The API enforces this; the admin UI uses it to hide controls. */
export const rolePermissions: Record<Role, readonly Permission[]> = {
  owner: permissions,
  admin: permissions,
  member: ['leads:read', 'leads:write'],
  viewer: ['leads:read'],
};

export const roleLabels: Record<Role, string> = {
  owner: 'Owner',
  admin: 'Admin',
  member: 'Member',
  viewer: 'Viewer',
};

export const roleDescriptions: Record<Role, string> = {
  owner: 'Full access, including managing admins.',
  admin: 'Full access. Can manage members and viewers.',
  member: 'Can view and work leads. No deleting, exports or settings.',
  viewer: 'Read-only access to leads.',
};

export function can(role: Role, permission: Permission) {
  return rolePermissions[role].includes(permission);
}

/* ------------------------------------------------------------------ */
/* Pipeline                                                            */
/* ------------------------------------------------------------------ */

/**
 * The sales process: a discovery call, a team review, then a proposal meeting that ends in a
 * yes (won) or no (lost). There is no follow-up after a "no", so Lost is final.
 */
export const leadStages = [
  'discovery_booked',
  'discovery_done',
  'team_review',
  'proposal_booked',
  'won',
  'lost',
] as const;
export type LeadStage = (typeof leadStages)[number];

export const leadStageLabels: Record<LeadStage, string> = {
  discovery_booked: 'Discovery booked',
  discovery_done: 'Discovery done',
  team_review: 'Team review',
  proposal_booked: 'Proposal booked',
  won: 'Won',
  lost: 'Lost',
};

/** Stages still in progress (not decided yet). */
export const openStages: readonly LeadStage[] = [
  'discovery_booked',
  'discovery_done',
  'team_review',
  'proposal_booked',
];

export const lostReasons = [
  'declined_offer',
  'no_show',
  'not_pitched',
  'too_small',
  'not_a_fit',
  'other',
] as const;
export type LostReason = (typeof lostReasons)[number];

export const lostReasonLabels: Record<LostReason, string> = {
  declined_offer: 'Said no to the offer',
  no_show: "Didn't show up",
  not_pitched: 'Team decided not to pitch',
  too_small: 'Business too small',
  not_a_fit: 'Not a good fit',
  other: 'Other',
};

export const meetingTypes = ['discovery', 'proposal'] as const;
export type MeetingType = (typeof meetingTypes)[number];

export const meetingTypeLabels: Record<MeetingType, string> = {
  discovery: 'Discovery call',
  proposal: 'Proposal meeting',
};

export const meetingStatuses = ['scheduled', 'completed', 'no_show', 'cancelled'] as const;
export type MeetingStatus = (typeof meetingStatuses)[number];

export const meetingStatusLabels: Record<MeetingStatus, string> = {
  scheduled: 'Scheduled',
  completed: 'Completed',
  no_show: 'No-show',
  cancelled: 'Cancelled',
};

export const salesChannels = [
  'website',
  'facebook',
  'instagram',
  'marketplace',
  'whatsapp',
  'store',
  'other',
] as const;
export type SalesChannel = (typeof salesChannels)[number];

export const salesChannelLabels: Record<SalesChannel, string> = {
  website: 'Website',
  facebook: 'Facebook page',
  instagram: 'Instagram',
  marketplace: 'Daraz / marketplace',
  whatsapp: 'WhatsApp',
  store: 'Physical store',
  other: 'Other',
};

export const activityTypes = [
  'created',
  'note',
  'call',
  'stage_changed',
  'assigned',
  'updated',
  'meeting_booked',
  'meeting_updated',
] as const;
export type ActivityType = (typeof activityTypes)[number];

/* ------------------------------------------------------------------ */
/* Auth & team inputs                                                  */
/* ------------------------------------------------------------------ */

const password = z
  .string()
  .min(10, 'Use at least 10 characters')
  .max(200, 'That password is too long');

/** Letters, numbers, dots, dashes and underscores. Case is kept for display; sign-in ignores it. */
export const usernameSchema = z
  .string()
  .trim()
  .min(3, 'Use at least 3 characters')
  .max(30, 'Use at most 30 characters')
  .regex(/^[a-zA-Z0-9][a-zA-Z0-9._-]*$/, 'Use letters, numbers, dots, dashes or underscores');

/** Lower-cased form used for sign-in and the uniqueness check. */
export const usernameKey = (username: string) => username.trim().toLowerCase();

export const loginSchema = z.object({
  /** An email address or a username. */
  identifier: z
    .string()
    .trim()
    .min(1, 'Enter your email or username')
    .max(200)
    .transform((v) => v.toLowerCase()),
  password: z.string().min(1, 'Enter your password').max(200),
});

export const acceptInviteSchema = z.object({
  token: z.string().min(10),
  /** Required for new invites, ignored for password resets. */
  name: z.string().trim().min(1, 'Enter your name').max(100).optional(),
  password,
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Enter your current password'),
  newPassword: password,
});

export const updateProfileSchema = z.object({
  name: z.string().trim().min(1, 'Enter your name').max(100),
  /** null (or empty) removes the username; then you sign in with your email. */
  username: z.union([usernameSchema, z.literal('').transform(() => null), z.null()]).optional(),
});

export const inviteUserSchema = z.object({
  email: z.email('Enter a valid email').transform((e) => e.toLowerCase()),
  role: z.enum(roles),
});

/** An admin adds someone directly, with a starting password they must replace. */
export const createUserSchema = z.object({
  username: usernameSchema,
  email: z.email('Enter a valid email').transform((e) => e.toLowerCase()),
  password,
  role: z.enum(roles),
});

/** A phone's push token, saved by the Android app. */
export const deviceTokenSchema = z.object({ token: z.string().min(20).max(4096) });

export const updateUserSchema = z
  .object({
    role: z.enum(roles),
    status: z.enum(['active', 'disabled']),
  })
  .partial()
  .refine((v) => Object.keys(v).length > 0, 'Nothing to update');

/* ------------------------------------------------------------------ */
/* Leads, activities, meetings                                         */
/* ------------------------------------------------------------------ */

const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .optional()
    .transform((v) => (v ? v : undefined));

/** Optional for leads you add yourself, but must be a real web address when filled in. */
const website = z
  .string()
  .trim()
  .max(200)
  .refine((v) => !v || isWebsite(v), WEBSITE_ERROR);

const phone = z
  .string()
  .trim()
  .regex(/^\+?[\d\s\-().]{7,20}$/, 'Enter a valid phone number');
const money = z.number().nonnegative().max(1e13).nullable();

export const partnerStatuses = ['solo', 'partner'] as const;
export type PartnerStatus = (typeof partnerStatuses)[number];
export const partnerStatusLabels: Record<PartnerStatus, string> = {
  solo: 'Alone',
  partner: 'Has a partner',
};

/** Delivered sales per taka of ad spend, or null until both are known. */
export function calculateRoas(
  adSpend: number | null | undefined,
  delivered: number | null | undefined,
) {
  if (adSpend == null || delivered == null) return null;
  if (!Number.isFinite(adSpend) || !Number.isFinite(delivered) || adSpend <= 0 || delivered < 0) {
    return null;
  }
  return delivered / adSpend;
}

/** One product they sell, with what it costs them and what they sell it for (per unit, taka). */
export const productSchema = z.object({
  name: z.string().trim().max(120),
  purchasePrice: money,
  sellingPrice: money,
});

/** What you learn on the discovery call. Amounts are monthly, in taka. */
export const discoverySchema = z
  .object({
    businessType: z.string().trim().max(200),
    products: z.array(productSchema).max(30),
    /** What came up when discussing the products. */
    productNotes: z.string().trim().max(2000),
    monthlyRevenue: money,
    /** Where they want monthly revenue to be, and by when. */
    targetRevenue: money,
    targetMonths: z.union([z.literal(3), z.literal(6)]).nullable(),
    /** Who runs their ads now. */
    adsRunBy: z.string().trim().max(200),
    partnerStatus: z.enum(partnerStatuses).nullable(),
    /** Ad spend in the last 30 days. */
    monthlyAdSpend: money,
    /** Value of products delivered from that ad spend. ROAS is worked out from these two. */
    deliveredSales: money,
    /** How many parcels out of 10 get returned. */
    returnsPerTen: z.number().int().min(0).max(10).nullable(),
    /** Why they want an agency even though they're doing well. */
    whyAgency: z.string().trim().max(2000),
    averageOrderValue: money,
    channels: z.array(z.enum(salesChannels)).max(salesChannels.length),
    notes: z.string().trim().max(5000),
  })
  .partial();

/** What the team decides to offer. */
export const offerSchema = z
  .object({
    /** Monthly sales the client must reach before Muvance charges anything. */
    salesTarget: money,
    /** Muvance's share of sales, in percent. */
    commissionPercent: z.number().min(0).max(100).nullable(),
    /** Internal only; never shown to the client. */
    notes: z.string().trim().max(5000),
  })
  .partial();

export const createLeadSchema = z.object({
  name: z.string().trim().min(1, 'Enter a name').max(100),
  phone,
  businessName: optionalText(150),
  website: website.optional().transform((v) => (v ? v : undefined)),
  monthlySales: optionalText(100).transform((v) => (v ? withTaka(v) : undefined)),
  message: optionalText(2000),
  assigneeId: z.string().nullable().optional(),
  tags: z.array(z.string().trim().min(1).max(30)).max(20).default([]),
});

export const updateLeadSchema = z
  .object({
    name: z.string().trim().min(1).max(100),
    phone,
    businessName: z.string().trim().max(150),
    website,
    monthlySales: z.string().trim().max(100),
    message: z.string().trim().max(2000),
    stage: z.enum(leadStages),
    /** Required when moving a lead to Lost. */
    lostReason: z.enum(lostReasons),
    lostNote: z.string().trim().max(1000),
    assigneeId: z.string().nullable(),
    tags: z.array(z.string().trim().min(1).max(30)).max(20),
    discovery: discoverySchema,
    offer: offerSchema,
  })
  .partial()
  .refine((v) => Object.keys(v).length > 0, 'Nothing to update');

export const bulkUpdateLeadsSchema = z.object({
  ids: z.array(z.string()).min(1).max(500),
  stage: z.enum(leadStages).optional(),
  lostReason: z.enum(lostReasons).optional(),
  assigneeId: z.string().nullable().optional(),
});

export const leadSorts = [
  '-createdAt',
  'createdAt',
  '-lastActivityAt',
  'name',
  '-revenue',
] as const;

export const leadListQuerySchema = z.object({
  q: z.string().trim().max(100).optional(),
  stage: z.enum(leadStages).optional(),
  /** Leaves out Lost leads when no stage is chosen (the main Leads list). */
  excludeLost: z.enum(['true']).optional(),
  /** A user id, "me" or "unassigned". */
  assignee: z.string().max(50).optional(),
  tag: z.string().trim().max(30).optional(),
  sort: z.enum(leadSorts).default('-createdAt'),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(200).default(25),
});

/** You set the time yourself (it doesn't need to match the website's booking hours). */
export const scheduleMeetingSchema = z.object({
  type: z.enum(meetingTypes),
  startsAt: z.iso.datetime(),
  durationMinutes: z.number().int().min(15).max(180).default(30),
});

export const createActivitySchema = z.object({
  type: z.enum(['note', 'call']),
  body: z.string().trim().min(1, 'Write something first').max(5000),
});

export const updateMeetingSchema = z.object({
  status: z.enum(meetingStatuses),
});

export const meetingListQuerySchema = z.object({
  range: z.enum(['upcoming', 'past', 'all']).default('upcoming'),
  status: z.enum(meetingStatuses).optional(),
});

/* ------------------------------------------------------------------ */
/* Settings                                                            */
/* ------------------------------------------------------------------ */

export const availabilitySettingsSchema = z
  .object({
    /** 0 = Sunday … 6 = Saturday. */
    workingDays: z.array(z.number().int().min(0).max(6)).min(1, 'Pick at least one day'),
    /** Hour of the first and last call start, 0–23 (host time). */
    firstStartHour: z.number().int().min(0).max(23),
    lastStartHour: z.number().int().min(0).max(23),
    slotIntervalMinutes: z.union([z.literal(30), z.literal(60)]),
    durationMinutes: z.number().int().min(15).max(120),
    daysAhead: z.number().int().min(1).max(90),
    minNoticeHours: z.number().int().min(0).max(72),
  })
  .refine((v) => v.lastStartHour >= v.firstStartHour, {
    message: 'The last start must be after the first',
    path: ['lastStartHour'],
  });

/* ------------------------------------------------------------------ */
/* Inferred input types                                                */
/* ------------------------------------------------------------------ */

export type LoginInput = z.infer<typeof loginSchema>;
export type AcceptInviteInput = z.infer<typeof acceptInviteSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type InviteUserInput = z.infer<typeof inviteUserSchema>;
export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type CreateLeadInput = z.input<typeof createLeadSchema>;
export type UpdateLeadInput = z.infer<typeof updateLeadSchema>;
export type BulkUpdateLeadsInput = z.infer<typeof bulkUpdateLeadsSchema>;
/** Leads list filters as sent by the admin (all optional; the API fills defaults). */
export type LeadListQuery = Partial<z.output<typeof leadListQuerySchema>>;
export type CreateActivityInput = z.infer<typeof createActivitySchema>;
export type ScheduleMeetingInput = z.input<typeof scheduleMeetingSchema>;
export type DiscoveryInput = z.infer<typeof discoverySchema>;
export type OfferInput = z.infer<typeof offerSchema>;
export type AvailabilitySettings = z.infer<typeof availabilitySettingsSchema>;

/* ------------------------------------------------------------------ */
/* API response shapes                                                 */
/* ------------------------------------------------------------------ */

export type UserStatus = 'active' | 'disabled';

export interface UserDto {
  id: string;
  name: string;
  /** Accounts created with a username may have no email. */
  email: string | null;
  username: string | null;
  /** Still on the starting password an admin set: nothing else works until it's replaced. */
  mustChangePassword: boolean;
  role: Role;
  status: UserStatus;
  createdAt: string;
  lastLoginAt: string | null;
}

export interface MeDto extends UserDto {
  permissions: Permission[];
}

export interface InviteDto {
  id: string;
  email: string;
  role: Role;
  type: 'invite' | 'reset';
  expiresAt: string;
  createdAt: string;
  invitedBy: string | null;
}

export interface TeamDto {
  users: UserDto[];
  invites: InviteDto[];
}

export interface InviteLinkDto {
  url: string;
  expiresAt: string;
}

export interface InviteInfoDto {
  email: string;
  type: 'invite' | 'reset';
}

export interface UserRefDto {
  id: string;
  name: string;
}

export interface LeadDto {
  id: string;
  name: string;
  phone: string;
  businessName: string;
  website: string;
  monthlySales: string;
  message: string;
  stage: LeadStage;
  lostReason: LostReason | null;
  lostNote: string;
  tags: string[];
  assignee: UserRefDto | null;
  source: 'website' | 'manual';
  discovery: DiscoveryDto;
  offer: OfferDto;
  nextMeetingAt: string | null;
  nextMeetingType: MeetingType | null;
  /** When the discovery call was first marked done, the proposal first booked, and the decision. */
  discoveryDoneAt: string | null;
  proposalAt: string | null;
  decidedAt: string | null;
  createdAt: string;
  updatedAt: string;
  lastActivityAt: string;
}

export interface ProductDto {
  name: string;
  purchasePrice: number | null;
  sellingPrice: number | null;
}

export interface DiscoveryDto {
  businessType: string;
  products: ProductDto[];
  productNotes: string;
  monthlyRevenue: number | null;
  targetRevenue: number | null;
  targetMonths: 3 | 6 | null;
  adsRunBy: string;
  partnerStatus: PartnerStatus | null;
  monthlyAdSpend: number | null;
  deliveredSales: number | null;
  returnsPerTen: number | null;
  whyAgency: string;
  averageOrderValue: number | null;
  channels: SalesChannel[];
  notes: string;
}

export interface OfferDto {
  salesTarget: number | null;
  commissionPercent: number | null;
  notes: string;
}

export interface LeadListDto {
  items: LeadDto[];
  total: number;
  page: number;
  pageSize: number;
}

export interface ActivityDto {
  id: string;
  leadId: string;
  type: ActivityType;
  body: string;
  /** Extra details, e.g. { from: 'new', to: 'contacted' } for stage changes. */
  meta: Record<string, string | null>;
  actor: UserRefDto | null;
  createdAt: string;
}

export interface MeetingDto {
  id: string;
  leadId: string;
  lead: { name: string; phone: string; businessName: string; stage: LeadStage } | null;
  type: MeetingType;
  startsAt: string;
  endsAt: string;
  status: MeetingStatus;
  timeZone: string;
  createdAt: string;
}

export interface LeadDetailDto {
  lead: LeadDto;
  meetings: MeetingDto[];
  activities: ActivityDto[];
}

export interface DashboardDto {
  totals: {
    leads: number;
    newThisWeek: number;
    upcomingMeetings: number;
    /** Leads waiting on the team's decision. */
    inReview: number;
    clients: number;
    /** Share of discovery calls people actually attended (null until there's data). */
    showUpRate: number | null;
    /** Share of completed discoveries that reached a proposal meeting. */
    proposalRate: number | null;
    /** Share of decided proposals that said yes. */
    closeRate: number | null;
    /** Average commission agreed with won clients. */
    avgCommission: number | null;
  };
  byStage: Record<LeadStage, number>;
  lostReasons: Record<LostReason, number>;
  upcoming: MeetingDto[];
  recentActivity: (ActivityDto & { leadName: string })[];
}
