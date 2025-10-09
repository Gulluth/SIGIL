<script lang="ts">
  import { onMount, onDestroy } from "svelte";
  import { EditorView, keymap } from "@codemirror/view";
  import { EditorState, Compartment } from "@codemirror/state";
  import { yaml } from "@codemirror/lang-yaml";
  import { oneDark } from "@codemirror/theme-one-dark";
  import { defaultKeymap, historyKeymap } from "@codemirror/commands";
  import { searchKeymap, highlightSelectionMatches } from "@codemirror/search";
  import { closeBrackets, autocompletion } from "@codemirror/autocomplete";
  import {
    foldGutter,
    syntaxHighlighting,
    defaultHighlightStyle,
  } from "@codemirror/language";
  import {
    lineNumbers,
    highlightActiveLine,
    highlightActiveLineGutter,
    dropCursor,
  } from "@codemirror/view";
  import { lintGutter } from "@codemirror/lint";

  // Props interface for Svelte 5
  interface CodeEditorProps {
    value?: string;
    theme?: "light" | "dark";
    readOnly?: boolean;
    showLineNumbers?: boolean;
    debounce?: number;
    placeholder?: string;
    onchange?: (value: string) => void;
    onfocus?: () => void;
    onblur?: () => void;
  }

  let {
    value = "",
    theme = "dark",
    readOnly = false,
    showLineNumbers = true,
    debounce = 250,
    placeholder = "Enter your SIGIL YAML here...",
    onchange,
    onfocus,
    onblur,
  }: CodeEditorProps = $props();

  let editorElement: HTMLDivElement;
  let view: EditorView;
  let debounceTimer: ReturnType<typeof setTimeout>;

  function handleChange(update: any) {
    if (update.docChanged) {
      const newValue = update.state.doc.toString();

      // Debounce the change event
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        onchange?.(newValue);
      }, debounce);
    }
  }

  function createExtensions() {
    const extensions = [
      // Language support
      yaml(),

      // Basic editing features
      closeBrackets(),
      autocompletion(),
      highlightSelectionMatches(),

      // Visual enhancements
      syntaxHighlighting(defaultHighlightStyle, { fallback: true }),
      highlightActiveLine(),
      dropCursor(),

      // Keymaps
      keymap.of([...defaultKeymap, ...historyKeymap, ...searchKeymap]),

      // Change handler
      EditorView.updateListener.of(handleChange),

      // Readonly state
      EditorView.editable.of(!readOnly),

      // Theme
      theme === "dark" ? oneDark : [],
    ];

    // Conditionally add line numbers and gutter
    if (showLineNumbers) {
      extensions.push(
        lineNumbers(),
        highlightActiveLineGutter(),
        foldGutter(),
        lintGutter(),
      );
    }

    return extensions;
  }

  onMount(() => {
    view = new EditorView({
      state: EditorState.create({
        doc: value,
        extensions: createExtensions(),
      }),
      parent: editorElement,
    });

    // Focus and blur handlers
    const focusHandler = () => onfocus?.();
    const blurHandler = () => onblur?.();

    editorElement.addEventListener("focusin", focusHandler);
    editorElement.addEventListener("focusout", blurHandler);

    return () => {
      editorElement?.removeEventListener("focusin", focusHandler);
      editorElement?.removeEventListener("focusout", blurHandler);
    };
  });

  onDestroy(() => {
    clearTimeout(debounceTimer);
    view?.destroy();
  });

  // Reactive updates using Svelte 5 effects
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

  // Reactive theme and options updates
  $effect(() => {
    if (view) {
      // For now, we'll recreate the view when options change
      // In a production app, you'd want to use compartments for better performance
      const currentDoc = view.state.doc.toString();
      view.destroy();

      view = new EditorView({
        state: EditorState.create({
          doc: currentDoc,
          extensions: createExtensions(),
        }),
        parent: editorElement,
      });
    }
  });

  // Public methods
  export function focus() {
    view?.focus();
  }

  export function getSelection() {
    if (!view) return "";
    const { from, to } = view.state.selection.main;
    return view.state.doc.sliceString(from, to);
  }

  export function insertText(text: string) {
    if (!view) return;
    const { from } = view.state.selection.main;
    view.dispatch({
      changes: { from, insert: text },
      selection: { anchor: from + text.length },
    });
  }
</script>

<div
  bind:this={editorElement}
  class="cm-editor-wrapper w-full h-full"
  class:cm-readonly={readOnly}
></div>

<style>
  :global(.cm-editor-wrapper .cm-editor) {
    height: 100%;
  }

  :global(.cm-editor-wrapper .cm-scroller) {
    font-family: "JetBrains Mono", "Fira Code", "Monaco", "Cascadia Code",
      monospace;
    font-size: 14px;
    line-height: 1.5;
  }

  :global(.cm-editor-wrapper .cm-focused) {
    outline: none;
  }

  :global(.cm-editor-wrapper.cm-readonly .cm-cursor) {
    display: none;
  }

  /* Custom YAML syntax highlighting tweaks */
  :global(.cm-editor-wrapper .tok-string) {
    color: #98c379;
  }

  :global(.cm-editor-wrapper .tok-number) {
    color: #d19a66;
  }

  :global(.cm-editor-wrapper .tok-bool) {
    color: #56b6c2;
  }

  :global(.cm-editor-wrapper .tok-null) {
    color: #c678dd;
  }
</style>
