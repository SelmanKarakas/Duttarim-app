# Duttarim Android build 2

Branch: `android-build-2`. Android versionCode: **2**, versionName: **1.1**.
Original `.gitignore` edits were preserved and excluded from implementation commits.

## Tickets

| Ticket | Implemented |
|---|---|
| DUT-A01 | Shared tuner status renderer, serialized start requests, cancellation after navigation/backgrounding, separated permission/error/pitch/completed states. Existing pitch detection and tuning thresholds retained. |
| DUT-A02 | Startup/resume permission checks; native request on Start; permanent denial opens app settings; onboarding uses the same flow and can finish after denial. |
| DUT-A03 | Fixed status/pitch rows and numeric widths; completion overlay cannot move the layout. |
| DUT-A04 | Flexible tuner layout between header and navigation, safe-area sizing, compact layout and scrolling fallback on unusually short screens. |
| DUT-A05 | AudioRecord keeps draining during reference playback; native analysis buffers/stabilizer are cleared while muted, then analysis resumes after a 350 ms decay tail. JS ignores playback pitch and watchdog checks. |
| DUT-A06 | Selected-string highlight is rendered above the instrument instead of behind it. |
| DUT-A07 | Round green check with accessible completion label. |
| DUT-A08 | Both strings shown simultaneously; only natural notes labeled. Original 15 fret positions/first-string notes retained; second string transposed by the current D/G or D/A tuning interval. Small screens scroll to keep labels readable. |
| DUT-A09 | Previous panel history, notation detail restoration, fullscreen/detail back handling, normal app exit when history is empty. |
| DUT-A10 | Lazy first-page notation previews, simplified-page fallback, bounded preview area and missing-image fallback. |
| DUT-A11 | Exercises category, category-aware search/favorites, existing notation viewer, category selection in the existing admin editor. Catalog accepts `exercise` / `exercises`; missing category remains a piece. |
| DUT-A12 | Library labels in Turkish, English and Uyghur; existing songs routes/IDs retained. |

## Validation

- JavaScript syntax check passed.
- Browser integration tests passed: native permission mocks, recording/reference coexistence, navigation history, stable text layout at 320×568 / 390×844 / 768×1024, exercises/search/favorites, and natural-note dual-string mapping.
- Gradle `assembleDebug testDebugUnitTest lintDebug bundleRelease` passed using JDK 21. The repository's existing unit suite has one example test; it does not validate audio detection. Lint: 0 errors, 12 warnings in existing Android resources/configuration.
- Debug APK installed and launched in the Small_Phone Android emulator. Installed package confirms 2 / 1.1. No matching fatal/uncaught JS errors were found in the inspected recent startup log.

## Build and artifacts

Use JDK 21, run `npx cap sync android`, then from the Android directory:

```
gradlew.bat assembleDebug testDebugUnitTest lintDebug bundleRelease
```

- Installable debug APK: `android/app/build/outputs/apk/debug/app-debug.apk`
- Release AAB: `android/app/build/outputs/bundle/release/app-release.aab`
- The AAB is **unsigned**. The existing release signing key/configuration must be supplied through Android Studio's Generate Signed Bundle flow before Play upload. No keys were created or changed.
- UI regression test: `tools/build2-ui-test.cjs`; requires Playwright and Microsoft Edge. Set `PLAYWRIGHT_MODULE` to an installed Playwright module if it is not on the project module path.

## Joint review / remaining manual checks

- `/mnt/data/text.png` was unavailable; Frets follows the textual requirements and existing instrument artwork. Compare with the original reference during visual review.
- No exercise notation files were supplied; the category/editor/viewer are implemented, and the category shows an empty state until content is added.
- Test real microphone input, speaker bleed/decay timing, headphones, permission denial/re-grant, and font scaling on physical devices. Browser audio tests use native mocks; emulator opening alone does not validate physical audio behavior.
- Review the selected-string overlay alignment and Frets visual spacing together with the user.

## Visual review revision

User-requested changes after build 2: removed tuner instrument glow and Library search; evenly distributed category filters; page-specific header titles; distinct piece/exercise icons instead of thumbnails. Frets now matches the supplied reference with Bom on the left (only Do 1), Zil on the right, numbered natural notes and connector lines. The label map is illustrative and does not change audio tuning. Both upload forms provide a content-type selector, and the local publication path persists the category; the existing online API already preserves it. The earlier ticket table describes the initial build and is superseded by these UI choices.
