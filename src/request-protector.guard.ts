import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Inject,
  Injectable,
} from '@nestjs/common';
import { Request } from 'express';
import useragent from 'express-useragent';
import { DetectAllowed } from './helpers/detect-allowed';
import { ipMatches, normaliseIp } from './helpers/ip-match';
import { RequestProtectorOptions } from './interfaces/request-protector-options.interface';
import { IAllowedClients, IAllowedPlatforms } from './interfaces/request-protector-platforms.interface';

export const REQUEST_PROTECTOR_OPTIONS = 'REQUEST_PROTECTOR_OPTIONS';

/** Maximum User-Agent header length accepted when no explicit limit is set. */
const DEFAULT_MAX_UA_LENGTH = 512;

/** Resolve the originating client IP, honouring an optional proxy header. */
function resolveClientIp(req: Request, header?: string): string {
  if (header) {
    const raw = req.headers[header.toLowerCase()];
    const value = Array.isArray(raw) ? raw[0] : raw;
    if (typeof value === 'string' && value.length > 0) {
      // X-Forwarded-For may contain "client, proxy1, proxy2"
      const first = value.split(',')[0]?.trim();
      if (first) return normaliseIp(first);
    }
  }
  if (typeof req.ip === 'string' && req.ip.length > 0) return normaliseIp(req.ip);
  const sockAddr = req.socket?.remoteAddress;
  return normaliseIp(sockAddr);
}

/** Returns true if any rule matches the given UA (case-insensitive substrings or RegExp). */
function matchesUaRule(uaLower: string, rules: ReadonlyArray<string | RegExp>): boolean {
  for (const rule of rules) {
    if (typeof rule === 'string') {
      if (rule.length > 0 && uaLower.includes(rule.toLowerCase())) return true;
    } else if (rule instanceof RegExp) {
      // Test against the original (non-lowercased) UA to respect case-sensitive patterns.
      if (rule.test(uaLower)) return true;
    }
  }
  return false;
}

@Injectable()
export class RequestProtectorGuard implements CanActivate {
  constructor(
    @Inject(REQUEST_PROTECTOR_OPTIONS)
    private readonly options: RequestProtectorOptions,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<Request>();

    // ── 1. User-Agent sanity checks (cheap; done before any parsing) ──────────

    const uaRaw: string = (req.headers['user-agent'] as string | undefined) ?? '';
    const maxUaLen = this.options.maxUserAgentLength ?? DEFAULT_MAX_UA_LENGTH;

    // Reject absurdly long UA strings – header-stuffing / DoS mitigation
    if (uaRaw.length > maxUaLen) {
      throw new ForbiddenException('Access denied: malformed User-Agent');
    }

    if (this.options.denyEmptyUserAgent && uaRaw.length === 0) {
      throw new ForbiddenException('Access denied: missing User-Agent');
    }

    // ── 1b. IP allow / deny lists (cheap; before any async work) ──────────────

    const blacklistIps = this.options.ipBlacklist;
    const whitelistIps = this.options.ipWhitelist;

    if (
      (blacklistIps && blacklistIps.length > 0) ||
      (whitelistIps && whitelistIps.length > 0)
    ) {
      const clientIp = resolveClientIp(req, this.options.trustedProxyIpHeader);

      if (blacklistIps && blacklistIps.length > 0 && ipMatches(clientIp, blacklistIps)) {
        throw new ForbiddenException('Access denied: blacklisted IP');
      }
      if (whitelistIps && whitelistIps.length > 0 && !ipMatches(clientIp, whitelistIps)) {
        throw new ForbiddenException('Access denied: IP not in whitelist');
      }
    }

    // ── 1c. User-Agent allow / deny patterns (substring or RegExp) ────────────

    const uaLowerEarly = uaRaw.toLowerCase();
    const uaBlacklist = this.options.userAgentBlacklist;
    if (uaBlacklist && uaBlacklist.length > 0 && matchesUaRule(uaLowerEarly, uaBlacklist)) {
      throw new ForbiddenException('Access denied: blacklisted User-Agent');
    }

    const uaWhitelist = this.options.userAgentWhitelist;
    const uaTrusted =
      !!uaWhitelist && uaWhitelist.length > 0 && matchesUaRule(uaLowerEarly, uaWhitelist);

    // ── 2. Device-token check (async; done before expensive UA parsing) ───────

    const tokenHeader = this.options.deviceTokenHeader ?? 'x-device-token';
    const deviceToken = req.headers[tokenHeader] as string | undefined;

    if (!(await DetectAllowed.isAuthorizedDevice(this.options, deviceToken))) {
      throw new ForbiddenException('Access denied: untrusted device');
    }

    // ── 3. Short-circuit when everything is allowed ───────────────────────────

    const platforms: IAllowedPlatforms | '*' = this.options.allowedPlatforms ?? '*';
    const clients: IAllowedClients | '*' = this.options.allowedClients ?? '*';

    // Trusted-UA short-circuit: skip platform/client checks entirely.
    if (uaTrusted) return true;

    if (platforms === '*' && clients === '*') return true;

    // ── 4. Parse the UA (only reached when we actually need it) ───────────────
    //
    // All detect* helpers receive the already-lowercased string so they never
    // call .toLowerCase() more than once per request.

    const uaLower = uaLowerEarly;
    const ua = {
      ...useragent.parse(uaRaw),
      ...DetectAllowed.detectTablets(uaLower),
      ...DetectAllowed.detectScripts(uaLower),
      ...DetectAllowed.detectBots(uaLower),
      ...DetectAllowed.detectGadgets(uaLower),
      ...DetectAllowed.detectApps(uaLower),
    };

    // ── 5. Platform checks ────────────────────────────────────────────────────

    if (platforms !== '*') {
      const mobileAllowed = DetectAllowed.checkAllow(
        platforms.mobile,
        {
          iphone:        ua.isiPhone,
          ipod:          ua.isiPod,
          ipad:          ua.isiPad,
          android:       ua.isAndroid,
          androidtablet: ua.isAndroidTablet,
          windowsphone:  ua.isWindowsPhone,
          bada:          ua.isBada,
          samsung:       ua.isSamsung,
          kindlefire:    ua.isKindleFire,
          silk:          ua.isSilk,
        },
        ua.isMobile,
      );

      const tabletAllowed = DetectAllowed.checkAllow(
        platforms.tablet,
        {
          ipad:          ua.isiPad,
          androidtablet: ua.isAndroidTablet,
          kindle:        ua.isKindle,
          windowstablet: ua.isWindowsTablet,
        },
        ua.isTablet,
      );

      const desktopAllowed = DetectAllowed.checkAllow(
        platforms.desktop,
        {
          windows:   ua.isWindows,
          mac:       ua.isMac,
          linux:     ua.isLinux || ua.isLinux64,
          chromeos:  ua.isChromeOS,
          raspberry: ua.isRaspberry,
        },
        ua.isDesktop,
      );

      const smartGadgetsAllowed = DetectAllowed.checkAllow(
        platforms.smartGadgets,
        {
          alexa:      ua.isAlexa,
          googlehome: ua.isGoogleHome,
          echo:       ua.isAlexa,
          nest:       ua.isGoogleHome,
          smarthub:   ua.isSmartHub,
          iot:        ua.isSmartHub,
        },
      );

      const gameConsolesAllowed = DetectAllowed.checkAllow(
        platforms.gameConsoles,
        {
          playstation: ua.isPlayStation,
          ps5:         ua.isPlayStation,
          ps4:         ua.isPlayStation,
          xbox:        ua.isXbox,
          nintendo:    ua.isNintendo,
          switch:      ua.isNintendo,
          wii:         ua.isNintendo,
        },
      );

      const smartTVAllowed = !!platforms.smartTV && ua.isSmartTV;

      // Custom platform strings – guard against prototype-pollution via user input
      const customsAllowed =
        Array.isArray(platforms.customs) &&
        platforms.customs.some(
          v => typeof v === 'string' && v.length > 0 && uaLower.includes(v.toLowerCase()),
        );

      if (
        !mobileAllowed &&
        !tabletAllowed &&
        !desktopAllowed &&
        !smartTVAllowed &&
        !smartGadgetsAllowed &&
        !gameConsolesAllowed &&
        !customsAllowed
      ) {
        throw new ForbiddenException('Access denied: unauthorized or unsupported platform');
      }
    }

    // ── 6. Client checks ──────────────────────────────────────────────────────

    if (clients !== '*') {
      const browserAllowed = DetectAllowed.checkAllow(clients.browser, {
        chrome:    ua.isChrome,
        firefox:   ua.isFirefox,
        safari:    ua.isSafari,
        edge:      ua.isEdge,
        opera:     ua.isOpera,
        ie:        ua.isIE,
        konqueror: ua.isKonqueror,
        omniweb:   ua.isOmniWeb,
        seamonkey: ua.isSeaMonkey,
        flock:     ua.isFlock,
        amaya:     ua.isAmaya,
        epiphany:  ua.isEpiphany,
      });

      const scriptsAllowed = DetectAllowed.checkAllow(clients.scripts, {
        curl:                ua.isCurl,
        wget:                ua.isWget,
        postman:             ua.isPostman,
        httpie:              ua.isHttpie,
        powershell:          ua.isPowerShell,
        java:                ua.isJava,
        'go-http-client':    ua.isGoHttp,
        php:                 ua.isPHP,
        ruby:                ua.isRuby,
        perl:                ua.isPerl,
        'python-requests':   ua.isPythonRequests,
        'python-httpx':      ua.isPythonHttpx,
        urllib:              ua.isUrllib,
        aiohttp:             ua.isAiohttp,
        axios:               ua.isAxios,
        'node-fetch':        ua.isNodeFetch,
        superagent:          ua.isSuperagent,
        got:                 ua.isGot,
        okhttp:              ua.isOkHttp,
        'apache-httpclient': ua.isApacheHttpClient,
        unity:               ua.isUnity,
      });

      const botsAllowed = DetectAllowed.checkAllow(
        clients.bots,
        {
          googlebot:        ua.isGoogleBot,
          bingbot:          ua.isBingBot,
          duckduckbot:      ua.isDuckDuckBot,
          yandexbot:        ua.isYandexBot,
          facebookbot:      ua.isFacebookBot,
          slackbot:         ua.isSlackBot,
          telegrambot:      ua.isTelegramBot,
          twitterbot:       ua.isTwitterBot,
          linkedinbot:      ua.isLinkedInBot,
          pinterestbot:     ua.isPinterestBot,
          'yahoo-slurp':    ua.isYahooSlurp,
          baiduspider:      ua.isBaiduSpider,
          exabot:           ua.isExaBot,
          ahrefsbot:        ua.isAhrefsBot,
          semrushbot:       ua.isSemrushBot,
          accoona:          ua.isAccoonaBot,
          gptbot:           ua.isGptBot,
          'oai-searchbot':  ua.isOaiSearchBot,
          'chatgpt-user':   ua.isChatGptUser,
          whatsappbot:      ua.isWhatsAppBot,
          applebot:         ua.isAppleBot,
          discordbot:       ua.isDiscordBot,
        },
        ua.isBot,
      );

      const appsAllowed = DetectAllowed.checkAllow(clients.apps, {
        telegram:        ua.isTelegram,
        instagram:       ua.isInstagram,
        facebook:        ua.isFacebook,
        messenger:       ua.isMessenger,
        whatsapp:        ua.isWhatsApp,
        tiktok:          ua.isTikTok,
        discord:         ua.isDiscord,
        slack:           ua.isSlack,
        spotify:         ua.isSpotify,
        electron:        ua.isElectron,
        zoom:            ua.isZoom,
        skype:           ua.isSkype,
        viber:           ua.isViber,
        youtube:         ua.isYouTube,
        googleapp:       ua.isGoogleApp,
        googleassistant: ua.isGoogleAssistant,
        gmail:           ua.isGmail,
        googledrive:     ua.isGoogleDrive,
        googlephotos:    ua.isGooglePhotos,
        googlecalendar:  ua.isGoogleCalendar,
        googleplay:      ua.isGooglePlay,
        googlemaps:      ua.isGoogleMaps,
      });

      const customsAllowed =
        Array.isArray(clients.customs) &&
        clients.customs.some(
          v => typeof v === 'string' && v.length > 0 && uaLower.includes(v.toLowerCase()),
        );

      if (!browserAllowed && !scriptsAllowed && !botsAllowed && !appsAllowed && !customsAllowed) {
        throw new ForbiddenException('Access denied: unauthorized or unsupported client');
      }
    }

    return true;
  }
}
