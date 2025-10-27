import {
  IBot,
  IGadget,
  IScript,
  ITablet,
  RequestProtectorOptions
} from "../interfaces/request-protector-options.interface";

export class DetectPlatform {
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

  static checkAllow<T extends Record<string, boolean>>(
    setting: boolean | string[] | undefined,
    values: T,
    isAllowed?: boolean
  ): boolean {
    if (setting === true) return isAllowed === true || Object.values(values).some(Boolean);
    if (Array.isArray(setting))
      return setting.some(k => values[k.toLowerCase() as keyof T]);
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

  static isClientAllowed(options: RequestProtectorOptions, clientName?: string): boolean {
    if (!options.allowedClients || options.allowedClients === '*') {
      return true;
    }

    return !!clientName && options.allowedClients.includes(clientName);
  }
}