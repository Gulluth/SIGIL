.PHONY: clean clean-all dev build setup help

.DEFAULT_GOAL := help

help:
	@echo "Available targets:"
	@echo "  clean      - Remove build artifacts (binaries, dist, .svelte-kit)"
	@echo "  clean-all  - Deep clean including node_modules and go cache"  
	@echo "  setup      - Install dependencies and create necessary directories"
	@echo "  dev        - Run development server"
	@echo "  build      - Build production version"
	@echo "  help       - Show this help message"

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
