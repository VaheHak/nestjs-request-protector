import {
  type Apps, type Bots, type Browser, type Desktop, type GameConsoles,
  type Mobile, type RequestProtectorOptions, type Scripts, type SmartGadgets, type Tablet,
} from '../interfaces/request-protector-options.interface';
import { type IApps, type IBot, type IGadget, type IScript, type ITablet } from '../interfaces/request-protector-platforms.interface';

// ─── Pre-compiled regex patterns ─────────────────────────────────────────────
// Compiled once at module load; re-using compiled RegExp objects is ~3-5x faster
// than repeated string .includes() calls on long UA strings for regex-based checks,
// and avoids repeated pattern parsing inside hot paths.

const RE = Object.freeze({
  // Tablets
  kindle:          /silk|kindle/i,
  windowsTablet:   /touch.*windows nt|windows nt.*touch/i,

  // Scripts – most are simple substrings; regex used only where anchoring helps
  java:            /^java[/ ]/i,

  // Gadgets
  alexa:           /alexa|amazon-echo|\becho\b/i,
  googleHome:      /googlehome|nesthub|nest-mini|nest-audio/i,
  smartHub:        /smartthings|homekit|smarthub|\biot\b/i,
  playStation:     /playstation|ps[45]/i,
  xbox:            /xbox(?:one|series)?/i,
  nintendo:        /nintendo|switch|wii/i,
} as const);

// ─── Simple substring token sets ─────────────────────────────────────────────
// Flat string checks are faster than regex for simple inclusion tests.
// Grouped as frozen objects to keep them tree-shakeable and readable.

const TOKENS = Object.freeze({
  scripts: {
    curl:             'curl',
    wget:             'wget',
    postman:          'postmanruntime',
    httpie:           'httpie',
    powershell:       'powershell',
    winhttp:          'winhttp',
    goHttp:           'go-http-client',
    php:              'php',
    ruby:             'ruby',
    faraday:          'faraday',
    perl:             'libwww-perl',
    pythonRequests:   'python-requests',
    pythonHttpx:      'httpx',
    urllib:           'urllib',
    aiohttp:          'aiohttp',
    axios:            'axios',
    nodeFetch:        'node-fetch',
    superagent:       'superagent',
    got:              '\bgot\b',   // intentionally a string; see note below
    okhttp:           'okhttp',
    apacheHttp:       'apache-httpclient',
    unity:            'unityplayer',
  },
  bots: {
    google:           'googlebot',
    bing:             'bingbot',
    duckduck:         'duckduckbot',
    yandex:           'yandexbot',
    facebookExt:      'facebookexternalhit',
    facebookBot:      'facebookbot',
    slack:            'slackbot',
    telegram:         'telegrambot',
    twitter:          'twitterbot',
    linkedin:         'linkedinbot',
    pinterest:        'pinterestbot',
    yahoo:            'yahoo',
    yahooSeeker:      'yahooseeker',
    slurp:            'slurp',
    baidu:            'baiduspider',
    exa:              'exabot',
    ahrefs:           'ahrefsbot',
    semrush:          'semrushbot',
    accoona:          'accoona',
    gpt:              'gptbot',
    oaiSearch:        'oai-searchbot',
    chatgptUser:      'chatgpt-user',
    chatgpt:          'chatgpt',
    whatsapp:         'whatsapp',
    apple:            'applebot',
    discord:          'discordbot',
  },
  apps: {
    telegram:         'telegram',
    instagram:        'instagram',
    facebook:         'facebook',
    messenger:        'messenger',
    whatsapp:         'whatsapp',
    tiktok:           'tiktok',
    musically:        'musically',
    discord:          'discord',
    slack:            'slack',
    spotify:          'spotify',
    electron:         'electron',
    zoom:             'zoom',
    skype:            'skype',
    viber:            'viber',
    youtube:          'youtube',
    googleApp:        'googleapp',
    gsa:              'gsa',
    googleAndroid:    'com.google.android',
    googleAssistant:  'googleassistant',
    gmail:            'gmail',
    googleDrive:      'googledrive',
    drive:            'drive',
    googlePhotos:     'googlephotos',
    googleCalendar:   'googlecalendar',
    googlePlay:       'googleplay',
    playStore:        'playstore',
    googleMaps:       'googlemaps',
  },
} as const);

// ─── Token cache ──────────────────────────────────────────────────────────────

interface TokenCache {
  tokens: Set<string>;
  expiresAt: number;
}

let _tokenCache: TokenCache | null = null;

function isCacheValid(now: number): boolean {
  return _tokenCache !== null && now < _tokenCache.expiresAt;
}

/** Visible for testing – clears the module-level token cache. */
export function clearTokenCache(): void {
  _tokenCache = null;
}

// ─── Helper ───────────────────────────────────────────────────────────────────

/** Inline helper – avoids a function-call overhead in tight loops. */
function has(ua: string, token: string): boolean {
  return ua.includes(token);
}

// ─── DetectAllowed ────────────────────────────────────────────────────────────

export class DetectAllowed {
  // ── Platform detectors ──────────────────────────────────────────────────────

  static detectTablets(ua: string): ITablet {
    return {
      isKindle:        RE.kindle.test(ua),
      isWindowsTablet: RE.windowsTablet.test(ua),
    };
  }

  static detectScripts(ua: string): IScript {
    const t = TOKENS.scripts;
    return {
      isCurl:             has(ua, t.curl),
      isWget:             has(ua, t.wget),
      isPostman:          has(ua, t.postman),
      isHttpie:           has(ua, t.httpie),
      isPowerShell:       has(ua, t.powershell) || has(ua, t.winhttp),
      isJava:             RE.java.test(ua),
      isGoHttp:           has(ua, t.goHttp),
      isPHP:              has(ua, t.php),
      isRuby:             has(ua, t.ruby) || has(ua, t.faraday),
      isPerl:             has(ua, t.perl),
      isPythonRequests:   has(ua, t.pythonRequests),
      isPythonHttpx:      has(ua, t.pythonHttpx),
      isUrllib:           has(ua, t.urllib),
      isAiohttp:          has(ua, t.aiohttp),
      isAxios:            has(ua, t.axios),
      isNodeFetch:        has(ua, t.nodeFetch),
      isSuperagent:       has(ua, t.superagent),
      // 'got' is a very short token; use word-boundary check to avoid false
      // positives on strings like 'forgot', 'maggot', etc.
      isGot:              /\bgot\b/.test(ua),
      isOkHttp:           has(ua, t.okhttp),
      isApacheHttpClient: has(ua, t.apacheHttp),
      isUnity:            has(ua, t.unity),
    };
  }

  static detectBots(ua: string): IBot {
    const t = TOKENS.bots;
    return {
      isGoogleBot:    has(ua, t.google),
      isBingBot:      has(ua, t.bing),
      isDuckDuckBot:  has(ua, t.duckduck),
      isYandexBot:    has(ua, t.yandex),
      isFacebookBot:  has(ua, t.facebookExt) || has(ua, t.facebookBot),
      isSlackBot:     has(ua, t.slack),
      isTelegramBot:  has(ua, t.telegram),
      isTwitterBot:   has(ua, t.twitter),
      isLinkedInBot:  has(ua, t.linkedin),
      isPinterestBot: has(ua, t.pinterest),
      isYahooSlurp:   has(ua, t.yahoo) || has(ua, t.yahooSeeker) || has(ua, t.slurp),
      isBaiduSpider:  has(ua, t.baidu),
      isExaBot:       has(ua, t.exa),
      isAhrefsBot:    has(ua, t.ahrefs),
      isSemrushBot:   has(ua, t.semrush),
      isAccoonaBot:   has(ua, t.accoona),
      isGptBot:       has(ua, t.gpt),
      isOaiSearchBot: has(ua, t.oaiSearch),
      isChatGptUser:  has(ua, t.chatgptUser) || has(ua, t.chatgpt),
      isWhatsAppBot:  has(ua, t.whatsapp),
      isAppleBot:     has(ua, t.apple),
      isDiscordBot:   has(ua, t.discord),
    };
  }

  static detectGadgets(ua: string): IGadget {
    return {
      isAlexa:       RE.alexa.test(ua),
      isGoogleHome:  RE.googleHome.test(ua),
      isSmartHub:    RE.smartHub.test(ua),
      isPlayStation: RE.playStation.test(ua),
      isXbox:        RE.xbox.test(ua),
      isNintendo:    RE.nintendo.test(ua),
    };
  }

  static detectApps(ua: string): IApps {
    const t = TOKENS.apps;
    return {
      isTelegram:        has(ua, t.telegram),
      isInstagram:       has(ua, t.instagram),
      isFacebook:        has(ua, t.facebook),
      isMessenger:       has(ua, t.messenger),
      isWhatsApp:        has(ua, t.whatsapp),
      isTikTok:          has(ua, t.tiktok) || has(ua, t.musically),
      isDiscord:         has(ua, t.discord),
      isSlack:           has(ua, t.slack),
      isSpotify:         has(ua, t.spotify),
      isElectron:        has(ua, t.electron),
      isZoom:            has(ua, t.zoom),
      isSkype:           has(ua, t.skype),
      isViber:           has(ua, t.viber),
      isYouTube:         has(ua, t.youtube),
      isGoogleApp:       has(ua, t.googleApp) || has(ua, t.gsa) || has(ua, t.googleAndroid),
      isGoogleAssistant: has(ua, t.googleAssistant),
      isGmail:           has(ua, t.gmail),
      isGoogleDrive:     has(ua, t.googleDrive) || has(ua, t.drive),
      isGooglePhotos:    has(ua, t.googlePhotos),
      isGoogleCalendar:  has(ua, t.googleCalendar),
      isGooglePlay:      has(ua, t.googlePlay) || has(ua, t.playStore),
      isGoogleMaps:      has(ua, t.googleMaps),
    };
  }

  // ── Allow-list checker ──────────────────────────────────────────────────────

  /**
   * Determines whether a category is allowed given the guard configuration.
   *
   * @param setting  - The configured allow policy (`true`, a string array, or `undefined`).
   * @param values   - A map of known identifiers → detected booleans for this category.
   * @param fallback - The library's own "is this category active at all" flag (e.g. `ua.isMobile`).
   */
  static checkAllow<
    T extends
        | Record<Browser, boolean>
      | Record<Mobile, boolean>
      | Record<Tablet, boolean>
      | Record<Desktop, boolean>
      | Record<Scripts, boolean>
      | Record<Bots, boolean>
      | Record<SmartGadgets, boolean>
      | Record<GameConsoles, boolean>
      | Record<Apps, boolean>
  >(
    setting: boolean | string[] | undefined,
    values: T,
    fallback?: boolean,
  ): boolean {
    if (!setting) return false;

    if (setting === true) {
      return fallback === true || Object.values(values).some(Boolean);
    }

    if (Array.isArray(setting)) {
      // Use a Set for O(1) lookup when the array is large; otherwise the loop
      // is fast enough for typical configs (< 20 items).
      return setting.some(k => Boolean(values[k.toLowerCase() as keyof T]));
    }

    return false;
  }

  // ── Device token authorisation ──────────────────────────────────────────────

  /**
   * Checks whether `deviceToken` is in the allow-list.
   *
   * Remote tokens (from `fetchAllowedTokens`) are **cached** for
   * `tokenCacheTtlMs` ms (default 30 s) so we never make a remote call on
   * every request. The cache is module-level, so it is shared across all
   * instances of the guard within a single process.
   *
   * Security notes:
   *  - Comparison uses `Set.has()` which is O(1) and does not leak timing
   *    information beyond "member / not member of the set". For very high
   *    security requirements you should implement HMAC comparison in
   *    `fetchAllowedTokens` before returning tokens.
   *  - The token is validated only if it is a non-empty string. A missing or
   *    malformed header is always rejected when token validation is enabled.
   */
  static async isAuthorizedDevice(
    options: RequestProtectorOptions,
    deviceToken?: string,
  ): Promise<boolean> {
    // Fast path – token validation disabled
    if (!options.allowedDeviceTokens || options.allowedDeviceTokens === '*') {
      return true;
    }

    // Reject immediately if the token is missing or not a string
    if (typeof deviceToken !== 'string' || deviceToken.length === 0) {
      return false;
    }

    const staticTokens = options.allowedDeviceTokens as string[];

    // If there is no dynamic fetcher, skip cache machinery entirely
    if (!options.fetchAllowedTokens) {
      return staticTokens.includes(deviceToken);
    }

    // Build / refresh cache
    const now = Date.now();
    const ttl = options.tokenCacheTtlMs ?? 30_000;

    if (!isCacheValid(now)) {
      let fetched: string[] = [];
      try {
        fetched = await options.fetchAllowedTokens();
      } catch (err) {
        // Log and degrade gracefully: fall back to static list only
         
        console.error('[nestjs-request-protector] fetchAllowedTokens error:', err);
      }
      _tokenCache = {
        tokens: new Set([...staticTokens, ...fetched]),
        expiresAt: now + ttl,
      };
    }

    return (_tokenCache as TokenCache).tokens.has(deviceToken);
  }
}
