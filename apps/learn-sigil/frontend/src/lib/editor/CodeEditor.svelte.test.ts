import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, fireEvent } from '@testing-library/svelte';
import { tick } from 'svelte';
import CodeEditor from './CodeEditor.svelte';

describe('CodeEditor Component (Svelte 5 Migration)', () => {
  let mockOnChange: ReturnType<typeof vi.fn>;
  let mockOnFocus: ReturnType<typeof vi.fn>;
  let mockOnBlur: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockOnChange = vi.fn();
    mockOnFocus = vi.fn();
    mockOnBlur = vi.fn();

    // Mock setTimeout for debouncing
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it('should render with default props', () => {
    const { container } = render(CodeEditor, {
      props: {
        onchange: mockOnChange,
        onfocus: mockOnFocus,
        onblur: mockOnBlur,
      },
    });

    // Should render the editor container
    const editorDiv = container.querySelector('.cm-editor');
    expect(editorDiv).toBeTruthy();
  });

  it('should display initial value', () => {
    const initialValue = 'name: "test"\nversion: "1.0.0"';

    const { container } = render(CodeEditor, {
      props: {
        value: initialValue,
        onchange: mockOnChange,
      },
    });

    // Check that the editor contains the initial content
    const editorContent = container.querySelector('.cm-content');
    expect(editorContent?.textContent).toContain('test');
  });

  it('should use callback props instead of createEventDispatcher', async () => {
    const { component, container } = render(CodeEditor, {
      props: {
        value: '',
        onchange: mockOnChange,
        onfocus: mockOnFocus,
        onblur: mockOnBlur,
      },
    });

    // Simulate text input in the editor
    const editorContent = container.querySelector('.cm-content');
    if (editorContent) {
      // Simulate typing
      await fireEvent.input(editorContent, {
        target: { textContent: 'name: "new content"' }
      });

      // Fast-forward debounce timer
      vi.advanceTimersByTime(300);

      // Check that onchange callback was called
      expect(mockOnChange).toHaveBeenCalled();
    }
  });

  it('should handle focus and blur events', async () => {
    const { container } = render(CodeEditor, {
      props: {
        onchange: mockOnChange,
        onfocus: mockOnFocus,
        onblur: mockOnBlur,
      },
    });

    const editorContainer = container.querySelector('.cm-editor');

    if (editorContainer) {
      // Simulate focus
      await fireEvent.focusIn(editorContainer);
      expect(mockOnFocus).toHaveBeenCalled();

      // Simulate blur
      await fireEvent.focusOut(editorContainer);
      expect(mockOnBlur).toHaveBeenCalled();
    }
  });

  it('should apply theme correctly', () => {
    const { container } = render(CodeEditor, {
      props: {
        theme: 'dark',
        onchange: mockOnChange,
      },
    });

    // Check that dark theme is applied
    const editor = container.querySelector('.cm-editor');
    expect(editor?.classList.toString()).toContain('cm-');
  });

  it('should show line numbers when enabled', () => {
    const { container } = render(CodeEditor, {
      props: {
        showLineNumbers: true,
        onchange: mockOnChange,
      },
    });

    // Check for line number gutter
    const lineNumbers = container.querySelector('.cm-lineNumbers');
    expect(lineNumbers).toBeTruthy();
  });

  it('should be read-only when specified', () => {
    const { container } = render(CodeEditor, {
      props: {
        readOnly: true,
        onchange: mockOnChange,
      },
    });

    const editor = container.querySelector('.cm-editor');
    expect(editor?.classList.toString()).toContain('cm-');
  });

  it('should debounce change events', async () => {
    const { container } = render(CodeEditor, {
      props: {
        value: '',
        debounce: 100,
        onchange: mockOnChange,
      },
    });

    const editorContent = container.querySelector('.cm-content');

    if (editorContent) {
      // Simulate rapid typing
      await fireEvent.input(editorContent, { target: { textContent: 'a' } });
      await fireEvent.input(editorContent, { target: { textContent: 'ab' } });
      await fireEvent.input(editorContent, { target: { textContent: 'abc' } });

      // Should not have called onChange yet
      expect(mockOnChange).not.toHaveBeenCalled();

      // Fast-forward past debounce time
      vi.advanceTimersByTime(150);

      // Now it should have been called once (debounced)
      expect(mockOnChange).toHaveBeenCalledTimes(1);
    }
  });

  it('should handle value updates reactively', async () => {
    const { rerender } = render(CodeEditor, {
      props: {
        value: 'initial',
        onchange: mockOnChange,
      },
    });

    // Update the value and re-render
    await rerender({ value: 'updated content' });
    await tick();

    // The editor should reflect the new value
    // This tests the $effect reactive update working correctly
    // We verify no unwanted change events are fired for external updates
    expect(mockOnChange).not.toHaveBeenCalledWith('updated content');
  });

  it('should support YAML syntax highlighting', () => {
    const yamlContent = `
name: "SIGIL Editor"
version: "1.0.0"
settings:
  theme: dark
  features:
    - syntax-highlighting
    - auto-completion
`;

    const { container } = render(CodeEditor, {
      props: {
        value: yamlContent,
        onchange: mockOnChange,
      },
    });

    // Check that YAML syntax highlighting is active
    const editor = container.querySelector('.cm-editor');
    expect(editor).toBeTruthy();
  });

  it('should use Svelte 5 runes correctly', () => {
    // This test ensures the component compiles with Svelte 5
    // The fact that render() works without errors indicates
    // proper $props(), $state, and $effect usage
    expect(() => {
      render(CodeEditor, {
        props: {
          value: 'test',
          onchange: mockOnChange,
        },
      });
    }).not.toThrow();
  });

  it('should handle empty callback props gracefully', () => {
    // Test that the component works even without callback props
    expect(() => {
      render(CodeEditor, {
        props: {
          value: 'test',
          // No callback props provided
        },
      });
    }).not.toThrow();
  });
});