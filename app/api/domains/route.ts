import { EmailDomain } from '@/lib/db/models';
import { successResponse, errorResponse } from '@/lib/utils/helpers';
import { getCached, CacheKeys, CacheTTL } from '@/lib/redis/client';

export async function GET() {
  try {
    // Try to get from cache first
    const domains = await getCached(
      CacheKeys.domains(),
      async () => {
        return await EmailDomain.findAll({
          where: { isActive: true },
          attributes: ['domain', 'isActive', 'description'],
          order: [['createdAt', 'ASC']],
        });
      },
      CacheTTL.DOMAINS
    );

    const formattedDomains = domains.map(d => ({
      domain: typeof d === 'string' ? d : (d as any).domain,
      isActive: typeof d === 'string' ? true : (d as any).isActive,
    }));

    return successResponse(formattedDomains);
  } catch (error) {
    console.error('Error fetching domains:', error);
    return errorResponse('INTERNAL_ERROR', 'Failed to fetch email domains', 500);
  }
}
