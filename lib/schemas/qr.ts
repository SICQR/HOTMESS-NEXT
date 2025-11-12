import { z } from 'zod';

export const QRScanSchema = z.object({
  qrCode: z.string().min(1, 'QR code is required'),
  userId: z.string().min(1).optional(),
});

export type QRScanPayload = z.infer<typeof QRScanSchema>;
