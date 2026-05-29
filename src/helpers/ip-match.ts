/**
 * Network helpers – IP normalisation + CIDR matching.
 *
 * Kept dependency-free on purpose: a tiny, well-tested implementation is
 * preferable to pulling in a third-party module for a hot path that runs on
 * every request.
 *
 * Supports:
 *  - Exact IPv4 / IPv6 matching
 *  - IPv4 CIDR (e.g. `10.0.0.0/8`, `192.168.1.0/24`)
 *  - IPv4-mapped IPv6 addresses (`::ffff:1.2.3.4`) – normalised to IPv4
 *
 * IPv6 CIDR is intentionally NOT supported here; if you need it, pass exact
 * IPv6 addresses or open an issue.
 */

/** Strip an IPv4-mapped IPv6 prefix (`::ffff:`) so 1.2.3.4 == ::ffff:1.2.3.4. */
export function normaliseIp(raw: string | undefined | null): string {
  if (!raw) return '';
  const ip = raw.trim().toLowerCase();
  if (ip.startsWith('::ffff:')) return ip.slice(7);
  return ip;
}

function ipv4ToInt(ip: string): number | null {
  const parts = ip.split('.');
  if (parts.length !== 4) return null;
  let acc = 0;
  for (const p of parts) {
    if (!/^\d{1,3}$/.test(p)) return null;
    const n = Number(p);
    if (n < 0 || n > 255) return null;
    acc = (acc * 256) + n;
  }
  // Force unsigned 32-bit
  return acc >>> 0;
}

interface ParsedRule {
  /** Lower-cased exact IP literal (no mask). */
  exact?: string;
  /** IPv4 CIDR: pre-computed base & mask. */
  cidr?: { base: number; mask: number };
}

const RULE_CACHE = new Map<string, ParsedRule>();

function parseRule(rule: string): ParsedRule {
  const cached = RULE_CACHE.get(rule);
  if (cached) return cached;

  let parsed: ParsedRule = {};
  const trimmed = rule.trim().toLowerCase();

  const slash = trimmed.indexOf('/');
  if (slash === -1) {
    parsed = { exact: normaliseIp(trimmed) };
  } else {
    const ipPart = trimmed.slice(0, slash);
    const bits = Number(trimmed.slice(slash + 1));
    const base = ipv4ToInt(ipPart);
    if (base !== null && Number.isInteger(bits) && bits >= 0 && bits <= 32) {
      // mask of 0 means "match everything"; (-1 << 32) is 0 in JS, handle explicitly
      const mask = bits === 0 ? 0 : (0xffffffff << (32 - bits)) >>> 0;
      parsed = { cidr: { base: (base & mask) >>> 0, mask } };
    } else {
      // Invalid CIDR – fall back to exact match (will simply never hit)
      parsed = { exact: trimmed };
    }
  }

  RULE_CACHE.set(rule, parsed);
  return parsed;
}

/**
 * Test whether `ip` matches any of the given rules.
 * Rules can be exact IPs or IPv4 CIDR blocks.
 */
export function ipMatches(ip: string, rules: readonly string[]): boolean {
  const norm = normaliseIp(ip);
  if (!norm) return false;

  const asInt = ipv4ToInt(norm);

  for (const rule of rules) {
    if (typeof rule !== 'string' || rule.length === 0) continue;
    const p = parseRule(rule);
    if (p.exact !== undefined) {
      if (p.exact === norm) return true;
      continue;
    }
    if (p.cidr && asInt !== null) {
      if (((asInt & p.cidr.mask) >>> 0) === p.cidr.base) return true;
    }
  }

  return false;
}

/** Visible for testing. */
export function _clearIpRuleCache(): void {
  RULE_CACHE.clear();
}

