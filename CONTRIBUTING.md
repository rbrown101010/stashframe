# Contributing to Stashframe

Open an issue for bugs or ideas, or send a focused pull request. Include what changed, how you checked it, and a screenshot for visible changes. Never include API keys or personal library files.

## Local development

Use macOS and Node.js 22.12+. Run `npm ci`, then `npm start`. There is no frontend build step. Restart Electron after changing main-process code.

- `main.cjs`: native window, shortcuts, API calls, image actions, encrypted credentials, IPC.
- `renderer/`: search, generator, notes, shared previews, styles.
- `preload.cjs`: restricted bridge to the main process.
- `library.cjs` and `generation-store.cjs`: local persistence.
- `image-download.cjs` and `image-formats.cjs`: downloads, fallback previews, PNG conversion.
- `sticker.cjs`: local white outline around an alpha silhouette.
- `jev-ranking.cjs`: experimental visual scoring.

## Checks

Run `npm test` for unit tests and `npm run test:batch` for the search UI. `node test/effects-desktop.cjs` exercises background removal and stickers with a mocked remove.bg response. Use the other `test/*-desktop.cjs` scripts for affected features. Desktop tests need a graphical session and can temporarily bring test windows forward.

`npm run test:desktop` is an opt-in **live** API test. Set `IMAGES_CREDENTIALS_FILE` to a private JSON file outside the repo containing your `serper` and `removebg` keys. `TEST_REMOVE_BG=1` spends a remove.bg credit. It also changes the clipboard. Never put credentials in a fixture or screenshot.

Before shipping a launcher change, manually test the shortcut from another macOS Space, a fullscreen app, and a second display. Automated window flags alone cannot prove Mission Control behavior.

## Packaging

Run `npm run package`. The app is in `release/`. Keep the stable bundle identifier, internal Electron name (used by Keychain), and legacy user-data directory unless you also implement and test a migration. Release builds currently have no Developer ID signature, notarization, or auto-update system.

## License

Contributions are under the MIT license. Only contribute code and assets you have permission to distribute. Preserve third-party license notices.
