# SIGIL Release Process

## Complete Release Workflow

### Step 1: Version & Tag (Local)
```bash
# Most common: automatic version based on your commits
npm run release

# Manual version control (if needed)
npm run release:patch    # Bug fixes: 0.1.0 → 0.1.1
npm run release:minor    # New features: 0.1.0 → 0.2.0  
npm run release:major    # Breaking changes: 0.1.0 → 1.0.0

# Preview what will happen (safe to run anytime)
npm run release:dry-run

# Push the version and tags
git push --follow-tags origin main
```

### Step 2: Publish to npm (GitHub)
```bash
# Go to: https://github.com/Gulluth/sigil/releases
# 1. Click "Create a new release"
# 2. Tag: Use version from step 1 (e.g., "v0.1.4")
# 3. Title: "SIGIL v0.1.4"
# 4. Description: Add release notes
# 5. Click "Publish release"

# This triggers GitHub Actions to:
# - Run all tests
# - Build package  
# - Publish to npm as @gulluth/sigil
```

## Process Notes

1. **Use conventional commits** (format affects automatic versioning):
   - `feat: add new feature` → minor version bump
   - `fix: repair bug` → patch version bump
   - `feat!: breaking change` → major version bump

2. **Publishing happens via GitHub** - no local npm publish
   - Tests run before publish
   - Credentials stay secure
   - Complete audit trail

3. **Two-step process**:
   - Local: Version bump and git tag
   - GitHub: Create release to trigger npm publish

## Installation for users

```bash
npm install @gulluth/sigil
```

## Development details

See `CONTRIBUTING.md` for complete development workflow and commit formats.