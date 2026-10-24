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

## Mobile push notifications

The notification bell works without EAS. Remote phone notifications require a linked Expo project and platform credentials.

1. In `frontend`, run `eas init` and select the intended Expo account/project. Because `app.config.js` is dynamic, if EAS cannot write the project ID automatically, add the returned ID to `app.json` as `expo.extra.eas.projectId`, or set `EXPO_PUBLIC_EAS_PROJECT_ID` in the build environment. Preserve any existing configuration.
2. Run `eas build:configure`, then `eas credentials --platform android` to configure an FCM V1 service account. Configure Firebase's `google-services.json` through `expo.android.googleServicesFile` as described in the Expo setup guide.
3. For iOS, run `eas credentials --platform ios` to configure the Apple push notification key using the appropriate Apple Developer account.
4. Build and install PulseFit, enable notifications, and verify delivery on a device. Use a development build or production build for remote notifications.

An EAS project ID identifies the Expo project; it is not a push credential. A configured ID alone does not prove FCM/APNs credentials are ready. Check them in the EAS credentials manager and verify delivery.

See [Expo push notification setup](https://docs.expo.dev/push-notifications/push-notifications-setup/).

## Website notifications

The dashboard bell and notification centre start automatically over an authenticated live connection. A 60-second recovery poll and reconnect refresh recover missed changes. On the first click or keypress after sign-in, PulseFit requests notification permission through the browser's standard prompt. Once allowed, desktop alerts work automatically on later visits. Denied permission is not requested again; it can be changed in browser site settings. Desktop alerts require HTTPS (or localhost) and an open PulseFit tab; closed-tab Web Push is not configured. Existing unread notifications stay in the centre without flooding the desktop when signing in.

See [notification operation and deployment](docs/NOTIFICATIONS.md) for migration, reverse proxy, mobile delivery, and verification requirements.
