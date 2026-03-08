import { z } from 'zod';
import { SERVICE_CATEGORIES } from '../constants/categories.js';

export const ethereumAddressSchema = z
  .string()
  .regex(/^0x[a-fA-F0-9]{40}$/, 'Invalid Ethereum address');

export const didSchema = z
  .string()
  .regex(/^did:ethr:0x[a-fA-F0-9]+:0x[a-fA-F0-9]{40}$/, 'Invalid DID format');

export const transactionHashSchema = z
  .string()
  .regex(/^0x[a-fA-F0-9]{64}$/, 'Invalid transaction hash');

export const categorySchema = z.enum(SERVICE_CATEGORIES);

export const ratingSchema = z.number().int().min(1).max(5);

export const agentConfigSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  capabilities: z.array(categorySchema).optional(),
  network: z.enum(['base', 'base-sepolia']).optional(),
  creatorDID: didSchema.optional(),
});

export const walletConfigSchema = z.object({
  provider: z.string().min(1),
  privateKey: z.string().optional(),
  mnemonic: z.string().optional(),
  apiKey: z.string().optional(),
  network: z.string().optional(),
});

export const reviewInputSchema = z.object({
  transactionHash: transactionHashSchema,
  category: categorySchema,
  rating: ratingSchema,
  comment: z.string().max(1000).optional(),
});

export const searchFiltersSchema = z.object({
  capability: categorySchema.optional(),
  minRating: z.number().min(0).max(5).optional(),
  minLevel: z.number().int().min(0).max(3).optional(),
  name: z.string().optional(),
  active: z.boolean().optional(),
  limit: z.number().int().min(1).max(100).optional(),
  offset: z.number().int().min(0).optional(),
});

export const paymentRequestSchema = z.object({
  amount: z.string().min(1),
  currency: z.string().min(1),
  network: z.string().min(1),
  description: z.string().optional(),
  recipientDID: didSchema,
});
