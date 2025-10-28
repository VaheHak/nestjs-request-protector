import {IAllowedClients, IAllowedPlatforms} from "./request-protector-platforms.interface";

export interface RequestProtectorOptions {
  /**
   * Represents the header name used for sending the device token in HTTP requests.
   * It is an optional string that may contain the key identifying the token header
   * required for specific API or service authorization processes.
   *
   * @default 'x-device-token'
   */
  deviceTokenHeader?: string;
  /**
   * A variable representing allowed device tokens for accessing a particular resource or service.
   *
   * It can either be:
   * - A wildcard '*' allowing all device tokens
   * - An array of specific device tokens represented as strings.
   *
   * This variable is optional.
   */
  allowedDeviceTokens?: '*' | string[];
  /**
   * Defines the clients that are allowed to access a particular resource.
   *
   * - When set to '*', access is granted to all clients without restriction.
   * - When set to an `IAllowedClients` object, the access is restricted based on the criteria defined within the object.
   *
   * This configuration is typically used to enforce access control mechanisms in an application.
   */
  allowedClients: '*' | IAllowedClients;
  /**
   * Specifies the platforms that are allowed or applicable for a particular
   * operation or configuration.
   *
   * - If set to '*', it indicates that all platforms are allowed (default).
   * - If set to an `IAllowedPlatforms` object, it provides a detailed
   *   definition of the allowed platforms.
   *
   * @default '*'
   */
  allowedPlatforms?: '*' | IAllowedPlatforms;
  /**
   * A function that, when implemented, fetches a list of allowed tokens.
   *
   * The function returns a promise that resolves to an array of strings, where each string represents a token that is permitted.
   *
   * @type {Function|undefined}
   * @returns {Promise<string[]>} A promise that resolves to an array of allowed token strings.
   */
  fetchAllowedTokens?: () => Promise<string[]>;
}

export type Browser =
  | 'chrome'
  | 'firefox'
  | 'safari'
  | 'edge'
  | 'opera'
  | 'ie'
  | 'konqueror'
  | 'omniweb'
  | 'seamonkey'
  | 'flock'
  | 'amaya'
  | 'epiphany';
export type Mobile =
  | 'iphone'
  | 'ipod'
  | 'ipad'
  | 'android'
  | 'androidtablet'
  | 'windowsphone'
  | 'bada'
  | 'samsung'
  | 'kindlefire'
  | 'silk';
export type Tablet = 'ipad' | 'androidtablet' | 'kindle' | 'windowstablet';
export type Desktop = 'windows' | 'mac' | 'linux' | 'chromeos' | 'raspberry';
export type Scripts =
  | 'curl'
  | 'wget'
  | 'postman'
  | 'httpie'
  | 'powershell'
  | 'java'
  | 'go-http-client'
  | 'php'
  | 'ruby'
  | 'perl'
  | 'python-requests'
  | 'python-httpx'
  | 'urllib'
  | 'aiohttp'
  | 'axios'
  | 'node-fetch'
  | 'superagent'
  | 'got'
  | 'okhttp'
  | 'apache-httpclient'
  | 'unity';
export type Bots =
  | 'googlebot'
  | 'bingbot'
  | 'duckduckbot'
  | 'yandexbot'
  | 'telegrambot'
  | 'facebookbot'
  | 'whatsappbot'
  | 'discordbot'
  | 'slackbot'
  | 'linkedinbot'
  | 'twitterbot'
  | 'applebot'
  | 'pinterestbot'
  | 'yahoo-slurp'
  | 'baiduspider'
  | 'exabot'
  | 'ahrefsbot'
  | 'semrushbot'
  | 'accoona'
  | 'gptbot'
  | 'oai-searchbot'
  | 'chatgpt-user';
export type SmartGadgets = 'alexa' | 'googlehome' | 'echo' | 'nest' | 'smarthub' | 'iot';
export type GameConsoles = 'playstation' | 'xbox' | 'nintendo' | 'switch' | 'wii' | 'ps5' | 'ps4';
export type Apps =
  | 'telegram'
  | 'instagram'
  | 'facebook'
  | 'messenger'
  | 'whatsapp'
  | 'tiktok'
  | 'discord'
  | 'slack'
  | 'spotify'
  | 'electron'
  | 'zoom'
  | 'skype'
  | 'viber'
  | 'youtube'
  | 'googleapp'
  | 'googleassistant'
  | 'gmail'
  | 'googledrive'
  | 'googlephotos'
  | 'googlecalendar'
  | 'googleplay'
  | 'googlemaps';
