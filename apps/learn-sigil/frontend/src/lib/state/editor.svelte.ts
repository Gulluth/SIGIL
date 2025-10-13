// Editor state management using Svelte 5 runes

export interface FileTab {
  id: string;
  name: string;
  content: string;
  isDirty: boolean;
  isNew: boolean;
  filePath?: string;
}

// Create state store that can be safely exported
class EditorStore {
  currentFile = $state<string | null>(null);
  openFiles = $state<Map<string, FileTab>>(new Map());
  activeTabId = $state<string | null>(null);

  // SIGIL processing state  
  isProcessing = $state<boolean>(false);
  lastResult = $state<string | null>(null);
  lastError = $state<string | null>(null);
  selectedTemplateId = $state<string>('');

  // UI state
  showLineNumbers = $state<boolean>(true);
  currentTheme = $state<'light' | 'dark'>('dark');
  tabPosition = $state<'top' | 'bottom'>('top');
}

// Export singleton instance
export const editorStore = new EditorStore();

// Export getters for accessing state values
export function getActiveTabId(): string | null {
  return editorStore.activeTabId;
}

export function getOpenFiles(): Map<string, FileTab> {
  return editorStore.openFiles;
}

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

  // Create new Map to trigger reactivity
  const newMap = new Map(editorStore.openFiles);
  newMap.set(id, fileTab);
  editorStore.openFiles = newMap;
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

  // Create new Map to trigger reactivity
  const newMap = new Map(editorStore.openFiles);
  newMap.set(id, fileTab);
  editorStore.openFiles = newMap;
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

  // Create new Map to trigger reactivity
  const newMap = new Map(editorStore.openFiles);
  newMap.delete(id);
  editorStore.openFiles = newMap;

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

  const originalContent = file.isNew ? '' : file.content;
  file.content = content;
  file.isDirty = content !== originalContent;

  // Create new Map to trigger reactivity
  const newMap = new Map(editorStore.openFiles);
  newMap.set(id, file);
  editorStore.openFiles = newMap;
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

  // Create new Map to trigger reactivity
  const newMap = new Map(editorStore.openFiles);
  newMap.set(id, file);
  editorStore.openFiles = newMap;
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

// Tab navigation methods
export function switchToTab(id: string): void {
  if (editorStore.openFiles.has(id)) {
    editorStore.activeTabId = id;
  }
}

export function switchToNextTab(): void {
  const files = getAllOpenFiles();
  if (files.length <= 1) return;

  const currentIndex = files.findIndex(f => f.id === editorStore.activeTabId);
  const nextIndex = (currentIndex + 1) % files.length;
  editorStore.activeTabId = files[nextIndex].id;
}

export function switchToPrevTab(): void {
  const files = getAllOpenFiles();
  if (files.length <= 1) return;

  const currentIndex = files.findIndex(f => f.id === editorStore.activeTabId);
  const prevIndex = currentIndex === 0 ? files.length - 1 : currentIndex - 1;
  editorStore.activeTabId = files[prevIndex].id;
}

export function closeActiveTab(): boolean {
  if (!editorStore.activeTabId) return false;
  return closeFile(editorStore.activeTabId);
}

// Helper to get all file contents for SIGIL processing
export function getAllFileContents(): Record<string, string> {
  const contents: Record<string, string> = {};
  for (const [id, file] of editorStore.openFiles.entries()) {
    contents[file.name] = file.content;
  }
  return contents;
}