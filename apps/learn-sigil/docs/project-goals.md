# SIGIL Editor - Desktop Application

The goal of this project is to build a desktop SIGIL YAML editor/playground/tutorial using SvelteKit 2.x + Svelte 5.x (with runes syntax) packaged as a Wails 3.x application.

## Project Goals

- **Zero backend dependency** - All processing runs locally in the desktop app
- **Split-pane interface**: 
  - Left: Editable YAML (SIGIL source code) with syntax highlighting
  - Right: Live parsed/evaluated output with generation results
- **File management**: Import/Export YAML files using native file dialogs
- **Multi-file support**: Tab-based editing with SIGIL file merging capabilities; all open YAML files are processed together, with a Template ID text field next to the generate button
- **Cartridge system**: `.sigil` file format for packaging complete SIGIL generators with metadata, themes, and tutorials
- **Real-time validation**: YAML syntax validation and SIGIL semantic checking in editor
- **Tutorial system**: Interactive learning pages with guided examples, deliverable as cartridges
- **Frameless desktop experience**: Clean UI with compact header bar, hamburger menu, and keyboard shortcuts

## Core Architecture

1. **Wails 3.x Alpha** - Desktop application framework
2. **SvelteKit 2.x** - Frontend framework with static adapter for Wails
3. **Svelte 5.x with Runes** - Reactive state management
4. **CodeMirror 6** - YAML editor with SIGIL-specific extensions
5. **TailwindCSS** - Utility-first CSS framework for clean UI
6. **SIGIL Runtime Integration** - Local monorepo package reference
7. **Native File System Access** - Via Wails APIs for file operations
8. **Main Thread Processing** - SIGIL processing with Svelte runes
9. **Tab-based Multi-file** - Primary file management interface
10. **Retro Console Theming** - 8-bit inspired color palettes with pixel art aesthetics
11. **Cartridge System** - `.sigil` file format for shareable SIGIL generators

## Key Architecture Decisions

### Editor Component
**CodeMirror 6**  
- Selected for its lightweight design, excellent tree-shaking, built-in YAML support, and extensive plugin ecosystem that allows for clean, customizable UI with toggleable features (e.g., line numbers, spell check) via preferences.
- Provides the flexibility needed for SIGIL-specific extensions while maintaining a retro-inspired, distraction-free appearance.
- Alternatives considered: Monaco (too heavy for YAML focus) and Ace (less modular for deep customization).

### SIGIL Runtime Integration
**Local monorepo package reference**  
- Import from `../../libs/sigil` leveraging the current monorepo structure for seamless development and testing alongside SIGIL library evolution.

### State Management Strategy  
**Svelte 5 Runes**  
- Using modern reactive primitives for better TypeScript support and cleaner component architecture, with runes handling both component and global app state.

### Multi-File Strategy
**Dual tab system with cartridge support**  
- **Editor Tabs** (top of left panel): Open YAML files with close buttons, scrollable overflow, keyboard shortcuts (Ctrl+Tab), drag-and-drop reordering
- **Output Tabs** (top of right panel): Output (default), Console (debug/errors), Cartridge (metadata editor when cartridge loaded)
- **Cartridge Mode**: One cartridge open at a time; cartridge files shown with special badge/icon; standalone YAML files can be opened alongside and are implicitly added to cartridge on save
- **Freestyle Mode**: Individual YAML files without cartridge context
- **SIGIL Processing**: All open YAML files merged and sent to SIGIL runtime; text input field for Template ID with autocomplete suggestions from cartridge manifest

### Output Format
**Tabbed output panel with multiple views**  
- **Output Tab** (default): SIGIL-generated plain text for clean, focused results
- **Console Tab**: Combined debug logs, validation errors (red), warnings (yellow), processing steps (blue), collapsible sections
- **Cartridge Tab**: Only visible when cartridge loaded; edit manifest, manage files, customize theme, set suggested templates, preview thumbnail
- Panel tabs allow users to switch contexts without cluttering the main UI, following the Svelte REPL pattern

### Tutorial Integration
**Tutorial cartridges with embedded learning content**  
- Default landing page shows hot-key commands (e.g., Ctrl+O for opening files) and buttons: "New Empty File", "Load Cartridge", and "Learn SIGIL"
- Tutorials are regular `.sigil` cartridges that include guided content, potentially with progression tracking and validation checks
- Landing page also features cartridge library/examples for discovery
- Session restoration: Preferences option (enabled by default) to reopen previously open files/cartridges on launch; gracefully handles missing/corrupted files by falling back to landing page
- Accessibility: Keyboard navigation for buttons and hot-keys

### Performance
**Main thread processing with Svelte runes**  
- SIGIL processing runs on the main thread using Svelte 5 runes for reactive state management, leveraging SIGIL's fast performance for simplicity and direct UI integration.
- Unit tests will cover performance edge cases (e.g., large files, boundary conditions) to provide early feedback on potential UI hangs.

### Validation
**On-demand SIGIL validation with real-time YAML syntax checking**  
- YAML syntax validation runs in real-time via CodeMirror for immediate feedback on structure.
- SIGIL semantic validation is on-demand (e.g., via a "Validate" button), checking against SIGIL APIs for template validity and errors, to avoid overwhelming the UI early in development.

### SIGIL Syntax Highlighting & Error Detection
**Enhanced CodeMirror integration for SIGIL-specific syntax patterns**  
- **Critical Issue Identified**: The current YAML parser treats unquoted square brackets `[melee]` as YAML flow sequences (arrays) instead of SIGIL template references, causing silent failures where `[dot.notation]` renders literally instead of processing hierarchically.
- **Template Reference Validation**: Implement real-time detection of unquoted template references in YAML arrays and flag them as syntax errors with suggestions to quote them (`"[melee]"` instead of `[melee]`).  
- **SIGIL Syntax Highlighting**: Extend CodeMirror's YAML mode to recognize and visually distinguish SIGIL-specific patterns:
  - Template references: `[weapon.melee]`, `[dot.notation]` 
  - Inline alternatives: `{a|an|the}`
  - Hierarchical dot notation paths
  - Quoted vs unquoted template references in arrays
- **Common Error Patterns**: Build specific detection for frequent SIGIL mistakes:
  - Unquoted square brackets in YAML arrays (the root cause of our dot notation issue)
  - Invalid dot notation paths that don't exist in the current data structure
  - Missing template references and circular dependencies
  - Inconsistent template reference formatting
- **Developer Experience**: Provide helpful error messages with context and fix suggestions, integrating with CodeMirror's linting system to show red squiggly lines and hover tooltips.

### Cartridge System
**`.sigil` file format for packaging complete SIGIL generators**  
- **Format**: ZIP archive with `.sigil` extension containing YAML files, manifest, optional thumbnail, and optional fonts
- **Manifest Structure** (`manifest.json`):
  ```json
  {
    "name": "Fantasy Generator",
    "version": "1.0.0",
    "author": "Creator Name",
    "description": "Generate fantasy characters and items",
    "sigilVersion": "1.0.0",  // Optional, warns if mismatch
    "files": ["tables.yaml", "weapons.yaml"],
    "suggestedTemplates": [
      { "id": "character", "description": "Generate a character" },
      { "id": "weapon", "description": "Generate a weapon" }
    ],
    "theme": {
      "palette": "nes-red",  // Or "custom"
      "font": {
        "family": "Press Start 2P",
        "source": "google-fonts"
      }
    }
  }
  ```
- **Thumbnail**: Optional `thumbnail.png` or `thumbnail.webp` (separate file in ZIP, not base64); falls back to default SIGIL icon
- **Session Management**: One cartridge open at a time; must close (with save prompt if dirty) before opening another
- **Mixed Mode**: Standalone YAML files can be opened alongside cartridge files; implicitly added to cartridge on save
- **Sharing**: Cartridges enable easy distribution of complete SIGIL projects including themes and tutorials
- **Discovery**: Landing page features cartridge library for browsing community generators

### Frameless Window Design
**Clean, distraction-free interface with compact header**  
- **Frameless Window**: No native OS window chrome; custom window controls styled to match retro aesthetic
- **Compact Header Bar** (GNOME Libadwaita style):
  ```
  ┌─────────────────────────────────────────────┐
  │ ☰ Fantasy Generator        [▭] [◻] [✕]    │
  └─────────────────────────────────────────────┘
  ```
  - Left: Hamburger menu + cartridge/file name (entire header is draggable except interactive elements)
  - Right: Window controls (minimize, maximize, close)
  - No toolbar clutter - all actions accessed via hamburger menu
- **Hamburger Menu**: Essential actions only - New, Open Cartridge, Open File, Save, Save As, Preferences, About
- **Keyboard Shortcuts**: Primary interaction method (Ctrl+O, Ctrl+S, Ctrl+Tab, etc.)
- **Cartridge Name Display**: Shows manifest `name` field, or filename without extension if missing; no `.sigil` extension shown

## File/Folder Structure (Proposed)

```
frontend/src/
  lib/
    components/
      Editor.svelte           # Main editor with tab management
      OutputPanel.svelte      # Tabbed output (Output/Console/Cartridge)
      HeaderBar.svelte        # Frameless window header with hamburger menu
      LandingPage.svelte      # Welcome screen with "New", "Load Cartridge", "Learn" buttons
      CartridgeEditor.svelte  # Cartridge metadata editor
      TutorialViewer.svelte   # Tutorial content display
    editor/
      CodeEditor.svelte       # CodeMirror 6 implementation
      extensions/             # SIGIL-specific CodeMirror extensions
    wails/
      fileSystem.ts          # Native file open/save operations
      cartridge.ts           # Cartridge load/save/pack/unpack operations
      preferences.ts         # App settings persistence
    state/
      editor.ts              # Editor state using Svelte runes
      files.ts               # Open files and tab management
      cartridge.ts           # Active cartridge state
      settings.ts            # User preferences and themes
    examples/
      examples.ts            # Built-in tutorial examples
    themes/
      retro-palettes.ts      # 8-bit console-inspired color palettes
    types/
      wails.d.ts             # Wails API type definitions
  routes/
    +layout.svelte          # App shell with frameless window header
    +page.svelte            # Landing page or main editor
    cartridge/
      [id]/
        +page.svelte        # Cartridge detail/preview page
    tutorial/
      +layout.svelte        # Tutorial layout with split-pane
      +page.svelte          # Tutorial index
      [slug]/
        +page.svelte        # Individual tutorial lessons
  app.html                  # Base HTML template
```

### Wails Integration Points
- **File Operations**: Native open/save dialogs via Wails APIs (replaces web file APIs)
- **Cartridge Operations**: ZIP file handling for loading/saving `.sigil` cartridges
- **Frameless Window**: Custom window controls using Wails draggable regions
- **Preferences**: Native app settings storage (replaces localStorage)
- **Window Management**: Remember size/position, custom minimize/maximize/close

---

## Cartridge Manifest Structure

```typescript
export interface CartridgeManifest {
  name: string;
  version: string;
  author: string;
  description: string;
  sigilVersion?: string;  // Optional, warns if mismatch
  files: string[];        // YAML files included in cartridge
  suggestedTemplates?: Array<{
    id: string;
    description: string;
  }>;
  theme?: {
    palette: string;      // 'nes-red', 'game-boy', 'custom', etc.
    colors?: {            // Only if palette === 'custom'
      bg: string;
      fg: string;
      accent: string;
    };
    font?: {
      family: string;
      source: 'google-fonts' | 'system' | 'embedded';
    };
  };
  thumbnail?: string;     // Filename of thumbnail image in cartridge
  tutorial?: {            // Optional tutorial metadata
    steps: number;
    difficulty: 'beginner' | 'intermediate' | 'advanced';
  };
}
```

## Tutorial Examples Structure

```typescript
export interface TutorialExample {
  id: string;
  title: string;
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  files: Record<string, string>; // Support multi-file examples
  expectedOutput?: string;
}

export const examples: TutorialExample[] = [
  {
    id: 'minimal-world',
    title: 'Minimal World',
    description: 'Basic SIGIL world definition with regions',
    difficulty: 'beginner',
    files: {
      'world.yaml': `world:
  name: "Elaria" 
  regions:
    - name: "Northreach"
      climate: "arctic"
    - name: "Verdelune" 
      climate: "temperate"`
    }
  },
  {
    id: 'characters-factions',
    title: 'Characters & Factions',
    description: 'Adding characters linked to factions',
    difficulty: 'intermediate',
    files: {
      'world.yaml': `world:
  factions:
    - id: "guild.artificers"
      name: "Guild of Artificers"
  characters:
    - name: "Seren Valis"
      faction: "guild.artificers"
      traits: ["curious", "methodical"]`
    }
  }
];
```

## State Management Patterns

### Svelte 5 Runes Implementation
```typescript
// lib/state/editor.ts - Example state management
export const currentFile = $state<string | null>(null);
export const openFiles = $state<Map<string, string>>(new Map());
export const isDirty = $state<boolean>(false);
export const selectedTemplateId = $state<string>('');

// Cartridge state
export const activeCartridge = $state<CartridgeManifest | null>(null);
export const cartridgeFiles = $state<Set<string>>(new Set());  // Files belonging to cartridge
export const standaloneFiles = $state<Set<string>>(new Set()); // Files not in cartridge

// SIGIL processing state  
export const isProcessing = $state<boolean>(false);
export const lastResult = $state<string | null>(null);
export const lastError = $state<string | null>(null);

// UI state
export const showLineNumbers = $state<boolean>(true);
export const currentTheme = $state<string>('nes-red');  // Retro palette
export const activeOutputTab = $state<'output' | 'console' | 'cartridge'>('output');
```

## Wails Integration Considerations

### Native File System Access
```typescript
// lib/wails/fileSystem.ts
import { OpenFile, SaveFile } from '@wailsio/runtime';

export async function openYamlFile(): Promise<{ name: string; content: string } | null> {
  try {
    const file = await OpenFile({
      filters: [
        { displayName: 'SIGIL Files', pattern: '*.yaml;*.yml' },
        { displayName: 'All Files', pattern: '*.*' }
      ]
    });
    return file ? { name: file.name, content: file.content } : null;
  } catch (error) {
    console.error('Failed to open file:', error);
    return null;
  }
}

export async function saveYamlFile(content: string, filename?: string): Promise<boolean> {
  try {
    await SaveFile(content, {
      defaultFilename: filename || 'untitled.yaml',
      filters: [
        { displayName: 'SIGIL Files', pattern: '*.yaml;*.yml' }
      ]
    });
    return true;
  } catch (error) {
    console.error('Failed to save file:', error);  
    return false;
  }
}
```

### Hamburger Menu Structure
Frameless window with compact menu for essential actions:
- **File**: New, Open Cartridge, Open File, Save, Save As Cartridge, Export YAML, Recent, Quit
- **Edit**: Undo, Redo, Cut, Copy, Paste, Find, Replace  
- **View**: Toggle Line Numbers, Theme Selection, Font Size
- **Help**: Learn SIGIL, Keyboard Shortcuts, About

### Drag and Drop
Yaml and Cartridges can be loaded with drag-and-drop.
- **Drop zone visual feedback**
- Loading multiple YAML files opens a new tab for each
- Silently ignores non-yaml and sigil cartridges

### Application Settings
Replace localStorage with native preferences:
```typescript
// lib/wails/preferences.ts
import { GetConfig, SetConfig } from '@wailsio/runtime';

interface AppSettings {
  theme: 'nes-red' | 'game-boy' | 'c64-blue' | 'custom';
  editorFontSize: number;
  autoSave: boolean;
  recentFiles: string[];
  recentCartridges: string[];
  sessionRestore: boolean;
}

export async function loadSettings(): Promise<AppSettings> {
  return await GetConfig('app.settings') || {
    theme: 'nes-red',
    editorFontSize: 14, 
    autoSave: true,
    recentFiles: [],
    recentCartridges: [],
    sessionRestore: true
  };
}

export async function saveSettings(settings: AppSettings): Promise<void> {
  await SetConfig('app.settings', settings);
}
```

## Styling Strategy Decisions

### CSS Framework Options
**TailwindCSS**  
- Selected for its utility-first approach, excellent tree-shaking, and consistent design system that supports a clean, GTK4/Gnome3-inspired UI.
- Allows for rapid prototyping of layouts while keeping bundle size minimal through purging unused styles.
- Alternatives considered: Native CSS (more manual work) and CSS-in-JS (runtime overhead).

### Theme System
**Retro 8-bit console-inspired color palettes**  
- **CSS Custom Properties**: Define theme tokens as CSS variables for easy customization
- **Rainbow Monochrome Palettes**: Each palette uses monochromatic base + accent colors for syntax highlighting
- **Built-in Palettes**:
  - 🔴 **NES Red**: Warm reds/oranges (Super Mario Bros aesthetic)
  - 🟠 **Atari Orange**: Earth tones (Atari 2600 classic)
  - 🟡 **Game Boy**: Greens/yellows (DMG-01 original)
  - 🟢 **Zelda Green**: Forest greens (Link's palette)
  - 🔵 **Commodore 64**: Blues/purples (C64 blue screen)
  - 🟣 **SNES Purple**: Deep purples (Mode 7 vibes)
  - ⚫ **Pixel Noir**: Grayscale with cyan/magenta accents
- **Cartridge Theme Override**: Cartridges can specify custom palettes and fonts that override user settings
- **Font Support**: Start with Google Fonts references; future support for embedded fonts in cartridges
- **Pixel Art Aesthetic**: Clean borders, retro typography, optional CRT-style effects

## Development Workflow Considerations

### Build Configuration
- **SvelteKit Static Adapter**: Required for Wails packaging
- **Vite Configuration**: Optimize for desktop app (different from web)
- **TypeScript**: Full type safety including Wails APIs
- **Bundle Analysis**: Important for desktop app size management

### Testing Strategy  
- **Component Testing**: Vitest + Testing Library for Svelte components
- **Integration Testing**: Test Wails API integrations with mocked backends
- **E2E Testing**: Playwright for full desktop app testing workflows

### Development Environment
- **Hot Reload**: Vite dev server during frontend development  
- **Wails Dev Mode**: `wails dev` for integrated testing with Go backend
- **Debugging**: DevTools available in development builds

## Next Steps

1. **Set up basic Wails + SvelteKit integration** with static adapter
2. **Install and configure dependencies** (CodeMirror 6, TailwindCSS)  
3. **Implement frameless window** with compact header bar and hamburger menu
4. **Create landing page** with "New File", "Load Cartridge", and "Learn SIGIL" buttons
5. **Build dual-tab editor component** with CodeMirror integration (editor tabs + output tabs)
6. **Add native file operations** using Wails APIs (open/save/recent files)
7. **Implement cartridge system** (`.sigil` format, manifest, pack/unpack)
8. **Integrate SIGIL runtime** for main-thread processing with runes
9. **Create retro theme system** with 8-bit console palettes
10. **Add SIGIL syntax highlighting** and validation (unquoted bracket detection, dot notation validation)
11. **Build cartridge editor tab** for metadata and theme customization
12. **Implement tutorial system** as special cartridges with guided content

# Code Editor Component

## Playground Component

```html
<script lang="ts">
  import CodeEditor from '$lib/editor/CodeEditor.svelte';
  import { code, parsing, result, error } from '$lib/stores/playground';
  import { encodeSnippet } from '$lib/util/compress';
  import { examples } from '$lib/examples/examples';

  let worker: Worker;
  let currentId = 0;

  // Local states
  let localCode = '';
  let selectedExample = 0;
  let autoRun = true;
  let dark = true;

  const runParse = () => {
    if (!worker) return;
    parsing.set(true);
    error.set(null);
    const id = ++currentId;
    worker.postMessage({ id, code: localCode });
  };

  function onEditorChange(v: string) {
    localCode = v;
    code.set(v);
    if (autoRun) runParse();
  }

  function loadExample(i: number) {
    selectedExample = i;
    localCode = examples[i].code;
    code.set(localCode);
    runParse();
  }

  function share() {
    const c = encodeSnippet(localCode);
    const url = new URL(window.location.href);
    url.searchParams.set('c', c);
    history.replaceState({}, '', url.toString());
    navigator.clipboard.writeText(url.toString());
    // Optionally show toast
  }

  // Watch query param at mount
  import { onMount } from 'svelte';
  import { decodeSnippet } from '$lib/util/compress';
  onMount(() => {
    worker = new Worker(new URL('../workers/sigilWorker.ts', import.meta.url), { type: 'module' });
    worker.onmessage = (e: MessageEvent) => {
      const { id, ok, ast, error: err } = e.data;
      if (id !== currentId) return; // ignore stale
      parsing.set(false);
      if (ok) {
        result.set(ast);
      } else {
        error.set(err);
        result.set(null);
      }
    };
    // query param load
    const params = new URLSearchParams(window.location.search);
    const dec = decodeSnippet(params.get('c'));
    if (dec) {
      localCode = dec;
      code.set(localCode);
    } else {
      loadExample(0);
    }
    runParse();
  });
</script>

<div class="playground">
  <div class="toolbar">
    <select bind:value={selectedExample} on:change={() => loadExample(selectedExample)}>
      {#each examples as ex, i}
        <option value={i}>{ex.title}</option>
      {/each}
    </select>
    <label><input type="checkbox" bind:checked={autoRun}> Auto-run</label>
    <button on:click={runParse} disabled={autoRun}>Run</button>
    <button on:click={share}>Share Link</button>
    <label><input type="checkbox" bind:checked={dark}> Dark</label>
  </div>

  <div class="panes">
    <div class="pane left">
      <CodeEditor bind:value={localCode} {dark} on:change={(e) => onEditorChange(e.detail)} />
    </div>
    <div class="pane right">
      <Output />
    </div>
  </div>
</div>

<style>
.playground {
  display: flex;
  flex-direction: column;
  height: 100%;
}
.toolbar {
  display: flex;
  gap: 0.75rem;
  padding: 0.5rem;
  align-items: center;
  background: var(--toolbar-bg, #222);
  color: #eee;
}
.panes {
  flex: 1;
  display: grid;
  grid-template-columns: 1fr 1fr;
  min-height: 0;
}
.pane {
  min-height: 0;
  overflow: auto;
  border: 1px solid #333;
}
.left { border-right: none; }
</style>

<!-- A simple output sub-component inline for brevity -->
<script lang="ts">
  import { status, result, error } from '$lib/stores/playground';
  import { derived } from 'svelte/store';
  const pretty = derived(result, $r => $r ? JSON.stringify($r, null, 2) : '');
</script>

<svelte:component this="{Output}" />

<!-- Could be extracted -->
<script lang="ts">
  function Output() {}
</script>

<div slot="right-output">
  {#if $status === 'parsing'}
    <p>Parsing...</p>
  {:else if $status === 'error'}
    <pre class="err">{$error}</pre>
  {:else if $status === 'ok'}
    <pre class="json">{$pretty}</pre>
  {:else}
    <p>Idle</p>
  {/if}
</div>

<style>
.json, .err {
  margin: 0;
  padding: 1rem;
  font-family: monospace;
  font-size: 13px;
  white-space: pre;
}
.err { color: #ff6b6b; }
</style>
```

(You can extract Output into its own file for cleanliness.)

# Main Page

```html
<script>
  import Playground from '$lib/components/Playground.svelte';
</script>

<Playground style="height:100vh;" />

```

Global styles will be managed using TailwindCSS.

# SIGIL Runtime

Using the logic in the SIGIL docs.

# Tutorial Pages
For tutorial steps, each [slug]/+page.svelte can import the same Playground but supply:

- initialCode
- Additional explanatory markdown
- Possibly a guard that locks certain lines (you can implement a “readOnlyRanges” extension in CodeMirror later).