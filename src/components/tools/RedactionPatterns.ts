export const REDACTION_PATTERNS = {
  ssn: {
    regex: /\b\d{3}-\d{2}-\d{4}\b/g,
    name: 'Social Security Numbers',
    validate: true,
    color: '#dc2626',
  },
  creditCard: {
    regex: /\b\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/g,
    name: 'Credit Card Numbers',
    validate: 'luhn',
    color: '#7c2d12',
  },
  email: {
    regex: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g,
    name: 'Email Addresses',
    validate: false,
    color: '#1d4ed8',
  },
  phone: {
    regex: /\b(?:\+?1[-.\s]?)?\(?([0-9]{3})\)?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})\b/g,
    name: 'Phone Numbers',
    validate: false,
    color: '#059669',
  },
  ipAddress: {
    regex: /\b(?:[0-9]{1,3}\.){3}[0-9]{1,3}\b/g,
    name: 'IP Addresses',
    validate: 'ipv4',
    color: '#7c3aed',
  },
};

export type RedactionPatternKey = keyof typeof REDACTION_PATTERNS; 