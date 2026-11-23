# Looper local system

A modern local environment for the Clay visual programming prototypes. Webapp,
Messenger, the mobile web/native app, and the Android app share one REST API and
SQLite database. No historical Firebase account or physical Clay unit is needed.
The seeded **Local Clay** simulator records commands and applies color changes
and loop erasure. It does not execute arbitrary hardware commands or timed loops.

## Start with containers

Clone the repositories as siblings (SSH is useful for private repositories):

```sh
mkdir -p repos
cd repos
for repo in looper looper-mobile looper-messenger looper-webapp looper-android; do
  git clone "git@github.com:ah-cog/$repo.git"
done
cd looper-webapp
docker compose up -d --build
node scripts/smoke.mjs
```

| App | Address |
| --- | --- |
| Visual canvas | http://localhost:3000 |
| Messenger and shared API | http://localhost:3001 |
| Mobile browser preview | http://localhost:3002 |

Services have health checks, run as the Node user, and bind published ports to
host loopback. State persists in the `looper_looper-data` Docker volume.
`docker compose down` stops the services without removing data.

Add a behavior in Mobile, see it appear in Canvas, then send `change color to
blue` in Messenger. All views update within one second. Remove a behavior from
any view to update the shared sequence. Connection failures are shown in the UI.

The Python `looper` repository now contains a separate Claude prompt-loop CLI;
it is not the original Clay service. Its dependencies and container are maintained
independently. `pixel` is not required by this local simulator.

## Native apps

See the sibling `looper-mobile/README.md` for Capacitor iOS/Android builds and
`looper-android/README.md` for the Java Android app. iOS Simulator connects to
`http://127.0.0.1:3001`; Android Emulator connects to `http://10.0.2.2:3001`.
Native clients bundle their UI and use the same API as the web apps. The connection
settings can point to a different development host.

## CLI and Android container builds

```sh
docker compose run --rm cli --help
docker compose run --rm cli doctor
docker compose --profile build build android-build
docker compose --profile build run --rm android-build
```

The Android build service uses linux/amd64 because Android's Linux SDK build tools
are x86 binaries. It copies the APK into the `looper_android-artifacts` volume.
iOS builds require Xcode on macOS; simulators and emulators run on the host.

## Develop without Docker

Requires Node 26 LTS (24+ is also supported) or newer:

```sh
npm ci
MESSENGER_URL=http://127.0.0.1:3001 npm start
```

Start Messenger and Mobile in their own terminals using the same `npm ci` /
`npm start` commands. Default ports are 3001 and 3002. `PORT` overrides any app's
port. Messenger's `DATABASE_PATH` selects its SQLite file.

## Verification

```sh
node scripts/smoke.mjs
cd ../looper-messenger && npm test
cd ../looper && uv run pytest && uv build
```

The smoke check verifies all health endpoints and the full Mobile → Messenger →
Canvas path, including persisted messages and synchronized behavior deletion.
The API tests cover validation, mutations, and persistence across restart.

The original browser prototype remains at `/looper.html` as a historical asset.
The default UI uses browser-native JavaScript and SVG instead of the old
Processing.js, jQuery, and Hammer stack. The server uses Express 5 with a
committed dependency lockfile and Node's SQLite implementation.
