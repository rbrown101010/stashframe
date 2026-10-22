# Stashframe

I built this because I’m constantly grabbing images for presentations, Excalidraw diagrams, and thumbnails. I wanted to hit a shortcut, find an image, copy it, and get back to what I was making.

That’s Stashframe. A small Mac app for finding images, building a library of assets, and using those assets to generate new images. The images I copy and save stay in my library, so I can keep reusing them instead of looking for the same thing again.

It’s open source. Bring your own API keys. No Stashframe account or subscription.

## Get started

**[Download Stashframe for Apple Silicon Macs](https://github.com/rbrown101010/stashframe/releases/latest)**, unzip it, and move Stashframe.app into Applications. This early release is unsigned; see the installation notes below.

Or run it from source:

You need macOS, Git, and **Node.js 22.12 or newer**. Apple Silicon is the tested platform. Intel Macs can build from source with the command below. Windows and Linux are not currently supported releases.

```sh
git clone https://github.com/rbrown101010/stashframe.git
cd stashframe
npm ci
npm start
```

On first launch, open **Settings → API Settings** and add the keys for the features you want. Save settings, then start searching. You don’t need every key.

| Key | What it unlocks | Get one |
| --- | --- | --- |
| Serper | Google Images search | [serper.dev](https://serper.dev/) |
| remove.bg | Remove Background and Sticker when an image needs its background removed | [remove.bg API](https://www.remove.bg/api) |
| Vercel AI Gateway | AI search and image generation | [AI Gateway](https://vercel.com/ai-gateway) |

These services have their own pricing and credits. Stashframe uses your keys directly. Adding an outline to an existing cutout runs locally and doesn’t spend another remove.bg credit. Notes, browsing your saved library, and copying local images work without API keys.

## How I use it

Press **⌘ Shift Space** to bring it up on your current desktop, on the display under your pointer. Change the shortcut in Settings if another app uses it. Close the window or press Escape to tuck it away; the menu bar icon keeps it available.

Type what you want and press Enter. Images fit inside the grid without cropping. Start another tab while the first search is still loading. If I need a few things at once, I type something like:

```text
camera; microphone; notebook
```

That opens three searches. For a looser idea, describe the visuals and press **⌘ Enter** for AI search. The filter menu gives you All, Transparent, and Icons. As you type, Stashframe also finds matching images you’ve already saved.

Hover an image for actions, or click it for a larger preview:

- **Copy** puts a PNG on your clipboard and keeps it in Saved. Paste it into your board, slide, or editor.
- **Save** puts a PNG in Downloads and keeps it in Saved. Names follow the search: `Camera (1).png`, `Camera (2).png`.
- **Remove Background** makes a transparent cutout with no outline.
- **Sticker** removes the background and adds a small white outline around the subject. On an existing cutout, it just adds the outline.
- **Original** steps back to the previous version while editing a search result. Original, cutout, and sticker can each be saved separately.
- **Add to image generator** puts an image in your generation grid so you can use it as a reference.

Use the left and right arrows in the preview to move through images. Copy and Save convert supported image formats to PNG, preserving transparency. Animated images use their first frame. If a site blocks the original, Stashframe tries the displayed preview and labels the result “preview quality.” If neither is accessible, it shows an error.

## Generate images from your library

Open the image generator in the left sidebar. Type a prompt at the bottom and press Enter. New images appear at the top left; you can submit more prompts while earlier ones are still generating. Up to four jobs run at once.

Drag an image into the prompt, attach or paste a file, or type **@** to choose from Saved. References appear as image chips above your text. You can attach up to eight. I use this to bring the same assets into new graphics and thumbnail ideas.

Your prompt and references stay there after submitting so you can make another variation immediately. **Clear** or **⌘ Backspace** clears the composer. **Shift Enter** adds a new line. Choose from common aspect ratios, including 1:1, 16:9, and 9:16, and Fast, Standard, or High quality.

The current generation model is `openai/gpt-image-2`. AI search uses `openai/gpt-4.1-nano`. Model availability depends on your Gateway account. Developers can override them with `IMAGE_MODEL` and `AI_MODEL` when launching.

## A few useful shortcuts

| Shortcut | Action |
| --- | --- |
| ⌘ Shift Space | Show or hide Stashframe |
| ⌘ T / ⌘ W | New / close search tab |
| ⌘ L | Focus search |
| ⌘ Enter | AI search |
| ⌘ 9 | Saved images |
| ⌘ C / ⌘ S | Copy / save the focused image or preview |
| B / Shift B | Remove Background / Sticker |
| ← / → | Previous / next image in preview |
| ⌘ N | New note |
| ⌘ , | Settings |
| Escape | Close the preview or hide the app |

Notes are a place for prompts, hooks, and reminders. They save locally as you type. Settings also includes **Open at login**.

## Install your own build

```sh
npm run package
```

This creates `release/Stashframe-darwin-arm64/Stashframe.app`. Copy it into Applications and open it. For an Intel build:

```sh
npm run package -- --arch=x64
```

Builds are currently **unsigned and not notarized**. macOS may block a downloaded build; after verifying where it came from, use System Settings → Privacy & Security → Open Anyway. Don’t disable Gatekeeper globally. There is no automatic updater yet; install a newer build to update.

Already using Agent Native Images? Stashframe keeps the same local data folder and app identifier, so your saved images, notes, keys, and settings carry over. Quit the old app and replace it with Stashframe; don’t run both copies.

## Your data

There’s no hosted Stashframe backend or telemetry. Your library, notes, image cache, generation history, and settings live on your Mac. API keys are encrypted using Electron safeStorage backed by macOS Keychain; they stay in the main process.

- Image search queries go to Serper. Image previews and downloads contact their image hosts.
- Background removal sends the selected image to remove.bg.
- AI search sends your description to Vercel AI Gateway. Generation sends your prompt and attached reference images.
- Experimental Jev ranking, if enabled, sends candidate images and search context through AI Gateway.

Local data remains in `~/Library/Application Support/Agent Native Images/` for compatibility. Keep that folder private. Don’t upload it, API keys, or private images to GitHub. The software’s MIT license does not grant rights to images found in search; check the source before publishing them.

## Experimental image ranking

**Jev mode** and **Jev overlay** are optional and off by default. They attempt to rank images for relevance, clarity, and usefulness as stickers or icons, then animate the grid into order. Overlay shows the returned fit and confidence.

This is not a launch dependency: the last live Gateway test did not expose images to Jev. The app checks visual capability and stops with an error rather than showing misleading ratings. Ordinary search still works. See `jev-ranking.cjs` for the integration and `JEV_MODEL` override.

## Contribute

Electron, plain JavaScript, and CSS. No frontend framework or web server.

```sh
npm test
npm run test:batch
node test/effects-desktop.cjs
node test/generator-desktop.cjs
node test/notes-desktop.cjs
```

Desktop tests use isolated temporary data and mocked providers unless explicitly documented otherwise. See [CONTRIBUTING.md](CONTRIBUTING.md) for the project map and testing details, and [SECURITY.md](SECURITY.md) for reporting vulnerabilities.

## License

[MIT](LICENSE). Use it, change it, build on it. Bundled Geist fonts have their own [license](assets/Geist-LICENSE.txt).
