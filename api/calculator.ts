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

export function findMatchingPackage(days: number, petSize: PetSize): Package | null {
  const packages = getAllPackages();

  const eligiblePackages = packages.filter(pkg => {
    const sizeValid = validatePetSize(pkg, petSize).allowed;
    if (!sizeValid) return false;

    if (pkg.minDays && days < pkg.minDays) return false;
    if (pkg.maxDays && days > pkg.maxDays) return false;

    return true;
  });

  if (eligiblePackages.length === 0) return null;

  eligiblePackages.sort((a, b) => {
    const typePriority = { daycare: 3, shortstay: 2, longstay: 1 };
    return typePriority[a.type] - typePriority[b.type];
  });

  return eligiblePackages[0];
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

  const matchedPkg = findMatchingPackage(days, petSize);

  if (!matchedPkg) {
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

  const sizeValidation = validatePetSize(matchedPkg, petSize);
  if (!sizeValidation.allowed) {
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
      error: sizeValidation.message,
    };
  }

  let dailyRate = matchedPkg.dailyPrice;
  let basePrice: number;
  let discountAmount = 0;

  if (matchedPkg.type === 'longstay' && matchedPkg.monthlyPrice && days >= 30) {
    const fullMonths = Math.floor(days / 30);
    const remainingDays = days % 30;
    basePrice = fullMonths * matchedPkg.monthlyPrice + remainingDays * dailyRate;
  } else {
    basePrice = days * dailyRate;
  }

  if (matchedPkg.extendedStayDiscount > 0 && days >= 3) {
    discountAmount = Math.round(basePrice * (matchedPkg.extendedStayDiscount / 100));
  }

  const finalPrice = basePrice - discountAmount;

  return {
    success: true,
    matchedPackage: matchedPkg,
    totalPrice: finalPrice,
    breakdown: {
      basePrice,
      discount: discountAmount,
      finalPrice,
      dailyRate,
      days,
    },
  };
}
