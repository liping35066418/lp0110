import type { Package } from './types';

let packages: Package[] = [
  {
    id: 'pkg-1',
    type: 'daycare',
    name: '日托基础套餐',
    description: '适合上班族，白天专人看护',
    promoText: '首单立减20元',
    maxPetSize: 'large',
    dailyPrice: 88,
    extendedStayDiscount: 0,
    minDays: 1,
    maxDays: 1,
    order: 1,
    createdAt: Date.now(),
  },
  {
    id: 'pkg-2',
    type: 'shortstay',
    name: '短期寄养套餐',
    description: '3-7天短期寄养，独立空间',
    promoText: '连住3天享9折',
    maxPetSize: 'large',
    dailyPrice: 128,
    extendedStayDiscount: 10,
    minDays: 2,
    maxDays: 14,
    order: 2,
    createdAt: Date.now(),
  },
  {
    id: 'pkg-3',
    type: 'longstay',
    name: '长期包月套餐',
    description: '30天以上长期寄养，优惠多多',
    promoText: '包月立省500元',
    maxPetSize: 'medium',
    dailyPrice: 98,
    extendedStayDiscount: 20,
    monthlyPrice: 2580,
    minDays: 30,
    order: 3,
    createdAt: Date.now(),
  },
];

export function getAllPackages(): Package[] {
  return [...packages].sort((a, b) => a.order - b.order);
}

export function getPackageById(id: string): Package | undefined {
  return packages.find(p => p.id === id);
}

export function createPackage(pkg: Omit<Package, 'id' | 'createdAt'>): Package {
  const newPackage: Package = {
    ...pkg,
    id: `pkg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    createdAt: Date.now(),
  };
  packages.push(newPackage);
  return newPackage;
}

export function updatePackage(id: string, updates: Partial<Package>): Package | undefined {
  const index = packages.findIndex(p => p.id === id);
  if (index === -1) return undefined;
  packages[index] = { ...packages[index], ...updates };
  return packages[index];
}

export function deletePackage(id: string): boolean {
  const index = packages.findIndex(p => p.id === id);
  if (index === -1) return false;
  packages.splice(index, 1);
  return true;
}

export function reorderPackages(ids: string[]): void {
  const newPackages: Package[] = [];
  ids.forEach((id, index) => {
    const pkg = packages.find(p => p.id === id);
    if (pkg) {
      newPackages.push({ ...pkg, order: index + 1 });
    }
  });
  const remaining = packages.filter(p => !ids.includes(p.id));
  remaining.forEach((pkg, index) => {
    newPackages.push({ ...pkg, order: ids.length + index + 1 });
  });
  packages = newPackages;
}

export function setPackagesForTesting(testPackages: Package[]): void {
  packages = [...testPackages];
}
