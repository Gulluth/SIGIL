.PHONY: clean clean-all dev build setup help build-darwin build-darwin-amd64 build-darwin-arm64 build-darwin-universal build-linux build-linux-amd64 build-linux-arm64 build-windows build-windows-amd64 build-all package package-all version-bump version-major version-minor version-patch

.DEFAULT_GOAL := help

help:
	@echo "Available targets:"
	@echo "  clean                - Remove build artifacts (binaries, dist, .svelte-kit)"
	@echo "  clean-all            - Deep clean including node_modules and go cache"  
	@echo "  setup                - Install dependencies and create necessary directories"
	@echo "  dev                  - Run development server"
	@echo "  build                - Build production version for current platform"
	@echo ""
	@echo "Platform-specific builds:"
	@echo "  build-darwin-amd64   - Build for macOS Intel (x86_64)"
	@echo "  build-darwin-arm64   - Build for macOS Apple Silicon (M1/M2/M3)"
	@echo "  build-darwin-universal - Build universal macOS binary (Intel + Apple Silicon)"
	@echo "  build-linux-amd64    - Build for Linux x86_64"
	@echo "  build-linux-arm64    - Build for Linux ARM64"
	@echo "  build-windows-amd64  - Build for Windows x86_64"
	@echo "  build-all            - Build for all platforms"
	@echo ""
	@echo "Installers:"
	@echo "  package              - Package installer for current platform"
	@echo "  package-all          - Build installers for all platforms"
	@echo ""
	@echo "Version management:"
	@echo "  version-patch        - Bump patch version (0.1.0 -> 0.1.1)"
	@echo "  version-minor        - Bump minor version (0.1.0 -> 0.2.0)"
	@echo "  version-major        - Bump major version (0.1.0 -> 1.0.0)"
	@echo ""
	@echo "  help                 - Show this help message"

clean:
	@echo "Cleaning build artifacts..."
	# Clean bin directory contents but keep the directory
	rm -rf bin/*
	# Clean frontend build artifacts
	rm -rf frontend/dist frontend/.svelte-kit
	# Clean any generated binaries in the project root
	rm -f learn-sigil learn-sigil.exe sigil-editor sigil-editor.exe
	# Clean temporary files and build outputs (but preserve build config)
	rm -rf .tmp
	# Clean any build outputs while preserving config files
	@if [ -d "build" ]; then \
		find build -name "*.exe" -o -name "*.app" -o -name "*.deb" -o -name "*.rpm" -o -name "*.zip" -o -name "*.tar.gz" | xargs rm -f 2>/dev/null || true; \
	fi
	@echo "Clean complete!"

clean-all: clean
	@echo "Deep cleaning (including dependencies)..."
	# Also clean node_modules and go cache if you want a complete reset
	rm -rf frontend/node_modules
	go clean -cache -modcache -testcache
	@echo "Deep clean complete!"

setup:
	@echo "Setting up project dependencies..."
	# Install frontend dependencies
	cd frontend && npm install
	# Ensure bin directory exists
	mkdir -p bin
	# Check if build directory exists, if not, warn user
	@if [ ! -d "build" ]; then \
		echo "WARNING: build directory missing. If wails3 commands fail, you may need to:"; \
		echo "  1. Check if this is a proper wails3 project"; \
		echo "  2. Run 'wails3 init' in a new directory and copy build files"; \
		echo "  3. Or restore build directory from backup/source"; \
	fi
	@echo "Setup complete!"

dev:
	wails3 dev

build:
	wails3 build

# macOS builds
build-darwin-amd64:
	@echo "Building for macOS Intel (x86_64)..."
	wails3 task darwin:build ARCH=amd64 PRODUCTION=true

build-darwin-arm64:
	@echo "Building for macOS Apple Silicon (ARM64)..."
	wails3 task darwin:build ARCH=arm64 PRODUCTION=true

build-darwin-universal:
	@echo "Building universal macOS binary (Intel + Apple Silicon)..."
	wails3 task darwin:build:universal PRODUCTION=true

# Linux builds
build-linux-amd64:
	@echo "Building for Linux x86_64..."
	wails3 task linux:build ARCH=amd64 PRODUCTION=true

build-linux-arm64:
	@echo "Building for Linux ARM64..."
	wails3 task linux:build ARCH=arm64 PRODUCTION=true

# Windows builds
build-windows-amd64:
	@echo "Building for Windows x86_64..."
	wails3 task windows:build ARCH=amd64 PRODUCTION=true

# Build all platforms
build-all:
	@echo "Building for all platforms..."
	@echo ""
	@$(MAKE) build-darwin-universal
	@echo ""
	@$(MAKE) build-linux-amd64
	@echo ""
	@$(MAKE) build-linux-arm64
	@echo ""
	@$(MAKE) build-windows-amd64
	@echo ""
	@echo "All platform builds complete!"
	@echo "Binaries are in the bin/ directory"

# Package installers
package:
	@echo "Packaging installer for current platform..."
	wails3 task package PRODUCTION=true

package-all:
	@echo "Building installers for all platforms..."
	@echo ""
	@echo "Note: Cross-platform packaging may require platform-specific tools."
	@echo "For best results, build packages on their native platforms."
	@echo ""
	@if [ "$$(uname)" = "Darwin" ]; then \
		echo "Building macOS .app bundle and DMG..."; \
		wails3 task darwin:package PRODUCTION=true; \
	fi
	@if [ "$$(uname)" = "Linux" ]; then \
		echo "Building Linux packages (DEB, RPM, AppImage)..."; \
		wails3 task linux:package PRODUCTION=true; \
	fi
	@echo ""
	@echo "Note: Windows NSIS/MSIX installers should be built on Windows."
	@echo "Run 'make package' on Windows to create Windows installers."

# Version management
version-patch:
	@echo "Bumping patch version..."
	@./scripts/bump-version.sh patch

version-minor:
	@echo "Bumping minor version..."
	@./scripts/bump-version.sh minor

version-major:
	@echo "Bumping major version..."
	@./scripts/bump-version.sh major
