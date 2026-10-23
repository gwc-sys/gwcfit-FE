# Account menu debugging report

Date: 22 October 2026

## Scope and findings

All four requested reports were investigated. Three application defects were corrected. The two reported Pressable locations share one composition defect; the reduced-motion message itself is informational, but inspection also found a missing reduced-motion guard on the web modal.

| Finding | Severity | Evidence and result |
| --- | --- | --- |
| Both account-menu Pressable reports | P2 Medium | React Native Web maps `accessibilityRole="button"` to a real HTML button. The backdrop, menu container and item buttons were nested. Chromium reproduced six nested buttons and React's invalid-nesting console errors. Replaced the two containers with Views and made the dismiss button a sibling of the menu. Zero nested buttons and zero console errors afterward in the isolated component harness. |
| Application `pointerEvents` prop usage | P3 Low | Four JSX usages were found. Moved each value into its existing style, preserving `none` and the existing visual styles. A source scan now finds no `pointerEvents=` props in `src`. |
| Reanimated reduced-motion notice | Informational | This development diagnostic reflects an enabled accessibility preference. It was neither suppressed nor disabled. |
| Web account modal ignored reduced motion | P2 Medium | The modal always requested `fade`; it now uses `none` when `useReducedMotion()` is true, matching the existing native implementation. |

The reproduced React messages were:

> In HTML, &lt;button&gt; cannot be a descendant of &lt;button&gt;. This will cause a hydration error.

> &lt;button&gt; cannot contain a nested &lt;button&gt;. See this log for the ancestor stack trace.

These were React console errors. No uncaught JavaScript exception was reproduced in the isolated menu. The original authenticated-session exception was not supplied, so no claim is made that every possible dashboard exception has been reproduced or eliminated.

## Changes and line ranges

Ranges describe this patch, not unrelated changes already present in the working tree.

| File | Lines | Change |
| --- | --- | --- |
| `src/ui/web/layouts/PulseDashboardLayout.tsx` | 3–5, 13, 429–586 | Read reduced-motion preference; preserve backdrop/menu style references on Views; add an absolutely positioned, labelled sibling dismiss button. Existing item buttons, destinations and callbacks are retained. |
| `src/components/member/MemberTrainingHero.tsx` | 19 | Move decorative orbit pointer handling into style. |
| `src/components/member/MemberMoveScreen.tsx` | 65 | Move ring wrapper pointer handling into style. This file was already untracked; its other content was preserved. |
| `src/ui/mobile/components/Screen.tsx` | 87 | Move decorative gradient pointer handling into style. |
| `src/ui/mobile/components/PulseReference.tsx` | 41 | Move segmented background pointer handling into style. |
| `scripts/dashboard-account-menu.test.cjs` | 1–103 | Add four regression tests for composition, dismissal, original routes, theme, logout confirmation/pending state and reduced motion. |

The sibling dismiss button receives outside clicks without being an ancestor of menu actions. Clicking identity text or menu whitespace no longer depends on a container Pressable to stop propagation. Existing colors, dimensions, spacing, typography and responsive style definitions were not edited.

## Validation and actual results

Commands below ran from `frontend` unless stated otherwise.

| Command/check | Actual result |
| --- | --- |
| `npm run typecheck` (`tsc --noEmit`) | Passed. |
| `npm test` | 61 passed, 0 failed, including four new regression tests. Baseline before edits: 57 passed. |
| `node --test src/ui/mobile/__tests__/*.test.cjs` | 36 passed, 3 failed. The same three failures occur when this patch's mobile edits are reversed in memory; see remaining issues. |
| `npx expo install --check` | Failed dependency alignment: installed Expo 57.0.30 versus expected ~57.0.31; expo-sharing 57.0.23 versus expected ~57.0.24. |
| `npx expo-doctor` | 20/21 checks passed; only the same dependency-alignment check failed. No RN Web/Reanimated incompatibility was identified by these checks. |
| `npx expo export --platform web --dev --output-dir ../.tmp/account-menu-web-dev` | Export completed, command exit 0. Expo subsequently reported forcefully closing a lingering NativeWind Tailwind child process. |
| `npx expo export --platform all --output-dir ../.tmp/account-menu-final-export` | Passed, exit 0. Web, iOS and Android bundles and export metadata produced. This compiles native bundles; it is not a device execution test. |
| `node .tmp/account-menu-verify.cjs` from workspace root | Isolated Chromium harness passed for gym_owner, trainer, member and super_admin configurations: valid DOM, identity click, Enter activation once, reopen, Escape and backdrop dismissal. Trainer theme remained open; 390px touch interaction and disabled pending logout also passed. Zero browser console warnings/errors in these menu checks. |
| `python -m pytest app/tests/test_rbac.py -q -p no:cacheprovider` from `backend` | 5 passed. |
| `python -m pytest app/tests/test_rbac_endpoints.py -q -p no:cacheprovider` from `backend` | 42 passed using the suite's fake database sessions and dependency overrides. |
| `git diff --check` | Passed. |
| Project lint command | No lint script or lint configuration is defined; no lint pass is claimed. |

The browser harness renders the real web layout, item renderer and menu styles with React and the installed React Native Web. Screen, icon/gradient and reduced-motion adapters are isolated; navigation, theme and logout are recorded callbacks. It does not authenticate to a live server or perform real account mutations. Desktop and touch configurations verify menu behavior, not every application screen. Physical Android/iOS execution and authenticated end-to-end testing were not performed.

Temporary reproduction tools, full before-fix console traces, browser results and export logs are under the workspace `.tmp` directory. Browser test tooling was installed there only; this patch adds no application dependencies. `account-menu-before-console.log` records the six nested buttons and full React console output; `account-menu-browser-results.json` records the corrected interaction results.

## Remaining warnings and pre-existing failures

- Mobile contrast test: `native-layout.test.cjs:514` fails the white text versus primary button 4.5:1 assertion. Theme colors were not edited because the request forbids unrelated visual changes.
- Mobile Operations test: `native-layout.test.cjs:698` cannot find the expected Attendance action. That component was not changed.
- Mobile Pressable boundary test: `native-pressable.test.cjs:76` flags `components/member/MemberMobileActivity.tsx`. That component was not changed.
- The two Expo patch mismatches remain. Package manifests and locks already contained user edits; no dependency upgrades were needed to fix the confirmed menu defect.
- Installed React Navigation components still use `pointerEvents` props (including its Header and ResourceSavingView). The full application may therefore still emit the deprecation warning from dependencies. No dependency source was patched or warning suppressed.
- Reanimated's reduced-motion notice remains intentionally enabled. The web modal now respects the startup preference, as do the already guarded native modal and animated SurfacePanels. `useReducedMotion` reflects the setting at app startup; changing the OS setting does not itself trigger a rerender, per its documented behavior.
- Build logs contain the environment's `NO_COLOR`/`FORCE_COLOR` conflict notice. No application behavior was changed to silence it.

## Database, security and unchanged behavior

No backend source, API contract, schema, migration, stored record, credential, authentication mechanism, role check or authorization mechanism was changed by this patch. No production data was read or modified. Existing backend and frontend user edits were preserved. Nothing was pushed or deployed.

The reviewed backend role and permission dependencies still derive the user from authentication and reject unauthorized roles/permissions with HTTP 403. Existing RBAC unit and endpoint tests passed, including owner restrictions, trainer permissions, member access boundaries and super-admin behavior. These tests support unchanged enforcement; they are not a complete security audit or a live penetration test.

Menu actions preserve their exact original destinations: Profile, Settings (trainer still routes to Profile), Notifications, and Security (trainer still routes to Profile; owner still opens the existing placeholder). Theme toggles remain in the menu. Logout still closes the menu, requests confirmation and only invokes the mutation after confirmation; pending logout stays disabled. Opening, closing and clicking identity content do not invoke account mutations in the regression harness. Navigation to real destination screens can still perform their existing queries; those queries were not changed or exercised against production.

Confirmed unchanged through tests/review: original route selections, theme callback behavior, logout confirmation, pending state, keyboard and touch activation, auth/session regression tests, role-based route tests, account style definitions, and database/RBAC implementation.

References: Reanimated documents [useReducedMotion and its startup-setting behavior](https://docs.swmansion.com/react-native-reanimated/docs/device/useReducedMotion/), and its [troubleshooting guide describes the informational development notice](https://docs.swmansion.com/react-native-reanimated/docs/3.x/guides/troubleshooting/). React Native Web documents [pointerEvents as a style property](https://necolas.github.io/react-native-web/docs/styling/).
