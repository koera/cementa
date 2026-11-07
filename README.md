# Cementa

A mobile app to track the budget of a construction project.

- Record income and expenses, date by date
- Set a budget per category, with progress bars (turns red when over budget)
- Two accounts (Bank, Cash): choose the account for each transaction
- Filter transactions by account, month and category
- Export the list to PDF *(not built yet)*
- Works offline: data is stored on the phone in SQLite

## Tech stack

| Part | Choice |
|---|---|
| UI | Ionic + Angular (standalone components), tabs layout |
| Native shell | Capacitor (iOS) |
| Storage | SQLite via `@capacitor-community/sqlite` |
| State | Angular signals inside services |

Money is always stored as **integer cents** (`125000` = €1,250.00).

---

## 1. One-time setup on a Mac

1. **Node.js LTS** (use an even-numbered version; odd versions such as 23 are not supported by Angular):
   ```bash
   nvm install --lts
   nvm use --lts
   node -v
   ```
2. **CLIs**:
   ```bash
   npm install -g @ionic/cli @angular/cli
   ```
3. **Xcode** from the Mac App Store. Open it once, accept the license and let it install its components. Then in *Xcode → Settings → Components (or Platforms)*, download an **iOS simulator runtime**.
4. **Command line tools and license**:
   ```bash
   xcode-select --install
   sudo xcode-select -s /Applications/Xcode.app/Contents/Developer
   sudo xcodebuild -license accept
   ```
5. **CocoaPods** (only if the iOS project uses it):
   ```bash
   brew install cocoapods
   ```

An Apple Developer account is **not** needed for the simulator. It is only needed for a real device and the App Store.

## 2. Get the project running

```bash
git clone <repo-url> Cementa
cd Cementa
npm install
```

### In the browser (fast UI work)

```bash
ionic serve
```

The database does **not** work in the browser (it needs the extra `jeep-sqlite` web setup). Use the simulator to test anything that saves data.

### On the iOS simulator

First run, or after any change to native code or plugins:

```bash
ionic build
npx cap sync ios
ionic cap run ios          # pick a simulator from the list
```

Daily development with live reload:

```bash
ionic cap run ios -l --external --consolelogs
```

- `-l` reloads the app when you save a file
- `--external` makes the dev server reachable from a real iPhone on the same Wi-Fi
- `--consolelogs` prints the app's `console.log` output in the terminal

Stop it with `Ctrl+C` (this restores the iOS project's config).

### Open in Xcode (to see the real build errors)

```bash
npx cap open ios
```

Choose an iPhone simulator at the top and press Run (▶).

## 3. Which command when?

| I changed... | Run |
|---|---|
| Angular code (`.ts`, `.html`, `.scss`) with live reload running | nothing, it reloads |
| Angular code, no live reload | `ionic build` then `npx cap sync ios`, then Run |
| Installed or removed a Capacitor plugin | `npx cap sync ios`, then `ionic cap run ios` **without** `-l` |
| `capacitor.config.ts` | `npx cap sync ios` |
| App icon or splash images | see section 5 |
| Database structure | add a migration (section 4) |

## 4. Database

- File: `src/app/services/database.service.ts`
- Tables: `account`, `category`, `txn`
- The schema is versioned with `PRAGMA user_version`. **To change the schema, add a new entry to `MIGRATIONS`. Never edit an existing one**, or installed apps will not upgrade correctly.
- First launch creates two accounts (Bank, Cash) with a balance of 0.
- Balances and "spent" are **calculated by SQL**, never stored.
- Services (`src/app/services/`): `AccountService`, `CategoryService`, `TransactionService`. Pages read their signals and call their methods; they never write SQL.

**Reset all local data while developing:** delete the app from the simulator (long-press the icon, *Remove App*) and run it again.

## 5. App icon and splash screen

Source images are in `assets/`:

```
assets/icon-only.png        icon-foreground.png     icon-background.png
assets/splash.png           splash-dark.png
```

Regenerate the native files after changing them:

```bash
npx capacitor-assets generate --ios
npx cap sync ios
```

If the old icon still shows, delete the app from the simulator and run again (iOS caches icons).

The app name under the icon comes from `appName` in `capacitor.config.ts`.

## 6. Troubleshooting

**`Unable to find application named 'Simulator'`**
Simulator lives inside Xcode. Check `xcode-select -p` points to `/Applications/Xcode.app/Contents/Developer`. On very new Xcode versions the app may be named **DeviceHub**: look in `/Applications/Xcode.app/Contents/Applications`, or use *Xcode → Open Developer Tool*. You can also boot a simulator from the terminal:
```bash
xcrun simctl list devices available
xcrun simctl boot "<device name>"
```

**Simulator crashes or won't start**
```bash
xcrun simctl shutdown all
sudo killall -9 com.apple.CoreSimulator.CoreSimulatorService
xcrun simctl erase all
```
If it persists, reinstall the iOS runtime in *Xcode → Settings → Components*.

**`ionic cap run ios` lists devices but fails**
Pick a simulator, not your real phone (a phone needs signing and Developer Mode). Run from Xcode (`npx cap open ios`) to see the actual error.

**macOS asks for the login keychain for github.com**
Normal: git is downloading dependencies. Enter your Mac password and choose *Always Allow*.

**`CapacitorSQLite plugin is not implemented on ios`**
The native app was built before the plugin was added. Run `ionic build`, `npx cap sync ios`, delete the app from the simulator, then `ionic cap run ios` without `-l`.

**Changes don't appear in the simulator**
The simulator may be running an old build. Stop the app, rebuild with `ionic cap run ios`, or in Xcode use *Product → Clean Build Folder*.

**White screen**
Open the console (terminal with `--consolelogs`, or Safari → Develop → Simulator → the app) and read the red error. Common causes: a missing entry in a component's `imports` array, or a modal whose content has no height.

**Icons don't show**
Standalone Ionic needs each icon registered once: `addIcons({ listOutline, ... })`.

**Safari web inspector for the simulator**
*Safari → Settings → Advanced → Show features for web developers*, then *Develop → Simulator → (your app)*.
