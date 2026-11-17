import crypto from 'crypto';

/**
 * Validated file types and their corresponding magic bytes
 */
export interface ValidatedFile {
  isValid: boolean;
  ext: string;
  mime: string;
  error?: string;
}

/**
 * Validates file signature (magic bytes) for JPG, PNG, and PDF.
 * Never trust client-supplied Content-Type or file extensions.
 */
export function validateFileMagicBytes(buffer: Buffer): ValidatedFile {
  if (!buffer || buffer.length < 8) {
    return { isValid: false, ext: '', mime: '', error: 'Ukuran file tidak valid atau file kosong.' };
  }

  // JPEG / JPG: Starts with FF D8 FF
  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return { isValid: true, ext: '.jpg', mime: 'image/jpeg' };
  }

  // PNG: Starts with 89 50 4E 47 0D 0A 1A 0A
  if (
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47 &&
    buffer[4] === 0x0d &&
    buffer[5] === 0x0a &&
    buffer[6] === 0x1a &&
    buffer[7] === 0x0a
  ) {
    return { isValid: true, ext: '.png', mime: 'image/png' };
  }

  // PDF: Starts with 25 50 44 46 (%PDF)
  if (
    buffer[0] === 0x25 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x44 &&
    buffer[3] === 0x46
  ) {
    return { isValid: true, ext: '.pdf', mime: 'application/pdf' };
  }

  return {
    isValid: false,
    ext: '',
    mime: '',
    error: 'File signature tidak sesuai. Hanya file JPG, PNG, atau PDF asli yang diperbolehkan.',
  };
}

/**
 * Sanitizes original file name to prevent Path Traversal and XSS.
 * Removes path separators, control characters, and dangerous symbols.
 */
export function sanitizeFileName(fileName: string): string {
  if (!fileName) return 'dokumen_lampiran';
  // Remove path separators, null bytes, HTML tags, and non-printable chars
  return fileName
    .replace(/[<>:"/\\|?*\x00-\x1F]/g, '')
    .replace(/\.\.+/g, '.') // prevent traversal dots
    .trim()
    .substring(0, 100);
}

/**
 * Sanitizes generic user text inputs against control characters and null bytes.
 */
export function sanitizeText(input: string | null | undefined): string {
  if (!input) return '';
  return input
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '') // remove control chars
    .trim();
}

/**
 * Simple In-Memory Sliding-Window Rate Limiter
 * Protects against Brute-Force and Credential Stuffing on serverless/Node runtimes.
 */
interface RateLimitRecord {
  count: number;
  resetTime: number;
}

const rateLimitStore = new Map<string, RateLimitRecord>();

// Cleanup stale entries every 10 minutes
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now();
    for (const [key, value] of rateLimitStore.entries()) {
      if (now > value.resetTime) {
        rateLimitStore.delete(key);
      }
    }
  }, 10 * 60 * 1000);
}

export function checkRateLimit(
  identifier: string,
  maxAttempts: number = 5,
  windowSeconds: number = 60
): { allowed: boolean; remaining: number; retryAfterSeconds: number } {
  const now = Date.now();
  const windowMs = windowSeconds * 1000;
  const existing = rateLimitStore.get(identifier);

  if (!existing || now > existing.resetTime) {
    rateLimitStore.set(identifier, {
      count: 1,
      resetTime: now + windowMs,
    });
    return { allowed: true, remaining: maxAttempts - 1, retryAfterSeconds: 0 };
  }

  if (existing.count >= maxAttempts) {
    const retryAfterSeconds = Math.ceil((existing.resetTime - now) / 1000);
    return { allowed: false, remaining: 0, retryAfterSeconds };
  }

  existing.count += 1;
  return {
    allowed: true,
    remaining: maxAttempts - existing.count,
    retryAfterSeconds: 0,
  };
}

/**
 * Reset rate limit counter on successful action (e.g. successful login)
 */
export function resetRateLimit(identifier: string): void {
  rateLimitStore.delete(identifier);
}

/**
 * Extract client IP address from standard proxy headers
 */
export function getClientIp(headers: Headers): string {
  const forwarded = headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  const realIp = headers.get('x-real-ip');
  if (realIp) {
    return realIp.trim();
  }
  return '127.0.0.1';
}

/**
 * Generate cryptographically secure random token/UUID
 */
export function generateSecureId(): string {
  return crypto.randomUUID();
}
