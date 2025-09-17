# SIGIL Release Commands Quick Reference

## For daily use (you won't need to remember the details)

```bash
# Most common: automatic version based on your commits
npm run release

# Preview what will happen (safe to run anytime)
npm run release:dry-run

# Manual version control (if needed)
npm run release:patch    # Bug fixes: 0.1.0 → 0.1.1
npm run release:minor    # New features: 0.1.0 → 0.2.0  
npm run release:major    # Breaking changes: 0.1.0 → 1.0.0

# After any release, push the changes
git push --follow-tags origin main
```

## What you need to know

1. **Use conventional commits** (the format matters for automatic versioning):
   - `feat: add new feature` → minor version bump
   - `fix: repair bug` → patch version bump
   - `feat!: breaking change` → major version bump

2. **Tests run automatically** - if they fail, release is cancelled

3. **Everything is automatic** - version bumping, changelog, git tags

## Full documentation

See `CONTRIBUTING.md` for complete details on development workflow and commit formats.