import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Inject,
  Injectable,
} from '@nestjs/common';
import * as useragent from 'express-useragent';
import {Request} from 'express';
import {
  RequestProtectorOptions,
  IAllowedPlatforms,
  Bots, Browser, Mobile, Tablet, Desktop, Scripts, SmartGadgets, GameConsoles,
} from './interfaces/request-protector-options.interface';
import {DetectPlatform} from "./heplers/detect-platform";

export const REQUEST_PROTECTOR_OPTIONS = 'REQUEST_PROTECTOR_OPTIONS';

@Injectable()
export class RequestProtectorGuard implements CanActivate {
  constructor(
    @Inject(REQUEST_PROTECTOR_OPTIONS)
    private readonly options: RequestProtectorOptions,
  ) {
  }


  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<Request>();
    const uaRaw = req.headers['user-agent'] || '';
    const ua = {
      ...useragent.parse(uaRaw),
      ...DetectPlatform.detectTablets(uaRaw),
      ...DetectPlatform.detectScripts(uaRaw),
      ...DetectPlatform.detectBots(uaRaw),
      ...DetectPlatform.detectGadgets(uaRaw),
    };
    const uaSource = ua.source?.toLowerCase() || '';

    const tokenHeader = this.options.deviceTokenHeader || 'x-device-token';
    const deviceToken = req.headers[tokenHeader] as string | undefined;
    const clientName = req.headers['x-client-name'] as string | undefined;

    if (!await DetectPlatform.isAuthorizedDevice(this.options, deviceToken) || !DetectPlatform.isClientAllowed(this.options, clientName)) {
      throw new ForbiddenException('Access denied: untrusted client or device');
    }

    if (this.options.allowedPlatforms === '*') return true;

    const p: IAllowedPlatforms = this.options.allowedPlatforms;

    const browsers: Record<Browser, boolean> = {
      chrome: ua.isChrome,
      firefox: ua.isFirefox,
      safari: ua.isSafari,
      edge: ua.isEdge,
      opera: ua.isOpera,
      ie: ua.isIE,
      konqueror: ua.isKonqueror,
      omniweb: ua.isOmniWeb,
      seamonkey: ua.isSeaMonkey,
      flock: ua.isFlock,
      amaya: ua.isAmaya,
      epiphany: ua.isEpiphany,
    };

    const mobiles: Record<Mobile, boolean> = {
      iphone: ua.isiPhone,
      ipod: ua.isiPod,
      ipad: ua.isiPad,
      android: ua.isAndroid,
      androidtablet: ua.isAndroidTablet,
      windowsphone: ua.isWindowsPhone,
      bada: ua.isBada,
      samsung: ua.isSamsung,
      kindlefire: ua.isKindleFire,
      silk: ua.isSilk,
    };

    const tablets: Record<Tablet, boolean> = {
      ipad: ua.isiPad,
      androidtablet: ua.isAndroidTablet,
      kindle: ua.isKindle,
      windowstablet: ua.isWindowsTablet,
    };

    const desktops: Record<Desktop, boolean> = {
      windows: ua.isWindows,
      mac: ua.isMac,
      linux: ua.isLinux || ua.isLinux64,
      chromeos: ua.isChromeOS,
      raspberry: ua.isRaspberry,
    };

    const scripts: Record<Scripts, boolean> = {
      curl: ua.isCurl,
      wget: ua.isWget,
      postman: ua.isPostman,
      httpie: ua.isHttpie,
      powershell: ua.isPowerShell,
      java: ua.isJava,
      'go-http-client': ua.isGoHttp,
      php: ua.isPHP,
      ruby: ua.isRuby,
      perl: ua.isPerl,
      'python-requests': ua.isPythonRequests,
      'python-httpx': ua.isPythonHttpx,
      urllib: ua.isUrllib,
      aiohttp: ua.isAiohttp,
      axios: ua.isAxios,
      'node-fetch': ua.isNodeFetch,
      superagent: ua.isSuperagent,
      got: ua.isGot,
      okhttp: ua.isOkHttp,
      'apache-httpclient': ua.isApacheHttpClient,
      unity: ua.isUnity,
    };

    const bots: Record<Bots, boolean> = {
      googlebot: ua.isGoogleBot,
      bingbot: ua.isBingBot,
      duckduckbot: ua.isDuckDuckBot,
      yandexbot: ua.isYandexBot,
      facebookbot: ua.isFacebookBot,
      slackbot: ua.isSlackBot,
      telegrambot: ua.isTelegramBot,
      twitterbot: ua.isTwitterBot,
      linkedinbot: ua.isLinkedInBot,
      pinterestbot: ua.isPinterestBot,
      'yahoo-slurp': ua.isYahooSlurp,
      baiduspider: ua.isBaiduSpider,
      exabot: ua.isExaBot,
      ahrefsbot: ua.isAhrefsBot,
      semrushbot: ua.isSemrushBot,
      accoona: ua.isAccoonaBot,
      gptbot: ua.isGptBot,
      'oai-searchbot': ua.isOaiSearchBot,
      'chatgpt-user': ua.isChatGptUser,
      whatsappbot: ua.isWhatsAppBot,
      applebot: ua.isAppleBot,
      discordbot: ua.isDiscordBot,
    };

    const gadgets: Record<SmartGadgets, boolean> = {
      alexa: ua.isAlexa,
      googlehome: ua.isGoogleHome,
      echo: ua.isAlexa,
      nest: ua.isGoogleHome,
      smarthub: ua.isSmartHub,
      iot: ua.isSmartHub,
    };

    const consoles: Record<GameConsoles, boolean> = {
      playstation: ua.isPlayStation,
      ps5: ua.isPlayStation,
      ps4: ua.isPlayStation,
      xbox: ua.isXbox,
      nintendo: ua.isNintendo,
      switch: ua.isNintendo,
      wii: ua.isNintendo,
    };

    const browserAllowed = DetectPlatform.checkAllow(p.browser, browsers);
    const mobileAllowed = DetectPlatform.checkAllow(p.mobile, mobiles, ua.isMobile);
    const tabletAllowed = DetectPlatform.checkAllow(p.tablet, tablets);
    const desktopAllowed = DetectPlatform.checkAllow(p.desktop, desktops);
    const scriptsAllowed = DetectPlatform.checkAllow(p.scripts, scripts);
    const botsAllowed = DetectPlatform.checkAllow(p.bots, bots, ua.isBot);
    const smartGadgetsAllowed = DetectPlatform.checkAllow(p.smartGadgets, gadgets);
    const gameConsolesAllowed = DetectPlatform.checkAllow(p.gameConsoles, consoles);
    const smartTVAllowed = !!p.smartTV && ua.isSmartTV;
    const customsAllowed =
      p.customs?.some(c => c && uaSource.includes(c.toLowerCase())) ?? false;

    if (
      !browserAllowed &&
      !mobileAllowed &&
      !tabletAllowed &&
      !desktopAllowed &&
      !smartTVAllowed &&
      !botsAllowed &&
      !scriptsAllowed &&
      !smartGadgetsAllowed &&
      !gameConsolesAllowed &&
      !customsAllowed
    ) {
      throw new ForbiddenException('Access denied: unauthorized or unsupported client');
    }

    return true;
  }
}
