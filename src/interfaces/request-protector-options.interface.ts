import { type IAllowedClients, type IAllowedPlatforms } from './request-protector-platforms.interface';

export interface RequestProtectorOptions {
  /**
   * Header name used for the device token.
   * @default 'x-device-token'
   */
  deviceTokenHeader?: string;

  /**
   * Static list of allowed device tokens, or '*' to allow all.
   */
  allowedDeviceTokens?: '*' | string[];

  /**
   * Duration in ms to cache tokens fetched via fetchAllowedTokens.
   * Set to 0 to disable caching (not recommended for high-traffic apps).
   * @default 30000
   */
  tokenCacheTtlMs?: number;

  /**
   * Allowed clients (browsers, scripts, bots, apps).
   * Use '*' to allow everything.
   */
  allowedClients: '*' | IAllowedClients;

  /**
   * Allowed platforms (mobile, desktop, tablet, etc.).
   * Defaults to '*' (all allowed).
   * @default '*'
   */
  allowedPlatforms?: '*' | IAllowedPlatforms;

  /**
   * Async function to fetch additional allowed device tokens from a remote
   * source (e.g. a database or secrets manager). Results are cached for
   * `tokenCacheTtlMs` ms to avoid a remote call on every request.
   */
  fetchAllowedTokens?: () => Promise<string[]>;

  /**
   * Maximum length (bytes) accepted for the User-Agent header.
   * Requests with a longer UA string are rejected to prevent header-stuffing attacks.
   * @default 512
   */
  maxUserAgentLength?: number;

  /**
   * When true, an empty or missing User-Agent header is denied.
   * @default false
   */
  denyEmptyUserAgent?: boolean;

  /**
   * IP allow-list. Accepts exact IPv4/IPv6 addresses and IPv4 CIDR blocks
   * (e.g. `'10.0.0.0/8'`, `'192.168.1.0/24'`).
   *
   * If provided, **only** requests whose client IP matches one of these
   * entries are allowed; everything else is rejected before any User-Agent
   * parsing happens.
   *
   * Leave undefined to disable the check.
   */
  ipWhitelist?: string[];

  /**
   * IP deny-list. Same format as `ipWhitelist`. Matching requests are
   * rejected immediately. Evaluated **before** `ipWhitelist`.
   */
  ipBlacklist?: string[];

  /**
   * User-Agent allow-list. Each entry is either a case-insensitive substring
   * or a `RegExp`. When a UA matches, the request is considered **trusted**
   * and bypasses the platform/client allow-list checks (the device-token
   * and IP checks still run).
   *
   * Useful for internal monitors, health-checkers, or partner integrations
   * that you don't want to enumerate in `allowedClients`.
   */
  userAgentWhitelist?: Array<string | RegExp>;

  /**
   * User-Agent deny-list. Same format as `userAgentWhitelist`. Matching
   * requests are rejected immediately, regardless of any other allow-list.
   * Evaluated before `userAgentWhitelist`.
   */
  userAgentBlacklist?: Array<string | RegExp>;

  /**
   * Header name to read the original client IP from when running behind a
   * proxy/load-balancer (e.g. `'x-forwarded-for'`, `'cf-connecting-ip'`).
   * The first IP in a comma-separated list is used. When unset, the guard
   * falls back to `req.ip` and then to `req.socket.remoteAddress`.
   */
  trustedProxyIpHeader?: string;
}

// ── Narrow string-literal types used for type-safe allow-lists ──────────────

export type Browser =
  | 'chrome' | 'firefox' | 'safari' | 'edge' | 'opera'
  | 'ie' | 'konqueror' | 'omniweb' | 'seamonkey' | 'flock'
  | 'amaya' | 'epiphany';

export type Mobile =
  | 'iphone' | 'ipod' | 'ipad' | 'android' | 'androidtablet'
  | 'windowsphone' | 'bada' | 'samsung' | 'kindlefire' | 'silk';

export type Tablet = 'ipad' | 'androidtablet' | 'kindle' | 'windowstablet';

export type Desktop = 'windows' | 'mac' | 'linux' | 'chromeos' | 'raspberry';

export type Scripts =
  | 'curl' | 'wget' | 'postman' | 'httpie' | 'powershell' | 'java'
  | 'go-http-client' | 'php' | 'ruby' | 'perl' | 'python-requests'
  | 'python-httpx' | 'urllib' | 'aiohttp' | 'axios' | 'node-fetch'
  | 'superagent' | 'got' | 'okhttp' | 'apache-httpclient' | 'unity';

export type Bots =
  | 'googlebot' | 'bingbot' | 'duckduckbot' | 'yandexbot' | 'telegrambot'
  | 'facebookbot' | 'whatsappbot' | 'discordbot' | 'slackbot' | 'linkedinbot'
  | 'twitterbot' | 'applebot' | 'pinterestbot' | 'yahoo-slurp' | 'baiduspider'
  | 'exabot' | 'ahrefsbot' | 'semrushbot' | 'accoona' | 'gptbot'
  | 'oai-searchbot' | 'chatgpt-user';

export type SmartGadgets = 'alexa' | 'googlehome' | 'echo' | 'nest' | 'smarthub' | 'iot';

export type GameConsoles = 'playstation' | 'xbox' | 'nintendo' | 'switch' | 'wii' | 'ps5' | 'ps4';

export type Apps =
  | 'telegram' | 'instagram' | 'facebook' | 'messenger' | 'whatsapp'
  | 'tiktok' | 'discord' | 'slack' | 'spotify' | 'electron' | 'zoom'
  | 'skype' | 'viber' | 'youtube' | 'googleapp' | 'googleassistant'
  | 'gmail' | 'googledrive' | 'googlephotos' | 'googlecalendar'
  | 'googleplay' | 'googlemaps';
