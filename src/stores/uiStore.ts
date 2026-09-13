import { create } from 'zustand';
import { CameraMode } from '../data/types';

interface UIState {
  sidebarCollapsed: boolean;
  rightPanelOpen: boolean;
  cameraMode: CameraMode;
  currentPage: string;
  isWorkPaused: boolean;
  toggleSidebar: () => void;
  toggleRightPanel: () => void;
  setCameraMode: (mode: CameraMode) => void;
  setCurrentPage: (page: string) => void;
  toggleWorkPaused: () => void;
  setWorkPaused: (paused: boolean) => void;
}

export const useUIStore = create<UIState>((set) => ({
  sidebarCollapsed: false,
  rightPanelOpen: true,
  cameraMode: 'full',
  currentPage: 'overview',
  isWorkPaused: false,

  toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
  toggleRightPanel: () => set((state) => ({ rightPanelOpen: !state.rightPanelOpen })),
  setCameraMode: (mode) => set({ cameraMode: mode }),
  setCurrentPage: (page) => set({ currentPage: page }),
  toggleWorkPaused: () => set((state) => ({ isWorkPaused: !state.isWorkPaused })),
  setWorkPaused: (paused) => set({ isWorkPaused: paused }),
}));

// Alias for consistent naming across the codebase
export const useUiStore = useUIStore;
