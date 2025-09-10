import { create } from 'zustand';
import type { User } from '../types';

interface NotebookState {
  // Auth state
  user: User | null;
  isAuthenticated: boolean;
  
  // UI state
  selectedFolder: string | null;
  selectedNote: string | null;
  
  // Actions
  setUser: (user: User | null) => void;
  setSelectedFolder: (folderId: string | null) => void;
  setSelectedNote: (noteId: string | null) => void;
  logout: () => void;
}

export const useNotebookStore = create<NotebookState>((set) => ({
  // Initial state
  user: JSON.parse(localStorage.getItem('user') || 'null'),
  isAuthenticated: !!localStorage.getItem('token'),
  selectedFolder: null,
  selectedNote: null,
  
  // Actions
  setUser: (user) => {
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
      set({ user, isAuthenticated: true });
    } else {
      localStorage.removeItem('user');
      set({ user: null, isAuthenticated: false });
    }
  },
  
  setSelectedFolder: (folderId) => set(state => ({ 
    selectedFolder: folderId, 
    selectedNote: state.selectedFolder === folderId ? state.selectedNote : null 
  })),
  
  setSelectedNote: (noteId) => set({ selectedNote: noteId }),
  
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    set({ 
      user: null, 
      isAuthenticated: false, 
      selectedFolder: null, 
      selectedNote: null 
    });
  },
}));