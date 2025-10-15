# SIGIL Editor - Build & Release Guide

This document describes the build system, version management, and release process for the SIGIL Editor desktop application.

## Quick Start

```bash
# Install dependencies
make setup

# Run in development mode
make dev

# Build for current platform
make build

# Build for all platforms
make build-all

# Package installers
make package
```

## Version Management

The SIGIL Editor uses a unified version management system that updates:
- `version.json` - Central version source
- `build/config.yml` - Wails build configuration
- `frontend/package.json` - Frontend package version
- `version.go` - Go version constants

### Bumping Versions

Use the Makefile targets to automatically bump versions:

```bash
# Bump patch version (0.1.0 -> 0.1.1)
make version-patch

# Bump minor version (0.1.0 -> 0.2.0)
make version-minor

# Bump major version (0.1.0 -> 1.0.0)
make version-major
```

The version bump script will:
1. Update all version files
2. Generate `version.go` with constants
3. Commit changes to git
4. Create a git tag (e.g., `v0.1.1`)

### Manual Version Management

You can also run the script directly:

```bash
./scripts/bump-version.sh [major|minor|patch]
```

## Building for Specific Platforms

### macOS

```bash
# Intel (x86_64)
make build-darwin-amd64

# Apple Silicon (M1/M2/M3)
make build-darwin-arm64

# Universal binary (both architectures)
make build-darwin-universal
```

**Building on macOS:**
- Requires macOS operating system
- Requires Xcode Command Line Tools
- CGO enabled (default in Taskfile)

**Cross-compiling from Linux:**
- Requires OSXCross toolchain
- Requires macOS SDK (extracted from Xcode)
- See `docs/CROSS_COMPILE_MACOS.md` for setup
- Run `./scripts/setup-osxcross.sh` for guided installation

To set up OSXCross on Linux:
```bash
./scripts/setup-osxcross.sh
```

### Linux

```bash
# x86_64
make build-linux-amd64

# ARM64
make build-linux-arm64
```

**Note:** Building for Linux requires:
- Linux operating system (or cross-compilation setup)
- gcc/build-essential
- GTK3 development libraries

### Windows

```bash
# x86_64
make build-windows-amd64
```

**Note:** Building for Windows:
- Can be cross-compiled from Linux/macOS
- CGO is disabled for Windows builds
- Requires mingw-w64 for cross-compilation

## Build Artifacts

Compiled binaries are placed in the `bin/` directory:

```
bin/
├── sigil-editor              # Current platform binary
├── sigil-editor.exe          # Windows (if cross-compiled)
└── ...
```

## Creating Installers

### Current Platform

```bash
make package
```

This creates platform-specific installers:

- **macOS**: `.app` bundle and DMG
- **Linux**: DEB, RPM, AppImage
- **Windows**: NSIS installer or MSIX package

### All Platforms

```bash
make package-all
```

**Important:** Cross-platform packaging has limitations. For best results:
- Build macOS installers on macOS
- Build Linux installers on Linux
- Build Windows installers on Windows

## NX Workspace Integration

The project uses NX for monorepo management. You can use NX commands as alternatives to Make:

```bash
# Build SIGIL library
nx build sigil

# Build desktop app
nx build learn-sigil

# Build all platform binaries
nx build-all learn-sigil

# Run in dev mode
nx dev learn-sigil

# Build everything in monorepo
nx run-many -t build --all
```

From the root directory, you can also use npm scripts:

```bash
npm run build              # Build all projects
npm run build:sigil        # Build SIGIL library only
npm run build:app          # Build desktop app
npm run build:all-platforms # Build for all platforms
npm run dev:app            # Run app in dev mode
npm run version:patch      # Bump patch version
```

## Release Workflow

1. **Ensure clean working directory**
   ```bash
   git status
   make clean
   ```

2. **Run tests** (when available)
   ```bash
   # Add test commands here
   ```

3. **Bump version**
   ```bash
   make version-minor  # or version-patch, version-major
   ```

4. **Build all platforms**
   ```bash
   make build-all
   ```

5. **Test binaries**
   - Test each platform binary
   - Verify version info is correct
   - Check file operations work

6. **Create installers**
   ```bash
   # On macOS
   make package

   # On Linux
   make package

   # On Windows
   make package
   ```

7. **Push to repository**
   ```bash
   git push origin main
   git push --tags
   ```

8. **Create GitHub Release**
   - Go to GitHub Releases
   - Create new release from tag
   - Upload all installers
   - Add release notes

## Build Configuration

Build settings are configured in:

- `build/config.yml` - Application metadata, version, file associations
- `build/Taskfile.yml` - Common build tasks
- `build/darwin/Taskfile.yml` - macOS-specific build tasks
- `build/linux/Taskfile.yml` - Linux-specific build tasks
- `build/windows/Taskfile.yml` - Windows-specific build tasks

## Troubleshooting

### "command not found: wails3"

Install Wails v3:
```bash
go install github.com/wailsapp/wails/v3/cmd/wails3@latest
```

### CGO errors on macOS

Ensure Xcode Command Line Tools are installed:
```bash
xcode-select --install
```

### Linux GTK errors

Install GTK3 development libraries:
```bash
# Debian/Ubuntu
sudo apt-get install libgtk-3-dev

# Fedora
sudo dnf install gtk3-devel

# Arch
sudo pacman -S gtk3
```

### Cross-compilation issues

- For best results, build on native platforms
- Some features may not work with cross-compilation
- CGO must be disabled for cross-platform Windows builds

## Clean Builds

```bash
# Remove build artifacts
make clean

# Deep clean (including dependencies)
make clean-all

# Then rebuild
make setup
make build
```

## Version File Structure

### version.json
```json
{
  "version": "0.1.0",
  "buildNumber": 1
}
```

### version.go
```go
package main

const (
    Version     = "0.1.0"
    BuildNumber = 1
)
```

This version info can be accessed in Go code and displayed in the application.

## CI/CD Integration

For automated builds, consider:

1. GitHub Actions workflow for multi-platform builds
2. Automated version bumping on merge to main
3. Automatic release creation with binaries
4. Installer signing (macOS/Windows)

Example workflow structure:
```yaml
name: Release
on:
  push:
    tags:
      - 'v*'
jobs:
  build-macos:
    runs-on: macos-latest
    # ...
  build-linux:
    runs-on: ubuntu-latest
    # ...
  build-windows:
    runs-on: windows-latest
    # ...
```

## Support

For build issues or questions:
- Check Wails v3 documentation: https://v3.wails.io
- Review project issues
- Check DEVELOPMENT.md for additional context
