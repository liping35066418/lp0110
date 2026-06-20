export type PackageType = 'daycare' | 'shortstay' | 'longstay';

export type PetSize = 'small' | 'medium' | 'large' | 'xlarge';

export interface Package {
  id: string;
  type: PackageType;
  name: string;
  description: string;
  promoText: string;
  maxPetSize: PetSize;
  dailyPrice: number;
  extendedStayDiscount: number;
  minDays?: number;
  maxDays?: number;
  monthlyPrice?: number;
  order: number;
  createdAt: number;
}

export interface CalculationRequest {
  days: number;
  petSize: PetSize;
}

export interface CalculationResult {
  success: boolean;
  matchedPackage?: Package;
  totalPrice: number;
  breakdown: {
    basePrice: number;
    discount: number;
    finalPrice: number;
    dailyRate: number;
    days: number;
  };
  error?: string;
}

export const PET_SIZE_WEIGHT: Record<PetSize, number> = {
  small: 1,
  medium: 2,
  large: 3,
  xlarge: 4,
};

export const PET_SIZE_LABELS: Record<PetSize, string> = {
  small: '小型',
  medium: '中型',
  large: '大型',
  xlarge: '超大型',
};

export const PACKAGE_TYPE_LABELS: Record<PackageType, string> = {
  daycare: '日托',
  shortstay: '短期寄养',
  longstay: '长期包月',
};

export const PACKAGE_TYPE_ICONS: Record<PackageType, string> = {
  daycare: '☀️',
  shortstay: '🏠',
  longstay: '📅',
};

export const PACKAGE_TYPE_COLORS: Record<PackageType, string> = {
  daycare: 'from-amber-400 to-orange-500',
  shortstay: 'from-blue-400 to-indigo-500',
  longstay: 'from-emerald-400 to-teal-500',
};
