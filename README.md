# PulseFit Frontend

Expo and React Native client for PulseFit.

```powershell
copy .env.example .env
npm install
npm run web
```

Use `npm run android` or `npm run ios` for native development. When testing on a physical device, set `EXPO_PUBLIC_API_URL` in `.env` to the backend URL reachable from that device.

The main app has independent presentation trees in `src/ui/mobile` and `src/ui/web`. Metro chooses the browser `.web.tsx` entries automatically. APIs, hooks, stores and validation remain at their existing paths; screen files retain the shared feature behavior.

See [platform architecture and file mapping](../docs/UI_PLATFORM_ARCHITECTURE.md). Validate with `npm run typecheck`, `npm test`, and `npx expo export --platform all`.
