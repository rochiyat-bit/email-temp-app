'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Copy, Mail, RefreshCw, Check } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface EmailDomain {
  domain: string;
  isActive: boolean;
}

export function EmailGenerator() {
  const router = useRouter();
  const [customPrefix, setCustomPrefix] = useState('');
  const [domains, setDomains] = useState<EmailDomain[]>([]);
  const [selectedDomain, setSelectedDomain] = useState('');
  const [generatedEmail, setGeneratedEmail] = useState('');
  const [accessToken, setAccessToken] = useState('');
  const [expiresAt, setExpiresAt] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');

  // Fetch available domains
  useEffect(() => {
    fetchDomains();
  }, []);

  const fetchDomains = async () => {
    try {
      const response = await fetch('/api/domains');
      const data = await response.json();
      if (data.success && data.data.length > 0) {
        setDomains(data.data);
        setSelectedDomain(data.data[0].domain);
      }
    } catch (error) {
      console.error('Failed to fetch domains:', error);
    }
  };

  const generateEmail = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/emails/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customPrefix: customPrefix || undefined,
          domain: selectedDomain || undefined,
        }),
      });

      const data = await response.json();

      if (!data.success) {
        setError(data.error?.message || 'Failed to generate email');
        return;
      }

      setGeneratedEmail(data.data.emailAddress);
      setAccessToken(data.data.accessToken);
      setExpiresAt(data.data.expiresAt);
    } catch (error) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(generatedEmail);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const goToInbox = () => {
    if (accessToken) {
      router.push(`/inbox/${accessToken}`);
    }
  };

  const getTimeRemaining = () => {
    if (!expiresAt) return '';
    const now = new Date();
    const expiry = new Date(expiresAt);
    const diff = expiry.getTime() - now.getTime();
    const minutes = Math.floor(diff / 60000);
    return `Expires in ${minutes} minutes`;
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mail className="h-6 w-6" />
          Generate Temporary Email
        </CardTitle>
        <CardDescription>
          Create a temporary email address instantly. No registration required.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!generatedEmail ? (
          <>
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Custom Prefix (Optional)
              </label>
              <Input
                type="text"
                placeholder="e.g., myemail"
                value={customPrefix}
                onChange={(e) => setCustomPrefix(e.target.value.toLowerCase())}
                disabled={loading}
                maxLength={20}
              />
              <p className="text-xs text-muted-foreground">
                3-20 characters, lowercase letters, numbers, and hyphens only
              </p>
            </div>

            {domains.length > 1 && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Domain</label>
                <select
                  value={selectedDomain}
                  onChange={(e) => setSelectedDomain(e.target.value)}
                  disabled={loading}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  {domains.map((domain) => (
                    <option key={domain.domain} value={domain.domain}>
                      @{domain.domain}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {error && (
              <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">
                {error}
              </div>
            )}

            <Button
              onClick={generateEmail}
              disabled={loading}
              className="w-full"
              size="lg"
            >
              {loading ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Mail className="mr-2 h-4 w-4" />
                  Generate Email Address
                </>
              )}
            </Button>
          </>
        ) : (
          <>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Your Temporary Email</label>
                <span className="text-xs text-muted-foreground">
                  {getTimeRemaining()}
                </span>
              </div>

              <div className="flex gap-2">
                <Input
                  type="text"
                  value={generatedEmail}
                  readOnly
                  className="font-mono text-base"
                />
                <Button
                  onClick={copyToClipboard}
                  variant="outline"
                  size="icon"
                >
                  {copied ? (
                    <Check className="h-4 w-4 text-green-500" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>

              <div className="flex gap-2">
                <Button onClick={goToInbox} className="flex-1" size="lg">
                  Open Inbox
                </Button>
                <Button
                  onClick={() => {
                    setGeneratedEmail('');
                    setAccessToken('');
                    setExpiresAt('');
                    setCustomPrefix('');
                  }}
                  variant="outline"
                  size="lg"
                >
                  Generate New
                </Button>
              </div>

              {copied && (
                <p className="text-sm text-green-600 text-center">
                  Email address copied to clipboard!
                </p>
              )}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
