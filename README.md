# Duttarim

Duttarim is a Capacitor Android app for tuning a dutar and viewing sheet music. The Android tuner is implemented in `android/app/src/main/java/com/duttarim/app/DutarTunerPlugin.java`; the interface and bundled offline catalog live in `www/`. `content/` holds the online catalog and score images published through the Cloudflare Worker in `worker/`.

## Working on the app

- Open this repository's `android/` directory in Android Studio. Edit web source in `www/`, then run `npx cap sync android` before building the Android app. Generated Android web assets are ignored by Git.
- Install JavaScript dependencies with `npm ci`. Run `npm test` for syntax and catalog/image checks. The browser regression suite is `npm run test:ui` and requires Playwright plus Microsoft Edge; it uses microphone mocks. The earlier layout suite is `npm run test:ui:build2`.
- Run Android unit tests from `android/` with `gradlew.bat testDebugUnitTest`. Check microphone accuracy, speaker bleed, permissions, and rapid start/stop on a physical device before release.
- Start the local score editor with `npm run admin`. The in-app editor publishes through `worker/`; see [worker/README.md](worker/README.md) for its required secrets. Never put publishing tokens or signing keys in the app or repository.

## Branches and release flow

`develop` is the app development branch. It combines the Android changes from `android-build-2` with the latest published catalog from `main`. The Worker publishes score catalog and images to `main`, so bring new content into `develop` regularly with `git fetch origin` and `git merge origin/main`. Make new app changes from `develop`; merge tested changes back to `main` for release. Keep release artifacts in `android/app/release/` outside Git.

Android `versionCode` is the store upgrade counter; `versionName` is the user-facing version. The package version in `package.json` is separate. Verify all three deliberately when preparing a release.

## Known follow-up work

- Offline catalog entries can point to remote score images that are not stored permanently on the device.
- The native audio recorder still needs device stress testing around repeated start/stop and background transitions.
- The browser regression suite is separate from `npm test` and is not a substitute for physical audio testing.
