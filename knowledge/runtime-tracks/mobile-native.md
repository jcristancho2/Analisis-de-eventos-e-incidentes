# Runtime Track: Mobile Native

> Choose this when the deliverable is an app installed from the App Store or Google Play — push notifications, camera, offline storage, background work, a home-screen icon.

**Last verified: 2026-07-27** — every version below was checked against the npm registry, the Expo
SDK 57 `bundledNativeModules.json`, and the vendors' release feeds on this date. When refreshing this
file, re-verify and update this line.

## When to choose this track

- **Default to Expo.** Managed workflow, config plugins, `expo-router`, EAS Build and EAS Update. It
  covers roughly 95% of mobile products and it is what the rest of this file assumes.
- **Ejecting is almost never necessary.** Expo's continuous native generation (CNG) plus config
  plugins means you can add native dependencies and edit `Info.plist` / `AndroidManifest.xml` without
  ever checking in `ios/` and `android/`. If someone says "we'll need to eject for X", make them name
  X first — it is usually already a config plugin.
- **Go fully native (Swift/SwiftUI + Kotlin/Compose) only when the product is genuinely native-heavy:**
  custom camera pipelines, ARKit/ARCore, low-latency audio/DSP, Live Activities and widgets as a core
  surface, CarPlay/watchOS/visionOS, or you need a platform API the day it ships rather than a
  release cycle later.
- **Not this track** if the answer is really a responsive web app — see `knowledge/runtime-tracks/ts-node.md`.
  Shipping a WebView wrapper gets rejected under App Review guideline 4.2 (minimum functionality).
- **Flutter** is a legitimate choice — one codebase, excellent rendering consistency, strong for
  design-heavy apps. Pick it only if the team already writes Dart. It cannot share code or types with
  a TypeScript backend, which is the single biggest reason to prefer Expo.

## Pinned versions

| Layer | Choice | Version | Notes |
|---|---|---|---|
| Framework | Expo SDK | `57.0.8` | npm `latest`; SDK line `sdk-57` |
| Runtime | React Native | `0.86.0` | Expo template pins exact `0.86.0`; npm `latest` is `0.86.2` |
| UI | React | `19.2.3` | RN 0.86 peer is `^19.2.3` |
| Routing | `expo-router` | `~57.0.8` | Versioning changed — see Gotchas |
| Styling | `nativewind` | `4.2.6` | Needs `tailwindcss` **3.x**, not 4 |
| Styling | `tailwindcss` (native only) | `~3.4.17` | Pinned separately from any web app in the repo |
| Animation | `react-native-reanimated` | `4.5.1` | SDK pin; npm `latest` is `4.5.3` |
| Animation | `react-native-worklets` | `0.10.1` | Mandatory peer of Reanimated 4 |
| Gestures | `react-native-gesture-handler` | `~2.32.0` | npm `latest` is `3.1.0` — **do not install it yet** |
| Navigation | `react-native-screens` | `~4.26.0` | |
| Navigation | `react-native-safe-area-context` | `~5.7.0` | |
| Web output | `react-native-web` | `~0.21.0` | Optional; only if you want a web target |
| Language | TypeScript | `~6.0.3` | Expo SDK 57 template pin. TS 7.0.2 exists; template has not moved |
| Types | `@types/react` | `~19.2.2` | |
| Testing | `jest-expo` | `57.0.2` | Major must match the SDK major |
| Lint | `eslint-config-expo` | `~57.0.0` | Driven by `expo lint` |
| Build/deploy | `eas-cli` | `21.3.0` | |
| Health check | `expo-doctor` | `1.20.1` | |
| Toolchain | Node | `22+` required, **24 LTS** recommended | RN 0.84 raised the floor to 22 |
| Toolchain | JDK | `17` (Azul Zulu) | |
| Toolchain | Android SDK | compile & target **36** (Android 16) | Play requires target 36 for new apps and updates from 2026-08-31 |
| Toolchain | Xcode | **26+** with the iOS 26 SDK | Required for all App Store Connect uploads since 2026-04-28 |

### Fully-native sub-track

| Platform | Language | Version | UI |
|---|---|---|---|
| iOS | Swift | `6.3.3` | SwiftUI, with UIKit for anything SwiftUI still can't do (complex collection views, precise keyboard control) |
| Android | Kotlin | `2.4.10` | Jetpack Compose via BOM `2026.06.01` |
| Cross-platform alt | Flutter / Dart | `3.44.8` / `3.12.2` | Flutter stable channel |

## Setup

```bash
# 1. Scaffold — this template already includes expo-router, reanimated, worklets, gesture-handler
npx create-expo-app@latest my-app
cd my-app

# 2. NativeWind. Note the explicit npm install: `expo install` is SDK-aware but NativeWind is not in
#    Expo's bundled module list, so it would pull Tailwind 4 and break the build.
npm install nativewind@^4.2.6
npm install --save-dev tailwindcss@~3.4.17 prettier-plugin-tailwindcss
npx tailwindcss init

# 3. Verify the whole dependency graph agrees with the SDK
npx expo-doctor@latest

# 4. Run
npx expo start
```

`babel.config.js` — the worklets plugin **must be last**:

```js
module.exports = function (api) {
  api.cache(true);
  return {
    presets: [["babel-preset-expo", { jsxImportSource: "nativewind" }], "nativewind/babel"],
    plugins: ["react-native-worklets/plugin"],
  };
};
```

`metro.config.js`:

```js
const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");
module.exports = withNativeWind(getDefaultConfig(__dirname), { input: "./global.css" });
```

## Conventions

```
app/                      # expo-router: filesystem = navigation. This is the only router.
  _layout.tsx             # Root: providers, fonts, splash gate
  (tabs)/                 # Route group — parens do not appear in the URL
    _layout.tsx
    index.tsx
  (auth)/
    sign-in.tsx
  [id].tsx                # Dynamic segment
  +not-found.tsx
components/               # Presentational only. No data fetching.
features/<domain>/        # Screens' business logic, hooks, and API calls, colocated
lib/                      # api client, storage, analytics, notification registration
constants/theme.ts        # Design tokens. Mirror them into tailwind.config.js — one source.
global.css                # Tailwind directives, imported once in the root layout
app.config.ts             # Prefer .ts over app.json: env-driven bundle IDs and variants
eas.json                  # development / preview / production profiles
```

- **Never create `ios/` or `android/` directories in git.** Stay on CNG. Native changes go through
  config plugins or `expo-build-properties`.
- One screen file = one route. Push data fetching down into `features/<domain>` hooks so screens stay
  under ~150 lines.
- Secrets never live in `app.config.ts` — anything in the JS bundle is readable. Use EAS environment
  variables for build-time values and a server for anything actually secret.
- Use `expo-secure-store` for tokens, `expo-sqlite` or MMKV for local data. Not AsyncStorage for
  credentials.

## Testing / Lint / Build commands

| Task | Command |
|---|---|
| Dev server | `npx expo start` |
| Type check | `npx tsc --noEmit` |
| Lint | `npx expo lint` |
| Unit tests | `npx jest` (preset `jest-expo`) |
| Dependency health | `npx expo-doctor@latest` |
| Upgrade SDK | `npx expo install expo@^58.0.0 --fix` then `npx expo-doctor@latest` |
| Regenerate native dirs | `npx expo prebuild --clean` |
| Dev build (device) | `eas build -p ios --profile development` |
| Production build | `eas build -p all --profile production` |
| Ship JS-only fix | `eas update --branch production --message "fix: …"` |
| Submit to stores | `eas submit -p ios --latest` / `eas submit -p android --latest` |

E2E: **Maestro** for flows (`maestro test .maestro/`). It is far less brittle than Detox on Expo and
runs against the same dev build EAS already produced. `playwright-cli` does not apply here.

## Deployment notes

**EAS Build** produces the binaries. Three profiles, always: `development` (dev client, internal
distribution), `preview` (release-mode internal build for QA and TestFlight-alikes), `production`
(store submission). Get the development build onto a real device on day one — Expo Go is a demo
sandbox, not your app, and anything with a custom native module will not run in it.

**EAS Update** ships JS, styles, images, copy, and layout over the air. It cannot change native code,
permissions, or the Expo SDK version. The gate is `runtimeVersion`: an update only reaches builds
whose runtime version matches, so bumping native code creates a new runtime and correctly strands old
binaries. Use `--branch` per environment, roll out gradually, and keep the previous update ready to
republish as a rollback.

**What actually needs a store review vs. what does not:**

| Change | Path |
|---|---|
| Bug fix, copy, styling, new screen built from existing native modules | EAS Update — live in minutes |
| Feature flag flip, A/B config, remote content | EAS Update or your own config endpoint |
| New permission (camera, location, contacts) | New build + review |
| New native dependency or config plugin | New build + review |
| Expo SDK / RN upgrade | New build + review |
| App icon, name, App Store metadata or screenshots | Store review (metadata-only review is faster) |

**The policy line on OTA.** App Review guideline 2.5.2 reads strictly — apps "may not download,
install, or execute code which introduces or changes features or functionality." OTA JS updates
survive on the Developer Program License Agreement's interpreted-code carve-out, and Apple has not
enforced against Expo/CodePush-style updates in practice. The rule that matters: **never use an
update to change what the app is.** Shipping a feature you deliberately hid from review is guideline
2.3.1 (hidden features), and that is the one with "removal from the Apple Developer Program" attached.
Fixes and iteration, yes. A different app after approval, no.

**Review timelines — plan around these, do not gamble on them.** Apple reviews the large majority of
submissions within 24–48 hours, but a first submission from a new team, an app with accounts, or
anything touching payments or health data routinely takes longer, and a rejection resets the clock.
Google Play is usually faster for updates but a **first** release of a new personal developer account
can sit in extended review for days and requires closed testing before production. Budget a week for
your first ship on each store. Never promise a launch date that depends on a same-day approval.

**The rejections that actually happen** (in rough order of frequency):

1. **2.1 — incomplete.** No demo account, or the backend was down during review. Put working
   credentials in App Store Connect's review notes every single submission.
2. **5.1.1(v) — no in-app account deletion.** If users can create an account, they must be able to
   delete it inside the app. Not "email support."
3. **5.1.1 — privacy.** Missing privacy policy URL, a Privacy Manifest that does not match what the
   SDKs actually collect, or a vague purpose string. "This app needs your location" is not a reason.
4. **3.1.1 — payments.** Any digital good or subscription must go through IAP. Linking out to your
   own checkout for in-app content is an instant rejection.
5. **4.2 — minimum functionality.** Thin WebView wrappers and link collections.
6. **4.8 — login.** Third-party social login as the primary account without an equivalent
   privacy-preserving alternative (Sign in with Apple satisfies this).
7. **Crash on launch on the reviewer's device.** Test a release-mode build on a physical device, not
   just the simulator.

## Gotchas

- **The New Architecture is the only architecture. Delete every `newArchEnabled` setting you find.**
  RN 0.82 made bridgeless mandatory: `newArchEnabled=false` on Android and `RCT_NEW_ARCH_ENABLED=0`
  on iOS are *ignored*. RN 0.84 began physically removing Legacy Architecture components. Any tutorial
  or config that toggles this flag is pre-0.82 and stale — remove the line, do not set it to `true`.
  If a third-party library still needs the old architecture, it needs replacing, not a flag.
- **Upgrade Expo through `expo install --fix`, never by hand-editing `package.json`.** The SDK is a
  matched set of ~40 native modules; a manual bump of one desynchronizes the native build in ways that
  surface as opaque Gradle or CocoaPods errors. The path is: `npx expo install expo@^<next> --fix`,
  then `npx expo-doctor@latest`, then read the SDK changelog. Same for adding any package with native
  code: `npx expo install <pkg>`, not `npm install <pkg>`.
- **`react-native-gesture-handler` npm `latest` is 3.1.0; Expo SDK 57 pins `~2.32.0`.** GH 3.0 is a
  rewrite with a new hook-based API. `npm install react-native-gesture-handler` gets you 3.x and a
  broken build. Always `npx expo install`. Same trap class applies to `reanimated` (`latest` 4.5.3 vs
  SDK pin 4.5.1) and `worklets` (`latest` 0.11.3 vs SDK pin 0.10.1).
- **Reanimated 4 needs `react-native-worklets` as a separate install, and the babel plugin renamed.**
  It is `"react-native-worklets/plugin"`, not `"react-native-reanimated/plugin"`, and it must be the
  last entry in the plugins array. Reanimated 4.x also only runs on the New Architecture.
- **The old Hermes + Reanimated 3 memory hang is dead — do not repeat it.** The current live memory
  caveat is different and much narrower: Worklets **Bundle Mode** re-evaluates the JS bundle on each
  extra runtime in *development*, costing up to ~4× bundle size per runtime. It does not affect
  production, where bytecode is used and extra runtimes are nearly free. If you hit it, develop on a
  device without a heavily constrained heap rather than disabling Bundle Mode.
- **NativeWind stable is a Tailwind 3 library.** `nativewind@4.2.6` documents `tailwindcss@^3.4.17`.
  NativeWind 5 (`5.0.0-preview.4`, requires Tailwind `>4.1.11` plus `react-native-css`) is preview
  quality. In a monorepo that also has a Tailwind 4 web app, keep two separate Tailwind versions and
  share only the *token file*, not the config.
- **`expo-router` versioning changed.** It is now `~57.0.8` — lockstep with the SDK. Older docs
  showing `expo-router@5` or `@6` describe SDK 53 and 54. Do not "upgrade" to a lower-looking number.
- **`npx expo prebuild` now wipes `ios/` and `android/` by default** in SDK 57. Pass `--no-clean` to
  preserve them. If that matters to you, you have manual native edits that belong in a config plugin.
- **Android edge-to-edge is enforced on Android 15+.** RN 0.86 improved handling, but you still owe
  every screen correct `SafeAreaView` / `useSafeAreaInsets` treatment or content sits under the system
  bars on modern devices.
- **iOS build minutes are the schedule risk.** EAS free-tier iOS queues can be long. For a team on a
  deadline, a paid plan or a self-hosted runner is a cost line item, not an optimization.
- **Fully-native sub-track:** SwiftUI previews break constantly in large modules — keep view files
  small and prefer a runnable sample app target. On Android, always use the Compose **BOM** rather
  than pinning individual `androidx.compose.*` artifacts; mismatched Compose artifact versions are the
  #1 source of runtime crashes there.

## Shapes that use this track

- `knowledge/shapes/mobile-app.md` — the primary consumer
- `knowledge/shapes/agent-app.md` — when the agent surface is a phone app rather than a web client
- `knowledge/shapes/generative-media-app.md` — when capture and on-device media handling are central

## See also

- `knowledge/runtime-tracks/ts-node.md` — the companion API/backend; share types across both
- `knowledge/capabilities/auth.md` — mobile auth adds secure token storage and deep-link callbacks
- `knowledge/capabilities/payments-rails.md` — IAP vs. Stripe is a store-policy decision, not a
  technical one
- `knowledge/capabilities/deployment.md` — EAS in the context of the wider release pipeline
- `knowledge/stack-compatibility.md` — the SDK-pinned-version traps above, cross-checked
- `knowledge/skills-registry.md` — `ui-ux-pro-max` for the mobile design system, `emil-design-eng`
  for motion; both degrade gracefully if absent
