<script lang="ts">
  import { Window } from "@wailsio/runtime";

  // Minimum window size (matches main.go configuration)
  const MIN_WIDTH = 800;
  const MIN_HEIGHT = 600;

  // Resize handle thickness (pixels)
  const EDGE_SIZE = 4;
  const CORNER_SIZE = 16;

  // Create resize handler for a specific direction
  function createResizeHandler(direction: string) {
    return async (e: MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();

      const win = Window;

      // Get initial state
      const startX = e.clientX;
      const startY = e.clientY;
      const initialSize = await win.Size();
      const initialPos = await win.Position();

      let rafId: number | null = null;
      let isUpdating = false;

      console.log(`Starting resize: ${direction}`, {
        startX,
        startY,
        initialSize,
        initialPos,
      });

      function onMouseMove(moveEvent: MouseEvent) {
        // Cancel pending animation frame
        if (rafId !== null) {
          cancelAnimationFrame(rafId);
        }

        // Schedule update on next frame
        rafId = requestAnimationFrame(() => {
          // Skip if still processing previous update
          if (isUpdating) return;
          isUpdating = true;

          const dx = moveEvent.clientX - startX;
          const dy = moveEvent.clientY - startY;

          let newWidth = initialSize.width;
          let newHeight = initialSize.height;
          let newX = initialPos.x;
          let newY = initialPos.y;

          // Calculate new dimensions based on direction
          if (direction.includes("e")) {
            newWidth = initialSize.width + dx;
          }
          if (direction.includes("w")) {
            newWidth = initialSize.width - dx;
            newX = initialPos.x + dx;
          }
          if (direction.includes("s")) {
            newHeight = initialSize.height + dy;
          }
          if (direction.includes("n")) {
            newHeight = initialSize.height - dy;
            newY = initialPos.y + dy;
          }

          // Enforce minimum size
          if (newWidth < MIN_WIDTH) {
            newWidth = MIN_WIDTH;
            if (direction.includes("w")) {
              newX = initialPos.x + (initialSize.width - MIN_WIDTH);
            }
          }
          if (newHeight < MIN_HEIGHT) {
            newHeight = MIN_HEIGHT;
            if (direction.includes("n")) {
              newY = initialPos.y + (initialSize.height - MIN_HEIGHT);
            }
          }

          // Fire both calls together without awaiting to let Wails batch them
          if (direction.includes("w") || direction.includes("n")) {
            win.SetPosition(newX, newY);
          }
          win.SetSize(newWidth, newHeight).finally(() => {
            isUpdating = false;
          });
        });
      }

      function onMouseUp() {
        document.removeEventListener("mousemove", onMouseMove);
        document.removeEventListener("mouseup", onMouseUp);
        console.log("Resize ended");
      }

      document.addEventListener("mousemove", onMouseMove);
      document.addEventListener("mouseup", onMouseUp);
    };
  }
</script>

<!-- Edge resize handles -->
<div
  class="resize-handle resize-n"
  role="presentation"
  onmousedown={createResizeHandler("n")}
></div>
<div
  class="resize-handle resize-s"
  role="presentation"
  onmousedown={createResizeHandler("s")}
></div>
<div
  class="resize-handle resize-e"
  role="presentation"
  onmousedown={createResizeHandler("e")}
></div>
<div
  class="resize-handle resize-w"
  role="presentation"
  onmousedown={createResizeHandler("w")}
></div>

<!-- Corner resize handles -->
<div
  class="resize-handle resize-ne"
  role="presentation"
  onmousedown={createResizeHandler("ne")}
></div>
<div
  class="resize-handle resize-nw"
  role="presentation"
  onmousedown={createResizeHandler("nw")}
></div>
<div
  class="resize-handle resize-se"
  role="presentation"
  onmousedown={createResizeHandler("se")}
></div>
<div
  class="resize-handle resize-sw"
  role="presentation"
  onmousedown={createResizeHandler("sw")}
></div>

<style>
  .resize-handle {
    position: fixed;
    z-index: 10000;
    --wails-draggable: no-drag;
  }

  /* Edge handles - thin bars along edges */
  .resize-n,
  .resize-s {
    left: 0;
    right: 0;
    height: 4px;
  }

  .resize-n {
    top: 0;
    cursor: ns-resize;
  }

  .resize-s {
    bottom: 0;
    cursor: ns-resize;
  }

  .resize-e,
  .resize-w {
    top: 0;
    bottom: 0;
    width: 4px;
  }

  .resize-e {
    right: 0;
    cursor: ew-resize;
  }

  .resize-w {
    left: 0;
    cursor: ew-resize;
  }

  /* Corner handles - larger hit areas in corners */
  .resize-ne,
  .resize-nw,
  .resize-se,
  .resize-sw {
    width: 16px;
    height: 16px;
  }

  .resize-ne {
    top: 0;
    right: 0;
    cursor: nesw-resize;
  }

  .resize-nw {
    top: 0;
    left: 0;
    cursor: nwse-resize;
  }

  .resize-se {
    bottom: 0;
    right: 0;
    cursor: nwse-resize;
  }

  .resize-sw {
    bottom: 0;
    left: 0;
    cursor: nesw-resize;
  }

  /* Debug mode - uncomment to see resize handles */
  /* .resize-handle {
    background: rgba(255, 0, 0, 0.3);
  } */
</style>
