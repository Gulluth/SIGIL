// Editor state management using Svelte 5 compatible pattern

export interface FileTab {
  id: string;
  name: string;
  content: string;
  isDirty: boolean;
  isNew: boolean;
  filePath?: string;
}

// Simple state store without runes (for .ts files)
class EditorStore {
  private _currentFile: string | null = null;
  private _openFiles: Map<string, FileTab> = new Map();
  private _activeTabId: string | null = null;

  // SIGIL processing state  
  private _isProcessing: boolean = false;
  private _lastResult: string | null = null;
  private _lastError: string | null = null;
  private _selectedTemplateId: string = '';

  // UI state
  private _showLineNumbers: boolean = true;
  private _currentTheme: 'light' | 'dark' = 'dark';
  private _tabPosition: 'top' | 'bottom' = 'top';

  // Getters and setters
  get currentFile() { return this._currentFile; }
  set currentFile(value: string | null) { this._currentFile = value; }

  get openFiles() { return this._openFiles; }

  get activeTabId() { return this._activeTabId; }
  set activeTabId(value: string | null) { this._activeTabId = value; }

  get isProcessing() { return this._isProcessing; }
  set isProcessing(value: boolean) { this._isProcessing = value; }

  get lastResult() { return this._lastResult; }
  set lastResult(value: string | null) { this._lastResult = value; }

  get lastError() { return this._lastError; }
  set lastError(value: string | null) { this._lastError = value; }

  get selectedTemplateId() { return this._selectedTemplateId; }
  set selectedTemplateId(value: string) { this._selectedTemplateId = value; }

  get showLineNumbers() { return this._showLineNumbers; }
  set showLineNumbers(value: boolean) { this._showLineNumbers = value; }

  get currentTheme() { return this._currentTheme; }
  set currentTheme(value: 'light' | 'dark') { this._currentTheme = value; }

  get tabPosition() { return this._tabPosition; }
  set tabPosition(value: 'top' | 'bottom') { this._tabPosition = value; }
}

// Export singleton instance
export const editorStore = new EditorStore();

// Editor functions
export function createNewFile(name: string = 'Untitled'): string {
  const id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  let fileName = name.endsWith('.yaml') ? name : `${name}.yaml`;

  // Check for duplicate names and append number if needed
  const existingNames = Array.from(editorStore.openFiles.values()).map(f => f.name);
  let counter = 1;
  const baseName = fileName.replace(/\.yaml$/, '');

  while (existingNames.includes(fileName)) {
    fileName = `${baseName}-${counter}.yaml`;
    counter++;
  }

  const fileTab: FileTab = {
    id,
    name: fileName,
    content: '',
    isDirty: false,
    isNew: true,
  };

  editorStore.openFiles.set(id, fileTab);
  editorStore.activeTabId = id;

  return id;
}

export function openFile(name: string, content: string, filePath?: string): string {
  const id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  const fileTab: FileTab = {
    id,
    name,
    content,
    isDirty: false,
    isNew: false,
    filePath,
  };

  editorStore.openFiles.set(id, fileTab);
  editorStore.activeTabId = id;

  return id;
}

export function closeFile(id: string): boolean {
  const file = editorStore.openFiles.get(id);
  if (!file) return false;

  // Check if file has unsaved changes
  if (file.isDirty) {
    // In a real app, you'd show a confirmation dialog here
    // For now, we'll just allow closing
  }

  editorStore.openFiles.delete(id);

  // If we closed the active tab, switch to another one
  if (editorStore.activeTabId === id) {
    const remainingFiles = Array.from(editorStore.openFiles.keys());
    editorStore.activeTabId = remainingFiles.length > 0 ? remainingFiles[0] : null;
  }

  return true;
}

export function updateFileContent(id: string, content: string): void {
  const file = editorStore.openFiles.get(id);
  if (!file) return;

  const wasClean = !file.isDirty;
  file.content = content;
  file.isDirty = content !== (file.isNew ? '' : file.content);

  // Update the map to trigger reactivity
  editorStore.openFiles.set(id, file);
}

export function markFileSaved(id: string, filePath?: string): void {
  const file = editorStore.openFiles.get(id);
  if (!file) return;

  file.isDirty = false;
  file.isNew = false;
  if (filePath) {
    file.filePath = filePath;
    // Extract filename from path for display
    file.name = filePath.split(/[\\/]/).pop() || file.name;
  }

  editorStore.openFiles.set(id, file);
}

export function getActiveFile(): FileTab | null {
  return editorStore.activeTabId ? editorStore.openFiles.get(editorStore.activeTabId) || null : null;
}

export function getAllOpenFiles(): FileTab[] {
  return Array.from(editorStore.openFiles.values());
}

// Computed getters (exported as functions since derived can't be exported)
export function hasUnsavedChanges(): boolean {
  return Array.from(editorStore.openFiles.values()).some((file: FileTab) => file.isDirty);
}

export function openFileCount(): number {
  return editorStore.openFiles.size;
}