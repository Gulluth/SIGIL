/**
 * File system operations using Wails v3 Dialogs API
 */

import { Dialogs } from '@wailsio/runtime';
import { ReadFile, WriteFile } from '../../../bindings/github.com/Gulluth/SIGIL/apps/learn-sigil/fileservice';

export interface OpenFileResult {
  path: string;
  content: string;
  name: string;
}

export interface SaveFileResult {
  path: string;
  success: boolean;
}

/**
 * Show native file open dialog and read the selected file
 */
export async function openFileDialog(): Promise<OpenFileResult | null> {
  try {
    const result = await Dialogs.OpenFile({
      Title: 'Open YAML File',
      Filters: [
        {
          DisplayName: 'YAML Files',
          Pattern: '*.yaml;*.yml',
        },
        {
          DisplayName: 'All Files',
          Pattern: '*',
        },
      ],
    });

    if (!result) {
      return null;
    }

    // Read file content
    const content = await readFile(result);

    // Extract filename from path
    const name = result.split('/').pop() || result.split('\\').pop() || 'Untitled.yaml';

    return {
      path: result,
      content,
      name,
    };
  } catch (error) {
    console.error('Error opening file:', error);
    throw error;
  }
}

/**
 * Show native save file dialog
 */
export async function saveFileDialog(defaultName: string = 'Untitled.yaml'): Promise<string | null> {
  try {
    const result = await Dialogs.SaveFile({
      Title: 'Save YAML File',
      Filters: [
        {
          DisplayName: 'YAML Files',
          Pattern: '*.yaml;*.yml',
        },
        {
          DisplayName: 'All Files',
          Pattern: '*',
        },
      ],
    });

    return result || null;
  } catch (error) {
    console.error('Error saving file:', error);
    throw error;
  }
}

/**
 * Save content to a file path
 */
export async function saveFile(path: string, content: string): Promise<SaveFileResult> {
  try {
    await writeFile(path, content);
    return {
      path,
      success: true,
    };
  } catch (error) {
    console.error('Error writing file:', error);
    return {
      path,
      success: false,
    };
  }
}

/**
 * Read file content from path using Go backend
 */
async function readFile(path: string): Promise<string> {
  try {
    return await ReadFile(path);
  } catch (error) {
    console.error('Error reading file:', error);
    throw error;
  }
}

/**
 * Write file content to path using Go backend
 */
async function writeFile(path: string, content: string): Promise<void> {
  try {
    await WriteFile(path, content);
  } catch (error) {
    console.error('Error writing file:', error);
    throw error;
  }
}

/**
 * Show confirmation dialog for unsaved changes
 */
export async function confirmUnsavedChanges(filename: string): Promise<'save' | 'discard' | 'cancel'> {
  try {
    const result = await Dialogs.Question({
      Title: 'Unsaved Changes',
      Message: `Do you want to save changes to "${filename}"?`,
      Buttons: [
        { Label: 'Save' },
        { Label: "Don't Save" },
        { Label: 'Cancel' },
      ],
    });

    // Map button index to action
    switch (result) {
      case 'Save':
        return 'save';
      case "Don't Save":
        return 'discard';
      default:
        return 'cancel';
    }
  } catch (error) {
    console.error('Error showing confirmation dialog:', error);
    return 'cancel';
  }
}

/**
 * Show error dialog
 */
export async function showErrorDialog(title: string, message: string): Promise<void> {
  try {
    await Dialogs.Error({
      Title: title,
      Message: message,
    });
  } catch (error) {
    console.error('Error showing error dialog:', error);
  }
}

/**
 * Show info dialog
 */
export async function showInfoDialog(title: string, message: string): Promise<void> {
  try {
    await Dialogs.Info({
      Title: title,
      Message: message,
    });
  } catch (error) {
    console.error('Error showing info dialog:', error);
  }
}
