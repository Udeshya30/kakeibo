import { create } from 'zustand';

export type AppInitializationStatus = 'idle' | 'hydrating' | 'ready' | 'storage-unavailable';

interface AppState {
  readonly status: AppInitializationStatus;
  readonly statusMessage: string | null;
  readonly isUpdateAvailable: boolean;
  readonly isUpdateRequested: boolean;
  setStatus: (status: AppInitializationStatus, statusMessage?: string) => void;
  setUpdateAvailable: (isUpdateAvailable: boolean) => void;
  requestUpdate: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  status: 'idle',
  statusMessage: null,
  isUpdateAvailable: false,
  isUpdateRequested: false,
  setStatus: (status, statusMessage) => {
    set({
      status,
      statusMessage: statusMessage ?? null
    });
  },
  setUpdateAvailable: (isUpdateAvailable) => {
    set({ isUpdateAvailable });
  },
  requestUpdate: () => {
    set({ isUpdateRequested: true });
  }
}));
