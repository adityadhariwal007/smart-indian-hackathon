import DOMPurify from 'dompurify';

// Security, Anti-Spam & Rate Limiting Utility for HealthFlow

const RATE_LIMIT_PREFIX = 'healthflow_rl_';

/**
 * Checks if an action is rate-limited within a sliding time window.
 * @param {string} actionKey - Unique key for the action (e.g. 'complaint_submit', 'otp_send')
 * @param {number} maxAttempts - Max allowed attempts in the window (default 3)
 * @param {number} windowSeconds - Duration of the window in seconds (default 60s)
 * @returns {{ allowed: boolean, remainingAttempts: number, retryAfterSeconds: number }}
 */
export function checkRateLimit(actionKey, maxAttempts = 3, windowSeconds = 60) {
  if (typeof window === 'undefined') return { allowed: true, remainingAttempts: maxAttempts, retryAfterSeconds: 0 };

  const storageKey = `${RATE_LIMIT_PREFIX}${actionKey}`;
  const now = Date.now();
  const windowMs = windowSeconds * 1000;

  try {
    const raw = localStorage.getItem(storageKey);
    let attempts = raw ? JSON.parse(raw) : [];

    // Filter attempts within the active sliding window
    attempts = attempts.filter(timestamp => now - timestamp < windowMs);

    if (attempts.length >= maxAttempts) {
      const oldestInWindow = attempts[0];
      const retryAfter = Math.ceil((oldestInWindow + windowMs - now) / 1000);
      return {
        allowed: false,
        remainingAttempts: 0,
        retryAfterSeconds: Math.max(1, retryAfter)
      };
    }

    // Record this attempt
    attempts.push(now);
    localStorage.setItem(storageKey, JSON.stringify(attempts));

    return {
      allowed: true,
      remainingAttempts: maxAttempts - attempts.length,
      retryAfterSeconds: 0
    };
  } catch (e) {
    return { allowed: true, remainingAttempts: maxAttempts, retryAfterSeconds: 0 };
  }
}

/**
 * Validates that a honeypot field was left empty by a human user.
 * @param {string} trapValue - The value of the honeypot field
 * @returns {boolean} True if clean (empty), false if filled by a bot
 */
export function validateHoneypot(trapValue) {
  return !trapValue || trapValue.trim().length === 0;
}

/**
 * Sanitizes input string to prevent XSS injection using industry-standard DOMPurify.
 * By default strips all HTML tags, script entities, event handlers, and javascript: links.
 * @param {string} str
 * @param {object} options - Optional DOMPurify configuration override
 * @returns {string} Clean, safe text
 */
export function sanitizeInput(str, options = { ALLOWED_TAGS: [], ALLOWED_ATTR: [] }) {
  if (typeof str !== 'string') return '';
  if (typeof window !== 'undefined' && DOMPurify && typeof DOMPurify.sanitize === 'function') {
    return DOMPurify.sanitize(str, options).trim();
  }
  // Safe fallback if DOMPurify window context is not yet initialized
  return str.replace(/[<>]/g, '').trim();
}

/**
 * Sanitizes rich HTML content while preserving safe formatting tags.
 * Strips <script>, <iframe>, <object>, inline event handlers (onload, onerror), and malicious protocols.
 * @param {string} html
 * @returns {string} Sanitized HTML
 */
export function sanitizeHTML(html) {
  if (typeof html !== 'string') return '';
  if (typeof window !== 'undefined' && DOMPurify && typeof DOMPurify.sanitize === 'function') {
    return DOMPurify.sanitize(html, {
      ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p', 'br', 'ul', 'ol', 'li', 'span', 'code'],
      ALLOWED_ATTR: ['href', 'target', 'rel', 'class', 'title'],
    }).trim();
  }
  return html.replace(/[<>]/g, '').trim();
}
