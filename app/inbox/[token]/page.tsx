'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Mail,
  Clock,
  RefreshCw,
  Trash2,
  Copy,
  Check,
  ArrowLeft,
  Inbox,
  AlertCircle
} from 'lucide-react';
import { formatTimeAgo } from '@/lib/utils/helpers';

interface Email {
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

interface EmailDetail {
  id: string;
  from: {
    address: string;
    name: string;
  };
  subject: string;
  textBody: string;
  htmlBody: string;
  receivedAt: string;
  attachments: Array<{
    id: string;
    filename: string;
    contentType: string;
    size: number;
  }>;
}

interface InboxData {
  temporaryEmail: {
    emailAddress: string;
    expiresAt: string;
    totalEmails: number;
  };
  emails: Email[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    hasMore: boolean;
  };
}

export default function InboxPage() {
  const params = useParams();
  const router = useRouter();
  const token = params.token as string;

  const [inboxData, setInboxData] = useState<InboxData | null>(null);
  const [selectedEmail, setSelectedEmail] = useState<EmailDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [viewMode, setViewMode] = useState<'html' | 'text'>('html');

  useEffect(() => {
    fetchInbox();
    // Auto-refresh every 10 seconds
    const interval = setInterval(fetchInbox, 10000);
    return () => clearInterval(interval);
  }, [token]);

  const fetchInbox = async (showLoader = true) => {
    if (showLoader) setLoading(true);
    setRefreshing(true);
    setError('');

    try {
      const response = await fetch(`/api/emails/inbox/${token}`);
      const data = await response.json();

      if (!data.success) {
        setError(data.error?.message || 'Failed to fetch inbox');
        return;
      }

      setInboxData(data.data);
    } catch (error) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchEmailDetail = async (emailId: string) => {
    try {
      const response = await fetch(`/api/emails/${emailId}?accessToken=${token}`);
      const data = await response.json();

      if (!data.success) {
        setError(data.error?.message || 'Failed to fetch email');
        return;
      }

      setSelectedEmail(data.data);
    } catch (error) {
      setError('Failed to load email details');
    }
  };

  const deleteInbox = async () => {
    if (!confirm('Are you sure you want to delete this email address? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`/api/emails/inbox/${token}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        router.push('/');
      } else {
        setError('Failed to delete inbox');
      }
    } catch (error) {
      setError('Network error');
    }
  };

  const extendExpiration = async () => {
    try {
      const response = await fetch(`/api/emails/inbox/${token}/extend`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hours: 1 }),
      });

      const data = await response.json();

      if (data.success) {
        fetchInbox(false);
        alert('Email expiration extended by 1 hour');
      } else {
        alert(data.error?.message || 'Failed to extend expiration');
      }
    } catch (error) {
      alert('Network error');
    }
  };

  const copyEmail = async () => {
    if (inboxData?.temporaryEmail.emailAddress) {
      await navigator.clipboard.writeText(inboxData.temporaryEmail.emailAddress);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const getRemainingTime = () => {
    if (!inboxData?.temporaryEmail.expiresAt) return '';
    const now = new Date();
    const expiry = new Date(inboxData.temporaryEmail.expiresAt);
    const diff = expiry.getTime() - now.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);

    if (hours > 0) {
      return `${hours}h ${minutes % 60}m remaining`;
    }
    return `${minutes}m remaining`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Loading inbox...</p>
        </div>
      </div>
    );
  }

  if (error && !inboxData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <AlertCircle className="h-5 w-5" />
              Error
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4">{error}</p>
            <Button onClick={() => router.push('/')} className="w-full">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Go Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => router.push('/')}
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Button>

          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Mail className="h-5 w-5" />
                    <h2 className="text-xl font-semibold">Your Temporary Email</h2>
                  </div>
                  <div className="flex items-center gap-2">
                    <code className="text-lg bg-muted px-3 py-1 rounded">
                      {inboxData?.temporaryEmail.emailAddress}
                    </code>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={copyEmail}
                    >
                      {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    </Button>
                  </div>
                  <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {getRemainingTime()}
                    </span>
                    <span>{inboxData?.temporaryEmail.totalEmails} emails</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => fetchInbox(false)}
                    disabled={refreshing}
                  >
                    <RefreshCw className={`mr-2 h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
                    Refresh
                  </Button>
                  <Button variant="outline" onClick={extendExpiration}>
                    <Clock className="mr-2 h-4 w-4" />
                    Extend
                  </Button>
                  <Button variant="destructive" onClick={deleteInbox}>
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Email List and Viewer */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Email List */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Inbox className="h-5 w-5" />
                Inbox ({inboxData?.emails.length || 0})
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {inboxData?.emails.length === 0 ? (
                <div className="text-center py-12 px-4">
                  <Mail className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">No emails yet</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Emails will appear here when received
                  </p>
                </div>
              ) : (
                <div className="divide-y">
                  {inboxData?.emails.map((email) => (
                    <div
                      key={email.id}
                      onClick={() => fetchEmailDetail(email.id)}
                      className={`p-4 cursor-pointer hover:bg-accent transition-colors ${
                        !email.isRead ? 'bg-blue-50 dark:bg-blue-950/20' : ''
                      } ${
                        selectedEmail?.id === email.id ? 'bg-accent' : ''
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <div className="font-medium truncate">
                          {email.from.name}
                        </div>
                        <div className="text-xs text-muted-foreground shrink-0">
                          {formatTimeAgo(new Date(email.receivedAt))}
                        </div>
                      </div>
                      <div className="text-sm font-medium truncate mb-1">
                        {email.subject}
                      </div>
                      <div className="text-sm text-muted-foreground truncate">
                        {email.preview}
                      </div>
                      {!email.isRead && (
                        <div className="text-xs text-blue-600 font-medium mt-1">
                          Unread
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Email Viewer */}
          <Card className="lg:col-span-2">
            <CardHeader>
              {selectedEmail ? (
                <div>
                  <CardTitle className="text-xl mb-2">{selectedEmail.subject}</CardTitle>
                  <div className="text-sm text-muted-foreground space-y-1">
                    <div>
                      <span className="font-medium">From:</span> {selectedEmail.from.name} ({selectedEmail.from.address})
                    </div>
                    <div>
                      <span className="font-medium">Date:</span> {formatTimeAgo(new Date(selectedEmail.receivedAt))}
                    </div>
                  </div>
                  <div className="flex gap-2 mt-4">
                    <Button
                      variant={viewMode === 'html' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setViewMode('html')}
                    >
                      HTML
                    </Button>
                    <Button
                      variant={viewMode === 'text' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setViewMode('text')}
                    >
                      Plain Text
                    </Button>
                  </div>
                </div>
              ) : (
                <CardTitle>Select an email to view</CardTitle>
              )}
            </CardHeader>
            <CardContent>
              {selectedEmail ? (
                <div>
                  {viewMode === 'html' ? (
                    <div
                      className="prose dark:prose-invert max-w-none"
                      dangerouslySetInnerHTML={{ __html: selectedEmail.htmlBody }}
                    />
                  ) : (
                    <pre className="whitespace-pre-wrap font-sans text-sm">
                      {selectedEmail.textBody}
                    </pre>
                  )}

                  {selectedEmail.attachments.length > 0 && (
                    <div className="mt-6 pt-6 border-t">
                      <h4 className="font-medium mb-3">Attachments ({selectedEmail.attachments.length})</h4>
                      <div className="space-y-2">
                        {selectedEmail.attachments.map((att) => (
                          <div key={att.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                            <div>
                              <div className="font-medium">{att.filename}</div>
                              <div className="text-sm text-muted-foreground">
                                {(att.size / 1024).toFixed(2)} KB
                              </div>
                            </div>
                            <Button size="sm" variant="outline">
                              Download
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <Mail className="h-16 w-16 mx-auto mb-4 opacity-50" />
                  <p>Select an email from the list to view its contents</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
