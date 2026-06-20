import { create } from 'zustand';
import type { Package, CalculationRequest, CalculationResult, PetSize, PackageType } from '../types';
import { fetchPackages, createPackage, updatePackage, deletePackage, reorderPackages, calculatePrice } from '../services/api';

interface PackageState {
  packages: Package[];
  loading: boolean;
  error: string | null;
  calculationResult: CalculationResult | null;
  showAlert: boolean;
  alertMessage: string;
  editingPackage: Package | null;
  draggedType: PackageType | null;

  loadPackages: () => Promise<void>;
  addPackage: (pkg: Omit<Package, 'id' | 'createdAt'>) => Promise<void>;
  updatePackageById: (id: string, updates: Partial<Package>) => Promise<void>;
  removePackage: (id: string) => Promise<void>;
  reorder: (ids: string[]) => Promise<void>;
  calculate: (request: CalculationRequest) => Promise<void>;
  setShowAlert: (show: boolean, message?: string) => void;
  setEditingPackage: (pkg: Package | null) => void;
  setDraggedType: (type: PackageType | null) => void;
  clearCalculation: () => void;
}

export const usePackageStore = create<PackageState>((set, get) => ({
  packages: [],
  loading: false,
  error: null,
  calculationResult: null,
  showAlert: false,
  alertMessage: '',
  editingPackage: null,
  draggedType: null,

  loadPackages: async () => {
    set({ loading: true, error: null });
    try {
      const data = await fetchPackages();
      set({ packages: data, loading: false });
    } catch (err) {
      set({ error: (err as Error).message, loading: false });
    }
  },

  addPackage: async (pkg) => {
    set({ loading: true, error: null });
    try {
      const newPkg = await createPackage(pkg);
      set((state) => ({ packages: [...state.packages, newPkg].sort((a, b) => a.order - b.order), loading: false }));
    } catch (err) {
      set({ error: (err as Error).message, loading: false });
    }
  },

  updatePackageById: async (id, updates) => {
    set({ loading: true, error: null });
    try {
      const updated = await updatePackage(id, updates);
      set((state) => ({
        packages: state.packages.map((p) => (p.id === id ? updated : p)).sort((a, b) => a.order - b.order),
        loading: false,
        editingPackage: null,
      }));
      const { calculationResult } = get();
      if (calculationResult?.matchedPackage?.id === id) {
        get().clearCalculation();
      }
    } catch (err) {
      set({ error: (err as Error).message, loading: false });
    }
  },

  removePackage: async (id) => {
    set({ loading: true, error: null });
    try {
      await deletePackage(id);
      set((state) => ({
        packages: state.packages.filter((p) => p.id !== id),
        loading: false,
      }));
    } catch (err) {
      set({ error: (err as Error).message, loading: false });
    }
  },

  reorder: async (ids) => {
    set({ loading: true, error: null });
    try {
      const data = await reorderPackages(ids);
      set({ packages: data, loading: false });
    } catch (err) {
      set({ error: (err as Error).message, loading: false });
    }
  },

  calculate: async (request) => {
    set({ loading: true, error: null });
    try {
      const result = await calculatePrice(request);
      if (!result.success && result.error) {
        set({ showAlert: true, alertMessage: result.error, calculationResult: null, loading: false });
      } else {
        set({ calculationResult: result, loading: false });
      }
    } catch (err) {
      set({ error: (err as Error).message, loading: false });
    }
  },

  setShowAlert: (show, message) => {
    set({ showAlert: show, alertMessage: message || '' });
  },

  setEditingPackage: (pkg) => {
    set({ editingPackage: pkg });
  },

  setDraggedType: (type) => {
    set({ draggedType: type });
  },

  clearCalculation: () => {
    set({ calculationResult: null });
  },
}));
