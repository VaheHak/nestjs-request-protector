import { ipMatches, normaliseIp, _clearIpRuleCache } from '../src/helpers/ip-match';

describe('normaliseIp', () => {
  it('returns empty string for falsy input', () => {
    expect(normaliseIp(undefined)).toBe('');
    expect(normaliseIp(null)).toBe('');
    expect(normaliseIp('')).toBe('');
  });

  it('strips IPv4-mapped IPv6 prefix', () => {
    expect(normaliseIp('::ffff:1.2.3.4')).toBe('1.2.3.4');
    expect(normaliseIp('::FFFF:10.0.0.1')).toBe('10.0.0.1');
  });

  it('trims and lower-cases IPv6', () => {
    expect(normaliseIp('  ::1  ')).toBe('::1');
    expect(normaliseIp('2001:DB8::1')).toBe('2001:db8::1');
  });
});

describe('ipMatches', () => {
  beforeEach(() => _clearIpRuleCache());

  it('returns false on empty input or empty rules', () => {
    expect(ipMatches('', ['1.2.3.4'])).toBe(false);
    expect(ipMatches('1.2.3.4', [])).toBe(false);
  });

  it('matches exact IPv4', () => {
    expect(ipMatches('192.168.1.5', ['192.168.1.5'])).toBe(true);
    expect(ipMatches('192.168.1.6', ['192.168.1.5'])).toBe(false);
  });

  it('matches exact IPv6 (case-insensitive)', () => {
    expect(ipMatches('2001:DB8::1', ['2001:db8::1'])).toBe(true);
  });

  it('treats ::ffff: mapped addresses as IPv4', () => {
    expect(ipMatches('::ffff:10.0.0.5', ['10.0.0.5'])).toBe(true);
    expect(ipMatches('10.0.0.5', ['::ffff:10.0.0.5'])).toBe(true);
  });

  it('matches IPv4 CIDR /24', () => {
    expect(ipMatches('192.168.1.42', ['192.168.1.0/24'])).toBe(true);
    expect(ipMatches('192.168.2.42', ['192.168.1.0/24'])).toBe(false);
  });

  it('matches IPv4 CIDR /8', () => {
    expect(ipMatches('10.255.255.255', ['10.0.0.0/8'])).toBe(true);
    expect(ipMatches('11.0.0.1', ['10.0.0.0/8'])).toBe(false);
  });

  it('matches /32 (exact via CIDR)', () => {
    expect(ipMatches('1.2.3.4', ['1.2.3.4/32'])).toBe(true);
    expect(ipMatches('1.2.3.5', ['1.2.3.4/32'])).toBe(false);
  });

  it('matches /0 (everything)', () => {
    expect(ipMatches('99.99.99.99', ['0.0.0.0/0'])).toBe(true);
  });

  it('iterates multiple rules', () => {
    const rules = ['10.0.0.0/8', '192.168.1.1', '172.16.0.0/12'];
    expect(ipMatches('172.20.5.5', rules)).toBe(true);
    expect(ipMatches('8.8.8.8', rules)).toBe(false);
  });

  it('ignores invalid CIDR (treated as exact, never matches a real IP)', () => {
    expect(ipMatches('1.2.3.4', ['not-a-cidr/77'])).toBe(false);
  });

  it('ignores empty/non-string entries in the rule list', () => {
    expect(ipMatches('1.2.3.4', ['', undefined as unknown as string, '1.2.3.4'])).toBe(true);
  });
});

