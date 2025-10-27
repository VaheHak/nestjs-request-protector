export interface RequestProtectorOptions {
  allowedClients?: '*' | string[];
  deviceTokenHeader?: string;
  allowedDeviceTokens?: '*' | string[];
  allowedPlatforms: '*' | IAllowedPlatforms;
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

export interface IAllowedPlatforms {
  browser?: boolean | Array<Browser>;
  mobile?: boolean | Array<Mobile>;
  tablet?: boolean | Array<Tablet>;
  desktop?: boolean | Array<Desktop>;
  scripts?: boolean | Array<Scripts>;
  bots?: boolean | Array<Bots>;
  smartGadgets?: boolean | Array<SmartGadgets>;
  gameConsoles?: boolean | Array<GameConsoles>;
  smartTV?: boolean;
  customs?: string[];
}

export interface ITablet {
  isKindle: boolean;
  isWindowsTablet: boolean;
}

export interface IScript {
  isCurl: boolean;
  isWget: boolean;
  isPostman: boolean;
  isHttpie: boolean;
  isPowerShell: boolean;
  isJava: boolean;
  isGoHttp: boolean;
  isPHP: boolean;
  isRuby: boolean;
  isPerl: boolean;
  isPythonRequests: boolean;
  isPythonHttpx: boolean;
  isUrllib: boolean;
  isAiohttp: boolean;
  isAxios: boolean;
  isNodeFetch: boolean;
  isSuperagent: boolean;
  isGot: boolean;
  isOkHttp: boolean;
  isApacheHttpClient: boolean;
  isUnity: boolean;
}

export interface IBot {
  isGoogleBot: boolean;
  isBingBot: boolean;
  isDuckDuckBot: boolean;
  isYandexBot: boolean;
  isTelegramBot: boolean;
  isFacebookBot: boolean;
  isWhatsAppBot: boolean;
  isDiscordBot: boolean;
  isSlackBot: boolean;
  isLinkedInBot: boolean;
  isTwitterBot: boolean;
  isAppleBot: boolean;
  isPinterestBot: boolean;
  isYahooSlurp: boolean;
  isBaiduSpider: boolean;
  isExaBot: boolean;
  isAhrefsBot: boolean;
  isSemrushBot: boolean;
  isAccoonaBot: boolean;
  isGptBot: boolean;
  isOaiSearchBot: boolean;
  isChatGptUser: boolean;
}

export interface IGadget {
  isAlexa: boolean;
  isGoogleHome: boolean;
  isSmartHub: boolean;
  isPlayStation: boolean;
  isXbox: boolean;
  isNintendo: boolean;
}
