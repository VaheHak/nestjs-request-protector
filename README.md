![](https://img.shields.io/npm/v/nestjs-request-protector.svg)
![](https://img.shields.io/npm/dt/nestjs-request-protector.svg)
![](https://img.shields.io/npm/l/nestjs-request-protector.svg)
![](https://img.shields.io/github/issues/VaheHak/nestjs-request-protector.svg)
![](https://img.shields.io/github/contributors/VaheHak/nestjs-request-protector.svg)
![](https://img.shields.io/github/last-commit/VaheHak/nestjs-request-protector.svg)
![](https://img.shields.io/github/forks/VaheHak/nestjs-request-protector.svg)
![](https://img.shields.io/github/stars/VaheHak/nestjs-request-protector.svg)
![](https://img.shields.io/github/watchers/VaheHak/nestjs-request-protector.svg)

# 🛡️ NestJS Request Protector Guard

A flexible **NestJS Guard** that blocks unauthorized or automated API requests based on:
- Allowed **clients** via header (`x-client-name`)
- Allowed **device tokens**
- User-Agent / platform detection using [`express-useragent`](https://www.npmjs.com/package/express-useragent)
- Support for `*` (allow all) configuration for quick bypass
- Detection of script clients (`curl`, `wget`, `axios`, `python-requests`, etc.)

---

## 🚀 Installation

```bash
npm install nestjs-request-protector
```

---

## ⚙️ Setup Options

### 🧩 1️⃣ Register globally using `.forRoot()` (recommended)

```ts
import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { RequestProtectorModule, RequestProtectorGuard, RequestProtectorOptions } from 'nestjs-request-protector';

const protectorOptions: RequestProtectorOptions = {
  allowedDeviceTokens: ['device123', 'device456'],
  allowedClients: ['MyTrustedApp', 'SmartHomeClient'],
  allowedPlatforms: {
    browser: ['chrome', 'firefox', 'safari'],
    desktop: true,
    mobile: false,
    smartTV: false,
    bots: false,
    scripts: false,
    customs: ['internalmonitor'],
  },
};

@Module({
  imports: [
    RequestProtectorModule.forRoot(protectorOptions), // ✅ injects options globally
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: RequestProtectorGuard, // ✅ activates globally
    },
  ],
})
export class AppModule {}
```

---

### 🧩 2️⃣ Register globally using `useClass`

This approach allows **dependency injection** for your configuration.

```ts
import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { RequestProtectorGuard, RequestProtectorOptions, REQUEST_PROTECTOR_OPTIONS } from 'nestjs-request-protector';

const requestProtectorOptions: RequestProtectorOptions = {
  allowedDeviceTokens: ['secure123'],
  allowedClients: ['InternalApp'],
  allowedPlatforms: {
    browser: true,
    mobile: false,
    bots: false,
    scripts: false,
  },
};

@Module({
  providers: [
    {
      provide: REQUEST_PROTECTOR_OPTIONS,
      useValue: requestProtectorOptions,
    },
    {
      provide: APP_GUARD,
      useClass: RequestProtectorGuard,
    },
  ],
})
export class AppModule {}
```

---

### 🧩 3️⃣ Register globally using `useFactory`

This is simplest when options are static and you don’t need DI.

```ts
import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { RequestProtectorGuard, RequestProtectorOptions } from 'nestjs-request-protector';

const requestProtectorOptions: RequestProtectorOptions = {
  allowedDeviceTokens: ['device123', 'device456'],
  allowedClients: ['MyTrustedApp'],
  allowedPlatforms: {
    browser: ['chrome', 'firefox'],
    desktop: true,
    mobile: false,
  },
};

@Module({
  providers: [
    {
      provide: APP_GUARD,
      useFactory: () => new RequestProtectorGuard(requestProtectorOptions),
    },
  ],
})
export class AppModule {}
```

---

## 🌍 Platform Detection (Full List)

`allowedPlatforms` lets you control access by detected platform or User-Agent flags.

| **Category**       | **Type**                     | **Supported Keywords**                                                                                                                                                                                                                                                                                      | **Description**                                                   |
| ------------------ | ---------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------- |
| 🧭**browser**      | `boolean` / `Browser[]`      | `chrome`, `firefox`, `safari`, `edge`, `opera`, `ie`, `konqueror`, `omniweb`, `seamonkey`, `flock`, `amaya`, `epiphany`                                                                                                                                                                                     | Controls which desktop or mobile browsers are allowed             |
| 📱**mobile**       | `boolean` / `Mobile[]`       | `iphone`, `ipod`, `ipad`, `android`, `androidtablet`, `windowsphone`, `bada`, `samsung`, `kindlefire`, `silk`                                                                                                                                                                                               | Controls mobile or handheld devices                               |
| 💻**tablet**       | `boolean` / `Tablet[]`       | `ipad`, `androidtablet`, `kindle`, `windowstablet`                                                                                                                                                                                                                                                          | Controls tablet devices                                           |
| 🖥**desktop**      | `boolean` / `Desktop[]`      | `windows`, `mac`, `linux`, `chromeos`, `raspberry`                                                                                                                                                                                                                                                          | Controls desktop or laptop OS platforms                           |
| 🧠**smartGadgets** | `boolean` / `SmartGadgets[]` | `alexa`, `googlehome`, `echo`, `nest`, `smarthub`, `iot`                                                                                                                                                                                                                                                    | Controls smart home and IoT devices (Alexa, Google Home, etc.)    |
| 🎮**gameConsoles** | `boolean` / `GameConsoles[]` | `playstation`, `xbox`, `nintendo`, `switch`, `wii`, `ps5`, `ps4`                                                                                                                                                                                                                                            | Controls console-based access (PlayStation, Xbox, Nintendo, etc.) |
| 🤖**bots**         | `boolean` / `Bots[]`         | `googlebot`, `bingbot`, `duckduckbot`, `yandexbot`, `telegrambot`, `facebookbot`, `whatsappbot`, `discordbot`, `slackbot`, `linkedinbot`, `twitterbot`, `applebot`, `pinterestbot`, `yahoo-slurp`, `baiduspider`, `exabot`, `ahrefsbot`, `semrushbot`, `accoona`, `gptbot`, `oai-searchbot`, `chatgpt-user` | Allows or blocks crawlers, social bots, or AI preview agents      |
| ⚙️**scripts**      | `boolean` / `Scripts[]`      | `curl`, `wget`, `postman`, `httpie`, `powershell`, `java`, `go-http-client`, `php`, `ruby`, `perl`, `python-requests`, `python-httpx`, `urllib`, `aiohttp`, `axios`, `node-fetch`, `superagent`, `got`, `okhttp`, `apache-httpclient`, `unity`                                                              | Controls CLI tools and HTTP libraries                             |
| 📺**smartTV**      | `boolean`                    | —                                                                                                                                                                                                                                                                                                           | Allow Smart TV devices                                            |
| 🧩**customs**      | `string[]`                   | Any substring (e.g., `myiotclient`, `trustedapp`)                                                                                                                                                                                                                                                           | Add your own trusted clients or devices                           |

---

## 🧩 Full Example Configuration

```ts
const options: RequestProtectorOptions = {
  allowedDeviceTokens: ['abc123', 'xyz789'],
  fetchAllowedTokens: async () => ['dynamicToken'],
  deviceTokenHeader: 'x-device-token',
  allowedClients: ['MyApp', 'InternalMonitor'],
  allowedPlatforms: {
    browser: ['chrome', 'firefox'],
    mobile: false,
    tablet: ['ipad'],
    desktop: true,
    smartTV: false,
    bots: false,
    scripts: false,
    gameConsoles: false,
    smartGadgets: false,
    customs: ['trustedclient'],
  },
};
```

---

## ⚙️ Behavior Notes

- If `allowedPlatforms === '*'`, all platforms are allowed.
- If `allowedClients === '*'` or `allowedDeviceTokens === '*'`, all clients/tokens are accepted.
- Both `allowedClients` **and** `allowedDeviceTokens` are checked before platform detection.
- Scripts like `curl`, `axios`, or `wget` are automatically blocked unless `scripts: true`.
- `customs` allows substring matching inside User-Agent (case-insensitive).

---

## 🧠 How It Works

### 🔐 Device Token Validation

Requests must include a valid token if specified:

```http
GET /api/data
x-device-token: device123
User-Agent: MyIOTDevice/1.0
```

If `allowedDeviceTokens` is `'*'`, all tokens are accepted.

---

### 🤝 Allowed Clients

Set `allowedClients` to define which apps can access the API.

Example:
```ts
allowedClients: ['MyTrustedApp']
```
```http
GET /api/data
x-client-name: MyTrustedApp
```

If `allowedClients` is `'*'`, all client names are accepted.

---

### 🧩 Examples

#### ✅ Allow everything
```ts
allowedPlatforms: '*',
allowedClients: '*',
allowedDeviceTokens: '*',
```

#### ✅ Allow specific browsers only
```ts
allowedPlatforms: {
  browser: ['chrome', 'firefox'],
  desktop: true,
}
```

#### ✅ Allow custom trusted UA
```ts
allowedPlatforms: {
  customs: ['myiotdevice'],
}
```

#### ✅ Allow bots or scripts (for monitoring)
```ts
allowedPlatforms: {
  bots: true,
  scripts: true,
}
```

#### ✅ Dynamic token fetch
```ts
fetchAllowedTokens: async () => {
  const tokensFromDb = await TokenService.getActiveTokens();
  return tokensFromDb.map(t => t.token);
}
```

---

### ⚠️ Behavior Notes

- If `allowedPlatforms === '*'`, all platforms are allowed.
- `allowedClients` and `allowedDeviceTokens` are still checked first — both must pass.
- If `allowedPlatforms` is an object, at least one matching condition must be `true`.
- Scripts like `curl`, `axios`, or `wget` are automatically detected and blocked unless `scripts: true`.

---

## 🧱 Example Request Flow

✅ Allowed:
```http
GET /api/data
x-device-token: device123
x-client-name: MyTrustedApp
User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/122.0
```

❌ Blocked (untrusted client):
```http
GET /api/data
x-device-token: invalidToken
x-client-name: OtherApp
User-Agent: curl/8.0
```

❌ Blocked (not allowed platform):
```http
GET /api/data
User-Agent: PostmanRuntime/7.49.0
```

---

## ⚙️ Optional Flags

| Option | Type | Description |
|---------|------|-------------|
| `allowedPlatforms` | `'*' | IAllowedPlatforms` | Control platform-level filtering |
| `allowedDeviceTokens` | `string[] | '*'` | Static tokens allowed |
| `fetchAllowedTokens` | `() => Promise<string[]>` | Dynamically fetch allowed tokens |
| `deviceTokenHeader` | `string` | Custom header name for token |
| `allowedClients` | `string[] | '*'` | Allow specific client apps |

---

## 📜 License

MIT © 2025
