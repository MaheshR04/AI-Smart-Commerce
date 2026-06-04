/**
 * Security Middlewares for AI Smart Commerce
 * Implements: MongoDB Injection Protection, XSS Protection, Rate Limiting, and Input Validation
 */

// 1. MongoDB Injection Protection (NoSQL Sanitize)
// Recursively removes keys starting with '$' or containing '.' from request body, query, and params
export const mongoSanitize = (req, res, next) => {
  const sanitize = (obj) => {
    if (obj && typeof obj === 'object') {
      for (const key in obj) {
        if (key.startsWith('$') || key.includes('.')) {
          delete obj[key];
        } else if (typeof obj[key] === 'object') {
          sanitize(obj[key]);
        }
      }
    }
  };

  sanitize(req.body);
  sanitize(req.query);
  sanitize(req.params);
  next();
};

// 2. XSS Protection (Cross-Site Scripting Clean)
// Recursively strips script tags and sanitizes HTML entities inside string properties
export const xssClean = (req, res, next) => {
  const sanitizeValue = (val) => {
    if (typeof val === 'string') {
      // Remove dangerous script patterns
      let clean = val.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
      // Strip dangerous element handlers (e.g., onload, onerror)
      clean = clean.replace(/on\w+\s*=\s*"[^"]*"/gi, '');
      clean = clean.replace(/on\w+\s*=\s*'[^']*'/gi, '');
      clean = clean.replace(/javascript\s*:\s*/gi, '');
      // Escape tags
      clean = clean.replace(/</g, '&lt;').replace(/>/g, '&gt;');
      return clean;
    }
    if (val && typeof val === 'object') {
      for (const key in val) {
        val[key] = sanitizeValue(val[key]);
      }
    }
    return val;
  };

  req.body = sanitizeValue(req.body);
  req.query = sanitizeValue(req.query);
  req.params = sanitizeValue(req.params);
  next();
};

// 3. Flexible In-Memory Rate Limiting
const rateLimitMap = new Map();
export const rateLimiter = (options = {}) => {
  const windowMs = options.windowMs || 15 * 60 * 1000; // Default: 15 minutes
  const max = options.max || 100; // Default: 100 requests per window
  const message = options.message || 'Too many requests. Please try again later.';

  return (req, res, next) => {
    // Bypass rate limiting in development mode
    if (process.env.NODE_ENV !== 'production') {
      return next();
    }

    // Determine user client IP address
    const ip = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    const now = Date.now();

    // Check if IP is in the cache Map
    if (!rateLimitMap.has(ip)) {
      rateLimitMap.set(ip, { count: 1, resetTime: now + windowMs });
      return next();
    }

    const clientData = rateLimitMap.get(ip);

    // If window expired, reset client count and reset time
    if (now > clientData.resetTime) {
      clientData.count = 1;
      clientData.resetTime = now + windowMs;
      return next();
    }

    // Increment count
    clientData.count += 1;

    // Check rate limit threshold exceedance
    if (clientData.count > max) {
      return res.status(429).json({
        success: false,
        message,
      });
    }

    next();
  };
};

// Specialized Rate Limiters
export const authRateLimiter = rateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Max 100 attempts per 15 minutes
  message: 'Too many authentication attempts. Please try again after 15 minutes.',
});

export const apiRateLimiter = rateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 300, // Max 300 API requests per 15 minutes
  message: 'General API request rate exceeded. Please slow down your requests.',
});

// 4. Input Validations Middleware
export const validateUserRegister = (req, res, next) => {
  const { name, email, password } = req.body;

  if (!name || name.trim().length < 2) {
    return res.status(400).json({ success: false, message: 'Name is required and must be at least 2 characters long.' });
  }

  if (!email || !/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email)) {
    return res.status(400).json({ success: false, message: 'Please provide a valid email address.' });
  }

  if (!password || password.length < 6) {
    return res.status(400).json({ success: false, message: 'Password is required and must be at least 6 characters long.' });
  }

  next();
};

export const validateUserLogin = (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Please provide both email and password.' });
  }

  if (!/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email)) {
    return res.status(400).json({ success: false, message: 'Please enter a valid email format.' });
  }

  next();
};

export const validateAddressInput = (req, res, next) => {
  const { street, city, state, postalCode, country, phone } = req.body;

  if (!street || !city || !state || !postalCode || !country || !phone) {
    return res.status(400).json({ success: false, message: 'All address input fields (street, city, state, postalCode, country, phone) are required.' });
  }

  next();
};

export const validateReviewInput = (req, res, next) => {
  const { productId, rating, comment } = req.body;

  if (!productId) {
    return res.status(400).json({ success: false, message: 'Product ID is required.' });
  }

  const numericRating = Number(rating);
  if (isNaN(numericRating) || numericRating < 1 || numericRating > 5) {
    return res.status(400).json({ success: false, message: 'Rating must be a valid number between 1 and 5.' });
  }

  if (!comment || comment.trim().length < 3) {
    return res.status(400).json({ success: false, message: 'Comment is required and must be at least 3 characters long.' });
  }

  next();
};

export const validateForgotPassword = (req, res, next) => {
  const { email } = req.body;
  if (!email || !/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email)) {
    return res.status(400).json({ success: false, message: 'Please provide a valid email address.' });
  }
  next();
};

export const validateResetPassword = (req, res, next) => {
  const { password } = req.body;
  if (!password || password.length < 6) {
    return res.status(400).json({ success: false, message: 'Password is required and must be at least 6 characters long.' });
  }
  next();
};
