Bootstrapping the SIGIL Editor

- [X] Basic split-pane editor with CodeMirror 6
- [X] SIGIL integration (string template processing)
- [X] Basic YAML input and output display
- [X] Error handling and loading states
- [X] Foundation state management with Svelte 5 runes
- [X] Multi-file tab management with reactive state
- [X] Multi-file YAML processing with SIGIL

High-Priority Features (Implementation Order)

## Phase 1: Core Desktop Experience

### 1. Frameless Window + Compact UI 🖼️ **[NEXT]**
Status: Needs implementation
Priority: **Enables hamburger menu and professional desktop feel**

- [ ] Frameless window with custom window controls
- [ ] Compact header bar (GNOME Libadwaita style)
- [ ] Hamburger menu for essential actions (New, Open, Save, Save As, Preferences, About)
- [ ] Draggable window regions (entire header except controls)
- [ ] File name display in header (or "SIGIL Editor" when no file)
- [ ] Custom minimize/maximize/close buttons (retro styled)
- [ ] No toolbar clutter - clean, distraction-free interface

### 2. File System Integration 🎯 **[CRITICAL]**
Status: Missing critical functionality
Priority: **Ship a usable build - users can open, edit, and save YAML files**

- [ ] Native file open/save operations using Wails APIs
- [ ] File open dialog with YAML filter (`.yaml`, `.yml`)
- [ ] File save dialog with default `.yaml` extension
- [ ] "Dirty" file indicators (unsaved changes)
- [ ] Save confirmation prompts on close
- [ ] Recent files management (show in hamburger menu)
- [ ] Auto-save functionality (optional, in preferences)
- [ ] Session restoration (reopen files on startup)

### 3. Dual Output Panel Tabs 📑 **[MVP]**
Status: Basic output display, needs tab system
Priority: **Start simple - Output and Console tabs only**

- [ ] Tab bar above output panel (like Svelte REPL)
- [ ] **Output Tab** (default): Generated SIGIL text, clean display
- [ ] **Console Tab**: Debug logs, errors (red), warnings (yellow), processing info (blue)
- [ ] Tab switching functionality
- [ ] Collapsible sections in console for organization
- [ ] Copy output button
- [ ] Clear console button

### 4. Landing Page/Welcome Screen 📋 **[UX Polish]**
Status: Component exists but not integrated
Priority: **Professional first impression**

- [ ] Default startup screen when no files open
- [ ] Buttons: "New File", "Open File" (cartridges come later)
- [ ] Recent files quick access list
- [ ] Keyboard shortcuts reference
- [ ] Graceful handling when no files are open
- [ ] Session restoration toggle in preferences

## Phase 2: Enhanced Features

### 5. Multi-File Tab Management (Editor Tabs) 🎯
Status: ✅ Implemented, needs refinement

- [X] Tab-based interface with Svelte 5 runes
- [X] Tab switching and close functionality
- [ ] Keyboard shortcuts (Ctrl+Tab navigation, Ctrl+W close)
- [ ] Drag-and-drop tab reordering
- [ ] Scrollable tabs for overflow
- [ ] Tab context menu (Close, Close Others, Close All)

### 6. SIGIL Syntax Highlighting & Validation 🔧
Status: Critical for user experience

- [ ] CodeMirror extension for SIGIL template references `[weapon.melee]`
- [ ] Highlight inline alternatives `{a|an|the}`
- [ ] **Critical**: Detect unquoted brackets in YAML arrays (silent bug prevention)
- [ ] Visual distinction for dot notation paths
- [ ] Real-time YAML syntax validation
- [ ] On-demand SIGIL semantic validation (missing templates, circular dependencies)
- [ ] Error markers with red squiggly lines
- [ ] Helpful error messages with fix suggestions
- [ ] Hover tooltips for validation issues
- [ ] Console tab for validation feedback

### 7. Retro Theme System 🎨
Status: Needs complete implementation

- [ ] 8-bit console-inspired color palettes (rainbow monochrome)
- [ ] Built-in palettes: NES Red, Game Boy, C64 Blue, SNES Purple, Pixel Noir
- [ ] CSS custom properties for theme tokens
- [ ] Theme selection in hamburger menu
- [ ] Pixel art aesthetic: clean borders, retro typography
- [ ] Google Fonts integration for custom fonts

## Phase 3: Advanced Features

### 8. Cartridge System 🎮
Status: Core concept defined, deferred until core is solid

- [ ] `.sigil` file format (ZIP with manifest, YAML files, optional thumbnail)
- [ ] Cartridge loading/saving operations
- [ ] Manifest editor (name, description, author, version, suggested templates)
- [ ] One cartridge at a time session management
- [ ] Mix cartridge files + standalone YAML files
- [ ] Thumbnail support (PNG/WebP, fallback to default SIGIL icon)
- [ ] Theme override from cartridge manifest
- [ ] Cartridge tab in output panel
- [ ] "Load Cartridge" button on landing page

### 9. Tutorial System 📚
Status: Concept defined, builds on cartridge system

- [ ] Tutorial cartridges (regular `.sigil` files with tutorial content)
- [ ] 1-page YAML tutorial: lists and dicts basics
- [ ] Progressive tutorials following SIGIL README order
- [ ] Guided steps with progression tracking
- [ ] Validation checks for tutorial completion
- [ ] "Learn SIGIL" button on landing page
- [ ] Tutorial library/discovery interface
- [ ] Playwright tests for tutorial validation (compare to Node.js unit tests)

## Technical Debt & Refinements

- [ ] Clean up debugging console.log statements
- [ ] Improve error handling with user-friendly messages
- [ ] Add loading states for cartridge operations
- [ ] Optimize SIGIL processing for large files
- [ ] Implement proper TypeScript types for cartridge manifest
- [ ] Add unit tests for cartridge pack/unpack operations
- [ ] Document keyboard shortcuts in app
- [ ] Add accessibility features (ARIA labels, keyboard navigation)