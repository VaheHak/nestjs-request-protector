import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Inject,
  Injectable,
} from '@nestjs/common';
import * as useragent from 'express-useragent';
import {Request} from 'express';
import {RequestProtectorOptions,} from './interfaces/request-protector-options.interface';
import {DetectAllowed} from './heplers/detect-allowed';
import {IAllowedClients, IAllowedPlatforms} from "./interfaces/request-protector-platforms.interface";

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
      ...DetectAllowed.detectTablets(uaRaw),
      ...DetectAllowed.detectScripts(uaRaw),
      ...DetectAllowed.detectBots(uaRaw),
      ...DetectAllowed.detectGadgets(uaRaw),
      ...DetectAllowed.detectApps(uaRaw),
    };
    const uaSource = ua.source?.toLowerCase() || '';

    const tokenHeader = this.options.deviceTokenHeader || 'x-device-token';
    const deviceToken = req.headers[tokenHeader] as string | undefined;
    if (!(await DetectAllowed.isAuthorizedDevice(this.options, deviceToken))) {
      throw new ForbiddenException('Access denied: untrusted device');
    }

    const platforms: IAllowedPlatforms | '*' = this.options.allowedPlatforms ?? '*';
    const clients: IAllowedClients | '*' = this.options.allowedClients ?? '*';

    if (platforms === '*' && clients === '*') return true;

    /** ================== Platform checks ================== */
    if (platforms !== '*') {
      const mobileAllowed = DetectAllowed.checkAllow(
        platforms.mobile,
        {
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
        },
        ua.isMobile,
      );

      const tabletAllowed = DetectAllowed.checkAllow(
        platforms.tablet,
        {
          ipad: ua.isiPad,
          androidtablet: ua.isAndroidTablet,
          kindle: ua.isKindle,
          windowstablet: ua.isWindowsTablet,
        },
        ua.isTablet,
      );

      const desktopAllowed = DetectAllowed.checkAllow(
        platforms.desktop,
        {
          windows: ua.isWindows,
          mac: ua.isMac,
          linux: ua.isLinux || ua.isLinux64,
          chromeos: ua.isChromeOS,
          raspberry: ua.isRaspberry,
        },
        ua.isDesktop,
      );

      const smartGadgetsAllowed = DetectAllowed.checkAllow(
        platforms.smartGadgets,
        {
          alexa: ua.isAlexa,
          googlehome: ua.isGoogleHome,
          echo: ua.isAlexa,
          nest: ua.isGoogleHome,
          smarthub: ua.isSmartHub,
          iot: ua.isSmartHub,
        },
      );

      const gameConsolesAllowed = DetectAllowed.checkAllow(
        platforms.gameConsoles,
        {
          playstation: ua.isPlayStation,
          ps5: ua.isPlayStation,
          ps4: ua.isPlayStation,
          xbox: ua.isXbox,
          nintendo: ua.isNintendo,
          switch: ua.isNintendo,
          wii: ua.isNintendo,
        },
      );

      const smartTVAllowed = !!platforms.smartTV && ua.isSmartTV;
      const customsAllowed =
        platforms.customs?.some(v => v && uaSource.includes(v.toLowerCase())) ??
        false;

      if (
        !mobileAllowed &&
        !tabletAllowed &&
        !desktopAllowed &&
        !smartTVAllowed &&
        !smartGadgetsAllowed &&
        !gameConsolesAllowed &&
        !customsAllowed
      ) {
        throw new ForbiddenException(
          'Access denied: unauthorized or unsupported platform',
        );
      }
    }

    /** ================== Client checks ================== */
    if (clients !== '*') {
      const browserAllowed = DetectAllowed.checkAllow(clients.browser, {
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
      });

      const scriptsAllowed = DetectAllowed.checkAllow(clients.scripts, {
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
      });

      const botsAllowed = DetectAllowed.checkAllow(
        clients.bots,
        {
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
        },
        ua.isBot,
      );

      const appsAllowed = DetectAllowed.checkAllow(
        clients.apps,
        {
          telegram: ua.isTelegram,
          instagram: ua.isInstagram,
          facebook: ua.isFacebook,
          messenger: ua.isMessenger,
          whatsapp: ua.isWhatsApp,
          tiktok: ua.isTikTok,
          discord: ua.isDiscord,
          slack: ua.isSlack,
          spotify: ua.isSpotify,
          electron: ua.isElectron,
          zoom: ua.isZoom,
          skype: ua.isSkype,
          viber: ua.isViber,
          youtube: ua.isYouTube,
          googleapp: ua.isGoogleApp,
          googleassistant: ua.isGoogleAssistant,
          gmail: ua.isGmail,
          googledrive: ua.isGoogleDrive,
          googlephotos: ua.isGooglePhotos,
          googlecalendar: ua.isGoogleCalendar,
          googleplay: ua.isGooglePlay,
          googlemaps: ua.isGoogleMaps,
        }
      )

      const customsAllowed =
        clients.customs?.some(v => v && uaSource.includes(v.toLowerCase())) ??
        false;

      if (!browserAllowed && !scriptsAllowed && !botsAllowed && !appsAllowed && !customsAllowed) {
        throw new ForbiddenException(
          'Access denied: unauthorized or unsupported client',
        );
      }
    }

    return true;
  }
}
