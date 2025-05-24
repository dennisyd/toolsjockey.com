import { create } from 'zustand';

export type Tool = 'image-sharpener' | 'qr-code-generator' | 'image-compressor' | 'color-palette-generator' | 'pdf-utilities' | 'excel-merger-splitter';

interface AppState {
  darkMode: boolean;
  recentlyUsedTools: Tool[];
  toggleDarkMode: () => void;
  addRecentlyUsedTool: (tool: Tool) => void;
}

export const useAppStore = create<AppState>((set) => ({
  darkMode: localStorage.getItem('darkMode') === 'true',
  recentlyUsedTools: JSON.parse(localStorage.getItem('recentlyUsedTools') || '[]'),
  
  toggleDarkMode: () => set((state) => {
    const newDarkMode = !state.darkMode;
    localStorage.setItem('darkMode', String(newDarkMode));
    return { darkMode: newDarkMode };
  }),
  
  addRecentlyUsedTool: (tool) => set((state) => {
    // Remove the tool if it already exists to avoid duplicates
    const filteredTools = state.recentlyUsedTools.filter(t => t !== tool);
    // Add the tool to the beginning of the array
    const newTools = [tool, ...filteredTools].slice(0, 5); // Keep only the 5 most recent tools
    localStorage.setItem('recentlyUsedTools', JSON.stringify(newTools));
    return { recentlyUsedTools: newTools };
  }),
})); 