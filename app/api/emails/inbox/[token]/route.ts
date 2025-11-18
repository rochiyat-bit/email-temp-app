import { NextRequest } from 'next/server';
import { TemporaryEmail, ReceivedEmail } from '@/lib/db/models';
import { inboxAccessLimiter, withRateLimit } from '@/lib/redis/rate-limit';
import { errorResponse, successResponse, parsePagination, createPaginationMeta } from '@/lib/utils/helpers';
import { isExpired } from '@/lib/utils/helpers';
import { extractTextPreview } from '@/lib/utils/sanitize';
import { Op } from 'sequelize';

export async function GET(
  request: NextRequest,
  { params }: { params: { token: string } }
) {
  const token = params.token;

  return withRateLimit(inboxAccessLimiter, token, async () => {
    try {
      // Find temporary email by access token
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

      // Check if expired
      if (isExpired(tempEmail.expiresAt)) {
        // Mark as inactive
        await tempEmail.update({ isActive: false });

        return errorResponse(
          'EMAIL_EXPIRED',
          'This email address has expired',
          410
        );
      }

      // Update last accessed time
      await tempEmail.update({ lastAccessedAt: new Date() });

      // Parse pagination
      const searchParams = request.nextUrl.searchParams;
      const { page, limit, offset } = parsePagination(searchParams);
      const unreadOnly = searchParams.get('unreadOnly') === 'true';

      // Build where clause
      const whereClause: any = {
        temporaryEmailId: tempEmail.id,
      };

      if (unreadOnly) {
        whereClause.isRead = false;
      }

      // Get emails with pagination
      const { count, rows: emails } = await ReceivedEmail.findAndCountAll({
        where: whereClause,
        order: [['receivedAt', 'DESC']],
        limit,
        offset,
        attributes: [
          'id',
          'fromAddress',
          'fromName',
          'subject',
          'textBody',
          'htmlBody',
          'receivedAt',
          'hasAttachments',
          'isRead',
        ],
      });

      // Format emails
      const formattedEmails = emails.map(email => ({
        id: email.id,
        from: {
          address: email.fromAddress,
          name: email.fromName,
        },
        subject: email.subject,
        preview: extractTextPreview(email.textBody || email.htmlBody, 100),
        receivedAt: email.receivedAt.toISOString(),
        hasAttachments: email.hasAttachments,
        isRead: email.isRead,
      }));

      return successResponse({
        temporaryEmail: {
          emailAddress: tempEmail.emailAddress,
          expiresAt: tempEmail.expiresAt.toISOString(),
          totalEmails: tempEmail.totalEmailsReceived,
        },
        emails: formattedEmails,
        pagination: createPaginationMeta(page, limit, count),
      });
    } catch (error) {
      console.error('Inbox fetch error:', error);
      return errorResponse(
        'INTERNAL_ERROR',
        'Failed to fetch inbox',
        500
      );
    }
  });
}

// DELETE endpoint to delete the temporary email
export async function DELETE(
  request: NextRequest,
  { params }: { params: { token: string } }
) {
  const token = params.token;

  try {
    // Find temporary email by access token
    const tempEmail = await TemporaryEmail.findOne({
      where: {
        accessToken: token,
      },
    });

    if (!tempEmail) {
      return errorResponse(
        'EMAIL_NOT_FOUND',
        'Inbox not found',
        404
      );
    }

    // Delete the temporary email (cascade will delete related emails)
    await tempEmail.destroy();

    return successResponse({
      message: 'Email address deleted successfully',
    });
  } catch (error) {
    console.error('Delete inbox error:', error);
    return errorResponse(
      'INTERNAL_ERROR',
      'Failed to delete inbox',
      500
    );
  }
}
