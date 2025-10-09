<script lang="ts">
  let {
    leftContent,
    rightContent,
    leftLabel = "Editor",
    rightLabel = "Output",
  }: {
    leftContent?: any;
    rightContent?: any;
    leftLabel?: string;
    rightLabel?: string;
  } = $props();

  let splitterPosition = $state(50); // Percentage
  let isDragging = $state(false);
  let container: HTMLElement;

  function handleMouseDown(event: MouseEvent) {
    isDragging = true;
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
    event.preventDefault();
  }

  function handleMouseMove(event: MouseEvent) {
    if (!isDragging || !container) return;

    const rect = container.getBoundingClientRect();
    const newPosition = ((event.clientX - rect.left) / rect.width) * 100;
    splitterPosition = Math.max(20, Math.min(80, newPosition));
  }

  function handleMouseUp() {
    isDragging = false;
    document.removeEventListener("mousemove", handleMouseMove);
    document.removeEventListener("mouseup", handleMouseUp);
  }
</script>

<div
  bind:this={container}
  class="flex h-full w-full overflow-hidden bg-gray-800"
>
  <!-- Left Panel -->
  <div class="flex flex-col overflow-hidden" style="width: {splitterPosition}%">
    <div
      class="flex-shrink-0 bg-gray-700 px-3 py-2 text-sm font-medium text-gray-200"
    >
      {leftLabel}
    </div>
    <div class="flex-1 overflow-hidden">
      {@render leftContent?.()}
    </div>
  </div>

  <!-- Splitter -->
  <button
    class="w-1 cursor-col-resize bg-gray-600 hover:bg-blue-500 transition-colors"
    class:bg-blue-500={isDragging}
    onmousedown={handleMouseDown}
    aria-label="Resize panels"
  ></button>

  <!-- Right Panel -->
  <div
    class="flex flex-col overflow-hidden"
    style="width: {100 - splitterPosition}%"
  >
    <div
      class="flex-shrink-0 bg-gray-700 px-3 py-2 text-sm font-medium text-gray-200"
    >
      {rightLabel}
    </div>
    <div class="flex-1 overflow-hidden">
      {@render rightContent?.()}
    </div>
  </div>
</div>
