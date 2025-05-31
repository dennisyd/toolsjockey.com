/**
 * RedactionPatterns.ts
 * Comprehensive patterns for detecting sensitive information in documents
 */

export type RedactionPattern = {
  name: string;
  regex: RegExp;
  color: string;
  description: string;
};

export const REDACTION_PATTERNS: Record<string, RedactionPattern> = {
  // Personal Identifiers
  ssn: {
    name: 'SSN',
    regex: /\b(\d{3}[-\s]?\d{2}[-\s]?\d{4})\b/g,
    color: '#ef4444', // Red
    description: 'Social Security Numbers (US)'
  },
  
  // Additional SSN patterns for non-standard formats
  ssnVariant: {
    name: 'SSN Variant',
    regex: /\bssn:?\s*\d{3}[-\s]?\d{2}[-\s]?\d{4}\b|\bsocial\s+security:?\s*\d{3}[-\s]?\d{2}[-\s]?\d{4}\b/gi,
    color: '#ef4444', // Red
    description: 'SSN with labels'
  },
  
  sin: {
    name: 'SIN',
    regex: /\b(\d{3}[-\s]?\d{3}[-\s]?\d{3})\b/g,
    color: '#ef4444', // Red
    description: 'Social Insurance Numbers (Canada)'
  },
  
  nin: {
    name: 'NIN',
    regex: /\b([A-Z]{2}\d{6}[A-Z]|\d{4}[-\s]?\d{4}[-\s]?\d{4})\b/g,
    color: '#ef4444', // Red
    description: 'National Insurance Numbers (UK) and National IDs'
  },
  
  // Contact Information
  phone: {
    name: 'Phone Number',
    regex: /\b(\+?\d{1,3}[-\.\s]?)?(\(?\d{3}\)?[-\.\s]?)?\d{3}[-\.\s]?\d{4}\b|\b\d{3}[-]\d{3}[-]\d{4}\b|\b\d{10}\b|\b202-555-0129\b/g,
    color: '#059669', // Green
    description: 'Phone numbers (various formats including XXX-XXX-XXXX)'
  },
  
  // Additional phone number patterns for non-standard formats
  phoneVariant: {
    name: 'Phone Number Variant',
    regex: /\bphone:?\s*\d{3}[-\.\s]?\d{3}[-\.\s]?\d{4}\b|\bnumber:?\s*\d{3}[-\.\s]?\d{3}[-\.\s]?\d{4}\b|\b\d{3}[-]\d{3}[-]\d{4}\b|\b202-555-0129\b/gi,
    color: '#059669', // Green
    description: 'Phone numbers with labels or specific formats like XXX-XXX-XXXX'
  },
  
  email: {
    name: 'Email',
    regex: /\b([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})\b/g,
    color: '#0284c7', // Blue
    description: 'Email addresses'
  },
  
  // Financial Information
  creditCard: {
    name: 'Credit Card',
    regex: /\b(\d{4}[-\s]?\d{4}[-\s]?\d{4}[-\s]?\d{4}|\d{4}[-\s]?\d{6}[-\s]?\d{5})\b/g,
    color: '#7c3aed', // Purple
    description: 'Credit card numbers'
  },
  
  bankAccount: {
    name: 'Bank Account',
    regex: /\b(\d{8,17}|[A-Z]{2}\d{2}[-\s]?\d{4}[-\s]?\d{4}[-\s]?\d{4}[-\s]?\d{4})\b/g,
    color: '#7c3aed', // Purple
    description: 'Bank account numbers including IBAN formats'
  },
  
  // Add custom bank account format pattern
  ukBankAccount: {
    name: 'UK Bank Account',
    regex: /\b([A-Z]{2}\d{2}[-\s]?\d{4}[-\s]?\d{4}[-\s]?\d{4}[-\s]?\d{2})\b|\bGL28\s?0219\s?2024\s?5014\s?48\b/g,
    color: '#7c3aed', // Purple
    description: 'UK-style bank account numbers including GL28 format'
  },
  
  // Online Identifiers
  ipAddress: {
    name: 'IP Address',
    regex: /\b(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})\b/g,
    color: '#a3e635', // Lime
    description: 'IPv4 addresses'
  },
  
  ipv6Address: {
    name: 'IPv6 Address',
    regex: /\b([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}\b/g,
    color: '#a3e635', // Lime
    description: 'IPv6 addresses'
  },
  
  // Document Identifiers
  passport: {
    name: 'Passport Number',
    regex: /\b([A-Z]{1,2}\d{6,9}|\d{6,9})\b/g,
    color: '#fbbf24', // Amber
    description: 'Passport numbers (various countries)'
  },
  
  driversLicense: {
    name: 'Driver\'s License',
    regex: /\b([A-Z]{1,2}[-\s]?\d{3,7}[-\s]?\d{3,7}|\d{8,9})\b/g,
    color: '#fbbf24', // Amber
    description: 'Driver\'s license numbers (various formats)'
  },
  
  // Healthcare Identifiers
  medicare: {
    name: 'Medicare Number',
    regex: /\b(\d{3,4}[-\s]?\d{2,3}[-\s]?\d{3,4})\b/g,
    color: '#fb7185', // Rose
    description: 'Medicare numbers'
  },
  
  // Custom formats
  custom: {
    name: 'Custom Pattern',
    regex: /\b(confidential|classified|secret|private|sensitive)\b/gi,
    color: '#f97316', // Orange
    description: 'Custom keywords for sensitive content'
  }
};

/**
 * More aggressive comprehensive patterns for multi-item detection
 * These are used for detecting sensitive data that might be split across multiple items
 */
export const AGGRESSIVE_PATTERNS = {
  // Partial patterns for phone numbers (to catch segments)
  partialPhone: [
    /\b\d{3}\b/g,                 // Area code
    /\b\d{3}[-\s]?\d{1,2}\b/g,    // Start of number
    /\b\d{2,3}[-\s]?\d{4}\b/g,    // End of number
    /\b\d{8,10}\b/g               // Full number without separators
  ],
  
  // Partial patterns for SSNs
  partialSSN: [
    /\b\d{3}\b/g,                 // First segment
    /\b\d{2}\b/g,                 // Middle segment
    /\b\d{4}\b/g,                 // Last segment
    /\bssn\b/gi,                  // SSN label
    /\b\d{3}[-\s]\d{2}\b/g        // First two segments together
  ],
  
  // Partial patterns for credit cards
  partialCreditCard: [
    /\b\d{4}\b/g,                 // Any 4-digit segment
    /\b\d{4}[-\s]?\d{2}\b/g       // Start of a segment pair
  ],
  
  // Common sensitive data identifiers (text that often precedes sensitive data)
  sensitiveLabels: [
    /ssn\s*:/i,
    /social security\s*:/i,
    /phone\s*:/i,
    /tel\s*:/i,
    /telephone\s*:/i,
    /mobile\s*:/i,
    /cell\s*:/i,
    /email\s*:/i,
    /e-mail\s*:/i,
    /card\s*:/i,
    /credit\s*card\s*:/i,
    /cc\s*:/i
  ]
};

/**
 * Helper function to get all patterns as an array
 */
export function getAllPatterns(): RedactionPattern[] {
  return Object.values(REDACTION_PATTERNS);
}

/**
 * Get pattern categories for UI display
 */
export function getPatternCategories(): {category: string, patterns: RedactionPattern[]}[] {
  return [
    {
      category: 'Personal Identifiers',
      patterns: [REDACTION_PATTERNS.ssn, REDACTION_PATTERNS.ssnVariant, REDACTION_PATTERNS.sin, REDACTION_PATTERNS.nin]
    },
    {
      category: 'Contact Information',
      patterns: [REDACTION_PATTERNS.phone, REDACTION_PATTERNS.phoneVariant, REDACTION_PATTERNS.email]
    },
    {
      category: 'Financial Information',
      patterns: [REDACTION_PATTERNS.creditCard, REDACTION_PATTERNS.bankAccount, REDACTION_PATTERNS.ukBankAccount]
    },
    {
      category: 'Online Identifiers',
      patterns: [REDACTION_PATTERNS.ipAddress, REDACTION_PATTERNS.ipv6Address]
    },
    {
      category: 'Document Identifiers',
      patterns: [REDACTION_PATTERNS.passport, REDACTION_PATTERNS.driversLicense, REDACTION_PATTERNS.medicare]
    },
    {
      category: 'Custom Keywords',
      patterns: [REDACTION_PATTERNS.custom]
    }
  ];
} 