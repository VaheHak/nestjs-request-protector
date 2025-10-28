import {
  Apps,
  Bots,
  Browser,
  Desktop,
  GameConsoles,
  Mobile,
  RequestProtectorOptions,
  Scripts,
  SmartGadgets,
  Tablet
} from "../interfaces/request-protector-options.interface";
import {IApps, IBot, IGadget, IScript, ITablet} from "../interfaces/request-protector-platforms.interface";

export class DetectAllowed {
  static detectTablets(uaString: string): ITablet {
    const ua = uaString.toLowerCase();

    return {
      isKindle: ua.includes('silk') || ua.includes('kindle'),
      isWindowsTablet: ua.includes('touch') && ua.includes('windows nt'),
    };
  }

  static detectScripts(uaString: string): IScript {
    const ua = uaString.toLowerCase();

    return {
      isCurl: ua.includes('curl'),
      isWget: ua.includes('wget'),
      isPostman: ua.includes('postmanruntime'),
      isHttpie: ua.includes('httpie'),
      isPowerShell: ua.includes('powershell') || ua.includes('winhttp'),
      isJava: ua.startsWith('java') || ua.includes('java/'),
      isGoHttp: ua.includes('go-http-client'),
      isPHP: ua.includes('php'),
      isRuby: ua.includes('ruby') || ua.includes('faraday'),
      isPerl: ua.includes('libwww-perl'),
      isPythonRequests: ua.includes('python-requests'),
      isPythonHttpx: ua.includes('httpx'),
      isUrllib: ua.includes('urllib'),
      isAiohttp: ua.includes('aiohttp'),
      isAxios: ua.includes('axios'),
      isNodeFetch: ua.includes('node-fetch'),
      isSuperagent: ua.includes('superagent'),
      isGot: ua.includes('got'),
      isOkHttp: ua.includes('okhttp'),
      isApacheHttpClient: ua.includes('apache-httpclient'),
      isUnity: ua.includes('unityplayer'),
    };
  }

  static detectBots(uaString: string): IBot {
    const ua = uaString.toLowerCase();

    return {
      isGoogleBot: ua.includes('googlebot'),
      isBingBot: ua.includes('bingbot'),
      isDuckDuckBot: ua.includes('duckduckbot'),
      isYandexBot: ua.includes('yandexbot'),
      isFacebookBot: ua.includes('facebookexternalhit') || ua.includes('facebookbot'),
      isSlackBot: ua.includes('slackbot'),
      isTelegramBot: ua.includes('telegrambot'),
      isTwitterBot: ua.includes('twitterbot'),
      isLinkedInBot: ua.includes('linkedinbot'),
      isPinterestBot: ua.includes('pinterestbot'),
      isYahooSlurp: ua.includes('yahoo') || ua.includes('yahooseeker') || ua.includes('yahoobot') || ua.includes('slurp'),
      isBaiduSpider: ua.includes('baiduspider'),
      isExaBot: ua.includes('exabot'),
      isAhrefsBot: ua.includes('ahrefsbot'),
      isSemrushBot: ua.includes('semrushbot'),
      isAccoonaBot: ua.includes('accoona'),
      isGptBot: ua.includes('gptbot'),
      isOaiSearchBot: ua.includes('oai-searchbot'),
      isChatGptUser: ua.includes('chatgpt-user') || ua.includes('chatgpt'),
      isWhatsAppBot: ua.includes('whatsapp'),
      isAppleBot: ua.includes('applebot'),
      isDiscordBot: ua.includes('discordbot'),
    };
  }

  static detectGadgets(uaString: string): IGadget {
    const ua = uaString.toLowerCase();

    return {
      isAlexa: /alexa|amazon-echo|echo/i.test(ua),
      isGoogleHome: /googlehome|nesthub|nest-mini|nest-audio/i.test(ua),
      isSmartHub: /smartthings|homekit|smarthub|iot/i.test(ua),

      isPlayStation: /playstation|ps4|ps5/i.test(ua),
      isXbox: /xbox|xboxone|xboxseries/i.test(ua),
      isNintendo: /nintendo|switch|wii/i.test(ua),
    };
  }

  static detectApps(uaString: string): IApps {
    const ua = uaString.toLowerCase();

    return {
      isTelegram: ua.includes('telegram'),
      isInstagram: ua.includes('instagram'),
      isFacebook: ua.includes('facebook'),
      isMessenger: ua.includes('messenger'),
      isWhatsApp: ua.includes('whatsapp'),
      isTikTok: ua.includes('tiktok') || ua.includes('musically'),
      isDiscord: ua.includes('discord'),
      isSlack: ua.includes('slack'),
      isSpotify: ua.includes('spotify'),
      isElectron: ua.includes('electron'),
      isZoom: ua.includes('zoom'),
      isSkype: ua.includes('skype'),
      isViber: ua.includes('viber'),
      isYouTube: ua.includes('youtube'),
      isGoogleApp: ua.includes('googleapp') || ua.includes('gsa') || ua.includes('com.google.android'),
      isGoogleAssistant: ua.includes('googleassistant'),
      isGmail: ua.includes('gmail'),
      isGoogleDrive: ua.includes('googledrive') || ua.includes('drive'),
      isGooglePhotos: ua.includes('googlephotos'),
      isGoogleCalendar: ua.includes('googlecalendar'),
      isGooglePlay: ua.includes('googleplay') || ua.includes('playstore'),
      isGoogleMaps: ua.includes('googlemaps'),
    };
  }

  static checkAllow<
    T extends | Record<Browser, boolean>
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
    isAllowed?: boolean
  ): boolean {
    if (!setting) return false

    if (setting === true) return isAllowed === true || Object.values(values).some(Boolean);

    if (Array.isArray(setting)) {
      return setting.some(k => Boolean(values[k.toLowerCase() as keyof T]));
    }

    return false;
  }


  static async isAuthorizedDevice(options: RequestProtectorOptions, deviceToken?: string): Promise<boolean> {
    if (!options.allowedDeviceTokens || options.allowedDeviceTokens === '*') {
      return true;
    }

    let allowedTokens = [...options.allowedDeviceTokens];
    if (options.fetchAllowedTokens) {
      try {
        const fetched = await options.fetchAllowedTokens();
        allowedTokens = [...allowedTokens, ...fetched];
      } catch (err) {
        console.error('Error fetching allowed tokens:', err);
      }
    }

    return typeof deviceToken === 'string' && allowedTokens.includes(deviceToken);
  }
}