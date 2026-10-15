# UI fixes from the supplied video

Reviewed the approximately 111-second, 464 x 832 iOS recording by extracting frames and checking full-size images. This pass preserves the earlier redesign and addresses the actual failures in the recording.

| Video time | Visible issue | Fix |
|---|---|---|
| 12-24 s | Total Members hero becomes a small icon-only card; recent activity stacks vertically | Preserve the native Pressable style callback, restoring full-width hero, text allocation, and horizontal activity rows |
| 36-40 s | Operations is an unstyled three-column icon group | Restore the existing two-column card sizing, surfaces, padding and pressed feedback |
| 44 and 108 s | Range labels run together; empty revenue shows duplicate small-value ticks | Restore chip sizing/selection and show an explicit no-revenue state; real small payments use a readable axis scale |
| 48-52 and 88-104 s | Profile icons, labels and chevrons stack; action controls appear as bare text | Restore grouped horizontal rows, practical touch areas, edit and action button styles |
| 56-60 and 80-84 s | Gym Information labels and inputs collapse to a narrow width | Stretch the native field grid and form fields; reduce compact panel padding; keep labels and inputs at available width |
| 64-72 s | Starter-plan actions lose button styling; no visible back action | Restore native action styles and use the existing native ScreenHeader for stack back navigation |
| 76 s | Settings options lose row/button layout | Apply the native Pressable boundary to existing settings controls too |
| 92 s | Staff role chips lose styling; desktop table headings wrap awkwardly on a phone | Restore filter chips, hide the table header in the existing compact mode, and add native header/back behavior |
| Gym Information sheet | Editing can leave lower controls behind the keyboard | Add one keyboard-avoidance strategy and keyboard-friendly scrolling to Profile sheets |

## Root cause and scope

NativeWind's installed JSX runtime substitutes React Native Pressable with its CSS interop component. The installed inline-rule implementation treats Pressable's style function as an object and spreads it into an empty style. This is reproducible using the actual installed collectInlineRules and applyRules functions and explains the shared pattern in the video.

components/NativePressable.tsx now uses the explicit cssInterop: false opt-out to reach React Native Pressable. createElement alone was insufficient because the installed Babel plugin rewrites that call too. The opt-out is verified through the real development and production Babel pipeline. It forwards the original style callback, refs, children, press/long-press events, disabled/loading semantics and accessibility props. Native presentation imports in 52 files now use this boundary. Their existing handlers and permission checks remain unchanged. Native screens use StyleSheet styles rather than NativeWind className controls, so no native class styling is sacrificed.

The web presentation, Babel/Metro configuration, dependencies, shared API services, authentication, permissions and business logic were not changed in this pass. Additional layout fixes are in FormTextField, SurfacePanel, native GymPanels styles, StaffScreen, MembershipPlanScreen, ProfileScreen and PulseAnalytics.

## Verification

Regression tests reproduce the installed CSS interop failure, check the boundary through the actual JSX wrapper, verify ref/event/disabled preservation, and prevent direct native Pressable imports from reintroducing it. Layout tests also cover stretched fields, readable empty revenue and compact Staff headers. Existing auth, navigation, permission, native interaction and metric tests remain in place.

The original recording is evidence of the before state. No corrected on-device recording or screenshot was captured in this session, so these are code-level and bundle validations, not a claim of verified device pixel parity. The opening Expo Go loader and the red screen-recording status bar belong to the host app/iOS rather than this application's UI.

Reload the project in Expo Go to load the fixes. If it continues to display the old bundle, run `npx expo start --clear` from frontend and reopen the project.

Validation results: TypeScript passed; 26 application tests and 31 native/regression tests passed (57 total); both iOS and Android exports passed in `.tmp/video-ui-fixes`; `git diff --check` passed.
