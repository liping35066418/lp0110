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
  calcDays: number;
  calcPetSize: PetSize;
  selectedCalcPackageId: string | null;

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
  setCalcInputs: (days: number, petSize: PetSize) => void;
  setSelectedCalcPackageId: (id: string | null) => void;
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
  calcDays: 5,
  calcPetSize: 'medium',
  selectedCalcPackageId: null,

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
      const { calcDays, calcPetSize } = get();
      get().calculate({ days: calcDays, petSize: calcPetSize });
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
    set({ loading: true, error: null, calcDays: request.days, calcPetSize: request.petSize });
    try {
      const result = await calculatePrice(request);
      if (result.success && result.matchedPackage) {
        set({ calculationResult: result, loading: false, selectedCalcPackageId: result.matchedPackage.id });
      } else {
        set({ calculationResult: result, loading: false, selectedCalcPackageId: null });
      }
    } catch (err) {
      set({ error: (err as Error).message, loading: false, selectedCalcPackageId: null });
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
    set({ calculationResult: null, selectedCalcPackageId: null });
  },

  setCalcInputs: (days, petSize) => {
    set({ calcDays: days, calcPetSize: petSize });
  },

  setSelectedCalcPackageId: (id) => {
    set({ selectedCalcPackageId: id });
  },
}));
