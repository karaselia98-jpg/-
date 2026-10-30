# SalBlox Android

Android app (WebView) that runs the SalBlox web port in `app/src/main/assets/web`.
The Java side (`NativeBridge.java`) makes the Roblox requests, and `LoginActivity.java` handles the Roblox login.

## Build the APK on GitHub
1. Create a new GitHub repository and upload everything in this folder (keep `.github/`).
2. Open the **Actions** tab. The **build-apk** workflow runs on every push.
3. When it finishes, open the run and download **SalBlox-debug-apk** from the Artifacts section.
4. Unzip it, copy `app-debug.apk` to the phone, and install it (allow "install from unknown sources").

## Notes
- The login cookie is stored only on the phone, in the app's private storage.
- The bridge only sends requests to https://*.roblox.com, and sends the cookie only there.
- Not done yet: the rest of the iOS screens, the 3D avatar, and real-device testing.
