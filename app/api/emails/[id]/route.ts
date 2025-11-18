import { NextRequest } from 'next/server';
import { ReceivedEmail, TemporaryEmail, EmailAttachment } from '@/lib/db/models';
import { emailViewLimiter, withRateLimit } from '@/lib/redis/rate-limit';
import { errorResponse, successResponse, isValidUUID } from '@/lib/utils/helpers';
import { sanitizeHtmlEmail } from '@/lib/utils/sanitize';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const emailId = params.id;
  const accessToken = request.nextUrl.searchParams.get('accessToken');

  if (!accessToken) {
    return errorResponse(
      'MISSING_TOKEN',
      'Access token is required',
      400
    );
  }

  if (!isValidUUID(emailId)) {
    return errorResponse(
      'INVALID_EMAIL_ID',
      'Invalid email ID format',
      400
    );
  }

  return withRateLimit(emailViewLimiter, accessToken, async () => {
    try {
      // Verify access token
      const tempEmail = await TemporaryEmail.findOne({
        where: {
          accessToken,
          isActive: true,
        },
      });

      if (!tempEmail) {
        return errorResponse(
          'INVALID_TOKEN',
          'Invalid or expired access token',
          401
        );
      }

      // Find email
      const email = await ReceivedEmail.findOne({
        where: {
          id: emailId,
          temporaryEmailId: tempEmail.id,
        },
        include: [
          {
            model: EmailAttachment,
            as: 'attachments',
            attributes: ['id', 'filename', 'contentType', 'size'],
          },
        ],
      });

      if (!email) {
        return errorResponse(
          'EMAIL_NOT_FOUND',
          'Email not found',
          404
        );
      }

      // Mark as read if not already
      if (!email.isRead) {
        await email.update({ isRead: true });
      }

      // Sanitize HTML body
      const sanitizedHtml = sanitizeHtmlEmail(email.htmlBody);

      // Format attachments
      const attachments = (email as any).attachments?.map((att: any) => ({
        id: att.id,
        filename: att.filename,
        contentType: att.contentType,
        size: att.size,
      })) || [];

      return successResponse({
        id: email.id,
        from: {
          address: email.fromAddress,
          name: email.fromName,
        },
        subject: email.subject,
        textBody: email.textBody,
        htmlBody: sanitizedHtml,
        receivedAt: email.receivedAt.toISOString(),
        attachments,
        headers: email.headers,
      });
    } catch (error) {
      console.error('Email view error:', error);
      return errorResponse(
        'INTERNAL_ERROR',
        'Failed to fetch email',
        500
      );
    }
  });
}
