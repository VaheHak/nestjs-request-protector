![](https://img.shields.io/npm/v/nestjs-request-protector.svg)
![](https://img.shields.io/npm/dy/nestjs-request-protector.svg)
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

<a id="toc"></a>
## 📚 Table of Contents

- [🚀 Installation](#installation)
- [⚙ Features](#features)
- [⚙️ Setup Options](#setup-options)
  - [1️⃣ Global Registration (Recommended)](#setup-global)
  - [2️⃣ Using `useClass`](#setup-useclass)
  - [3️⃣ Using `useFactory`](#setup-usefactory)
- [🧩 Full Example](#full-example)
- [🌍 Platform or Client Detection (Full List)](#detection)
- [⚙️ Behavior Notes](#behavior-notes)
- [🚦 IP & User-Agent Whitelist / Blacklist](#whitelist-blacklist)
  - [Evaluation order](#evaluation-order)
  - [Notes](#whitelist-notes)
- [🧠 How It Works](#how-it-works)
  - [🔐 Device Token Validation](#device-token-validation)
  - [🧩 Examples](#examples)
- [🧱 Example Request Flow](#example-request-flow)
- [⚙️ Optional Flags](#optional-flags)
- [📜 License](#license)

---

<a id="installation"></a>
## 🚀 Installation

```bash
npm install nestjs-request-protector
```

---

<a id="features"></a>
## ⚙ Features

- ✅ Block non-browser and script-based requests (`curl`, `wget`, `axios`, etc.)
- 🔐 Allow only trusted devices via `x-device-token` or `<custom key>` 
- 📱 Detect devices: browser, desktop, mobile, tablet, console, IoT
- 🤖 Detect bots (Googlebot, ChatGPT, TelegramBot, etc.)
- 🧩 Support for `*` wildcard (allow all)
- 🧠 Customizable rules for both **platforms** and **clients**

---

<a id="setup-options"></a>
## ⚙️ Setup Options

<a id="setup-global"></a>
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

<a id="setup-useclass"></a>
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

<a id="setup-usefactory"></a>
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

<a id="full-example"></a>
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

<a id="detection"></a>
## 🌍 Platform or Client Detection (Full List)

🖥️ `allowedPlatforms` lets you control access by detected platform or User-Agent flags.

| **Category** | **Type** | **Supported Keywords** | **Description** |
|--------------|-----------|------------------------|------------------|
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
| 🌐 **browser** | `boolean` / `Browser[]` | chrome, firefox, safari, edge, opera, ie, konqueror, omniweb, seamonkey, flock, amaya, epiphany | Web browsers |
| ⚙️ **scripts** | `boolean` / `Scripts[]` | curl, wget, postman, httpie, powershell, java, go-http-client, php, ruby, perl, python-requests, python-httpx, urllib, aiohttp, axios, node-fetch, superagent, got, okhttp, apache-httpclient, unity | Command-line tools or libraries |
| 🤖 **bots** | `boolean` / `Bots[]` | googlebot, bingbot, duckduckbot, yandexbot, telegrambot, facebookbot, whatsappbot, discordbot, slackbot, linkedinbot, twitterbot, applebot, pinterestbot, yahoo-slurp, baiduspider, exabot, ahrefsbot, semrushbot, accoona, gptbot, oai-searchbot, chatgpt-user | Crawlers, social bots, AI agents |
| 📲 **apps** | `boolean` / `Apps[]` | telegram, instagram, facebook, messenger, whatsapp, tiktok, discord, slack, spotify, electron, zoom, skype, viber, youtube, googleapp, googleassistant, gmail, googledrive, googlephotos, googlecalendar, googleplay, googlemaps | Native or desktop applications |
| 🧩 **customs** | `string[]` | Any substring | Custom client matchers |

---

<a id="behavior-notes"></a>
## ⚙️ Behavior Notes

- If `allowedPlatforms === '*'` or `allowedClients === '*'` or `allowedDeviceTokens === '*'`, all platforms/clients/tokens are accepted.
- Both `allowedDeviceTokens` **and** `allowedPlatforms` are checked before client detection.
- Scripts like `curl`, `axios`, or `wget` are automatically blocked unless `scripts: true`.
- `customs` allows substring matching inside User-Agent (case-insensitive).

---

<a id="whitelist-blacklist"></a>
## 🚦 IP & User-Agent Whitelist / Blacklist

In addition to platform/client matchers, the guard supports first-class
**allow / deny lists** for IPs and User-Agents. They run **before** the
expensive UA parsing, so denied traffic is rejected almost for free.

```ts
const options: RequestProtectorOptions = {
  allowedClients: '*',

  // ── IP rules ─────────────────────────────────────────────────────────────
  // Exact IPv4/IPv6 or IPv4 CIDR blocks are supported.
  ipBlacklist: ['203.0.113.7', '198.51.100.0/24'],
  ipWhitelist: ['10.0.0.0/8', '192.168.1.0/24'],

  // When running behind a load-balancer/CDN, tell the guard which header
  // contains the original client IP. The first entry of a comma-separated
  // list is used.
  trustedProxyIpHeader: 'x-forwarded-for', // or 'cf-connecting-ip', etc.

  // ── User-Agent rules ─────────────────────────────────────────────────────
  // Each entry may be a case-insensitive substring or a RegExp.
  userAgentBlacklist: ['EvilScanner', /^badbot/i],

  // A match in `userAgentWhitelist` marks the request as *trusted* and skips
  // the platform/client allow-list checks (token + IP checks still run).
  userAgentWhitelist: ['MyInternalMonitor', /^uptime-robot\//i],
};
```

<a id="evaluation-order"></a>
### Evaluation order

For every request the guard runs these checks, in order, and short-circuits on the first failure:

1. `maxUserAgentLength` / `denyEmptyUserAgent`
2. `ipBlacklist` → **deny** on match
3. `ipWhitelist` → **deny** when set and *not* matched
4. `userAgentBlacklist` → **deny** on match
5. `userAgentWhitelist` → if matched, mark request as *trusted*
6. `allowedDeviceTokens` (+ optional `fetchAllowedTokens`)
7. `allowedPlatforms` / `allowedClients` — **skipped entirely** when the request is trusted

<a id="whitelist-notes"></a>
### Notes

- **Blacklist always wins over whitelist** (both for IPs and UAs).
- IPv4 CIDR is fully supported (e.g. `10.0.0.0/8`, `1.2.3.4/32`, `0.0.0.0/0`).
  IPv6 must be matched exactly — open an issue if you need IPv6 CIDR.
- `::ffff:1.2.3.4` (IPv4-mapped IPv6) is normalised to `1.2.3.4`, so a single
  rule covers both forms.
- Without `trustedProxyIpHeader`, the guard reads `req.ip` and then falls
  back to `req.socket.remoteAddress`. Make sure Express's `trust proxy`
  setting is configured if you rely on `req.ip`.

---

<a id="how-it-works"></a>
## 🧠 How It Works

<a id="device-token-validation"></a>
### 🔐 Device Token Validation

Requests must include a valid token if specified:

```http
GET /api/data
x-device-token: device123
User-Agent: MyIOTDevice/1.0
```

If `allowedDeviceTokens` is `'*'`, all tokens are accepted.

---

<a id="examples"></a>
### 🧩 Examples

#### ✅ Allow everything
```ts
allowedPlatforms: '*'
allowedClients: '*'
allowedDeviceTokens: '*'
```

#### ✅ Allow specific browsers only
```ts
allowedPlatforms: {
    browser: ['chrome', 'firefox']
}
```

#### ✅ Allow custom trusted UA
```ts
allowedPlatforms: {
    customs: ['myiotdevice']
}
```

#### ✅ Allow bots or scripts (for monitoring)
```ts
allowedClients: {
    bots: true
    scripts: true
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

<a id="example-request-flow"></a>
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

<a id="optional-flags"></a>
## ⚙️ Optional Flags

| Rule | Description |
|------|--------------|
| `allowedDeviceTokens` | Must match header token (or be `*` to allow all) |
| `fetchAllowedTokens` | Async dynamic token fetch support |
| `allowedClients` | Controls app/browser/script access |
| `allowedPlatforms` | Controls device or OS access |
| `'*'` (wildcard) | Allows everything for that rule |
| `customs` | Partial case-insensitive match on UA |
| `ipWhitelist` | Allow-list of exact IPs / IPv4 CIDR blocks |
| `ipBlacklist` | Deny-list of exact IPs / IPv4 CIDR blocks (wins over whitelist) |
| `userAgentWhitelist` | Substrings / RegExps that mark a request as trusted (skips client/platform checks) |
| `userAgentBlacklist` | Substrings / RegExps that immediately deny a request |
| `trustedProxyIpHeader` | Header (e.g. `x-forwarded-for`) used to read the real client IP behind a proxy |
| `maxUserAgentLength` | Max accepted UA length (default `512`) |
| `denyEmptyUserAgent` | Reject requests with no `User-Agent` header |

---

<a id="license"></a>
## 📜 License

MIT © 2025

[⬆ Back to top](#toc)

