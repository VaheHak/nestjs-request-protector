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

A powerful **NestJS Guard** that protects your API from unauthorized, scripted, or automated requests.  
It validates **clients**, **devices**, and **platforms** using `User-Agent` analysis powered by [`express-useragent`](https://www.npmjs.com/package/express-useragent).

---

## 🚀 Installation

```bash
npm install nestjs-request-protector
```

---

## ⚙ Features

- ✅ Block non-browser and script-based requests (`curl`, `wget`, `axios`, etc.)
- 🔐 Allow only trusted devices via `x-device-token` or `<custom key>` 
- 📱 Detect devices: browser, desktop, mobile, tablet, console, IoT
- 🤖 Detect bots (Googlebot, ChatGPT, TelegramBot, etc.)
- 🧩 Support for `*` wildcard (allow all)
- 🧠 Customizable rules for both **platforms** and **clients**

---

## ⚙️ Setup Options

### 1️⃣ Global Registration (Recommended)

```ts
import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { RequestProtectorModule, RequestProtectorGuard, RequestProtectorOptions } from 'nestjs-request-protector';

const protectorOptions: RequestProtectorOptions = {
  allowedDeviceTokens: ['device123', 'device456'],
  allowedClients: {
    browser: ['chrome', 'firefox', 'safari'],
    scripts: false,
    bots: ['googlebot', 'telegrambot'],
  },
  allowedPlatforms: {
    desktop: true,
    mobile: false,
    smartTV: false,
    smartGadgets: ['alexa', 'googlehome'],
    gameConsoles: ['playstation', 'xbox'],
    customs: ['internal-monitor'],
  },
};

@Module({
  imports: [RequestProtectorModule.forRoot(protectorOptions)],
  providers: [
    { provide: APP_GUARD, useClass: RequestProtectorGuard },
  ],
})
export class AppModule {}
```

---

### 2️⃣ Using `useClass`

```ts
import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { RequestProtectorGuard, REQUEST_PROTECTOR_OPTIONS, RequestProtectorOptions } from 'nestjs-request-protector';

const protectorOptions: RequestProtectorOptions = {
  allowedDeviceTokens: ['secure-token'],
  allowedClients: '*',
  allowedPlatforms: '*',
};

@Module({
  providers: [
    {
      provide: REQUEST_PROTECTOR_OPTIONS,
      useValue: protectorOptions,
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

### 3️⃣ Using `useFactory`

```ts
@Module({
  providers: [
    {
      provide: APP_GUARD,
      useFactory: () =>
        new RequestProtectorGuard({
          allowedDeviceTokens: '*',
          allowedClients: {
            browser: ['chrome', 'firefox'],
            scripts: ['axios'],
          },
          allowedPlatforms: {
            browser: ['chrome'],
            desktop: true,
          },
        }),
    },
  ],
})
export class AppModule {}
```

---

## 🧩 Full Example

```ts
const options: RequestProtectorOptions = {
  allowedDeviceTokens: ['abc123'],
  fetchAllowedTokens: async () => ['tokenFromDB'],
  allowedClients: {
    browser: true,
    bots: ['googlebot', 'telegrambot', 'chatgpt-user'],
    scripts: ['postman'],
    apps: ['messenger'],
    customs: ['iot']
  },
  allowedPlatforms: {
    desktop: ['mac', 'windows'],
    mobile: true,
    smartGadgets: ['alexa'],
    gameConsoles: ['playstation', 'xbox'],
    smartTV: true,
    tablet: true,
    customs: ['postman'],
  }
};
```

---

## 🌍 Platform or Client Detection (Full List)

🖥️ `allowedPlatforms` lets you control access by detected platform or User-Agent flags.

| **Category** | **Type** | **Supported Keywords** | **Description** |
|--------------|-----------|------------------------|------------------|
| 🧭 **browser** | `boolean` / `Browser[]` | chrome, firefox, safari, edge, opera, ie, konqueror, omniweb, seamonkey, flock, amaya, epiphany | Web browsers |
| 📱 **mobile** | `boolean` / `Mobile[]` | iphone, ipod, ipad, android, androidtablet, windowsphone, bada, samsung, kindlefire, silk | Mobile devices |
| 💻 **tablet** | `boolean` / `Tablet[]` | ipad, androidtablet, kindle, windowstablet | Tablet devices |
| 🖥 **desktop** | `boolean` / `Desktop[]` | windows, mac, linux, chromeos, raspberry | Desktop & laptop OS |
| 🧠 **smartGadgets** | `boolean` / `SmartGadgets[]` | alexa, googlehome, echo, nest, smarthub, iot | IoT & smart devices |
| 🎮 **gameConsoles** | `boolean` / `GameConsoles[]` | playstation, xbox, nintendo, switch, wii, ps5, ps4 | Gaming consoles |
| 📺 **smartTV** | `boolean` | — | Smart TVs |
| 🧩 **customs** | `string[]` | custom UA substrings | Custom rules |

---

🤝 `allowedClients` lets you control access by detected clients or User-Agent flags.

| **Category** | **Type** | **Supported Keywords** | **Description** |
|--------------|-----------|------------------------|------------------|
| 🌐 **browser** | `boolean` / `Browser[]` | Same as above | Allowed browsers |
| ⚙️ **scripts** | `boolean` / `Scripts[]` | curl, wget, postman, httpie, powershell, java, go-http-client, php, ruby, perl, python-requests, python-httpx, urllib, aiohttp, axios, node-fetch, superagent, got, okhttp, apache-httpclient, unity | Command-line tools or libraries |
| 🤖 **bots** | `boolean` / `Bots[]` | googlebot, bingbot, duckduckbot, yandexbot, telegrambot, facebookbot, whatsappbot, discordbot, slackbot, linkedinbot, twitterbot, applebot, pinterestbot, yahoo-slurp, baiduspider, exabot, ahrefsbot, semrushbot, accoona, gptbot, oai-searchbot, chatgpt-user | Crawlers, social bots, AI agents |
| 📲 **apps** | `boolean` / `Apps[]` | telegram, instagram, facebook, messenger, whatsapp, tiktok, discord, slack, spotify, electron, zoom, skype, viber, youtube, googleapp, googleassistant, gmail, googledrive, googlephotos, googlecalendar, googleplay, googlemaps | Native or desktop applications |
| 🧩 **customs** | `string[]` | Any substring | Custom client matchers |

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
allowedClients: {
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

## 🧱 Example Request Flow

✅ Allowed:
```http
GET /api/data
x-device-token: device123
User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/122.0
```

❌ Blocked (untrusted client):
```http
GET /api/data
x-device-token: invalidToken
User-Agent: curl/8.0
```

❌ Blocked (not allowed platform):
```http
GET /api/data
User-Agent: PostmanRuntime/7.49.0
```

---

## ⚙️ Optional Flags

| Rule | Description |
|------|--------------|
| `allowedDeviceTokens` | Must match header token (or be `*` to allow all) |
| `fetchAllowedTokens` | Async dynamic token fetch support |
| `allowedClients` | Controls app/browser/script access |
| `allowedPlatforms` | Controls device or OS access |
| `'*'` (wildcard) | Allows everything for that rule |
| `customs` | Partial case-insensitive match on UA |

---

## 📜 License

MIT © 2025
