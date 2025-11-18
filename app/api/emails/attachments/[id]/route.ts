import { NextRequest } from 'next/server';
import { EmailAttachment, ReceivedEmail, TemporaryEmail } from '@/lib/db/models';
import { attachmentDownloadLimiter, withRateLimit } from '@/lib/redis/rate-limit';
import { errorResponse, isValidUUID } from '@/lib/utils/helpers';
import { sanitizeFilename } from '@/lib/utils/sanitize';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const attachmentId = params.id;
  const accessToken = request.nextUrl.searchParams.get('accessToken');

  if (!accessToken) {
    return errorResponse('MISSING_TOKEN', 'Access token is required', 400);
  }

  if (!isValidUUID(attachmentId)) {
    return errorResponse('INVALID_ATTACHMENT_ID', 'Invalid attachment ID format', 400);
  }

  return withRateLimit(attachmentDownloadLimiter, accessToken, async () => {
    try {
      // Verify access token
      const tempEmail = await TemporaryEmail.findOne({
        where: {
          accessToken,
          isActive: true,
        },
      });

      if (!tempEmail) {
        return errorResponse('INVALID_TOKEN', 'Invalid or expired access token', 401);
      }

      // Find attachment with its email
      const attachment = await EmailAttachment.findOne({
        where: { id: attachmentId },
        include: [
          {
            model: ReceivedEmail,
            as: 'receivedEmail',
            where: {
              temporaryEmailId: tempEmail.id,
            },
          },
        ],
      });

      if (!attachment) {
        return errorResponse('ATTACHMENT_NOT_FOUND', 'Attachment not found', 404);
      }

      // Increment download count
      await attachment.update({
        downloadCount: attachment.downloadCount + 1,
      });

      // Sanitize filename
      const safeFilename = sanitizeFilename(attachment.filename);

      // Return file
      return new Response(attachment.content, {
        headers: {
          'Content-Type': attachment.contentType,
          'Content-Disposition': `attachment; filename="${safeFilename}"`,
          'Content-Length': attachment.size.toString(),
          'Cache-Control': 'private, max-age=300',
        },
      });
    } catch (error) {
      console.error('Attachment download error:', error);
      return errorResponse('INTERNAL_ERROR', 'Failed to download attachment', 500);
    }
  });
}
