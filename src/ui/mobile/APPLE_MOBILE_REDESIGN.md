# Apple-style mobile redesign from the 25 screenshots

## Scope

Only the mobile presentation tree changed. Existing controllers, API endpoints, database, permissions, authentication, payment/check-in handlers, form validation and web UI remain in place. The existing theme preference and system appearance behavior are reused.

## Compiler fix verified against the actual app configuration

The screenshots show the earlier button-layout failure despite previous unit tests passing. The earlier createElement boundary was also rewritten by nativewind/babel. NativePressable now explicitly passes cssInterop: false, which the installed runtime consumes before forwarding to native Pressable. Its style function, press state, refs, children and event handlers remain intact.

The regression test now runs the source through frontend/babel.config.js in development and production, then through the installed NativeWind JSX wrapper. Removing the opt-out reproduces interception. This verifies the emitted app code, rather than relying only on TypeScript-transpiled render-tree tests.

## Redesigned areas

- Shared design system: calmer 28-point page titles, 22-point section headings and 18-point card headings; native system fonts, existing scalable text, semantic contrast, blue accents, tinted input surfaces and consistent rounded cards. Reference background treatment now applies across mobile screens.
- Home/Members/Operations/Profile: the compiled button fix restores their designed full-width hero, compact member rows, two-column operation tiles, grouped settings rows and practical touch targets.
- Add/Edit Member: clearer user-facing copy and full-width fields retain all existing required fields and validation.
- Attendance: QR and activity sections are stacked at full width; statistic cards wrap into two columns; activity ring and legend fit the available panel; labels shrink/wrap without overflowing. Long member codes use a readable single line with the full accessible label. Header back navigation and refresh controls remain reachable. The decorative date chevron was removed because the date is informational, not a working date picker.
- QR panel: full-width layout prevents oversized QR codes and one-character metric columns; small metrics wrap instead of compressing indefinitely.
- Workout Plans: removed hardcoded zero statistic cards and redundant middle heading. The live ResourceCrudPanel still owns actual records, loading/errors, creation, editing and permissions. Create New Plan invokes the same createRequest callback.
- Payments: two-column statistic cards, a two-column quick-action grid, full-width search, themed chart text and explicit empty transaction/chart states. Removed fabricated 8.2% labels without modifying underlying financial calculations or save handlers.
- Generic resource panels: pagination wraps horizontally rather than occupying three oversized vertical rows. Existing page state, limits and callbacks remain unchanged.
- Settings: removed duplicate Theme and explanatory Authentication tiles; the existing Appearance switch and real security forms remain. The compiler fix restores Profile/Subscription row styles and button feedback.

## Screenshot interpretation

Screenshots 1, 2 and 25 include iOS Control Center, Expo Go's loading view or the app switcher. Those host surfaces are outside the application. Several other screenshots were captured during the native stack slide transition; the partially visible previous screen is expected during that gesture. This pass retains native navigation behavior rather than disabling transitions.

## Validation and device review

TypeScript passed. The existing application suite passed 26 tests; the mobile suite passed 34 tests, including compiler-level and narrow-layout regressions (60 total). Both iOS and Android exports passed. Actual corrected-device screenshots and interactive device replay were not available in this session; no pixel-parity claim is made.

Restart Metro from frontend with `npx expo start --clear`, then reopen the project in Expo Go so the phone loads the corrected compiled UI. The recording's red iOS status bar is produced by screen recording and is not an app theme error.
