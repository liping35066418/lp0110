import { useState, useEffect } from 'react';
import type { PetSize } from '../types';
import { PET_SIZE_LABELS, PACKAGE_TYPE_LABELS, PACKAGE_TYPE_ICONS } from '../types';
import { usePackageStore } from '../store/usePackageStore';
import { Calculator, RefreshCw } from 'lucide-react';

export default function PriceCalculator() {
  const { calculate, calculationResult, clearCalculation, packages, loading } = usePackageStore();
  const [days, setDays] = useState<number>(5);
  const [petSize, setPetSize] = useState<PetSize>('medium');
  const [autoCalculate, setAutoCalculate] = useState(true);

  const sizeOptions: { value: PetSize; label: string; emoji: string }[] = [
    { value: 'small', label: '小型', emoji: '🐕' },
    { value: 'medium', label: '中型', emoji: '🦮' },
    { value: 'large', label: '大型', emoji: '🐕‍🦺' },
    { value: 'xlarge', label: '超大型', emoji: '🐺' },
  ];

  useEffect(() => {
    if (autoCalculate && days > 0 && packages.length > 0) {
      const timer = setTimeout(() => {
        calculate({ days, petSize });
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [days, petSize, autoCalculate, calculate, packages.length]);

  useEffect(() => {
    if (packages.length > 0) {
      calculate({ days, petSize });
    }
  }, [packages]);

  const handleCalculate = () => {
    calculate({ days, petSize });
  };

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
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={autoCalculate}
              onChange={(e) => setAutoCalculate(e.target.checked)}
              className="w-4 h-4 rounded border-slate-600 bg-slate-700 text-blue-500 focus:ring-blue-500"
            />
            <span className="text-sm text-slate-300">实时计算</span>
          </label>
          {!autoCalculate && (
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
              计算费用
            </button>
          )}
          <button
            onClick={clearCalculation}
            className="px-4 py-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
          >
            清空
          </button>
        </div>

        {calculationResult && calculationResult.success && (
          <div className="bg-slate-700/50 rounded-xl p-5 border border-slate-600">
            <div className="flex items-center gap-3 mb-4 pb-4 border-b border-slate-600">
              <span className="text-3xl">
                {PACKAGE_TYPE_ICONS[calculationResult.matchedPackage!.type]}
              </span>
              <div>
                <div className="text-slate-400 text-sm">匹配套餐</div>
                <div className="font-bold text-lg">
                  {calculationResult.matchedPackage!.name}
                </div>
                <span className="text-xs bg-blue-500/30 text-blue-300 px-2 py-0.5 rounded-full">
                  {PACKAGE_TYPE_LABELS[calculationResult.matchedPackage!.type]}
                </span>
              </div>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-400">单日单价</span>
                <span className="font-medium">¥{calculationResult.breakdown.dailyRate}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">寄养天数</span>
                <span className="font-medium">{calculationResult.breakdown.days}天</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">基础总价</span>
                <span className="font-medium">¥{calculationResult.breakdown.basePrice}</span>
              </div>
              {calculationResult.breakdown.discount > 0 && (
                <div className="flex justify-between text-green-400">
                  <span>续住折扣</span>
                  <span className="font-medium">-¥{calculationResult.breakdown.discount}</span>
                </div>
              )}
              <div className="pt-3 mt-3 border-t border-slate-600">
                <div className="flex justify-between items-center">
                  <span className="text-lg">应付总价</span>
                  <span className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-400">
                    ¥{calculationResult.totalPrice}
                  </span>
                </div>
              </div>
            </div>
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
