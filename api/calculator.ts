import type { Package, CalculationRequest, CalculationResult, SizeValidationResult, PetSize } from './types';
import { PET_SIZE_WEIGHT, PET_SIZE_LABELS } from './types';
import { getAllPackages } from './store';

export function validatePetSize(pkg: Package, petSize: PetSize): SizeValidationResult {
  const pkgWeight = PET_SIZE_WEIGHT[pkg.maxPetSize];
  const petWeight = PET_SIZE_WEIGHT[petSize];

  if (petWeight > pkgWeight) {
    return {
      allowed: false,
      message: `该套餐仅支持${PET_SIZE_LABELS[pkg.maxPetSize]}及以下宠物体型，您的宠物为${PET_SIZE_LABELS[petSize]}，超出容纳范围`,
    };
  }

  return {
    allowed: true,
    message: '体型符合要求',
  };
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

export function findMatchingPackage(days: number, petSize: PetSize): { pkg: Package; priceInfo: ReturnType<typeof calcPriceForPackage> } | null {
  const packages = getAllPackages();

  const eligiblePackages = packages.filter(pkg => {
    const sizeValid = validatePetSize(pkg, petSize).allowed;
    if (!sizeValid) return false;
    if (pkg.minDays && days < pkg.minDays) return false;
    if (pkg.maxDays && days > pkg.maxDays) return false;
    return true;
  });

  if (eligiblePackages.length === 0) return null;

  let best: { pkg: Package; priceInfo: ReturnType<typeof calcPriceForPackage> } | null = null;
  for (const pkg of eligiblePackages) {
    const priceInfo = calcPriceForPackage(pkg, days);
    if (!best || priceInfo.totalPrice < best.priceInfo.totalPrice || 
        (priceInfo.totalPrice === best.priceInfo.totalPrice && pkg.order < best.pkg.order)) {
      best = { pkg, priceInfo };
    }
  }

  return best;
}

export function calculatePrice(request: CalculationRequest): CalculationResult {
  const { days, petSize } = request;

  if (days <= 0) {
    return {
      success: false,
      totalPrice: 0,
      breakdown: {
        basePrice: 0,
        discount: 0,
        finalPrice: 0,
        dailyRate: 0,
        days: 0,
      },
      error: '寄养天数必须大于0',
    };
  }

  const matchResult = findMatchingPackage(days, petSize);

  if (!matchResult) {
    const allPackages = getAllPackages();
    const sizeBlocked = allPackages.every(pkg => !validatePetSize(pkg, petSize).allowed);

    if (sizeBlocked) {
      return {
        success: false,
        totalPrice: 0,
        breakdown: {
          basePrice: 0,
          discount: 0,
          finalPrice: 0,
          dailyRate: 0,
          days,
        },
        error: `当前没有支持${PET_SIZE_LABELS[petSize]}宠物的套餐`,
      };
    }

    return {
      success: false,
      totalPrice: 0,
      breakdown: {
        basePrice: 0,
        discount: 0,
        finalPrice: 0,
        dailyRate: 0,
        days,
      },
      error: `没有匹配${days}天寄养的套餐`,
    };
  }

  const matchedPkg = matchResult.pkg;
  const priceInfo = matchResult.priceInfo;

  return {
    success: true,
    matchedPackage: matchedPkg,
    totalPrice: priceInfo.totalPrice,
    breakdown: {
      basePrice: priceInfo.basePrice,
      discount: priceInfo.discount,
      finalPrice: priceInfo.totalPrice,
      dailyRate: priceInfo.dailyRate,
      days,
      fullMonths: priceInfo.fullMonths,
      monthlyTotal: priceInfo.monthlyTotal,
      remainingDays: priceInfo.remainingDays,
      remainingDaysBase: priceInfo.remainingDaysBase,
      remainingDaysDiscount: priceInfo.remainingDaysDiscount,
    },
  };
}
