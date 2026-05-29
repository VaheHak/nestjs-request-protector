import { DetectAllowed, clearTokenCache } from '../src/helpers/detect-allowed';
import { RequestProtectorOptions } from '../src';

describe('DetectAllowed.detectTablets', () => {
  it('detects Kindle / Silk', () => {
    expect(DetectAllowed.detectTablets('mozilla kindle silk/3.0')).toEqual({
      isKindle: true,
      isWindowsTablet: false,
    });
  });

  it('detects Windows tablet UA', () => {
    expect(
      DetectAllowed.detectTablets('mozilla/5.0 (windows nt 10.0; touch)'),
    ).toEqual({ isKindle: false, isWindowsTablet: true });
  });

  it('returns all false for a plain desktop UA', () => {
    expect(DetectAllowed.detectTablets('mozilla/5.0 (x11; linux x86_64)')).toEqual({
      isKindle: false,
      isWindowsTablet: false,
    });
  });
});

describe('DetectAllowed.detectScripts', () => {
  it('detects curl', () => {
    const r = DetectAllowed.detectScripts('curl/8.0.1');
    expect(r.isCurl).toBe(true);
    expect(r.isWget).toBe(false);
  });

  it('detects PostmanRuntime', () => {
    expect(DetectAllowed.detectScripts('postmanruntime/7.49.0').isPostman).toBe(true);
  });

  it('detects Java with anchored regex', () => {
    expect(DetectAllowed.detectScripts('java/17.0.2').isJava).toBe(true);
    // should NOT match javascript or random "java" inside another word
    expect(DetectAllowed.detectScripts('mozilla javascript v8').isJava).toBe(false);
  });

  it('uses word boundary for "got" to avoid false positives', () => {
    expect(DetectAllowed.detectScripts('got/12.0').isGot).toBe(true);
    expect(DetectAllowed.detectScripts('mozilla forgot maggot').isGot).toBe(false);
  });

  it('detects PowerShell / WinHTTP', () => {
    expect(DetectAllowed.detectScripts('mozilla/5.0 winhttp').isPowerShell).toBe(true);
    expect(DetectAllowed.detectScripts('powershell/7.4').isPowerShell).toBe(true);
  });

  it('detects axios, node-fetch, okhttp, unity', () => {
    expect(DetectAllowed.detectScripts('axios/1.6.0').isAxios).toBe(true);
    expect(DetectAllowed.detectScripts('node-fetch/3.0').isNodeFetch).toBe(true);
    expect(DetectAllowed.detectScripts('okhttp/4.10').isOkHttp).toBe(true);
    expect(DetectAllowed.detectScripts('unityplayer/2022.3').isUnity).toBe(true);
  });
});

describe('DetectAllowed.detectBots', () => {
  it('detects Googlebot', () => {
    expect(DetectAllowed.detectBots('mozilla/5.0 googlebot/2.1').isGoogleBot).toBe(true);
  });

  it('detects facebook external hit and facebookbot', () => {
    expect(DetectAllowed.detectBots('facebookexternalhit/1.1').isFacebookBot).toBe(true);
    expect(DetectAllowed.detectBots('facebookbot/1.0').isFacebookBot).toBe(true);
  });

  it('detects ChatGPT user agents', () => {
    expect(DetectAllowed.detectBots('mozilla chatgpt-user/1.0').isChatGptUser).toBe(true);
    expect(DetectAllowed.detectBots('mozilla chatgpt').isChatGptUser).toBe(true);
  });

  it('returns false on plain browser UA', () => {
    const r = DetectAllowed.detectBots('mozilla/5.0 chrome/120');
    expect(Object.values(r).every(v => v === false)).toBe(true);
  });
});

describe('DetectAllowed.detectGadgets', () => {
  it('detects Alexa via various tokens', () => {
    expect(DetectAllowed.detectGadgets('amazon-echo/1.0').isAlexa).toBe(true);
    expect(DetectAllowed.detectGadgets('alexa device').isAlexa).toBe(true);
    expect(DetectAllowed.detectGadgets('mozilla echo browser').isAlexa).toBe(true);
  });

  it('detects PlayStation and Xbox', () => {
    expect(DetectAllowed.detectGadgets('ps5 browser').isPlayStation).toBe(true);
    expect(DetectAllowed.detectGadgets('playstation 4').isPlayStation).toBe(true);
    expect(DetectAllowed.detectGadgets('xboxseries').isXbox).toBe(true);
  });

  it('detects Nintendo', () => {
    expect(DetectAllowed.detectGadgets('nintendo switch').isNintendo).toBe(true);
    expect(DetectAllowed.detectGadgets('wii u browser').isNintendo).toBe(true);
  });
});

describe('DetectAllowed.detectApps', () => {
  it('detects Telegram and Instagram', () => {
    expect(DetectAllowed.detectApps('telegramios/9.0').isTelegram).toBe(true);
    expect(DetectAllowed.detectApps('instagram 250.0').isInstagram).toBe(true);
  });

  it('detects TikTok via "musically"', () => {
    expect(DetectAllowed.detectApps('musically/2023').isTikTok).toBe(true);
    expect(DetectAllowed.detectApps('tiktok/27.0').isTikTok).toBe(true);
  });

  it('detects Google App via gsa / com.google.android', () => {
    expect(DetectAllowed.detectApps('gsa/14.0 ios').isGoogleApp).toBe(true);
    expect(DetectAllowed.detectApps('com.google.android.gm').isGoogleApp).toBe(true);
  });
});

describe('DetectAllowed.checkAllow', () => {
  it('returns false when setting is undefined or false', () => {
    expect(DetectAllowed.checkAllow(undefined, { chrome: true } as any)).toBe(false);
    expect(DetectAllowed.checkAllow(false, { chrome: true } as any)).toBe(false);
  });

  it('returns true when setting === true and any value is true', () => {
    expect(DetectAllowed.checkAllow(true, { chrome: true, firefox: false } as any)).toBe(true);
  });

  it('returns true when setting === true via fallback', () => {
    expect(DetectAllowed.checkAllow(true, { chrome: false } as any, true)).toBe(true);
  });

  it('returns false when setting === true and nothing matches', () => {
    expect(DetectAllowed.checkAllow(true, { chrome: false, firefox: false } as any, false)).toBe(false);
  });

  it('returns true when array setting contains a matching key', () => {
    expect(
      DetectAllowed.checkAllow(['chrome'] as any, { chrome: true, firefox: false } as any),
    ).toBe(true);
  });

  it('returns false when array setting contains no matching keys', () => {
    expect(
      DetectAllowed.checkAllow(['firefox'] as any, { chrome: true, firefox: false } as any),
    ).toBe(false);
  });

  it('handles case-insensitive array keys', () => {
    expect(
      DetectAllowed.checkAllow(['CHROME'] as any, { chrome: true } as any),
    ).toBe(true);
  });
});

describe('DetectAllowed.isAuthorizedDevice', () => {
  beforeEach(() => clearTokenCache());

  const baseOpts = (extra: Partial<RequestProtectorOptions> = {}): RequestProtectorOptions => ({
    allowedClients: '*',
    ...extra,
  });

  it('returns true when allowedDeviceTokens is undefined', async () => {
    await expect(DetectAllowed.isAuthorizedDevice(baseOpts(), undefined)).resolves.toBe(true);
  });

  it('returns true when allowedDeviceTokens is "*"', async () => {
    await expect(
      DetectAllowed.isAuthorizedDevice(baseOpts({ allowedDeviceTokens: '*' }), 'anything'),
    ).resolves.toBe(true);
  });

  it('rejects missing token when list is configured', async () => {
    await expect(
      DetectAllowed.isAuthorizedDevice(baseOpts({ allowedDeviceTokens: ['a'] }), undefined),
    ).resolves.toBe(false);
    await expect(
      DetectAllowed.isAuthorizedDevice(baseOpts({ allowedDeviceTokens: ['a'] }), ''),
    ).resolves.toBe(false);
  });

  it('uses the static list when no fetcher provided', async () => {
    const opts = baseOpts({ allowedDeviceTokens: ['t1', 't2'] });
    await expect(DetectAllowed.isAuthorizedDevice(opts, 't1')).resolves.toBe(true);
    await expect(DetectAllowed.isAuthorizedDevice(opts, 'nope')).resolves.toBe(false);
  });

  it('merges fetched tokens and caches them', async () => {
    const fetcher = jest.fn().mockResolvedValue(['remote-1']);
    const opts = baseOpts({
      allowedDeviceTokens: ['local-1'],
      fetchAllowedTokens: fetcher,
      tokenCacheTtlMs: 10_000,
    });

    await expect(DetectAllowed.isAuthorizedDevice(opts, 'local-1')).resolves.toBe(true);
    await expect(DetectAllowed.isAuthorizedDevice(opts, 'remote-1')).resolves.toBe(true);
    await expect(DetectAllowed.isAuthorizedDevice(opts, 'unknown')).resolves.toBe(false);

    // Cached: should only have been called once
    expect(fetcher).toHaveBeenCalledTimes(1);
  });

  it('handles fetcher errors gracefully', async () => {
    const errSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    const fetcher = jest.fn().mockRejectedValue(new Error('boom'));
    const opts = baseOpts({
      allowedDeviceTokens: ['fallback'],
      fetchAllowedTokens: fetcher,
    });

    await expect(DetectAllowed.isAuthorizedDevice(opts, 'fallback')).resolves.toBe(true);
    await expect(DetectAllowed.isAuthorizedDevice(opts, 'remote')).resolves.toBe(false);
    expect(errSpy).toHaveBeenCalled();
    errSpy.mockRestore();
  });
});

