import { z } from 'zod';

// Generate Email Schema
export const generateEmailSchema = z.object({
  customPrefix: z
    .string()
    .min(3, 'Custom prefix must be at least 3 characters')
    .max(20, 'Custom prefix must be at most 20 characters')
    .regex(/^[a-z0-9-]+$/, 'Custom prefix can only contain lowercase letters, numbers, and hyphens')
    .optional(),
  domain: z.string().optional(),
});

export type GenerateEmailInput = z.infer<typeof generateEmailSchema>;

// Access Token Schema
export const accessTokenSchema = z.string().min(1, 'Access token is required');

// Email ID Schema
export const emailIdSchema = z.string().uuid('Invalid email ID');

// Inbox Query Schema
export const inboxQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(50).default(20),
  unreadOnly: z.coerce.boolean().default(false),
});

export type InboxQuery = z.infer<typeof inboxQuerySchema>;

// Mark as Read Schema
export const markAsReadSchema = z.object({
  accessToken: z.string().min(1, 'Access token is required'),
});

export type MarkAsReadInput = z.infer<typeof markAsReadSchema>;

// Extend Expiration Schema
export const extendExpirationSchema = z.object({
  hours: z.number().int().positive().max(24, 'Maximum extension is 24 hours'),
});

export type ExtendExpirationInput = z.infer<typeof extendExpirationSchema>;

// Email Address Validation
export const emailAddressSchema = z
  .string()
  .email('Invalid email address format');

// Attachment ID Schema
export const attachmentIdSchema = z.string().uuid('Invalid attachment ID');

// SMTP Email Parser Schema
export const smtpEmailSchema = z.object({
  from: z.object({
    address: z.string().email(),
    name: z.string(),
  }),
  to: z.array(z.string().email()),
  subject: z.string(),
  textBody: z.string(),
  htmlBody: z.string(),
  headers: z.record(z.any()),
  attachments: z
    .array(
      z.object({
        filename: z.string(),
        contentType: z.string(),
        content: z.instanceof(Buffer),
        size: z.number(),
      })
    )
    .optional()
    .default([]),
});

export type SMTPEmailInput = z.infer<typeof smtpEmailSchema>;
