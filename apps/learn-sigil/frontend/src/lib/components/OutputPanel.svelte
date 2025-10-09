<script lang="ts">
  let {
    content = "",
    error = null,
    isLoading = false,
    templateId = "",
    ongenerate,
    ontemplatechange,
  }: {
    content?: string;
    error?: string | null;
    isLoading?: boolean;
    templateId?: string;
    ongenerate?: () => void;
    ontemplatechange?: (event: Event) => void;
  } = $props();
</script>

<div class="flex h-full flex-col bg-gray-900">
  <!-- Header with Generate button -->
  <div class="flex-shrink-0 border-b border-gray-700 bg-gray-800 px-4 py-3">
    <div class="flex items-center justify-between">
      <div class="flex items-center space-x-2">
        <input
          type="text"
          placeholder="template_id"
          value={templateId}
          oninput={ontemplatechange}
          class="rounded border border-gray-600 bg-gray-700 px-3 py-1 text-sm text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none"
        />
        <button
          onclick={ongenerate}
          disabled={isLoading}
          class="rounded bg-blue-600 px-4 py-1 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {isLoading ? "Generating..." : "Generate"}
        </button>
      </div>
      <div class="text-xs text-gray-400">SIGIL Output</div>
    </div>
  </div>

  <!-- Content Area -->
  <div class="flex-1 overflow-auto p-4">
    {#if error}
      <div class="rounded-lg border border-red-600 bg-red-900/20 p-4">
        <div class="text-sm font-medium text-red-400">Error</div>
        <div class="mt-1 text-sm text-red-300">{error}</div>
      </div>
    {:else if content}
      <pre
        class="whitespace-pre-wrap font-mono text-sm text-gray-200">{content}</pre>
    {:else}
      <div class="flex h-full items-center justify-center text-gray-500">
        <div class="text-center">
          <div class="text-lg">No output yet</div>
          <div class="mt-1 text-sm">Enter YAML and click Generate</div>
        </div>
      </div>
    {/if}
  </div>
</div>
