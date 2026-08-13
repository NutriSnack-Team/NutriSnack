import { create } from 'zustand';
import type { AppState } from '@/types';

export const useAppStore = create<AppState>((set) => ({
  isScanning: false,
  scanResultId: null,
  dynamicProduct: null,
  setIsScanning: (status) => set({ isScanning: status }),
  setScanResultId: (id) => set({ scanResultId: id, dynamicProduct: null }),
  setDynamicProduct: (product) => set({ dynamicProduct: product, scanResultId: null }),
}));
