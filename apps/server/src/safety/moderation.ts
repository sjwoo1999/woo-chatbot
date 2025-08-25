export type SafetyCategory = 'politics' | 'risk' | 'advice' | 'pii';

const politics = [
  '대통령','국회의원','정당','선거','캠페인','외교','의회'
];
const risk = [
  '폭탄','암살','자살','총기','제조법','해킹','크랙','DDoS','키로거'
];
const advice = [
  '처방','진단','법률 자문','소송','투자 추천','보험 설계'
];

const piiRegexes = [
  /\b(\d{6})[- ]?(\d{7})\b/g, // 주민등록번호
  /\b01[016789][- ]?\d{3,4}[- ]?\d{4}\b/g, // 휴대전화
  /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g, // 이메일
  /\b(?:\d[ -]*?){13,19}\b/g, // 카드번호(단순)
];

export interface SafetyResult {
  blocked: boolean;
  warn: boolean;
  maskedText: string;
  categories: SafetyCategory[];
}

export function moderate(input: string): SafetyResult {
  const lower = input.toLowerCase();
  const categories: SafetyCategory[] = [];

  const hasPolitics = politics.some(k => lower.includes(k.toLowerCase()));
  const hasRisk = risk.some(k => lower.includes(k.toLowerCase()));
  const hasAdvice = advice.some(k => lower.includes(k.toLowerCase()));

  if (hasPolitics) categories.push('politics');
  if (hasRisk) categories.push('risk');
  if (hasAdvice) categories.push('advice');

  let masked = input;
  let matchedPII = false;
  for (const rx of piiRegexes) {
    masked = masked.replace(rx, (m) => {
      matchedPII = true;
      return '[PII_MASKED]';
    });
  }
  if (matchedPII) categories.push('pii');

  const blocked = hasPolitics || hasRisk;
  const warn = hasAdvice || matchedPII;

  return { blocked, warn, maskedText: masked, categories };
}
