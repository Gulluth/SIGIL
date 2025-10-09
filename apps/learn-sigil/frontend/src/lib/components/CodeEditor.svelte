<script lang="ts">
  import { onMount, onDestroy } from "svelte";
  import { EditorView } from "@codemirror/view";
  import { basicSetup } from "codemirror";
  import { EditorState } from "@codemirror/state";
  import { yaml } from "@codemirror/lang-yaml";
  import { oneDark } from "@codemirror/theme-one-dark";

  let {
    value = "",
    placeholder = "Enter YAML here...",
    onchange,
  }: {
    value?: string;
    placeholder?: string;
    onchange?: (value: string) => void;
  } = $props();

  let editorElement: HTMLElement;
  let view: EditorView;

  onMount(() => {
    const state = EditorState.create({
      doc: value,
      extensions: [
        basicSetup,
        yaml(),
        oneDark,
        EditorView.updateListener.of((update) => {
          if (update.docChanged) {
            const newValue = update.state.doc.toString();
            onchange?.(newValue);
          }
        }),
        EditorView.theme({
          "&": { height: "100%" },
          ".cm-scroller": { fontFamily: "inherit" },
          ".cm-editor": { height: "100%" },
        }),
      ],
    });

    view = new EditorView({
      state,
      parent: editorElement,
    });
  });

  onDestroy(() => {
    view?.destroy();
  });

  // Update editor content when value prop changes
  $effect(() => {
    if (view && value !== view.state.doc.toString()) {
      view.dispatch({
        changes: {
          from: 0,
          to: view.state.doc.length,
          insert: value,
        },
      });
    }
  });
</script>

<div
  class="h-full w-full overflow-hidden rounded-lg border border-gray-700 bg-gray-900"
>
  <div bind:this={editorElement} class="h-full w-full"></div>
</div>
