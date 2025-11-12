// HOTMESS ADD: Zod schemas for marketplace domain
import { z } from 'zod';

export const PartnerSchema = z.object({
  id: z.string().uuid().optional(), // db assigned
  slug: z.string().min(1).regex(/^[a-z0-9-]+$/),
  name: z.string().min(2),
  logo_url: z.string().url().nullable().optional(),
  categories: z.array(z.string().min(1)).default([]),
  created_at: z.string().datetime().optional(),
  updated_at: z.string().datetime().optional(),
});

export type Partner = z.infer<typeof PartnerSchema>;

export const OfferSchema = z.object({
  id: z.string().uuid().optional(),
  partner_id: z.string().uuid(),
  code: z.string().min(2),
  title: z.string().min(2),
  description: z.string().min(4),
  url: z.string().url(),
  price_from: z.number().positive().optional(),
  active: z.boolean().default(true),
  starts_at: z.string().datetime().optional(),
  ends_at: z.string().datetime().optional(),
  created_at: z.string().datetime().optional(),
});
export type Offer = z.infer<typeof OfferSchema>;

export const ClickSchema = z.object({
  id: z.string().uuid().optional(),
  offer_id: z.string().uuid(),
  partner_id: z.string().uuid(),
  user_id: z.string().uuid().nullable().optional(),
  hmac_valid: z.boolean().default(false),
  ts: z.string().datetime().optional(),
});
export type Click = z.infer<typeof ClickSchema>;

export const ConversionSchema = z.object({
  id: z.string().uuid().optional(),
  click_id: z.string().uuid(),
  offer_id: z.string().uuid(),
  partner_id: z.string().uuid(),
  amount: z.number().nonnegative().optional(),
  currency: z.string().length(3).optional(),
  ts: z.string().datetime().optional(),
});
export type Conversion = z.infer<typeof ConversionSchema>;

// Query schemas
export const PartnerSlugSchema = z.object({ slug: z.string().min(1) });
export const OfferListQuerySchema = z.object({ partner: z.string().uuid().optional() });
