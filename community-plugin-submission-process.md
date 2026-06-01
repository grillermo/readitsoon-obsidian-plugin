## Obsidian Community Plugin Submission

To list **ReadItSoon Sync** in the Obsidian community plugin registry:

### Prerequisites

- Plugin built and working locally (`obsidian-plugin/`)
- Public GitHub repo containing the plugin
- `manifest.json`, `main.js`, and `styles.css` (if any) at the **repo root** or a tagged release

### Steps

1. **Prepare the release**
   - Ensure `obsidian-plugin/manifest.json` has the correct `id`, `name`, `version`, and `minAppVersion`
   - Build: `cd obsidian-plugin && npm run build`
   - Create a GitHub release tagged `0.1.0` (matches `version` in manifest) with `main.js` and `manifest.json` as release assets

2. **Fork the community plugins repo**
   ```bash
   gh repo fork obsidianmd/obsidian-releases --clone
   ```

3. **Add the plugin entry**
   - Open `community-plugins.json` in the fork
   - Append an entry (keep the array sorted alphabetically by `id`):
   ```json
   {
     "id": "readitsoon-sync",
     "name": "ReadItSoon Sync",
     "author": "ReadItSoon",
     "description": "Sync ReadItSoon articles into your Obsidian vault.",
     "repo": "grillermo/readitsoon"
   }
   ```
   Replace `grillermo/readitsoon` with the actual GitHub `owner/repo`.

4. **Open a pull request**
   ```bash
   cd obsidian-releases
   git checkout -b add-readitsoon-sync
   git add community-plugins.json
   git commit -m "Add ReadItSoon Sync plugin"
   gh pr create --repo obsidianmd/obsidian-releases \
     --title "Add ReadItSoon Sync plugin" \
     --body "Plugin submission per https://docs.obsidian.md/Plugins/Releasing/Submit+your+plugin"
   ```

5. **Pass automated checks** — the PR triggers CI that validates manifest fields, release assets, and repo structure. Fix any reported issues.

6. **Review** — Obsidian team reviews manually after CI passes. Typically takes 1–4 weeks.

### Useful links

- Submission guide: https://docs.obsidian.md/Plugins/Releasing/Submit+your+plugin
- Plugin review checklist: https://docs.obsidian.md/Plugins/Releasing/Plugin+guidelines
- `obsidian-releases` repo: https://github.com/obsidianmd/obsidian-releases

---


