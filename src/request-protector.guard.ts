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
  IScriptedClient,
} from './interfaces/request-protector-options.interface';

export const REQUEST_PROTECTOR_OPTIONS = 'REQUEST_PROTECTOR_OPTIONS';

@Injectable()
export class RequestProtectorGuard implements CanActivate {
  constructor(
    @Inject(REQUEST_PROTECTOR_OPTIONS)
    private readonly options: RequestProtectorOptions,
  ) {
  }

  private detectScripts(uaString: string): IScriptedClient {
    const ua = uaString.toLowerCase();
    return {
      isCurl: ua.includes('curl'),
      isWget: ua.includes('wget'),
      isAxios: ua.includes('axios'),
      isNodeFetch: ua.includes('node-fetch'),
      isPythonRequests: ua.includes('python-requests'),
      isPowerShell: ua.includes('powershell') || ua.includes('winhttp'),
    };
  }

  private checkAllow<T extends Record<string, boolean>>(
    setting: boolean | string[] | undefined,
    values: T,
    isAllowed?: boolean
  ): boolean {
    if (setting === true) return isAllowed || Object.values(values).some(Boolean);
    if (Array.isArray(setting))
      return setting.some(k => values[k.toLowerCase() as keyof T]);
    return false;
  }


  private async isAuthorizedDevice(deviceToken?: string): Promise<boolean> {
    if (!this.options.allowedDeviceTokens || this.options.allowedDeviceTokens === '*') {
      return true;
    }

    let allowedTokens = [...this.options.allowedDeviceTokens];
    if (this.options.fetchAllowedTokens) {
      try {
        const fetched = await this.options.fetchAllowedTokens();
        allowedTokens = [...allowedTokens, ...fetched];
      } catch (err) {
        console.error('Error fetching allowed tokens:', err);
      }
    }

    return typeof deviceToken === 'string' && allowedTokens.includes(deviceToken);
  }

  private isClientAllowed(clientName?: string): boolean {
    if (!this.options.allowedClients || this.options.allowedClients === '*') {
      return true;
    }

    return !!clientName && this.options.allowedClients.includes(clientName);
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<Request>();
    const uaRaw = req.headers['user-agent'] || '';
    const ua = {
      ...useragent.parse(uaRaw),
      ...this.detectScripts(uaRaw),
    };
    const uaSource = ua.source?.toLowerCase() || '';

    const tokenHeader = this.options.deviceTokenHeader || 'x-device-token';
    const deviceToken = req.headers[tokenHeader] as string | undefined;
    const clientName = req.headers['x-client-name'] as string | undefined;

    if (!await this.isAuthorizedDevice(deviceToken) || !this.isClientAllowed(clientName)) {
      throw new ForbiddenException('Access denied: untrusted client or device');
    }

    if (this.options.allowedPlatforms === '*') return true;

    const p: IAllowedPlatforms = this.options.allowedPlatforms;
    const browsers = {
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

    const mobiles = {
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

    const tablets = {
      ipad: ua.isiPad,
      androidtablet: ua.isAndroidTablet,
    };

    const desktops = {
      windows: ua.isWindows,
      mac: ua.isMac,
      linux: ua.isLinux || ua.isLinux64,
      chromeos: ua.isChromeOS,
      raspberry: ua.isRaspberry,
    };

    const scripts = {
      curl: ua.isCurl,
      wget: ua.isWget,
      axios: ua.isAxios,
      nodefetch: ua.isNodeFetch,
      pythonrequests: ua.isPythonRequests,
      powershell: ua.isPowerShell,
    }

    const browserAllowed = this.checkAllow(p.browser, browsers);
    const mobileAllowed = this.checkAllow(p.mobile, mobiles, ua.isMobile);
    const tabletAllowed = this.checkAllow(p.tablet, tablets);
    const desktopAllowed = this.checkAllow(p.desktop, desktops);
    const scriptsAllowed = this.checkAllow(p.scripts, scripts);

    const smartTVAllowed = !!p.smartTV && ua.isSmartTV;
    const botsAllowed = !!p.bots && ua.isBot;

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
      !customsAllowed
    ) {
      throw new ForbiddenException('Access denied: unauthorized client');
    }

    return true;
  }
}
