export interface RequestProtectorOptions {
  allowedClients?: '*' | string[];
  deviceTokenHeader?: string;
  allowedDeviceTokens?: '*' | string[];
  allowedPlatforms: '*' | IAllowedPlatforms;
  fetchAllowedTokens?: () => Promise<string[]>;
}

export interface IAllowedPlatforms {
  browser?: boolean | Array<
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
    | 'epiphany'
  >;
  mobile?: boolean | Array<
    | 'iphone'
    | 'ipod'
    | 'ipad'
    | 'android'
    | 'androidtablet'
    | 'windowsphone'
    | 'bada'
    | 'samsung'
    | 'kindlefire'
    | 'silk'
  >;
  tablet?: boolean | Array<'ipad' | 'androidtablet'>;
  desktop?: boolean | Array<'windows' | 'mac' | 'linux' | 'chromeos' | 'raspberry'>;
  scripts?: boolean | Array<'curl' | 'wget' | 'axios' | 'nodefetch' | 'pythonrequests' | 'powershell'>;
  smartTV?: boolean;
  bots?: boolean;
  customs?: string[];
}

export interface IScriptedClient {
  isCurl: boolean;
  isWget: boolean;
  isAxios: boolean;
  isNodeFetch: boolean;
  isPythonRequests: boolean;
  isPowerShell: boolean;
}
