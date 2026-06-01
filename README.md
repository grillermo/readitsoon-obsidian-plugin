# ReadItSoon Sync

Obsidian plugin for syncing articles saved through ReadItSoon's Obsidian flow.

## Setup

1. Build plugin with `npm install && npm run build`.
2. Copy `main.js`, `manifest.json`, and `versions.json` into `.obsidian/plugins/readitsoon-sync`.
3. Enable plugin in Obsidian community plugin settings.
4. Paste token from `/obsidian`, choose target folder, then run `Sync articles now`.

## Network Use

Plugin calls configured ReadItSoon server with `Authorization: Bearer <token>` and downloads pending article markdown.

