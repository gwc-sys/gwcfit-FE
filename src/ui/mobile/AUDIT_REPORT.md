# PulseFit mobile UI audit and improvements

## Scope and evidence

Reviewed the supplied 11.jpg as visual direction: soft blue backgrounds, blue accents, rounded image and summary surfaces, clear hierarchy and generous spacing. Existing imagery and data are reused; no health measurements or new product features were invented from the reference.

The initial mobile tree contained **122 files / 22,484 lines**: 40 screen modules, 26 component modules, 2 feature presentation modules, 4 layout files, 1 navigation module, 46 style files, 1 theme module, 1 test file and DESIGN.md. Every initial file was read by the inventory audit; all 120 TypeScript/TSX modules were parsed for imports, controls and query usage. The dependency traversal read 219 shared source modules. This is a source audit, not a claim that every screen has been rendered on a device.

See [AUDIT_INVENTORY.md](AUDIT_INVENTORY.md) for the complete per-file inventory and modification status.

## Architecture and protected functionality

- Expo 57, React Native 0.86.3, React 19, React Navigation 7. The app uses native stacks and bottom tabs, not Expo Router.
- Android/iOS resolve native presentation facades to ui/mobile; browser facades resolve ui/web. Shared controllers keep API queries, mutations, data preparation and workflows in their existing locations.
- Shared hooks reviewed: useAuthActions, useMember, useOperations and useRbac. Member hooks retain query keys, refresh intervals, retry policy and mutations. CRUD hooks retain payloads, invalidation and permission gates.
- Shared navigation/store checks retain member, trainer, receptionist, sub-admin, gym-owner and super-admin route/permission decisions. Their native views still register the existing routes.
- Shared theme preference persistence and system-theme selection are unchanged. APIs, authentication/token handling, validation, database code and calculations were not edited.
- All 504 initial non-mobile frontend source files were hash checked against the audit baseline. No intentional change outside the mobile tree; no dependency additions or package/configuration changes.
- The source scan still finds 248 native Pressable controls. Count parity is an audit aid, not proof of end-to-end workflow correctness.

## Findings and completed fixes

| Area | Finding | Improvement |
|---|---|---|
| Visual system | Repeated radii and a neutral light background differed from the reference | Soft blue light background, shared rounded card/button tokens, existing blue actions and preserved dark theme |
| Onboarding | Fullscreen image/gradient and constrained heading could be difficult at large text sizes | Scrollable themed introduction, rounded existing image, wrapping copy, page announcement; same skip/next/final-account/sign-in callbacks |
| Targets | Small icon controls and fixed-height text actions across roles | Central controlMetrics token: 44 pt on iOS, 48 dp on Android; 119 interactive style definitions updated; fixed text-button heights can grow |
| Labels | 31 icon-only controls lacked explicit names | Names for search clear, view/edit/delete, serving changes, timer, camera, tracking, manual repetition and refresh controls |
| Disabled state | Some disabled controls lacked screen-reader metadata | Disabled accessibility state mirrors existing disabled expressions; original permission/mutation guards remain |
| Forms | Hairline focus/error styling and incomplete required/error announcements | Two-point focus/error outlines, required/error hints, original input values, callbacks and validation retained |
| Large text | Segments, badges, summaries and panel text could truncate | Wrapping content, flexible segment widths, growing tab bars and removal of selected single-line restrictions |
| Navigation | Workout tab used the active color when unfocused | Tint now follows the supplied focused/inactive navigation color; route registration/listeners unchanged |
| Keyboard | iOS could apply automatic keyboard insets and KeyboardAvoidingView together | One inset strategy for keyboard forms, original dismiss/tap behavior, Android height handling, embedded offset correction |
| Duplicate code | AppScreen duplicated Screen keyboard/safe-area implementation | AppScreen retains its public props and delegates to the shared native Screen implementation |
| Calendar | Seven columns cannot fit minimum targets on narrow phones or large text | Scrollable full-date rows when the grid would be too small; same month/date/clear/today handlers and minimum-date guards |
| Reduced motion | Button scaling and some dialog transitions ignored the preference | Opacity-only reduced-motion feedback; core picker/account dialogs suppress transitions when reduced motion is enabled |
| Modal accessibility | Nested panel Pressables could be treated as one control | Noninteractive event-containment panels do not become standalone screen-reader targets; children stay available |
| Contrast | Success text on the new background and a light-mode status-ring number were low contrast | Darker light-theme green, semantic ring text, contrast-safe destructive button background |
| Charts | Owner overview bars had no explicit numerical alternative | Each bar group exposes its existing date and series values as an accessibility label |
| Errors/offline | Existing request errors lacked connection guidance | Recognized network/timeout errors retain the original error and add connection guidance; no connectivity tracking, queue or retry policy added |
| Native cleanup | Unused local sizing variables and browser outline rules remained | Removed the unused inset variables and native-only outline rules; compatibility style exports remain to protect shared presentation contracts |

## Executed validation

| Check | Result |
|---|---|
| Frontend npm run typecheck | PASS |
| Frontend npm test | PASS: 26 tests |
| node --test src/ui/mobile/__tests__/*.test.cjs | PASS: 13 tests |
| Backend python -m pytest app/tests -q | PASS: 103 tests; two existing warnings |
| Owner site npm test | PASS: 11 tests |
| Owner site npm run build | PASS |
| Expo Android / iOS / Web export with source maps | PASS: Android, iOS and Web |
| Platform bundle UI-tree isolation | PASS: Android/iOS each include only mobile UI; Web includes only web UI |
| Source control-label scan | PASS: no remaining icon-only Pressables without explicit labels in the static scan |
| Non-mobile frontend source hash comparison | PASS: 504 unchanged files |
| ESLint | NOT AVAILABLE: frontend has no lint script/configuration; no tooling dependency installed |
| Real-device/browser visual checks | NOT RUN: no connected browser, simulator or device validation performed |

**153 tests passed across the executed suites.** The 13 native tests use a mocked React Native host: they verify component props, callbacks, structure, platform target tokens, large-font configuration, input semantics, reduced-motion settings, calendar restrictions, error guidance, selected tab tint and keyboard behavior. They do not measure native layout or screen-reader behavior.

Contrast checks cover 28 central opaque text/button combinations against their primary surfaces, at a 4.5:1 threshold. This does not certify text on photographs, chart colors, all alpha overlays, legacy canvases or every screen-specific literal color.

The backend emitted a python-jose utcnow deprecation warning and a pytest cache permission warning; neither failed tests. Export logs may include Node color-environment warnings. Backend behavior was not modified to suppress unrelated warnings.

## Remaining manual verification and release risks

- Render each role's screens on iOS and Android phones/tablets; review 320/390/768/1024 point/dp widths, landscape, display zoom and foldable widths.
- Use actual iOS Dynamic Type and Android font/display scaling up to 200% and larger accessibility categories. Mocked fontScale tests cannot prove absence of native clipping.
- Run VoiceOver and TalkBack through focus order, all icon actions, selected filters/tabs, validation announcements, modal focus entry/return, disabled controls, charts and destructive confirmations.
- Verify Android back navigation, iOS back gestures, safe areas around notches/home indicators, keyboard appearance/dismissal, nested selectors and scrolling at large text sizes.
- Verify reduced motion on device, including preference changes while the app is open. The existing Reanimated reduced-motion hook may require remounting to reflect a setting change.
- Exercise camera permission grant/deny, camera switching, tracking/manual repetition, pause/rest/completion and camera overlays on actual hardware; no camera workflow was altered.
- Simulate slow requests, empty responses, server errors and network loss/restoration. Existing error/refresh handling remains; a real-time offline banner, persistence queue and offline mutations are not introduced.
- Inspect contrast over photos, charts, specialty badges, legacy workout/coach dark canvases and screen-specific colors. Central token contrast tests are intentionally narrower than a rendered accessibility audit.
- Existing shared-controller compatibility exports/styles were retained where removing them could affect the common presentation-model contract. No broad dead-code deletion was attempted.
- Platform exports validate JavaScript bundling, not signed IPA/APK builds, native installation or a production-readiness certification.

## Design references

- [Apple accessibility guidance](https://developer.apple.com/design/human-interface-guidelines/accessibility)
- [Apple UI design guidance](https://developer.apple.com/design/tips/)
- [Android app accessibility guidance](https://developer.android.com/guide/topics/ui/accessibility/apps)

## Modified files

All paths below are relative to frontend/src/ui/mobile. Test and documentation files are included. No separate web presentation files were edited.

- [DESIGN.md](DESIGN.md)
- [__tests__/native-layout.test.cjs](__tests__/native-layout.test.cjs)
- [components/AppHeader.tsx](components/AppHeader.tsx)
- [components/AppScreen.tsx](components/AppScreen.tsx)
- [components/DataState.tsx](components/DataState.tsx)
- [components/DatePickerField.tsx](components/DatePickerField.tsx)
- [components/FoodNutritionMealPicker.tsx](components/FoodNutritionMealPicker.tsx)
- [components/FormTextField.tsx](components/FormTextField.tsx)
- [components/GymSelectField.tsx](components/GymSelectField.tsx)
- [components/Header.tsx](components/Header.tsx)
- [components/MetricCard.tsx](components/MetricCard.tsx)
- [components/PrimaryButton.tsx](components/PrimaryButton.tsx)
- [components/QuickAction.tsx](components/QuickAction.tsx)
- [components/RelationshipSelectField.tsx](components/RelationshipSelectField.tsx)
- [components/Screen.tsx](components/Screen.tsx)
- [components/ScreenHeader.tsx](components/ScreenHeader.tsx)
- [components/SectionHeader.tsx](components/SectionHeader.tsx)
- [components/SegmentedControl.tsx](components/SegmentedControl.tsx)
- [components/StatusBadge.tsx](components/StatusBadge.tsx)
- [components/SurfacePanel.tsx](components/SurfacePanel.tsx)
- [components/WorkoutCard.tsx](components/WorkoutCard.tsx)
- [components/dashboard/DailyAttendancePanel.tsx](components/dashboard/DailyAttendancePanel.tsx)
- [components/member/index.tsx](components/member/index.tsx)
- [features/operations/GymPanels.tsx](features/operations/GymPanels.tsx)
- [features/operations/ResourceCrudPanel.tsx](features/operations/ResourceCrudPanel.tsx)
- [layouts/PulseDashboardLayout.tsx](layouts/PulseDashboardLayout.tsx)
- [layouts/WorkspaceChrome.styles.ts](layouts/WorkspaceChrome.styles.ts)
- [navigation/RootNavigator.tsx](navigation/RootNavigator.tsx)
- [screens/ExerciseDetailScreen.tsx](screens/ExerciseDetailScreen.tsx)
- [screens/auth/InvitationSignUpScreen.tsx](screens/auth/InvitationSignUpScreen.tsx)
- [screens/auth/LoginScreen.tsx](screens/auth/LoginScreen.tsx)
- [screens/auth/OnboardingScreen.tsx](screens/auth/OnboardingScreen.tsx)
- [screens/member/MemberAttendanceScreen.tsx](screens/member/MemberAttendanceScreen.tsx)
- [screens/member/MemberExerciseDetailScreen.tsx](screens/member/MemberExerciseDetailScreen.tsx)
- [screens/member/MemberWorkoutCoachScreen.tsx](screens/member/MemberWorkoutCoachScreen.tsx)
- [screens/member/MemberWorkoutScreen.tsx](screens/member/MemberWorkoutScreen.tsx)
- [screens/saas/DietPlansScreen.tsx](screens/saas/DietPlansScreen.tsx)
- [screens/saas/GymAdminDashboardScreen.tsx](screens/saas/GymAdminDashboardScreen.tsx)
- [screens/saas/InvitationManagementScreen.tsx](screens/saas/InvitationManagementScreen.tsx)
- [screens/saas/MemberListScreen.tsx](screens/saas/MemberListScreen.tsx)
- [screens/saas/MembershipPlanScreen.tsx](screens/saas/MembershipPlanScreen.tsx)
- [screens/saas/PaymentScreen.tsx](screens/saas/PaymentScreen.tsx)
- [screens/saas/SettingsScreen.tsx](screens/saas/SettingsScreen.tsx)
- [screens/saas/StaffScreen.tsx](screens/saas/StaffScreen.tsx)
- [screens/saas/TrainersScreen.tsx](screens/saas/TrainersScreen.tsx)
- [styles/components/DatePickerField.styles.ts](styles/components/DatePickerField.styles.ts)
- [styles/components/FoodNutritionMealPicker.styles.ts](styles/components/FoodNutritionMealPicker.styles.ts)
- [styles/components/dashboard/DailyAttendancePanel.styles.ts](styles/components/dashboard/DailyAttendancePanel.styles.ts)
- [styles/components/dashboard/PulseDashboardLayout.styles.ts](styles/components/dashboard/PulseDashboardLayout.styles.ts)
- [styles/components/member/MemberDesktopLayout.styles.ts](styles/components/member/MemberDesktopLayout.styles.ts)
- [styles/features/operations/GymPanels.styles.ts](styles/features/operations/GymPanels.styles.ts)
- [styles/features/operations/ResourceCrudPanel.styles.ts](styles/features/operations/ResourceCrudPanel.styles.ts)
- [styles/navigation/RootNavigator.styles.ts](styles/navigation/RootNavigator.styles.ts)
- [styles/screens/auth/LoginScreen.styles.ts](styles/screens/auth/LoginScreen.styles.ts)
- [styles/screens/auth/OnboardingScreen.styles.ts](styles/screens/auth/OnboardingScreen.styles.ts)
- [styles/screens/member/MemberAttendanceScreen.styles.ts](styles/screens/member/MemberAttendanceScreen.styles.ts)
- [styles/screens/member/MemberDashboardScreen.styles.ts](styles/screens/member/MemberDashboardScreen.styles.ts)
- [styles/screens/member/MemberExerciseDetailScreen.styles.ts](styles/screens/member/MemberExerciseDetailScreen.styles.ts)
- [styles/screens/member/MemberWorkoutCoachScreen.styles.ts](styles/screens/member/MemberWorkoutCoachScreen.styles.ts)
- [styles/screens/member/MemberWorkoutDetailScreen.styles.ts](styles/screens/member/MemberWorkoutDetailScreen.styles.ts)
- [styles/screens/member/MemberWorkoutScreen.styles.ts](styles/screens/member/MemberWorkoutScreen.styles.ts)
- [styles/screens/saas/AttendanceScreen.styles.ts](styles/screens/saas/AttendanceScreen.styles.ts)
- [styles/screens/saas/DietPlansScreen.styles.ts](styles/screens/saas/DietPlansScreen.styles.ts)
- [styles/screens/saas/GymAdminDashboardScreen.styles.ts](styles/screens/saas/GymAdminDashboardScreen.styles.ts)
- [styles/screens/saas/InvitationManagementScreen.styles.ts](styles/screens/saas/InvitationManagementScreen.styles.ts)
- [styles/screens/saas/MemberListScreen.styles.ts](styles/screens/saas/MemberListScreen.styles.ts)
- [styles/screens/saas/MemberProfileScreen.styles.ts](styles/screens/saas/MemberProfileScreen.styles.ts)
- [styles/screens/saas/MembershipPlanScreen.styles.ts](styles/screens/saas/MembershipPlanScreen.styles.ts)
- [styles/screens/saas/PaymentScreen.styles.ts](styles/screens/saas/PaymentScreen.styles.ts)
- [styles/screens/saas/SettingsScreen.styles.ts](styles/screens/saas/SettingsScreen.styles.ts)
- [styles/screens/saas/StaffScreen.styles.ts](styles/screens/saas/StaffScreen.styles.ts)
- [styles/screens/saas/SuperAdminDashboardScreen.styles.ts](styles/screens/saas/SuperAdminDashboardScreen.styles.ts)
- [styles/screens/saas/TrainersScreen.styles.ts](styles/screens/saas/TrainersScreen.styles.ts)
- [theme/theme.ts](theme/theme.ts)
- [AUDIT_REPORT.md](AUDIT_REPORT.md) ? this report
- [AUDIT_INVENTORY.md](AUDIT_INVENTORY.md) ? complete initial file inventory

Final source-map inspection: Android 120 mobile / 0 web modules; iOS 120 mobile / 0 web modules; Web 0 mobile / 119 web modules.
