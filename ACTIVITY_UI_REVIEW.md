# Activity screen UI review

Scope: activity details, weekly history, monthly calendar, and daily goal editor.

## Changes
- Replaced pink accents with the existing app primary blue token.
- Used app theme tokens for backgrounds, surfaces, text, borders, and errors in light and dark mode.
- Kept neutral ring progress consistent with the dashboard ring.
- Moved week arrows above the weekday row to give dates more touch space.
- Added explicit previous/next day buttons as alternatives to swipes.
- Enlarged month and week navigation controls to 44 points.
- Kept weekday and monthly date cells at least 44 points wide on standard 375-point phone layouts.
- Preserved text scaling, descriptive date labels, selected states, and accessibility date actions.
- Added disabled states for unavailable forward navigation and pending goal saves.
- Added keyboard-aware goal scrolling and submit handling.
- Retained missing-data messages, retries, and automatic history pagination.

## References
- https://developer.apple.com/design/human-interface-guidelines/accessibility
- https://developer.apple.com/design/human-interface-guidelines/gestures

## Verification and limits
TypeScript and automated interaction tests cover code behavior, not device usability or Apple certification.
Still requires physical iPhone checks: horizontal swipes versus vertical scroll, VoiceOver, largest text sizes, landscape and compact phone layouts, keyboard avoidance, and light/dark appearance.
This review does not audit unrelated app screens or certify full HIG compliance.
