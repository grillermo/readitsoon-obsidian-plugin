# ReadItSoon Sync

Obsidian plugin for syncing articles saved through ReadItSoon's Obsidian flow.

## Installation with BRAT

Simplest way to install and auto-update:

1. Install the bookmarklet from `https://readitsoon.app/obsidian` and make a note of the token.
2. Install [BRAT](https://tfthacker.com/brat-quick-guide) plugin in Obsidian.
3. Open BRAT settings, click "Add beta plugin repository".
4. Enter: `https://github.com/grillermo/readitsoon-obsidian-plugin`
5. In BRAT's plugin list, find "ReadItSoon Sync" and click "Install".
6. Enable plugin in Obsidian community plugin settings.
7. Open the plugin's settings and paste token from choose target folder.
8. Send your articles (10 free per month)

## Manual Installation

1. Clone or download this repo.
2. Build plugin: `npm install && npm run build`.
3. Copy `main.js`, `manifest.json`, and `versions.json` into `.obsidian/plugins/readitsoon-sync` in your vault.
4. Enable plugin in Obsidian community plugin settings.
5. Paste token from `/obsidian`, choose target folder, then run `Sync articles now`.

## Releasing Updates

Releases are created automatically when tags are pushed. From the parent `readitsoon/` directory:

```bash
cd obsidian-plugin
# Update version in manifest.json and package.json
npm run build
cd ..
git add obsidian-plugin/
git commit -m "release: obsidian-plugin vX.Y.Z"
git tag "obsidian-plugin/vX.Y.Z"
git push origin main --tags
```

GitHub Actions will build and create a release with plugin assets, available to BRAT users within minutes.

## Network Use

Plugin calls configured ReadItSoon server with `Authorization: Bearer <token>` and downloads pending article markdown.

