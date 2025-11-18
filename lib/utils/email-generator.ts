import { nanoid } from 'nanoid';

// Word lists for generating random email addresses
const adjectives = [
  'swift', 'quiet', 'brave', 'bright', 'cool', 'dark', 'fast', 'gentle',
  'happy', 'jolly', 'kind', 'lively', 'merry', 'noble', 'proud', 'quick',
  'silent', 'sturdy', 'vibrant', 'wise', 'zesty', 'calm', 'eager', 'fair',
  'grand', 'honest', 'ideal', 'jovial', 'keen', 'lucky', 'mighty', 'neat',
];

const nouns = [
  'tiger', 'eagle', 'lion', 'wolf', 'bear', 'hawk', 'fox', 'owl',
  'panda', 'shark', 'whale', 'dragon', 'phoenix', 'falcon', 'leopard', 'cobra',
  'raven', 'panther', 'jaguar', 'lynx', 'otter', 'badger', 'python', 'viper',
  'condor', 'bison', 'moose', 'gazelle', 'cheetah', 'stallion', 'mustang', 'bronco',
];

/**
 * Generate a random email address
 * Format: adjective-noun-number@domain
 * Example: swift-tiger-2847@tempmail.example.com
 */
export function generateRandomEmail(domain: string, customPrefix?: string): string {
  if (customPrefix) {
    // Validate and use custom prefix
    const sanitizedPrefix = customPrefix.toLowerCase().replace(/[^a-z0-9-]/g, '');
    const number = Math.floor(Math.random() * 10000);
    return `${sanitizedPrefix}-${number}@${domain}`;
  }

  // Generate random email
  const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
  const noun = nouns[Math.floor(Math.random() * nouns.length)];
  const number = Math.floor(Math.random() * 10000);

  return `${adjective}-${noun}-${number}@${domain}`;
}

/**
 * Generate a unique access token
 * Returns a 32-character random string
 */
export function generateAccessToken(): string {
  return nanoid(32);
}

/**
 * Generate a display name from email address
 * Example: swift-tiger-2847@... -> Swift Tiger
 */
export function generateDisplayName(emailAddress: string): string {
  const localPart = emailAddress.split('@')[0];
  const parts = localPart.split('-').filter(part => isNaN(Number(part)));

  return parts
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Validate custom email prefix
 * Returns true if valid, false otherwise
 */
export function validateCustomPrefix(prefix: string): boolean {
  if (!prefix || prefix.length < 3 || prefix.length > 20) {
    return false;
  }

  // Only allow alphanumeric and hyphens
  const regex = /^[a-z0-9-]+$/;
  return regex.test(prefix.toLowerCase());
}

/**
 * Calculate expiration date from now
 * Default: 1 hour from now
 */
export function calculateExpirationDate(hours: number = 1): Date {
  const now = new Date();
  now.setHours(now.getHours() + hours);
  return now;
}
