# PulseFit mobile reference implementation

## Scope

All implementation changes are within frontend/src/ui/mobile. The Expo / React Native / TypeScript app uses shared controllers, React Query hooks, RBAC and React Navigation, with separate native and web presentation trees. Web presentation, backend, API contracts, auth, validation and shared business calculations remain unchanged. The existing broader screen inventory is in AUDIT_INVENTORY.md; this pass targets six owner screens.

The UI migration is: establish reference tokens and reusable presentation; refine native chrome and safe areas; implement the six reference layouts; keep richer existing controls discoverable; verify shared regressions, native render trees, derived display metrics, TypeScript and both native bundles. No package changes were necessary.

## Screen mapping and behavior

| Reference | Existing native screen | Reused behavior | Refinement |
|---|---|---|---|
| Home | GymAdminDashboardScreen | Existing dashboard, member and payment queries, owner counts and detail panels | Blue gradient total-members hero, Active/Revenue/New/Expiring cards, real recent members, expandable original insights |
| Members | MemberListScreen | Existing RBAC member query, search, sort, pagination, edits and confirmed deactivation | Compact title/search/filter layout, All/Active/Inactive/Expiring chips, single-row identity/plan/status, expandable actions |
| Operations | OperationsHubScreen | Existing permission checks and stack destinations | Two-column colored tiles in reference order, remaining tools under More tools |
| Analytics | ReportsScreen | Existing paid-payment query and reports; existing useMembers hook through a native adapter | 7D/30D/3M/1Y chips, cumulative revenue line, real New Members/Member Growth, revenue bars and date/amount axes |
| Notifications | NotificationsScreen | Existing query, unread status, mark-read mutation and invalidation | Colored category icons, relative timestamps, unread dots, All/Unread filters and readable detail sheet |
| Profile | ProfileScreen | Existing user, staff/settings/plan routes, MyGymPanel, persisted theme provider and confirmed logout | Centered identity, grouped settings, gym/preferences/help/about sheets, account details retained |

## Changed files

- theme/theme.ts and theme/referenceTokens.ts: navy/white surfaces, exact decorative accent and gradient tokens, accessible semantic text and compact corners.
- components/PulseReference.tsx: shared chips, cards, real-photo/initial avatars, baseline-aware trend indicators and SVG chart.
- components/OwnerMobileOverview.tsx: native owner summary and context using data already supplied by the shared controller.
- components/OperationCard.tsx and SettingsRow.tsx: strongly typed presentation-only grid/settings primitives.
- components/PulseAnalytics.tsx, hooks/useAnalyticsMembers.ts and data/referenceMetrics.ts: existing RBAC member hook, display ranges and metrics isolated from shared services.
- components/Screen.tsx: avoid duplicate home-indicator insets inside a tab navigator while retaining standalone safe areas.
- components/ScreenHeader.tsx: title and trailing action, preserving stack back behavior.
- layouts/PulseDashboardLayout.tsx and WorkspaceChrome.styles.ts: compact brand/greeting; hide duplicate branding above non-home owner screens; preserve notification/account/attendance/member actions.
- navigation/RootNavigator.tsx: reference owner tab labels and icons with unchanged route names and role gates.
- Six screens under screens/saas and MemberListScreen/ReportsScreen native styles: layout and working controls described above.
- __tests__/native-layout.test.cjs and reference-metrics.test.cjs: native presentation, permission/destination and date/metric regressions.

## Data and access limits

Counts, activity and percentages use existing returned records. New-member, expiry and range-comparison metrics inherit the existing 200-record list limit. They do not promise a complete historical aggregate for larger gyms. Percentage indicators are omitted when there is no previous-period baseline; Member Growth uses a dash when undefined. Expiring reuses getMembershipState's seven-day rule and rejects invalid/expired dates; Expired and Frozen remain in the filter menu. Analytics member queries run only with manage_members permission.

Member photos use existing extra_data.profile_photo when present, otherwise initials. The AuthUser model supplies no owner photo or owner-profile editing endpoint, so the profile avatar is initials and edit opens existing account settings.

The reference Equipment label uses the existing purple workout tile and keeps its WorkoutPlans destination. No equipment inventory service or mutation was added. Check-In and Attendance use the existing attendance screen. Announcements opens existing notifications for reading updates; no publishing feature was invented. Notifications have no priority field. The Important control explains that importance labels are unavailable; it does not invent priority statuses or change notification filtering business rules. Profile Subscription & Billing uses the MembershipPlans destination already used by the existing owner settings flow; it is not a new payment or tenant subscription processor. Help is a local usage guide, not an external support integration.

## Visual validation limits

The Browser runtime was initialized and browser discovery returned no available browsers. No adb or emulator command was available. Consequently no device screenshots, image-by-image comparison or real native interaction validation was possible in this session. Native render-tree tests cover both themes, 320-point layouts, doubled text scale, permission-controlled actions and empty/real-data states. They are not screenshots or proof of pixel parity. Foreground shades differ slightly from decorative reference colors to retain measured text contrast.

## Verification results

- npm run typecheck: passed on the final sources.
- npm test: 26 passed.
- node --test src/ui/mobile/__tests__/*.test.cjs: 24 passed (18 native layout/interaction and 6 metric/date tests).
- npx expo export --platform ios --platform android --output-dir .tmp/pulsefit-reference-native: passed for both targets; final output is in .tmp/pulsefit-reference-native. Export log: .tmp/pulsefit-reference-export.log.
- git diff --check: passed (line-ending notices only).
- Device screenshots, visual image comparison and simulator/native runtime validation: unavailable; not claimed as completed.

## Final presentation refinement

The six reference screens now opt into a subtle white/blue or navy background gradient. Embedded native screens let the workspace background show through, avoiding opaque nested panels. Filter chips use compact 32-point visible pills within their existing 44/48-point touch areas; selected pills use a blue gradient. Operation icons use theme-specific accent colors and the reference's eight labels/order, while destinations remain unchanged. Borders and bottom navigation surfaces were refined against the image. All source changes in this pass are presentation changes; no data services or metric calculations were edited.

The Equipment destination and Important information action are explicit compatibility fallbacks, not newly implemented inventory or notification-priority features. Account/member identities and business values remain real data, so they will differ from the sample image. No on-device image comparison was performed; exact pixel parity remains unverified.

Final refinement verification: TypeScript passed, all 57 tests passed, and iOS plus Android exports passed in `.tmp/reference-design-final`. No web or backend files were modified by this refinement.
