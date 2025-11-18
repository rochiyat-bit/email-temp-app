import DOMPurify from 'isomorphic-dompurify';

/**
 * Sanitize HTML email content to prevent XSS attacks
 * Removes dangerous tags, scripts, and attributes
 */
export function sanitizeHtmlEmail(htmlContent: string): string {
  const config = {
    ALLOWED_TAGS: [
      'a', 'abbr', 'b', 'blockquote', 'br', 'caption', 'code', 'col',
      'colgroup', 'dd', 'div', 'dl', 'dt', 'em', 'figcaption', 'figure',
      'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'hr', 'i', 'img', 'li', 'ol',
      'p', 'pre', 'q', 's', 'small', 'span', 'strike', 'strong', 'sub',
      'sup', 'table', 'tbody', 'td', 'tfoot', 'th', 'thead', 'tr', 'u', 'ul',
    ],
    ALLOWED_ATTR: [
      'alt', 'border', 'cellpadding', 'cellspacing', 'class', 'color',
      'colspan', 'dir', 'height', 'href', 'id', 'lang', 'rowspan', 'src',
      'style', 'title', 'width',
    ],
    ALLOWED_URI_REGEXP: /^(?:(?:(?:f|ht)tps?|mailto|tel|callto|cid|xmpp|data):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i,
    ALLOW_DATA_ATTR: false,
    FORBID_TAGS: ['script', 'style', 'iframe', 'object', 'embed', 'link'],
    FORBID_ATTR: ['onerror', 'onload', 'onclick', 'onmouseover', 'onfocus'],
  };

  return DOMPurify.sanitize(htmlContent, config);
}

/**
 * Extract plain text preview from HTML
 * Returns first 150 characters without HTML tags
 */
export function extractTextPreview(htmlOrText: string, length: number = 150): string {
  // Remove HTML tags
  const text = htmlOrText.replace(/<[^>]*>/g, '');

  // Remove extra whitespace
  const cleaned = text.replace(/\s+/g, ' ').trim();

  // Truncate to specified length
  if (cleaned.length <= length) {
    return cleaned;
  }

  return cleaned.substring(0, length) + '...';
}

/**
 * Validate and sanitize filename for attachments
 * Prevents directory traversal and dangerous characters
 */
export function sanitizeFilename(filename: string): string {
  // Remove path components
  const baseName = filename.replace(/^.*[\\\/]/, '');

  // Remove dangerous characters
  const sanitized = baseName.replace(/[^a-zA-Z0-9._-]/g, '_');

  // Limit length
  const maxLength = 255;
  if (sanitized.length > maxLength) {
    const ext = sanitized.split('.').pop();
    const name = sanitized.substring(0, maxLength - (ext ? ext.length + 1 : 0));
    return ext ? `${name}.${ext}` : name;
  }

  return sanitized;
}

/**
 * Check if content type is safe for display/download
 */
export function isSafeContentType(contentType: string): boolean {
  const dangerousTypes = [
    'application/x-msdownload',
    'application/x-executable',
    'application/x-sh',
    'application/x-bat',
    'text/x-script',
  ];

  return !dangerousTypes.some(dangerous =>
    contentType.toLowerCase().includes(dangerous)
  );
}

/**
 * Get IP address from request
 * Handles proxies and Vercel deployment
 */
export function getClientIp(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const real = request.headers.get('x-real-ip');

  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }

  if (real) {
    return real;
  }

  return 'unknown';
}

/**
 * Get user agent from request
 */
export function getUserAgent(request: Request): string {
  return request.headers.get('user-agent') || 'unknown';
}
