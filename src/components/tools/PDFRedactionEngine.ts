import { REDACTION_PATTERNS } from './RedactionPatterns';

// Luhn algorithm for credit card validation
function luhnCheck(num: string): boolean {
  let arr = (num + '').replace(/\D/g, '').split('').reverse().map(x => parseInt(x));
  let sum = arr.reduce((acc, val, i) => acc + (i % 2 ? ((val *= 2) > 9 ? val - 9 : val) : val), 0);
  return sum % 10 === 0;
}

// IPv4 validation
function isIPv4(ip: string): boolean {
  return /^([0-9]{1,3}\.){3}[0-9]{1,3}$/.test(ip) && ip.split('.').every(seg => +seg >= 0 && +seg <= 255);
}

export type RedactionMatch = {
  type: string;
  value: string;
  index: number;
  length: number;
  color: string;
};

export function detectSensitiveData(
  text: string,
  patterns: typeof REDACTION_PATTERNS,
  customPatterns: { name: string; regex: RegExp; color: string }[] = []
): RedactionMatch[] {
  const matches: RedactionMatch[] = [];
  const allPatterns = { ...patterns } as Record<string, { regex: RegExp; name: string; validate?: any; color: string }>;
  customPatterns.forEach(p => {
    allPatterns[p.name] = { regex: p.regex, name: p.name, color: p.color };
  });
  for (const key in allPatterns) {
    const { regex, name, validate, color } = allPatterns[key];
    let m: RegExpExecArray | null;
    const re = new RegExp(regex.source, regex.flags.includes('g') ? regex.flags : regex.flags + 'g');
    while ((m = re.exec(text))) {
      let valid = true;
      if (validate === 'luhn') valid = luhnCheck(m[0]);
      if (validate === 'ipv4') valid = isIPv4(m[0]);
      if (validate === true && key === 'ssn') valid = /^\d{3}-\d{2}-\d{4}$/.test(m[0]);
      if (valid) {
        matches.push({
          type: name,
          value: m[0],
          index: m.index,
          length: m[0].length,
          color,
        });
      }
    }
  }
  return matches;
} 