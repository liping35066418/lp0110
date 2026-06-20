import { useEffect, useMemo } from 'react';
import type { PetSize } from '../types';
import { PET_SIZE_LABELS, PACKAGE_TYPE_LABELS, PACKAGE_TYPE_ICONS } from '../types';
import { usePackageStore } from '../store/usePackageStore';
import { isSizeCompatible, isDaysInRange, calcPriceForPackage } from '../utils/calcEstimate';
import { Calculator, RefreshCw } from 'lucide-react';

export default function PriceCalculator() {
  const {
    calculate,
    calculationResult,
    clearCalculation,
    packages,
    loading,
    calcDays,
    calcPetSize,
    setCalcInputs,
    selectedCalcPackageId,
    setSelectedCalcPackageId,
  } = usePackageStore();

  const days = calcDays;
  const petSize = calcPetSize;
  const setDays = (d: number) => setCalcInputs(d, petSize);
  const setPetSize = (s: PetSize) => setCalcInputs(days, s);

  const sizeOptions: { value: PetSize; label: string; emoji: string }[] = [
    { value: 'small', label: '小型', emoji: '🐕' },
    { value: 'medium', label: '中型', emoji: '🦮' },
    { value: 'large', label: '大型', emoji: '🐕‍🦺' },
    { value: 'xlarge', label: '超大型', emoji: '🐺' },
  ];

  useEffect(() => {
    if (days > 0 && packages.length > 0) {
      const timer = setTimeout(() => {
        calculate({ days, petSize });
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [days, petSize, calculate, packages.length]);

  useEffect(() => {
    if (packages.length > 0) {
      calculate({ days, petSize });
    }
  }, [packages]);

  const handleCalculate = () => {
    calculate({ days, petSize });
  };

  const eligiblePackages = useMemo(() => {
    if (days <= 0) return [];
    return packages
      .filter(pkg => isSizeCompatible(pkg, petSize) && isDaysInRange(pkg, days))
      .map(pkg => ({ pkg, priceInfo: calcPriceForPackage(pkg, days) }))
      .sort((a, b) => a.priceInfo.totalPrice - b.priceInfo.totalPrice);
  }, [packages, days, petSize]);

  const selectedResult = useMemo(() => {
    if (eligiblePackages.length === 0) return null;
    const found = eligiblePackages.find(e => e.pkg.id === selectedCalcPackageId);
    return found || eligiblePackages[0];
  }, [eligiblePackages, selectedCalcPackageId]);

  return (
    <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-6 text-white shadow-2xl">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-blue-500/20 rounded-xl">
          <Calculator size={28} className="text-blue-400" />
        </div>
        <div>
          <h2 className="text-xl font-bold">寄养费用计算器</h2>
          <p className="text-slate-400 text-sm">输入天数和体型，自动匹配最优套餐</p>
        </div>
      </div>

      <div className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            寄养天数
          </label>
          <div className="flex items-center gap-3">
            <input
              type="range"
              min="1"
              max="60"
              value={days}
              onChange={(e) => setDays(Number(e.target.value))}
              className="flex-1 h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
            />
            <input
              type="number"
              min="1"
              value={days}
              onChange={(e) => setDays(Math.max(1, Number(e.target.value)))}
              className="w-20 px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-center focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <span className="text-slate-400">天</span>
          </div>
          <div className="flex justify-between text-xs text-slate-500 mt-1">
            <span>1天</span>
            <span>30天</span>
            <span>60天</span>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            宠物体型
          </label>
          <div className="grid grid-cols-4 gap-2">
            {sizeOptions.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setPetSize(opt.value)}
                className={`p-3 rounded-xl border-2 transition-all text-center ${
                  petSize === opt.value
                    ? 'border-blue-500 bg-blue-500/20'
                    : 'border-slate-600 hover:border-slate-500 bg-slate-700/50'
                }`}
              >
                <div className="text-2xl">{opt.emoji}</div>
                <div className="text-sm mt-1">{opt.label}</div>
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleCalculate}
            disabled={loading}
            className="flex-1 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl font-medium hover:from-blue-600 hover:to-indigo-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <RefreshCw size={18} className="animate-spin" />
            ) : (
              <Calculator size={18} />
            )}
            重新计算
          </button>
          <button
            onClick={clearCalculation}
            className="px-4 py-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
          >
            清空
          </button>
        </div>

        {eligiblePackages.length > 0 && (
          <>
            <div className="bg-slate-700/50 rounded-xl p-4 border border-slate-600">
              <div className="text-sm text-slate-400 mb-3 font-medium">可选套餐对比</div>
              <div className="space-y-1.5">
                {eligiblePackages.map(({ pkg, priceInfo }, index) => {
                  const isSelected = selectedResult?.pkg.id === pkg.id;
                  return (
                    <button
                      key={pkg.id}
                      type="button"
                      onClick={() => setSelectedCalcPackageId(pkg.id)}
                      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-all text-left ${
                        isSelected
                          ? 'bg-blue-500/20 border border-blue-400/40'
                          : 'bg-slate-600/30 border border-transparent hover:bg-slate-600/50'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-base">{PACKAGE_TYPE_ICONS[pkg.type]}</span>
                        <span className="text-sm font-medium">{pkg.name}</span>
                        {index === 0 && (
                          <span className="text-xs bg-green-500/30 text-green-300 px-1.5 py-0.5 rounded-full font-medium">
                            最优
                          </span>
                        )}
                      </div>
                      <span className="font-bold text-sm">¥{priceInfo.totalPrice}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {selectedResult && (
              <div className="bg-slate-700/50 rounded-xl p-5 border border-slate-600">
                <div className="flex items-center gap-3 mb-4 pb-4 border-b border-slate-600">
                  <span className="text-3xl">
                    {PACKAGE_TYPE_ICONS[selectedResult.pkg.type]}
                  </span>
                  <div>
                    <div className="text-slate-400 text-sm">当前套餐</div>
                    <div className="font-bold text-lg">
                      {selectedResult.pkg.name}
                    </div>
                    <span className="text-xs bg-blue-500/30 text-blue-300 px-2 py-0.5 rounded-full">
                      {PACKAGE_TYPE_LABELS[selectedResult.pkg.type]}
                    </span>
                  </div>
                </div>

                <div className="space-y-2 text-sm">
                  {selectedResult.priceInfo.fullMonths !== undefined && selectedResult.priceInfo.fullMonths > 0 ? (
                    <>
                      <div className="flex justify-between">
                        <span className="text-slate-400">包月费用</span>
                        <span className="font-medium">{selectedResult.priceInfo.fullMonths}个月 × ¥{selectedResult.pkg.monthlyPrice} = ¥{selectedResult.priceInfo.monthlyTotal}</span>
                      </div>
                      {selectedResult.priceInfo.remainingDays! > 0 && (
                        <>
                          <div className="flex justify-between">
                            <span className="text-slate-400">续住天数</span>
                            <span className="font-medium">{selectedResult.priceInfo.remainingDays}天 × ¥{selectedResult.priceInfo.dailyRate} = ¥{selectedResult.priceInfo.remainingDaysBase}</span>
                          </div>
                          {selectedResult.priceInfo.remainingDaysDiscount! > 0 && (
                            <div className="flex justify-between text-green-400">
                              <span>续住折扣</span>
                              <span className="font-medium">-¥{selectedResult.priceInfo.remainingDaysDiscount}</span>
                            </div>
                          )}
                        </>
                      )}
                    </>
                  ) : (
                    <>
                      <div className="flex justify-between">
                        <span className="text-slate-400">单日单价</span>
                        <span className="font-medium">¥{selectedResult.priceInfo.dailyRate}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">寄养天数</span>
                        <span className="font-medium">{days}天</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">基础总价</span>
                        <span className="font-medium">¥{selectedResult.priceInfo.basePrice}</span>
                      </div>
                      {selectedResult.priceInfo.discount > 0 && (
                        <div className="flex justify-between text-green-400">
                          <span>续住折扣</span>
                          <span className="font-medium">-¥{selectedResult.priceInfo.discount}</span>
                        </div>
                      )}
                    </>
                  )}
                  <div className="pt-3 mt-3 border-t border-slate-600">
                    <div className="flex justify-between items-center">
                      <span className="text-lg">应付总价</span>
                      <span className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-400">
                        ¥{selectedResult.priceInfo.totalPrice}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {eligiblePackages.length === 0 && calculationResult && !calculationResult.success && calculationResult.error && (
          <div className="bg-red-500/10 rounded-xl p-4 border border-red-500/30">
            <p className="text-red-300 text-sm">{calculationResult.error}</p>
          </div>
        )}

        {packages.length === 0 && (
          <div className="text-center py-8 text-slate-500">
            <div className="text-4xl mb-2">📦</div>
            <p>暂无套餐，请先从左侧拖拽创建套餐</p>
          </div>
        )}
      </div>
    </div>
  );
}
