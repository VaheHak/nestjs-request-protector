import {IAllowedClients, IAllowedPlatforms} from "./request-protector-platforms.interface";

export interface RequestProtectorOptions {
  deviceTokenHeader?: string;
  allowedDeviceTokens?: '*' | string[];
  allowedClients: '*' | IAllowedClients;
  allowedPlatforms?: '*' | IAllowedPlatforms;
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
