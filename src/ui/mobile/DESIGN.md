# Mobile interface

Native presentation only. The browser interface and shared controllers are unchanged.

- Large navigation titles, quiet semantic color, grouped rounded surfaces and system typography.
- Member Overview exposes every existing statistic in a two-column grid, followed by grouped action rows, schedule, progress, workouts and achievements.
- Equal-size tab symbols and persistent safe-area-aware native tabs on phones and tablets.
- Filled forms with 17-point input text, clear focus/error states and existing validation callbacks.
- Minimum 44-point primary controls, readable wrapping labels, reduced-motion-aware panel entry, and existing light/dark theme preferences.

All data, permissions, routes, calculations, refresh actions, authentication and mutation handlers continue to come from existing shared presentation models. Do not introduce API calls or duplicate business logic here.

Validation: TypeScript, frontend regression tests, and Android/iOS Metro exports. Device visual and interaction review is still required; exports do not validate native rendering or assistive technology behavior.

## Video review revision

Reference: videos.mp4, 58.6 seconds, reviewed at 15 points across all tabs. Issues included repeated owner banners, clipped member toolbars, single-column oversized metrics, dense desktop tables, excessive nested safe areas and a profile surface using its text color as its background.

The role workspace now has compact fixed navigation on feature pages. Each feature owns its original scroll view, refresh control and keyboard handling; only dashboard content uses the workspace scroller. Embedded screens omit the already supplied outer safe area. The home screen uses a Today summary and compact metric grid. Member and trainer directories use stacked cards, full-width search, wrapping actions, and accessible controls. Profile cards use themed surface and text pairs. Existing data, routes, permissions, confirmation flows and callbacks are retained.

Revision checks: `npm run typecheck`, `npm test` (26 existing regression tests), `node --test src/ui/mobile/__tests__/*.test.cjs` (4 native layout regressions), and Expo Android/iOS exports. Native layout regressions cover 320, 390, 768 and 1024 point widths, scroll ownership, safe-area ownership, refresh and keyboard preservation, shortcut destinations, direct-content plan scrolling, full-width search and readable light/dark profile surfaces. These are structural regression checks, not screenshot or device tests.

## HIG / Android accessibility audit

The 11.jpg reference informs the soft blue light background, blue actions, rounded onboarding image panel and grouped cards. Platform control sizes, focus borders, reduced motion and large-text refinements are centralized in existing mobile tokens/components. AppScreen now shares Screen safe-area and keyboard handling. Narrow/large-text calendars use a full-date list without changing date-selection callbacks. The separate web UI and shared functional modules are unchanged.

See [AUDIT_REPORT.md](AUDIT_REPORT.md) for executed checks, all modified files, risks and the device/accessibility verification still required. [AUDIT_INVENTORY.md](AUDIT_INVENTORY.md) records every initial mobile file.
