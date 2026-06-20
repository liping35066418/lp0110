import type { Package, PetSize } from '../types';
import { PET_SIZE_WEIGHT } from '../types';

export function isSizeCompatible(pkg: Package, petSize: PetSize): boolean {
  return PET_SIZE_WEIGHT[petSize] <= PET_SIZE_WEIGHT[pkg.maxPetSize];
}

export function isDaysInRange(pkg: Package, days: number): boolean {
  if (pkg.minDays && days < pkg.minDays) return false;
  if (pkg.maxDays && days > pkg.maxDays) return false;
  return true;
}

export function calcPriceForPackage(pkg: Package, days: number): {
  basePrice: number;
  discount: number;
  totalPrice: number;
  dailyRate: number;
  fullMonths?: number;
  monthlyTotal?: number;
  remainingDays?: number;
  remainingDaysBase?: number;
  remainingDaysDiscount?: number;
} {
  const dailyRate = pkg.dailyPrice;

  if (pkg.monthlyPrice && days >= 30) {
    const fullMonths = Math.floor(days / 30);
    const remainingDays = days % 30;
    const monthlyTotal = fullMonths * pkg.monthlyPrice;
    const remainingDaysBase = remainingDays * dailyRate;
    let remainingDaysDiscount = 0;
    if (pkg.extendedStayDiscount > 0 && remainingDays >= 3) {
      remainingDaysDiscount = Math.round(remainingDaysBase * (pkg.extendedStayDiscount / 100));
    }
    const basePrice = monthlyTotal + remainingDaysBase;
    return {
      basePrice,
      discount: remainingDaysDiscount,
      totalPrice: basePrice - remainingDaysDiscount,
      dailyRate,
      fullMonths,
      monthlyTotal,
      remainingDays,
      remainingDaysBase,
      remainingDaysDiscount,
    };
  }

  const basePrice = days * dailyRate;
  let discountAmount = 0;
  if (pkg.extendedStayDiscount > 0 && days >= 3) {
    discountAmount = Math.round(basePrice * (pkg.extendedStayDiscount / 100));
  }
  return {
    basePrice,
    discount: discountAmount,
    totalPrice: basePrice - discountAmount,
    dailyRate,
  };
}
