<script lang="ts">
  import type { FileTab } from "../state/editor.svelte.ts";

  let {
    tabs = [],
    activeTabId = null,
    onTabSelect,
    onTabClose,
    onNewTab,
    position = "top",
  }: {
    tabs?: FileTab[];
    activeTabId?: string | null;
    onTabSelect?: (tabId: string) => void;
    onTabClose?: (tabId: string) => void;
    onNewTab?: () => void;
    position?: "top" | "bottom";
  } = $props();

  function handleTabClick(tabId: string) {
    onTabSelect?.(tabId);
  }

  function handleTabClose(event: Event, tabId: string) {
    event.stopPropagation();
    onTabClose?.(tabId);
  }

  function handleNewTab() {
    onNewTab?.();
  }

  function getTabDisplayName(tab: FileTab): string {
    if (tab.isNew && !tab.name) {
      return "Untitled";
    }
    return tab.name || "Untitled";
  }

  // Debug logging - simple approach
  console.log("TabBar render - tabs count:", tabs?.length || 0);
  console.log("TabBar render - activeTabId:", activeTabId);
</script>

<div class="flex h-10 bg-gray-800 border-b border-gray-700">
  <!-- Scrollable tabs container -->
  <div class="flex-1 overflow-x-auto">
    <div class="flex h-full">
      {#each tabs as tab (tab.id)}
        <div
          class="flex items-center px-4 py-2 text-sm border-r border-gray-700 hover:bg-gray-700 transition-colors min-w-0 max-w-48 cursor-pointer"
          class:bg-gray-600={tab.id === activeTabId}
          class:text-white={tab.id === activeTabId}
          class:text-gray-300={tab.id !== activeTabId}
          onclick={() => handleTabClick(tab.id)}
          title={tab.filePath || getTabDisplayName(tab)}
          role="button"
          tabindex="0"
          onkeydown={(e) => e.key === "Enter" && handleTabClick(tab.id)}
        >
          <!-- Tab name with dirty indicator -->
          <span class="truncate">
            {getTabDisplayName(tab)}
            {#if tab.isDirty}
              <span class="ml-1 text-orange-400">•</span>
            {/if}
          </span>

          <!-- Close button -->
          <button
            class="ml-2 p-1 rounded hover:bg-gray-600 flex-shrink-0"
            onclick={(e) => handleTabClose(e, tab.id)}
            title="Close tab"
          >
            <svg
              class="w-3 h-3"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
      {/each}
    </div>
  </div>

  <!-- New tab button -->
  <div class="flex-shrink-0 border-l border-gray-700">
    <button
      class="h-full px-3 text-gray-300 hover:text-white hover:bg-gray-700 transition-colors"
      onclick={handleNewTab}
      title="New tab (Ctrl+T)"
    >
      <svg
        class="w-4 h-4"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M12 4v16m8-8H4"
        />
      </svg>
    </button>
  </div>
</div>

<style>
  /* Custom scrollbar for tabs */
  .overflow-x-auto::-webkit-scrollbar {
    height: 4px;
  }

  .overflow-x-auto::-webkit-scrollbar-track {
    background: #374151;
  }

  .overflow-x-auto::-webkit-scrollbar-thumb {
    background: #6b7280;
    border-radius: 2px;
  }

  .overflow-x-auto::-webkit-scrollbar-thumb:hover {
    background: #9ca3af;
  }
</style>
