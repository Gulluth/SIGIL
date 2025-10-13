<script lang="ts">
  import CodeEditor from "./CodeEditor.svelte";
  import OutputPanel from "./OutputPanel.svelte";
  import SplitPane from "./SplitPane.svelte";
  import TabBar from "./TabBar.svelte";
  import LandingPage from "./LandingPage.svelte";
  import { SigilProcessor } from "../sigil/processor";
  import {
    editorStore,
    getAllOpenFiles,
    getActiveFile,
    createNewFile,
    closeFile,
    switchToTab,
    switchToNextTab,
    switchToPrevTab,
    updateFileContent,
    getAllFileContents,
  } from "../state/editor.svelte.js";
  import { openFileDialog } from "../wails/fileSystem";
  import { openFile as openFileInStore } from "../state/editor.svelte";

  let templateId = $state("dot.notation");
  let output = $state("");
  let error = $state<string | null>(null);
  let isLoading = $state(false);

  const processor = new SigilProcessor();

  // Get active file content reactively
  const activeFile = $derived(getActiveFile());
  const yamlContent = $derived(activeFile?.content || "");
  // Use a reactive getter that watches the Map size and active tab
  const allTabs = $derived.by(() => {
    // Access the Map size to trigger reactivity when tabs are added/removed
    const mapSize = editorStore.openFiles.size;
    const activeId = editorStore.activeTabId;
    console.log(
      "DERIVED: allTabs recalculating, map size:",
      mapSize,
      "activeId:",
      activeId,
    );
    return getAllOpenFiles();
  });

  // Debug logging
  $effect(() => {
    console.log("=== TAB DEBUG ===");
    console.log("Open files count:", allTabs.length);
    console.log("Active tab ID:", editorStore.activeTabId);
    console.log(
      "All tabs:",
      allTabs.map((t) => ({
        id: t.id,
        name: t.name,
        content_length: t.content?.length || 0,
        isDirty: t.isDirty,
        isNew: t.isNew,
      })),
    );
    console.log("EditorStore openFiles size:", editorStore.openFiles.size);
    console.log("Raw openFiles:", Array.from(editorStore.openFiles.entries()));
    console.log("=================");
  });

  async function handleGenerate() {
    // Check if we have any content in any tab
    const allFileContents = getAllFileContents();
    const hasContent = Object.values(allFileContents).some((content) =>
      content.trim(),
    );

    if (!hasContent) return;

    isLoading = true;
    error = null;

    try {
      console.log("DEBUG: About to process YAML with templateId:", templateId);
      console.log("DEBUG: Processing files:", Object.keys(allFileContents));
      console.log("DEBUG: Total files:", Object.keys(allFileContents).length);

      // Show content of each file for debugging
      for (const [filename, content] of Object.entries(allFileContents)) {
        console.log(
          `DEBUG: File "${filename}" content (${content.length} chars):`,
          content.substring(0, 100) + "...",
        );
      }

      // Use the new multi-file processor
      const result = await processor.processMultipleYaml(
        allFileContents,
        templateId,
        true,
      );

      if (result.success) {
        output = result.output || "";
        error = null;
      } else {
        error = result.error || "Generation failed";
        output = "";
      }
    } catch (err) {
      error = err instanceof Error ? err.message : "Unknown error";
      output = "";
    } finally {
      isLoading = false;
    }
  }

  function handleYamlChange(newValue: string) {
    if (activeFile) {
      updateFileContent(activeFile.id, newValue);
    }
  }

  function handleTabSelect(tabId: string) {
    switchToTab(tabId);
  }

  function handleTabClose(tabId: string) {
    closeFile(tabId);
  }

  function handleNewTab() {
    createNewFile();
  }

  // Keyboard shortcuts handler
  function handleKeydown(event: KeyboardEvent) {
    if (event.ctrlKey || event.metaKey) {
      switch (event.key) {
        case "t":
          event.preventDefault();
          handleNewTab();
          break;
        case "w":
          event.preventDefault();
          if (activeFile) {
            handleTabClose(activeFile.id);
          }
          break;
        case "Tab":
          event.preventDefault();
          if (event.shiftKey) {
            // Shift+Ctrl+Tab for previous tab
            switchToPrevTab();
          } else {
            // Ctrl+Tab for next tab
            switchToNextTab();
          }
          break;
      }
    }
  }

  function handleTemplateIdChange(event: Event) {
    const target = event.target as HTMLInputElement;
    templateId = target.value;
  }

  // Landing page actions
  function handleNewFile() {
    createNewFile();
  }

  async function handleOpenFile() {
    try {
      const result = await openFileDialog();
      if (result) {
        openFileInStore(result.name, result.content, result.path);
      }
    } catch (error) {
      console.error("Error opening file:", error);
    }
  }

  function handleLearnSigil() {
    // TODO: Open tutorial or documentation
    console.log("Learn SIGIL clicked");
  }

  // Check if we should show landing page - directly watch Map size
  const showLandingPage = $derived.by(() => {
    // Access the Map directly to ensure reactivity
    const size = editorStore.openFiles.size;
    console.log(
      "DERIVED: Checking landing page visibility, files count:",
      size,
    );
    return size === 0;
  });

  // Debug effect to track landing page visibility
  $effect(() => {
    console.log(
      "EFFECT: showLandingPage =",
      showLandingPage,
      "| files =",
      editorStore.openFiles.size,
    );
  });
</script>

{#if showLandingPage}
  <LandingPage
    onnewfile={handleNewFile}
    onopenfile={handleOpenFile}
    onlearnsigil={handleLearnSigil}
  />
{:else}
  <div
    class="h-full w-full bg-gray-800 flex flex-col"
    onkeydown={handleKeydown}
    tabindex="-1"
    role="application"
  >
    <!-- Tab Bar -->
    <TabBar
      tabs={allTabs}
      activeTabId={editorStore.activeTabId}
      onTabSelect={handleTabSelect}
      onTabClose={handleTabClose}
      onNewTab={handleNewTab}
    />

    <!-- Editor Content -->
    <div class="flex-1 overflow-hidden">
      <SplitPane leftLabel="YAML Editor" rightLabel="SIGIL Output">
        {#snippet leftContent()}
          {#if activeFile}
            <CodeEditor
              value={yamlContent}
              onchange={handleYamlChange}
              placeholder="Enter your SIGIL YAML here..."
            />
          {:else}
            <div class="flex items-center justify-center h-full text-gray-500">
              <div class="text-center">
                <div class="text-lg">No file open</div>
                <div class="mt-1 text-sm">Create a new tab to get started</div>
              </div>
            </div>
          {/if}
        {/snippet}

        {#snippet rightContent()}
          <OutputPanel
            content={output}
            {error}
            {isLoading}
            {templateId}
            ongenerate={handleGenerate}
            ontemplatechange={handleTemplateIdChange}
          />
        {/snippet}
      </SplitPane>
    </div>
  </div>
{/if}
