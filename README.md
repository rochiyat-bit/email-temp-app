# Temporary Email Service - Full-Stack Web Application

A modern, privacy-focused temporary email service built with Next.js 14, TypeScript, PostgreSQL, and Redis. Generate disposable email addresses instantly, receive emails in real-time, and protect your privacy online.

## 🌟 Features

- **Instant Email Generation**: Create temporary email addresses with one click
- **No Registration Required**: Completely anonymous, no personal data collection
- **Real-Time Email Receiving**: Get notified instantly when emails arrive
- **Auto-Delete**: Emails automatically expire and delete after specified time
- **Custom Prefixes**: Optionally customize your email address prefix
- **Attachment Support**: Receive and download email attachments
- **HTML Email Rendering**: View emails with proper HTML rendering (sanitized for security)
- **Mobile Responsive**: Works perfectly on all devices
- **Rate Limiting**: Built-in protection against abuse
- **Privacy-First**: No tracking, no logging of email content

## 🛠️ Tech Stack

### Frontend
- **Next.js 14** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first CSS framework
- **shadcn/ui** - Beautiful, accessible UI components
- **date-fns** - Date formatting

### Backend
- **Next.js API Routes** - Serverless API
- **Sequelize ORM** - Database management
- **PostgreSQL** - Primary database
- **Redis (Upstash)** - Caching and rate limiting
- **Zod** - Runtime validation
- **DOMPurify** - HTML sanitization

## 📋 Prerequisites

- Node.js 20+
- PostgreSQL 15+
- Redis (or Upstash account)
- npm package manager

## 🚀 Quick Start

### 1. Clone and Install

```bash
git clone <repository-url>
cd email-temp-app
npm install
```

### 2. Configure Environment

Copy `.env.example` to `.env.local` and update:

```env
DATABASE_URL=postgresql://localhost:5432/tempmail_dev
UPSTASH_REDIS_REST_URL=your_redis_url
UPSTASH_REDIS_REST_TOKEN=your_redis_token
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Set Up Database

```bash
createdb tempmail_dev
npx sequelize-cli db:migrate
npx sequelize-cli db:seed:all
```

### 4. Start Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
email-temp-app/
├── app/
│   ├── api/                    # API endpoints
│   │   ├── domains/           # Domain management
│   │   └── emails/            # Email operations
│   ├── inbox/[token]/         # Inbox page
│   └── page.tsx               # Home page
├── lib/
│   ├── db/                    # Database config
│   │   ├── models/           # Sequelize models
│   │   ├── migrations/       # DB migrations
│   │   └── seeders/          # Seed data
│   ├── email/                 # Email processing
│   ├── redis/                 # Redis & rate limiting
│   ├── utils/                 # Utilities
│   └── validators/            # Zod schemas
├── components/                 # React components
└── types/                     # TypeScript types
```

## 🔧 API Endpoints

### Generate Email
**POST** `/api/emails/generate`
- Rate limit: 10/hour per IP
- Optional custom prefix

### Get Inbox
**GET** `/api/emails/inbox/:token`
- Rate limit: 60/min
- Pagination support
- Filter by unread

### View Email
**GET** `/api/emails/:id?accessToken=token`
- Rate limit: 100/min
- Auto marks as read

### Extend Expiration
**POST** `/api/emails/inbox/:token/extend`
- Rate limit: 3 per email lifetime
- Max 24 hours total

### Delete Inbox
**DELETE** `/api/emails/inbox/:token`
- Cascades to all emails

## 🔒 Security

- **Rate Limiting**: Multiple layers (IP, token)
- **HTML Sanitization**: DOMPurify prevents XSS
- **Input Validation**: Zod schemas for all inputs
- **Privacy**: No tracking, auto-deletion
- **SQL Injection**: Protected by Sequelize ORM

## 🧪 Testing

Send test email using `swaks`:

```bash
swaks --to test@tempmail.local \
      --from sender@example.com \
      --server localhost:2525 \
      --header "Subject: Test" \
      --body "Test email"
```

## 📦 Deployment

### Vercel Deployment

1. Push to GitHub
2. Import to Vercel
3. Configure environment variables
4. Set up Vercel Postgres or Supabase
5. Create Upstash Redis instance
6. Deploy

### SMTP Server

**Production Options:**
- CloudMailin (recommended for easy setup)
- Self-hosted VPS with Postfix
- Configure MX records for your domain

## 🐛 Troubleshooting

**Database errors:**
```bash
# Verify PostgreSQL
pg_isready
psql -l
```

**Redis errors:**
```bash
# Test connection
redis-cli ping
```

**Rate limiting in dev:**
```env
RATE_LIMIT_ENABLED=false
```

## 🎯 Roadmap

- [ ] Custom domain support
- [ ] Email forwarding
- [ ] Reply functionality
- [ ] Browser extension
- [ ] Mobile apps
- [ ] Public API
- [ ] Premium features

## 📝 License

MIT License - see [LICENSE](LICENSE)

## 🤝 Contributing

Contributions welcome! Please:
1. Fork the repository
2. Create feature branch
3. Commit changes
4. Push and create PR

---

**Built with Next.js 14, TypeScript, PostgreSQL & Redis**
