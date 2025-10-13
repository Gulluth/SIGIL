<script lang="ts">
  import { Application, Window } from "@wailsio/runtime";
  import {
    createNewFile,
    openFile as openFileInStore,
    getActiveFile,
    markFileSaved,
    updateFileContent,
  } from "../state/editor.svelte";
  import {
    openFileDialog,
    saveFile as saveFileToSystem,
    saveFileDialog,
    confirmUnsavedChanges,
    showErrorDialog,
  } from "../wails/fileSystem";

  let showMenu = $state(false);

  // Computed filename from active file
  let displayFileName = $derived(() => {
    const activeFile = getActiveFile();
    if (!activeFile) return "SIGIL Editor";

    const name = activeFile.name || "Untitled";
    return activeFile.isDirty ? `${name} *` : name;
  });

  // Initialize window lazily to avoid issues during SSR
  let currentWindow: Window | null = null;

  function getWindow() {
    if (!currentWindow) {
      currentWindow = new Window();
    }
    return currentWindow;
  }

  function toggleMenu() {
    showMenu = !showMenu;
  }

  function closeMenu() {
    showMenu = false;
  }

  async function minimizeWindow() {
    try {
      await getWindow().Minimise();
    } catch (error) {
      console.error("Failed to minimize window:", error);
    }
  }

  async function maximizeWindow() {
    try {
      await getWindow().ToggleMaximise();
    } catch (error) {
      console.error("Failed to maximize window:", error);
    }
  }

  async function closeWindow() {
    try {
      await Application.Quit();
    } catch (error) {
      console.error("Failed to close window:", error);
    }
  }

  // Menu actions
  function newFile() {
    closeMenu();
    createNewFile();
  }

  async function openFile() {
    closeMenu();
    try {
      const result = await openFileDialog();
      if (result) {
        openFileInStore(result.name, result.content, result.path);
      }
    } catch (error) {
      console.error("Error opening file:", error);
      await showErrorDialog("Open File Error", `Failed to open file: ${error}`);
    }
  }

  async function saveFile() {
    closeMenu();
    const activeFile = getActiveFile();
    if (!activeFile) return;

    try {
      // If file has no path, do Save As
      if (!activeFile.filePath) {
        await saveAsFile();
        return;
      }

      // Save to existing path
      const result = await saveFileToSystem(
        activeFile.filePath,
        activeFile.content,
      );
      if (result.success) {
        // Mark file as saved (not dirty)
        markFileSaved(activeFile.id, activeFile.filePath);
      } else {
        await showErrorDialog("Save Error", "Failed to save file");
      }
    } catch (error) {
      console.error("Error saving file:", error);
      await showErrorDialog("Save Error", `Failed to save file: ${error}`);
    }
  }

  async function saveAsFile() {
    closeMenu();
    const activeFile = getActiveFile();
    if (!activeFile) return;

    try {
      const path = await saveFileDialog(activeFile.name);
      if (!path) return; // User cancelled

      const result = await saveFileToSystem(path, activeFile.content);
      if (result.success) {
        // Update file path and mark as saved
        markFileSaved(activeFile.id, path);
      } else {
        await showErrorDialog("Save Error", "Failed to save file");
      }
    } catch (error) {
      console.error("Error saving file:", error);
      await showErrorDialog("Save Error", `Failed to save file: ${error}`);
    }
  }

  function showPreferences() {
    closeMenu();
    console.log("Preferences");
    // TODO: Implement preferences dialog
  }

  function showAbout() {
    closeMenu();
    console.log("About");
    // TODO: Implement about dialog
  }
</script>

<!-- Compact header bar with GNOME Libadwaita style -->
<header class="header-bar">
  <div class="header-content">
    <!-- Left side: Hamburger menu + file name -->
    <div class="header-left">
      <button class="hamburger-btn" onclick={toggleMenu} aria-label="Menu">
        <svg
          width="20"
          height="20"
          viewBox="0 0 20 20"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M2 4h16M2 10h16M2 16h16"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
          />
        </svg>
      </button>

      <span class="file-name">{displayFileName()}</span>
    </div>

    <!-- Center: Draggable spacer -->
    <div class="header-center"></div>

    <!-- Right side: Window controls -->
    <div class="header-right">
      <button class="window-btn" onclick={minimizeWindow} aria-label="Minimize">
        <svg
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M3 8h10"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
          />
        </svg>
      </button>

      <button class="window-btn" onclick={maximizeWindow} aria-label="Maximize">
        <svg
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <rect
            x="3"
            y="3"
            width="10"
            height="10"
            stroke="currentColor"
            stroke-width="2"
            fill="none"
          />
        </svg>
      </button>

      <button
        class="window-btn close-btn"
        onclick={closeWindow}
        aria-label="Close"
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M4 4l8 8M12 4l-8 8"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
          />
        </svg>
      </button>
    </div>
  </div>

  <!-- Dropdown menu -->
  {#if showMenu}
    <!-- Click outside to close -->
    <!-- svelte-ignore a11y_click_events_have_key_events -->
    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <div class="menu-backdrop" onclick={closeMenu}></div>

    <nav class="dropdown-menu" data-wails-no-drag>
      <div class="menu-section">
        <button class="menu-item" onclick={newFile}>
          <span>New File</span>
          <span class="shortcut">Ctrl+N</span>
        </button>
        <button class="menu-item" onclick={openFile}>
          <span>Open File...</span>
          <span class="shortcut">Ctrl+O</span>
        </button>
      </div>

      <div class="menu-divider"></div>

      <div class="menu-section">
        <button class="menu-item" onclick={saveFile}>
          <span>Save</span>
          <span class="shortcut">Ctrl+S</span>
        </button>
        <button class="menu-item" onclick={saveAsFile}>
          <span>Save As...</span>
          <span class="shortcut">Ctrl+Shift+S</span>
        </button>
      </div>

      <div class="menu-divider"></div>

      <div class="menu-section">
        <button class="menu-item" onclick={showPreferences}>
          <span>Preferences</span>
          <span class="shortcut">Ctrl+,</span>
        </button>
      </div>

      <div class="menu-divider"></div>

      <div class="menu-section">
        <button class="menu-item" onclick={showAbout}>
          <span>About</span>
        </button>
        <button class="menu-item" onclick={closeWindow}>
          <span>Quit</span>
          <span class="shortcut">Ctrl+Q</span>
        </button>
      </div>
    </nav>
  {/if}
</header>

<style>
  .header-bar {
    position: relative;
    height: 48px;
    background: #1e293b;
    border-bottom: 1px solid #334155;
    display: flex;
    align-items: center;
    user-select: none;
    z-index: 1000;
    --wails-draggable: drag;
  }

  .header-content {
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 12px;
  }

  .header-left {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .header-center {
    flex: 1;
    height: 100%;
    cursor: move;
  }

  .header-right {
    display: flex;
    align-items: center;
    gap: 4px;
  }

  .hamburger-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 36px;
    padding: 0;
    background: transparent;
    border: none;
    border-radius: 6px;
    color: #e2e8f0;
    cursor: pointer;
    transition: background-color 0.15s;
    --wails-draggable: no-drag;
  }

  .hamburger-btn:hover {
    background: #334155;
  }

  .hamburger-btn:active {
    background: #475569;
  }

  .file-name {
    font-size: 14px;
    font-weight: 500;
    color: #e2e8f0;
    cursor: move;
    user-select: none;
  }

  .window-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    padding: 0;
    background: transparent;
    border: none;
    border-radius: 6px;
    color: #e2e8f0;
    cursor: pointer;
    transition: background-color 0.15s;
    --wails-draggable: no-drag;
  }

  .window-btn:hover {
    background: #334155;
  }

  .window-btn:active {
    background: #475569;
  }

  .close-btn:hover {
    background: #dc2626;
    color: white;
  }

  .close-btn:active {
    background: #b91c1c;
  }

  /* Dropdown menu */
  .menu-backdrop {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 999;
  }

  .dropdown-menu {
    position: absolute;
    top: 52px;
    left: 12px;
    min-width: 220px;
    background: #1e293b;
    border: 1px solid #334155;
    border-radius: 8px;
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.5);
    z-index: 1000;
    padding: 4px;
  }

  .menu-section {
    padding: 4px 0;
  }

  .menu-item {
    width: 100%;
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 24px;
    padding: 8px 12px;
    background: transparent;
    border: none;
    border-radius: 4px;
    color: #e2e8f0;
    font-size: 14px;
    text-align: left;
    cursor: pointer;
    transition: background-color 0.15s;
  }

  .menu-item:hover {
    background: #334155;
  }

  .menu-item:active {
    background: #475569;
  }

  .shortcut {
    font-size: 12px;
    color: #94a3b8;
  }

  .menu-divider {
    height: 1px;
    background: #334155;
    margin: 4px 0;
  }
</style>
