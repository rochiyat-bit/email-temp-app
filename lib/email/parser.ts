import { simpleParser, ParsedMail, AddressObject } from 'mailparser';
import { ParsedEmail } from '@/types';

/**
 * Parse raw email stream to structured format
 */
export async function parseEmail(emailStream: NodeJS.ReadableStream): Promise<ParsedEmail> {
  const parsed: ParsedMail = await simpleParser(emailStream);

  // Extract from address and name
  const from = extractAddress(parsed.from);

  // Extract to addresses
  const to = extractAddresses(parsed.to);

  // Get text and HTML bodies
  const textBody = parsed.text || '';
  const htmlBody = parsed.html || parsed.textAsHtml || '';

  // Parse attachments
  const attachments =
    parsed.attachments?.map(attachment => ({
      filename: attachment.filename || 'unnamed',
      contentType: attachment.contentType,
      content: attachment.content,
      size: attachment.size,
    })) || [];

  // Get all headers as object
  const headers: Record<string, any> = {};
  if (parsed.headers) {
    parsed.headers.forEach((value, key) => {
      headers[key] = value;
    });
  }

  return {
    from,
    to,
    subject: parsed.subject || '(No Subject)',
    textBody,
    htmlBody,
    headers,
    attachments,
  };
}

/**
 * Extract single email address from AddressObject
 */
function extractAddress(
  addressObj: AddressObject | AddressObject[] | undefined
): { address: string; name: string } {
  if (!addressObj) {
    return { address: 'unknown@example.com', name: 'Unknown' };
  }

  const addresses = Array.isArray(addressObj) ? addressObj : [addressObj];
  const first = addresses[0]?.value?.[0];

  if (!first) {
    return { address: 'unknown@example.com', name: 'Unknown' };
  }

  return {
    address: first.address || 'unknown@example.com',
    name: first.name || first.address || 'Unknown',
  };
}

/**
 * Extract multiple email addresses from AddressObject
 */
function extractAddresses(
  addressObj: AddressObject | AddressObject[] | undefined
): string[] {
  if (!addressObj) {
    return [];
  }

  const addresses = Array.isArray(addressObj) ? addressObj : [addressObj];
  const result: string[] = [];

  addresses.forEach(addr => {
    addr.value.forEach(item => {
      if (item.address) {
        result.push(item.address);
      }
    });
  });

  return result;
}

/**
 * Calculate email size in bytes
 */
export function calculateEmailSize(parsed: ParsedEmail): number {
  let size = 0;

  // Text body size
  size += Buffer.byteLength(parsed.textBody, 'utf8');

  // HTML body size
  size += Buffer.byteLength(parsed.htmlBody, 'utf8');

  // Attachments size
  parsed.attachments.forEach(attachment => {
    size += attachment.size;
  });

  // Headers size (approximate)
  size += Buffer.byteLength(JSON.stringify(parsed.headers), 'utf8');

  return size;
}

/**
 * Check if email size exceeds limit
 */
export function isEmailTooLarge(size: number, maxSize: number = 10 * 1024 * 1024): boolean {
  return size > maxSize; // Default 10MB
}

/**
 * Extract recipient email address from To field
 * Returns the temporary email address from the To field
 */
export function extractRecipientEmail(to: string[]): string | null {
  // Return the first recipient that matches our domain
  const domains = process.env.EMAIL_DOMAINS?.split(',') || [];

  for (const email of to) {
    for (const domain of domains) {
      if (email.endsWith(`@${domain.trim()}`)) {
        return email.toLowerCase();
      }
    }
  }

  return to[0] || null;
}
