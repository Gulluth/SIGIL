# SIGIL Editor - Desktop Application

The goal of this project is to build a desktop SIGIL YAML editor/playground/tutorial using SvelteKit 2.x + Svelte 5.x (with runes syntax) packaged as a Wails 3.x application.

## Project Goals

- **Zero backend dependency** - All processing runs locally in the desktop app
- **Split-pane interface**: 
  - Left: Editable YAML (SIGIL source code) with syntax highlighting
  - Right: Live parsed/evaluated output with generation results
- **File management**: Import/Export YAML files using native file dialogs
- **Multi-file support**: Tab-based editing with SIGIL file merging capabilities; all open YAML files are processed together, with a Template ID text field next to the generate button
- **Real-time validation**: YAML syntax validation and SIGIL semantic checking in editor
- **Tutorial system**: Interactive learning pages with guided examples
- **Native desktop experience**: Menu bar, keyboard shortcuts, window management

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
10. **Terminal-inspired Theming** - Based on Gogh terminal themes

## Key Architecture Decisions

### Editor Component
**CodeMirror 6**  
- Selected for its lightweight design, excellent tree-shaking, built-in YAML support, and extensive plugin ecosystem that allows for clean, customizable UI with toggleable features (e.g., line numbers, spell check) via preferences.
- Provides the flexibility needed for SIGIL-specific extensions while maintaining a simple, GTK4/Gnome3-inspired appearance.
- Alternatives considered: Monaco (too heavy for YAML focus) and Ace (less modular for deep customization).

### SIGIL Runtime Integration
**Local monorepo package reference**  
- Import from `../../libs/sigil` leveraging the current monorepo structure for seamless development and testing alongside SIGIL library evolution.

### State Management Strategy  
**Svelte 5 Runes**  
- Using modern reactive primitives for better TypeScript support and cleaner component architecture, with runes handling both component and global app state.

### Multi-File Strategy
**Tab-based editing**  
- Tabs positioned at top or bottom (user-togglable) serve as the primary file manager, replacing the need for a sidebar tree view.
- Features: Close tabs with x button (prompt to save unsaved changes or new files), open files via native dialogs create new tabs, keyboard shortcuts for navigation (e.g., Ctrl+Tab), drag-and-drop reordering, scrollable tabs for overflow, recent files integration.
- SIGIL Processing: All open YAML files are merged and sent to SIGIL runtime; UI includes a text input field next to the generate button to select the Template ID for processing.

### Output Format
**Plain text output as primary, with optional debug JSON view**  
- Default display shows SIGIL-generated plain text for training and reference use, maintaining simplicity and direct correspondence to SIGIL's core output.
- Optional debug mode (toggleable in preferences) provides JSON details (e.g., parsed structures, diagnostics) for development, without cluttering the main UI.

### Tutorial Integration
**Embedded tutorials with consistent UI, accessed via landing page**  
- Default landing page shows hot-key commands (e.g., Ctrl+O for opening files) and two buttons: "New Empty File" and "Learn SIGIL".
- Tutorials reuse the split-pane editor layout for consistency, with guided content in the right pane.
- Session restoration: Preferences option (enabled by default) to reopen previously open files on launch; gracefully handles missing/corrupted files by falling back to landing page or opening accessible files.
- Accessibility: Keyboard navigation for buttons and hot-keys.

### Performance
**Main thread processing with Svelte runes**  
- SIGIL processing runs on the main thread using Svelte 5 runes for reactive state management, leveraging SIGIL's fast performance for simplicity and direct UI integration.
- Unit tests will cover performance edge cases (e.g., large files, boundary conditions) to provide early feedback on potential UI hangs.

### Validation
**On-demand SIGIL validation with real-time YAML syntax checking**  
- YAML syntax validation runs in real-time via CodeMirror for immediate feedback on structure.
- SIGIL semantic validation is on-demand (e.g., via a "Validate" button), checking against SIGIL APIs for template validity and errors, to avoid overwhelming the UI early in development.

## File/Folder Structure (Proposed)

```
frontend/src/
  lib/
    components/
      Editor.svelte           # Main editor with tab management
      OutputPanel.svelte      # SIGIL results display
      LandingPage.svelte      # Welcome screen with "New" and "Learn" buttons
      TutorialViewer.svelte   # Tutorial content display
    editor/
      CodeEditor.svelte       # CodeMirror 6 implementation
      extensions/             # SIGIL-specific CodeMirror extensions
    wails/
      fileSystem.ts          # Native file open/save operations
      preferences.ts         # App settings persistence
    state/
      editor.ts              # Editor state using Svelte runes
      files.ts               # Open files and tab management
      settings.ts            # User preferences and themes
    examples/
      examples.ts            # Built-in tutorial examples
    themes/
      gogh-themes.ts         # Terminal-inspired theme definitions
    types/
      wails.d.ts             # Wails API type definitions
  routes/
    +layout.svelte          # App shell with native menu integration
    +page.svelte            # Landing page or main editor
    tutorial/
      +layout.svelte        # Tutorial layout with split-pane
      +page.svelte          # Tutorial index
      [slug]/
        +page.svelte        # Individual tutorial lessons
  app.html                  # Base HTML template
```

### Wails Integration Points
- **File Operations**: Native open/save dialogs via Wails APIs (replaces web file APIs)
- **Menu Integration**: Native menu bar with standard File/Edit/View menus  
- **Preferences**: Native app settings storage (replaces localStorage)
- **Window Management**: Native window controls, remember size/position

---

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

// SIGIL processing state  
export const isProcessing = $state<boolean>(false);
export const lastResult = $state<string | null>(null);
export const lastError = $state<string | null>(null);

// UI state
export const showLineNumbers = $state<boolean>(true);
export const currentTheme = $state<string>('dracula');
export const tabPosition = $state<'top' | 'bottom'>('top');
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

### Menu Integration
Native menu bar integration for desktop app experience:
- **File Menu**: New, Open, Save, Save As, Recent Files, Quit
- **Edit Menu**: Undo, Redo, Cut, Copy, Paste, Find, Replace  
- **View Menu**: Toggle Panels, Zoom, Theme Selection
- **Help Menu**: Tutorial, Documentation, About

### Application Settings
Replace localStorage with native preferences:
```typescript
// lib/wails/preferences.ts
import { GetConfig, SetConfig } from '@wailsio/runtime';

interface AppSettings {
  theme: 'light' | 'dark' | 'system';
  editorFontSize: number;
  autoSave: boolean;
  recentFiles: string[];
}

export async function loadSettings(): Promise<AppSettings> {
  return await GetConfig('app.settings') || {
    theme: 'system',
    editorFontSize: 14, 
    autoSave: true,
    recentFiles: []
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
- **CSS Custom Properties**: Define theme tokens as CSS variables for easy customization.
- **System Theme Detection**: Respect OS light/dark mode preferences with automatic switching.
- **User Override**: Allow manual theme selection in settings, with themes based on well-known terminal themes from [Gogh](https://gogh-co.github.io/Gogh/) (e.g., Dracula, Solarized, Monokai) adapted for a desktop app UI.
- **Monochrome + Syntax Highlighting**: Simple themes focusing on readability, with distinct colors for YAML/SIGIL syntax elements while maintaining an uncluttered appearance.

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
3. **Implement landing page** with "New Empty File" and "Learn SIGIL" buttons
4. **Create tab-based editor component** with CodeMirror integration
5. **Add native file operations** using Wails APIs (open/save/recent files)
6. **Integrate SIGIL runtime** for main-thread processing with runes
7. **Implement basic tutorial system** with embedded lessons
8. **Add terminal-inspired theming** based on Gogh themes
9. **Create SIGIL validation** (on-demand) and YAML syntax checking (real-time)
```

# Code Editor Component

```
```
```

Playground Component

```
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

```
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