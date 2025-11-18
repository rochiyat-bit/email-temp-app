import { NextRequest } from 'next/server';
import { TemporaryEmail } from '@/lib/db/models';
import { extensionLimiter, withRateLimit } from '@/lib/redis/rate-limit';
import { errorResponse, successResponse } from '@/lib/utils/helpers';
import { extendExpirationSchema } from '@/lib/validators/schemas';

export async function POST(
  request: NextRequest,
  { params }: { params: { token: string } }
) {
  const token = params.token;

  return withRateLimit(extensionLimiter, token, async () => {
    try {
      // Parse request body
      const body = await request.json();
      const validation = extendExpirationSchema.safeParse(body);

      if (!validation.success) {
        return errorResponse(
          'VALIDATION_ERROR',
          validation.error.errors[0].message,
          400
        );
      }

      const { hours } = validation.data;

      // Find temporary email
      const tempEmail = await TemporaryEmail.findOne({
        where: {
          accessToken: token,
          isActive: true,
        },
      });

      if (!tempEmail) {
        return errorResponse(
          'EMAIL_NOT_FOUND',
          'Inbox not found or has been deleted',
          404
        );
      }

      // Check if already expired
      if (new Date() >= tempEmail.expiresAt) {
        return errorResponse(
          'EMAIL_EXPIRED',
          'Cannot extend an expired email address',
          400
        );
      }

      // Calculate new expiration
      const currentExpiry = tempEmail.expiresAt;
      const newExpiry = new Date(currentExpiry.getTime() + hours * 60 * 60 * 1000);

      // Check max extension limit
      const maxHours = parseInt(process.env.MAX_EMAIL_EXTENSION_HOURS || '24');
      const maxExpiry = new Date(
        tempEmail.createdAt.getTime() + maxHours * 60 * 60 * 1000
      );

      if (newExpiry > maxExpiry) {
        return errorResponse(
          'EXTENSION_LIMIT_EXCEEDED',
          `Cannot extend beyond ${maxHours} hours from creation`,
          400
        );
      }

      // Update expiration
      await tempEmail.update({ expiresAt: newExpiry });

      return successResponse({
        expiresAt: newExpiry.toISOString(),
        message: `Email expiration extended by ${hours} hour(s)`,
      });
    } catch (error) {
      console.error('Extension error:', error);
      return errorResponse(
        'INTERNAL_ERROR',
        'Failed to extend email expiration',
        500
      );
    }
  });
}
