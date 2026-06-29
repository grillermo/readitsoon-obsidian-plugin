---
name: release-changes
description: Use when changes are ready to release - builds the Obsidian plugin, commits source and build artifacts, bumps the semver tag, updates manifest.json version, and pushes the new tag to remote
---

# Release Changes

Build, commit, bump tag, push.

## Steps

1. **Build**
   ```bash
   npm run build
   ```

2. **Determine next version**
   ```bash
   git tag -l | sort -V | tail -1
   ```
   Bump minor (0.X.0 → 0.X+1.0). If user specifies version, use that instead.

3. **Update manifest.json** version field to match new tag.

4. **Commit** all changed files including build artifact:
   ```bash
   git add main.ts main.js manifest.json
   ```
   Add any other changed source files. Commit message format:
   ```
   feat: <short description of changes>
   ```

5. **Tag and push**
   ```bash
   git tag <new-version>
   git push github <new-version>
   ```

## Important

- Remote is `github`, not `origin`
- Tag format: `0.X.0` (semver, minor bumps)
- manifest.json version must match the git tag
- Always build before committing - `main.js` is the build artifact
- Push only the tag, not the branch (unless asked)
