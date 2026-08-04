import { create } from 'zustand';
import type { AppState } from '@/types';

export const useAppStore = create<AppState>((set) => ({
  isScanning: false,
  scanResultId: null,
  setIsScanning: (status) => set({ isScanning: status }),
  setScanResultId: (id) => set({ scanResultId: id }),
}));
