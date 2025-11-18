// Database Model Types
export interface TemporaryEmail {
  id: string;
  emailAddress: string;
  displayName: string;
  createdAt: Date;
  expiresAt: Date;
  lastAccessedAt: Date;
  isActive: boolean;
  accessToken: string;
  ipAddress: string;
  userAgent: string;
  totalEmailsReceived: number;
}

export interface ReceivedEmail {
  id: string;
  temporaryEmailId: string;
  fromAddress: string;
  fromName: string;
  subject: string;
  textBody: string;
  htmlBody: string;
  receivedAt: Date;
  hasAttachments: boolean;
  isRead: boolean;
  size: number;
  headers: Record<string, any>;
  spamScore: number;
}

export interface EmailAttachment {
  id: string;
  receivedEmailId: string;
  filename: string;
  contentType: string;
  size: number;
  content: Buffer;
  downloadCount: number;
  createdAt: Date;
}

export interface EmailDomain {
  id: string;
  domain: string;
  isActive: boolean;
  maxEmailsPerDay: number;
  description: string;
  createdAt: Date;
}

// API Request/Response Types
export interface GenerateEmailRequest {
  customPrefix?: string;
  domain?: string;
}

export interface GenerateEmailResponse {
  success: boolean;
  data?: {
    emailAddress: string;
    accessToken: string;
    expiresAt: string;
    inboxUrl: string;
  };
  error?: ApiError;
}

export interface InboxResponse {
  success: boolean;
  data?: {
    temporaryEmail: {
      emailAddress: string;
      expiresAt: string;
      totalEmails: number;
    };
    emails: EmailPreview[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      hasMore: boolean;
    };
  };
  error?: ApiError;
}

export interface EmailPreview {
  id: string;
  from: {
    address: string;
    name: string;
  };
  subject: string;
  preview: string;
  receivedAt: string;
  hasAttachments: boolean;
  isRead: boolean;
}

export interface EmailDetailResponse {
  success: boolean;
  data?: {
    id: string;
    from: {
      address: string;
      name: string;
    };
    subject: string;
    textBody: string;
    htmlBody: string;
    receivedAt: string;
    attachments: AttachmentInfo[];
    headers: Record<string, any>;
  };
  error?: ApiError;
}

export interface AttachmentInfo {
  id: string;
  filename: string;
  contentType: string;
  size: number;
}

export interface ApiError {
  code: string;
  message: string;
  retryAfter?: number;
}

// SSE Event Types
export type SSEEventType =
  | 'email:received'
  | 'email:updated'
  | 'inbox:expiring'
  | 'inbox:expired';

export interface SSEEvent {
  type: SSEEventType;
  data: any;
}

// Utility Types
export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
}

export interface ParsedEmail {
  from: {
    address: string;
    name: string;
  };
  to: string[];
  subject: string;
  textBody: string;
  htmlBody: string;
  headers: Record<string, any>;
  attachments: {
    filename: string;
    contentType: string;
    content: Buffer;
    size: number;
  }[];
}
