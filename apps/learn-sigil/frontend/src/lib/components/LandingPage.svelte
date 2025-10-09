<script lang="ts">
  // Svelte 5 callback props instead of createEventDispatcher
  interface Props {
    onnewfile?: () => void;
    onlearnsigil?: () => void;
    onopenfile?: () => void;
  }

  let { onnewfile, onlearnsigil, onopenfile }: Props = $props();

  const hotkeys = [
    { key: "Ctrl+N", description: "Create new file" },
    { key: "Ctrl+O", description: "Open existing file" },
    { key: "Ctrl+S", description: "Save current file" },
    { key: "Ctrl+Shift+S", description: "Save file as..." },
    { key: "Ctrl+W", description: "Close current tab" },
    { key: "Ctrl+Tab", description: "Switch between tabs" },
    { key: "F1", description: "Show help" },
  ];
</script>

<div
  class="flex flex-col items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900 p-8"
>
  <!-- SIGIL Logo/Title -->
  <div class="text-center mb-12">
    <h1 class="text-6xl font-bold text-gray-900 dark:text-white mb-4">SIGIL</h1>
    <p class="text-xl text-gray-600 dark:text-gray-300 max-w-2xl">
      A desktop YAML editor and playground for SIGIL (Sigil Is Generative
      Interpretive Language)
    </p>
  </div>

  <!-- Main Action Buttons -->
  <div class="flex flex-col sm:flex-row gap-4 mb-16">
    <button
      onclick={() => onnewfile?.()}
      class="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-lg transition-colors duration-200 flex items-center gap-3"
    >
      <svg
        class="w-5 h-5"
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
      New Empty File
    </button>

    <button
      onclick={() => onlearnsigil?.()}
      class="px-8 py-4 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg shadow-lg transition-colors duration-200 flex items-center gap-3"
    >
      <svg
        class="w-5 h-5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
        />
      </svg>
      Learn SIGIL
    </button>
  </div>

  <!-- Hotkey Reference -->
  <div
    class="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 max-w-md w-full"
  >
    <h2
      class="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2"
    >
      <svg
        class="w-5 h-5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM21 5a2 2 0 00-2-2h-4a2 2 0 00-2 2v12a4 4 0 004 4h4a2 2 0 002-2V5z"
        />
      </svg>
      Keyboard Shortcuts
    </h2>

    <div class="space-y-2">
      {#each hotkeys as { key, description }}
        <div class="flex justify-between items-center py-1">
          <span class="text-sm text-gray-600 dark:text-gray-300"
            >{description}</span
          >
          <kbd
            class="px-2 py-1 text-xs font-mono bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded border"
          >
            {key}
          </kbd>
        </div>
      {/each}
    </div>
  </div>

  <!-- Additional Actions -->
  <div class="mt-8 flex gap-4">
    <button
      onclick={() => onopenfile?.()}
      class="px-4 py-2 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium transition-colors duration-200 flex items-center gap-2"
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
          d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-5l-2-2H5a2 2 0 00-2 2z"
        />
      </svg>
      Open Existing File
    </button>
  </div>

  <!-- Version Info -->
  <div class="mt-8 text-center text-sm text-gray-500 dark:text-gray-400">
    <p>SIGIL Editor v0.1.0</p>
    <p class="mt-1">Built with SvelteKit + Wails</p>
  </div>
</div>
