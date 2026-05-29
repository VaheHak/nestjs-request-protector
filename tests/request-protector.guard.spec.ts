import {ExecutionContext, ForbiddenException} from '@nestjs/common';
import {RequestProtectorGuard, RequestProtectorOptions, clearTokenCache} from '../src';


function ctx(
  headers: Record<string, string | undefined>,
  extra: { ip?: string; remoteAddress?: string } = {},
): ExecutionContext {
  const req = {
    headers,
    ip: extra.ip,
    socket: { remoteAddress: extra.remoteAddress },
  };
  return {
    switchToHttp: () => ({
      getRequest: () => req,
      getResponse: () => ({}),
      getNext: () => undefined,
    }),
  } as unknown as ExecutionContext;
}

const UA_CHROME =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 ' +
  '(KHTML, like Gecko) Chrome/122.0 Safari/537.36';
const UA_CURL = 'curl/8.0.1';
const UA_IPHONE =
  'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 ' +
  '(KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1';
const UA_POSTMAN = 'PostmanRuntime/7.49.0';
const UA_GOOGLEBOT =
  'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)';

describe('RequestProtectorGuard', () => {
  beforeEach(() => clearTokenCache());

  const build = (opts: RequestProtectorOptions) => new RequestProtectorGuard(opts);

  it('allows everything when allowedClients and allowedPlatforms are "*"', async () => {
    const guard = build({allowedClients: '*', allowedPlatforms: '*'});
    await expect(guard.canActivate(ctx({'user-agent': UA_CURL}))).resolves.toBe(true);
  });

  it('rejects empty user-agent when denyEmptyUserAgent is true', async () => {
    const guard = build({
      allowedClients: '*',
      denyEmptyUserAgent: true,
    });
    await expect(guard.canActivate(ctx({}))).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('rejects user-agent longer than maxUserAgentLength', async () => {
    const guard = build({
      allowedClients: '*',
      maxUserAgentLength: 10,
    });
    await expect(
      guard.canActivate(ctx({'user-agent': 'a'.repeat(11)})),
    ).rejects.toThrow(/malformed User-Agent/);
  });

  it('rejects when device token does not match', async () => {
    const guard = build({
      allowedClients: '*',
      allowedDeviceTokens: ['secret'],
    });
    await expect(
      guard.canActivate(ctx({'user-agent': UA_CHROME, 'x-device-token': 'wrong'})),
    ).rejects.toThrow(/untrusted device/);
  });

  it('accepts when device token matches', async () => {
    const guard = build({
      allowedClients: '*',
      allowedDeviceTokens: ['secret'],
    });
    await expect(
      guard.canActivate(ctx({'user-agent': UA_CHROME, 'x-device-token': 'secret'})),
    ).resolves.toBe(true);
  });

  it('honours custom deviceTokenHeader', async () => {
    const guard = build({
      allowedClients: '*',
      allowedDeviceTokens: ['secret'],
      deviceTokenHeader: 'x-api-key',
    });
    await expect(
      guard.canActivate(ctx({'user-agent': UA_CHROME, 'x-api-key': 'secret'})),
    ).resolves.toBe(true);
  });

  it('blocks curl when scripts not allowed', async () => {
    const guard = build({
      allowedClients: {browser: true},
      allowedPlatforms: '*',
    });
    await expect(
      guard.canActivate(ctx({'user-agent': UA_CURL})),
    ).rejects.toThrow(/unauthorized or unsupported client/);
  });

  it('allows curl when scripts: ["curl"]', async () => {
    const guard = build({
      allowedClients: {scripts: ['curl']},
      allowedPlatforms: '*',
    });
    await expect(guard.canActivate(ctx({'user-agent': UA_CURL}))).resolves.toBe(true);
  });

  it('allows Chrome on desktop with allowedPlatforms.desktop = true', async () => {
    const guard = build({
      allowedClients: {browser: ['chrome']},
      allowedPlatforms: {desktop: true},
    });
    await expect(guard.canActivate(ctx({'user-agent': UA_CHROME}))).resolves.toBe(true);
  });

  it('rejects iPhone when only desktop: ["windows"] is allowed', async () => {
    const guard = build({
      allowedClients: '*',
      allowedPlatforms: {desktop: ['windows']},
    });
    await expect(
      guard.canActivate(ctx({'user-agent': UA_IPHONE})),
    ).rejects.toThrow(/unauthorized or unsupported platform/);
  });

  it('allows iPhone when mobile: ["iphone"]', async () => {
    const guard = build({
      allowedClients: '*',
      allowedPlatforms: {mobile: ['iphone']},
    });
    await expect(guard.canActivate(ctx({'user-agent': UA_IPHONE}))).resolves.toBe(true);
  });

  it('allows via customs platform substring match (case-insensitive)', async () => {
    const guard = build({
      allowedClients: '*',
      allowedPlatforms: {customs: ['MyIotDevice']},
    });
    await expect(
      guard.canActivate(ctx({'user-agent': 'MyIOTDevice/1.0'})),
    ).resolves.toBe(true);
  });

  it('allows Postman client only when scripts: ["postman"]', async () => {
    const guard = build({
      allowedClients: {scripts: ['postman']},
      allowedPlatforms: '*',
    });
    await expect(guard.canActivate(ctx({'user-agent': UA_POSTMAN}))).resolves.toBe(true);
  });

  it('allows Googlebot when bots: ["googlebot"]', async () => {
    const guard = build({
      allowedClients: {bots: ['googlebot']},
      allowedPlatforms: '*',
    });
    await expect(guard.canActivate(ctx({'user-agent': UA_GOOGLEBOT}))).resolves.toBe(true);
  });

  it('rejects Googlebot when bots not allowed', async () => {
    const guard = build({
      allowedClients: {browser: true},
      allowedPlatforms: '*',
    });
    await expect(
      guard.canActivate(ctx({'user-agent': UA_GOOGLEBOT})),
    ).rejects.toThrow(/unauthorized or unsupported client/);
  });

  it('supports fetchAllowedTokens', async () => {
    const fetcher = jest.fn().mockResolvedValue(['remote-token']);
    const guard = build({
      allowedClients: '*',
      allowedDeviceTokens: [],
      fetchAllowedTokens: fetcher,
    });
    await expect(
      guard.canActivate(
        ctx({'user-agent': UA_CHROME, 'x-device-token': 'remote-token'}),
      ),
    ).resolves.toBe(true);
    expect(fetcher).toHaveBeenCalledTimes(1);
  });
});

describe('RequestProtectorGuard – IP allow/deny', () => {
  beforeEach(() => clearTokenCache());
  const build = (opts: RequestProtectorOptions) => new RequestProtectorGuard(opts);

  it('blocks blacklisted IPs', async () => {
    const guard = build({
      allowedClients: '*',
      ipBlacklist: ['10.0.0.0/8'],
    });
    await expect(
      guard.canActivate(ctx({ 'user-agent': UA_CHROME }, { ip: '10.5.5.5' })),
    ).rejects.toThrow(/blacklisted IP/);
  });

  it('allows non-blacklisted IPs', async () => {
    const guard = build({
      allowedClients: '*',
      ipBlacklist: ['10.0.0.0/8'],
    });
    await expect(
      guard.canActivate(ctx({ 'user-agent': UA_CHROME }, { ip: '8.8.8.8' })),
    ).resolves.toBe(true);
  });

  it('rejects when IP is not in whitelist', async () => {
    const guard = build({
      allowedClients: '*',
      ipWhitelist: ['192.168.1.0/24'],
    });
    await expect(
      guard.canActivate(ctx({ 'user-agent': UA_CHROME }, { ip: '10.0.0.1' })),
    ).rejects.toThrow(/IP not in whitelist/);
  });

  it('accepts when IP is in whitelist', async () => {
    const guard = build({
      allowedClients: '*',
      ipWhitelist: ['192.168.1.0/24'],
    });
    await expect(
      guard.canActivate(ctx({ 'user-agent': UA_CHROME }, { ip: '192.168.1.42' })),
    ).resolves.toBe(true);
  });

  it('blacklist wins over whitelist when both match', async () => {
    const guard = build({
      allowedClients: '*',
      ipWhitelist: ['10.0.0.0/8'],
      ipBlacklist: ['10.0.0.5'],
    });
    await expect(
      guard.canActivate(ctx({ 'user-agent': UA_CHROME }, { ip: '10.0.0.5' })),
    ).rejects.toThrow(/blacklisted IP/);
  });

  it('reads IP from trustedProxyIpHeader (first entry of X-Forwarded-For)', async () => {
    const guard = build({
      allowedClients: '*',
      ipWhitelist: ['203.0.113.5'],
      trustedProxyIpHeader: 'x-forwarded-for',
    });
    await expect(
      guard.canActivate(
        ctx(
          { 'user-agent': UA_CHROME, 'x-forwarded-for': '203.0.113.5, 10.0.0.1' },
          { ip: '127.0.0.1' },
        ),
      ),
    ).resolves.toBe(true);
  });

  it('falls back to req.socket.remoteAddress when req.ip is missing', async () => {
    const guard = build({
      allowedClients: '*',
      ipBlacklist: ['1.2.3.4'],
    });
    await expect(
      guard.canActivate(ctx({ 'user-agent': UA_CHROME }, { remoteAddress: '1.2.3.4' })),
    ).rejects.toThrow(/blacklisted IP/);
  });

  it('treats ::ffff:-mapped IPv4 addresses as IPv4 for matching', async () => {
    const guard = build({
      allowedClients: '*',
      ipBlacklist: ['10.0.0.5'],
    });
    await expect(
      guard.canActivate(ctx({ 'user-agent': UA_CHROME }, { ip: '::ffff:10.0.0.5' })),
    ).rejects.toThrow(/blacklisted IP/);
  });
});

describe('RequestProtectorGuard – User-Agent allow/deny', () => {
  beforeEach(() => clearTokenCache());
  const build = (opts: RequestProtectorOptions) => new RequestProtectorGuard(opts);

  it('blocks UAs matching userAgentBlacklist substring (case-insensitive)', async () => {
    const guard = build({
      allowedClients: '*',
      userAgentBlacklist: ['EvilScanner'],
    });
    await expect(
      guard.canActivate(ctx({ 'user-agent': 'evilscanner/1.0' })),
    ).rejects.toThrow(/blacklisted User-Agent/);
  });

  it('blocks UAs matching a userAgentBlacklist RegExp', async () => {
    const guard = build({
      allowedClients: '*',
      userAgentBlacklist: [/^badbot/i],
    });
    await expect(
      guard.canActivate(ctx({ 'user-agent': 'BadBot/2.0' })),
    ).rejects.toThrow(/blacklisted User-Agent/);
  });

  it('lets non-matching UAs through the deny-list', async () => {
    const guard = build({
      allowedClients: '*',
      userAgentBlacklist: ['EvilScanner'],
    });
    await expect(
      guard.canActivate(ctx({ 'user-agent': UA_CHROME })),
    ).resolves.toBe(true);
  });

  it('userAgentWhitelist bypasses platform/client checks', async () => {
    const guard = build({
      // Would normally block curl, but the UA is explicitly trusted:
      allowedClients: { browser: ['chrome'] },
      allowedPlatforms: { desktop: ['windows'] },
      userAgentWhitelist: ['MyInternalMonitor'],
    });
    await expect(
      guard.canActivate(ctx({ 'user-agent': 'MyInternalMonitor/1.0 (curl)' })),
    ).resolves.toBe(true);
  });

  it('userAgentWhitelist still respects device-token requirement', async () => {
    const guard = build({
      allowedClients: '*',
      allowedDeviceTokens: ['secret'],
      userAgentWhitelist: ['MyInternalMonitor'],
    });
    await expect(
      guard.canActivate(ctx({ 'user-agent': 'MyInternalMonitor/1.0' })),
    ).rejects.toThrow(/untrusted device/);
  });

  it('userAgentBlacklist wins over userAgentWhitelist', async () => {
    const guard = build({
      allowedClients: '*',
      userAgentBlacklist: ['curl'],
      userAgentWhitelist: ['curl'],
    });
    await expect(
      guard.canActivate(ctx({ 'user-agent': 'curl/8.0' })),
    ).rejects.toThrow(/blacklisted User-Agent/);
  });
});


