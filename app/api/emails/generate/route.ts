import { NextRequest } from 'next/server';
import { TemporaryEmail, EmailDomain } from '@/lib/db/models';
import {
  generateRandomEmail,
  generateAccessToken,
  generateDisplayName,
  validateCustomPrefix,
  calculateExpirationDate,
} from '@/lib/utils/email-generator';
import { generateEmailSchema } from '@/lib/validators/schemas';
import { emailGenerationLimiter, withRateLimit } from '@/lib/redis/rate-limit';
import { getClientIp, getUserAgent } from '@/lib/utils/sanitize';
import { errorResponse, successResponse } from '@/lib/utils/helpers';

export async function POST(request: NextRequest) {
  // Get client IP for rate limiting
  const clientIp = getClientIp(request);

  return withRateLimit(emailGenerationLimiter, clientIp, async () => {
    try {
      // Parse and validate request body
      const body = await request.json();
      const validation = generateEmailSchema.safeParse(body);

      if (!validation.success) {
        return errorResponse(
          'VALIDATION_ERROR',
          validation.error.errors[0].message,
          400
        );
      }

      const { customPrefix, domain: requestedDomain } = validation.data;

      // Validate custom prefix if provided
      if (customPrefix && !validateCustomPrefix(customPrefix)) {
        return errorResponse(
          'INVALID_PREFIX',
          'Custom prefix must be 3-20 characters and contain only lowercase letters, numbers, and hyphens',
          400
        );
      }

      // Get available domains
      const domains = await EmailDomain.findAll({
        where: { isActive: true },
      });

      if (domains.length === 0) {
        return errorResponse(
          'NO_DOMAINS_AVAILABLE',
          'No email domains are currently available',
          503
        );
      }

      // Select domain
      let selectedDomain = domains[0].domain;
      if (requestedDomain) {
        const domainExists = domains.find(d => d.domain === requestedDomain);
        if (domainExists) {
          selectedDomain = requestedDomain;
        }
      }

      // Generate email address
      let emailAddress: string;
      let attempts = 0;
      const maxAttempts = 10;

      // Try to generate unique email address
      while (attempts < maxAttempts) {
        emailAddress = generateRandomEmail(selectedDomain, customPrefix);

        // Check if email already exists
        const existing = await TemporaryEmail.findOne({
          where: { emailAddress },
        });

        if (!existing) {
          break;
        }

        attempts++;
      }

      if (attempts >= maxAttempts) {
        return errorResponse(
          'GENERATION_FAILED',
          'Failed to generate unique email address. Please try again.',
          500
        );
      }

      // Generate access token
      const accessToken = generateAccessToken();

      // Generate display name
      const displayName = generateDisplayName(emailAddress!);

      // Calculate expiration
      const hoursToExpire = parseInt(
        process.env.DEFAULT_EMAIL_EXPIRATION_HOURS || '1'
      );
      const expiresAt = calculateExpirationDate(hoursToExpire);

      // Get user agent
      const userAgent = getUserAgent(request);

      // Create temporary email record
      const tempEmail = await TemporaryEmail.create({
        emailAddress: emailAddress!,
        displayName,
        expiresAt,
        accessToken,
        ipAddress: clientIp,
        userAgent,
        isActive: true,
        totalEmailsReceived: 0,
      });

      // Build response
      const inboxUrl = `/inbox/${accessToken}`;

      return successResponse(
        {
          emailAddress: tempEmail.emailAddress,
          accessToken: tempEmail.accessToken,
          expiresAt: tempEmail.expiresAt.toISOString(),
          inboxUrl,
        },
        201
      );
    } catch (error) {
      console.error('Email generation error:', error);
      return errorResponse(
        'INTERNAL_ERROR',
        'An error occurred while generating email address',
        500
      );
    }
  });
}
