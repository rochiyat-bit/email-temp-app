import { EmailGenerator } from '@/components/email/email-generator';
import { Shield, Clock, Lock, Zap } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <header className="text-center mb-16">
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Temporary Email Service
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Generate instant disposable email addresses. Protect your privacy, avoid spam, and stay anonymous online.
          </p>
        </header>

        {/* Email Generator */}
        <div className="mb-16">
          <EmailGenerator />
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16 max-w-6xl mx-auto">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <Zap className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="font-semibold text-lg">Instant Generation</h3>
            </div>
            <p className="text-muted-foreground">
              Create temporary email addresses in seconds with just one click.
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                <Shield className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="font-semibold text-lg">Privacy First</h3>
            </div>
            <p className="text-muted-foreground">
              No registration required. Your privacy is our top priority.
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                <Clock className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="font-semibold text-lg">Auto-Delete</h3>
            </div>
            <p className="text-muted-foreground">
              Emails automatically expire and delete after the specified time.
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-orange-100 dark:bg-orange-900 rounded-lg">
                <Lock className="h-6 w-6 text-orange-600 dark:text-orange-400" />
              </div>
              <h3 className="font-semibold text-lg">Secure</h3>
            </div>
            <p className="text-muted-foreground">
              Protected with rate limiting and XSS prevention measures.
            </p>
          </div>
        </div>

        {/* How It Works */}
        <div className="max-w-4xl mx-auto mb-16">
          <h2 className="text-3xl font-bold text-center mb-8">How It Works</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
                1
              </div>
              <h3 className="font-semibold text-lg mb-2">Generate Email</h3>
              <p className="text-muted-foreground">
                Click the button to instantly create a temporary email address
              </p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
                2
              </div>
              <h3 className="font-semibold text-lg mb-2">Use Anywhere</h3>
              <p className="text-muted-foreground">
                Use your temporary email for registrations, trials, or any online service
              </p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
                3
              </div>
              <h3 className="font-semibold text-lg mb-2">Receive Emails</h3>
              <p className="text-muted-foreground">
                Check your inbox to view received emails in real-time
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="text-center text-muted-foreground text-sm">
          <p>Built with Next.js 14, TypeScript, PostgreSQL & Redis</p>
          <p className="mt-2">© 2024 Temporary Email Service. All rights reserved.</p>
        </footer>
      </div>
    </div>
  );
}
