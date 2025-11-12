import { z } from 'zod';

export const SellerOnboardingSchema = z.object({
  name: z.string().min(2),
  shopName: z.string().min(2),
  email: z.string().email(),
  productCategory: z.string().optional(),
  productDescription: z.string().optional(),
  brandingAgreement: z.boolean().refine(v => v === true, 'Branding agreement required'),
});

export type SellerPayload = z.infer<typeof SellerOnboardingSchema>;
