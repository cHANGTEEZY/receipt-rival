# expo-boiler-plate

A premium Expo 57 starter with Better Auth, HeroUI Native, Uniwind, and a refined foundation ported from production patterns.

## Stack

- **Expo SDK 57** + React Native 0.86 + React 19
- **Expo Router** with Native Tabs, auth groups, and stack overlays
- **Better Auth** with SecureStore session cookies
- **TanStack Query** + Axios API layer
- **HeroUI Native** + **Uniwind** + Tailwind CSS v4
- **TanStack Form** + **Zod** for auth validation
- **Signal Blue** design system — see [`DESIGN.md`](DESIGN.md)

## Project structure

```
src/
├── app/              # Thin route files (Expo Router)
│   ├── (auth)/       # Sign-in, sign-up
│   ├── (app)/        # Native Tabs: Home, Explore
│   └── (screens)/    # Stack overlays: Settings, Appearance
├── features/         # Feature modules (screens + logic)
├── components/       # Shared UI (headers, haptics, skeletons)
├── hooks/
├── lib/              # Auth client, API client, query client
├── api/              # API modules + React Query hooks
└── utils/
```

Routes re-export feature modules — e.g. `src/app/(auth)/sign-in.tsx` → `@/features/auth/sign-in`.

## Get started

1. Install dependencies:

   ```bash
   npm install
   ```

2. Copy env and set your API URL:

   ```bash
   cp .env.example .env
   ```

   Set `EXPO_PUBLIC_API_URL` to your Better Auth server (e.g. `http://localhost:3000`).

3. Start Metro:

   ```bash
   npx expo start
   ```

## Development builds (required for Native Tabs)

Native Tabs, blur headers, and haptics require a **development build** — Expo Go has limited support.

```bash
npx expo run:ios
# or
npx expo run:android
```

## Environment

| Variable | Description |
|----------|-------------|
| `EXPO_PUBLIC_API_URL` | Better Auth / API base URL (no trailing slash) |

On physical devices, `localhost` is automatically rewritten to your machine's LAN IP (detected from Metro). Android emulators use `10.0.2.2`.

## Scripts

| Script | Description |
|--------|-------------|
| `npm start` | Start Expo dev server |
| `npm run ios` | Run iOS dev build |
| `npm run android` | Run Android dev build |
| `npm run web` | Start web |
| `npm run lint` | ESLint via Expo |

## Auth flow

```
Boot → index (session check) → (auth) sign-in/sign-up  OR  (app) Native Tabs
                                      ↓                        ↓
                              Better Auth              TanStack Query + Axios
                              (SecureStore)            (cookie from auth)
```

## Design

North star: **Calm Focus** — one Signal Blue accent, cool-gray canvas, premium through restraint. Full tokens in [`DESIGN.md`](DESIGN.md) and [`src/global.css`](src/global.css).
