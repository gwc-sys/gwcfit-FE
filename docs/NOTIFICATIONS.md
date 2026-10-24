# Notification operation

## Deployment

1. In `backend`, run `python -m alembic upgrade head` and restart the API. Migration `0013_live_notifications` adds PostgreSQL triggers. It is required for immediate event delivery.
2. Restart/rebuild the frontend. Installed Android and iOS apps need a new build containing the live client changes.
3. Route `/api/v1/notifications/live` through the reverse proxy with WebSocket upgrades enabled. Use WSS with an HTTPS frontend; allow the frontend origin in the backend CORS configuration. Tokens are sent in the first socket frame, never in the URL.
4. Preserve the existing Expo project and Android FCM/iOS APNs credentials. Enable notification permission on each device. Remote native push requires an installed app, not Expo Go.

For this workspace's Docker development setup, run `docker compose up -d --no-deps api` from the workspace root. The override mounts both application code and migrations, and startup applies migrations before Uvicorn starts. The Nginx configuration includes WebSocket upgrade headers; validate/reload it with `docker compose exec -T nginx nginx -t` and `docker compose exec -T nginx nginx -s reload` after an API container replacement. Running Alembic on the host may target a different database than Docker, so verify the container with `docker compose exec -T api python -m alembic current`.

## Delivery

- New gym enquiries save Super Admin alerts at submission time. Notification failure is isolated in a savepoint and does not reject valid enquiries.
- PostgreSQL publishes only committed changes. Each API worker has one listener, so an event written on one worker reaches clients connected to another.
- Changes to enquiries, gyms, subscriptions, invitations, and login events wake the event sync worker. The worker also runs at least every 30 seconds to recover missed events and evaluate time-based subscription alerts. Gym suspension expiry checking runs every 60 seconds.
- Notification inserts wake the mobile outbox and invalidate the affected account's connected bell/history queries. Read changes also refresh other connected devices. Queues coalesce bursts rather than growing without limit.
- The client reconnects with backoff, refreshes expired access tokens through the existing HTTP auth flow, and refetches history after reconnect. A 60-second recovery poll remains available if sockets are blocked. Returning to the app/page also refreshes data.
- Android/iOS send attempts use high priority. Per-device state avoids resending accepted pushes when a different device fails. Retry timestamps prevent accepted receipt checks from blocking newer pushes. Transport failures use backoff.
- Expo ticket acceptance is not delivery confirmation. The worker checks receipts after 15 minutes, removes unregistered tokens, and records retryable credential/provider errors in `notifications.payload.push_deliveries`. It retries pending alerts for up to one day. Never expose that internal payload to clients; the API returns selected display fields only.
- Native registration handles token rotation and iOS provisional permission. Signing out attempts token removal, clears visible notifications, closes the live connection, and resets the badge. Token removal requires connectivity; server-side ownership is reassigned on the next registration.

## Boundaries

Network, browser scheduling, Expo, APNs and FCM determine actual arrival time. Microsecond end-to-end delivery cannot be guaranteed. Local listener measurements do not measure internet or phone delivery. The operating system may delay background notifications.

Website desktop alerts require an open tab and permission. The standard browser prompt is requested on the first click or keypress after sign-in, without a separate enable button. Already granted permission works automatically; denied permission is not requested again. Closed-tab Web Push/service-worker subscriptions are not configured. Unsupported browsers still receive the in-app bell/history updates. Read status is shared across devices; already displayed operating-system banners are not remotely withdrawn.

## Verification

- Backend: `python -m pytest app/tests/test_platform_notifications.py app/tests/test_notification_live.py app/tests/test_notification_push_delivery.py app/tests/test_cors.py -q`.
- Frontend: `npm run typecheck`, `npm test`, and `npx expo export --platform all`.
- Device acceptance: submit a new enquiry, verify each active Super Admin's bell/history, open and read it on one device, and verify the other connected devices update. Repeat with the app in the background and confirm native delivery receipts. Disconnect/reconnect and sign out to verify recovery and account isolation.

Provider reference: [Expo sending notifications and receipts](https://docs.expo.dev/push-notifications/sending-notifications/).
