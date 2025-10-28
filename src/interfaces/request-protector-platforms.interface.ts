import {
  Apps,
  Bots,
  Browser,
  Desktop,
  GameConsoles,
  Mobile,
  Scripts,
  SmartGadgets,
  Tablet
} from "./request-protector-options.interface";

export interface IAllowedPlatforms {
  mobile?: boolean | Array<Mobile>;
  tablet?: boolean | Array<Tablet>;
  desktop?: boolean | Array<Desktop>;
  smartGadgets?: boolean | Array<SmartGadgets>;
  gameConsoles?: boolean | Array<GameConsoles>;
  smartTV?: boolean;
  customs?: string[];
}

export interface IAllowedClients {
  browser?: boolean | Array<Browser>;
  scripts?: boolean | Array<Scripts>;
  bots?: boolean | Array<Bots>;
  apps?: boolean | Array<Apps>;
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

export interface IApps {
  isTelegram: boolean;
  isInstagram: boolean;
  isFacebook: boolean;
  isMessenger: boolean;
  isWhatsApp: boolean;
  isTikTok: boolean;
  isDiscord: boolean;
  isSlack: boolean;
  isSpotify: boolean;
  isElectron: boolean;
  isZoom: boolean;
  isSkype: boolean;
  isViber: boolean;
  isYouTube: boolean;
  isGoogleApp: boolean;
  isGoogleAssistant: boolean;
  isGmail: boolean;
  isGoogleDrive: boolean;
  isGooglePhotos: boolean;
  isGoogleCalendar: boolean;
  isGooglePlay: boolean;
  isGoogleMaps: boolean;
}