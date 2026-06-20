import { useState, useMemo } from 'react';
import type { Package } from '../types';
import { PACKAGE_TYPE_LABELS, PACKAGE_TYPE_ICONS, PACKAGE_TYPE_COLORS, PET_SIZE_LABELS } from '../types';
import { usePackageStore } from '../store/usePackageStore';
import { isSizeCompatible, isDaysInRange, calcPriceForPackage } from '../utils/calcEstimate';
import { Edit2, Trash2, GripVertical, AlertCircle } from 'lucide-react';

interface PackageCardProps {
  pkg: Package;
  onDragStart: (e: React.DragEvent, id: string) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent, targetId: string) => void;
}

export default function PackageCard({ pkg, onDragStart, onDragOver, onDrop }: PackageCardProps) {
  const { setEditingPackage, removePackage, calculationResult, calcDays, calcPetSize } = usePackageStore();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const isMatched = calculationResult?.matchedPackage?.id === pkg.id;
  const sizeOk = isSizeCompatible(pkg, calcPetSize);
  const daysOk = isDaysInRange(pkg, calcDays);

  const estimate = useMemo(() => {
    if (isMatched && calculationResult?.success) {
      return {
        basePrice: calculationResult.breakdown.basePrice,
        discount: calculationResult.breakdown.discount,
        totalPrice: calculationResult.totalPrice,
        dailyRate: calculationResult.breakdown.dailyRate,
        fullMonths: calculationResult.breakdown.fullMonths,
        monthlyTotal: calculationResult.breakdown.monthlyTotal,
        remainingDays: calculationResult.breakdown.remainingDays,
        remainingDaysBase: calculationResult.breakdown.remainingDaysBase,
        remainingDaysDiscount: calculationResult.breakdown.remainingDaysDiscount,
      };
    }
    return calcPriceForPackage(pkg, calcDays);
  }, [pkg, calcDays, isMatched, calculationResult]);

  const handleDelete = () => {
    removePackage(pkg.id);
    setShowDeleteConfirm(false);
  };

  return (
    <div
      draggable={sizeOk}
      onDragStart={(e) => sizeOk && onDragStart(e, pkg.id)}
      onDragOver={onDragOver}
      onDrop={(e) => onDrop(e, pkg.id)}
      className={`relative bg-white rounded-2xl shadow-lg overflow-hidden border-2 transition-all duration-300 ${
        !sizeOk
          ? 'border-gray-300 opacity-60 grayscale'
          : isMatched
            ? 'border-green-500 ring-4 ring-green-200'
            : 'border-transparent hover:shadow-xl'
      }`}
    >
      {isMatched && (
        <div className="absolute top-0 right-0 bg-green-500 text-white px-3 py-1 text-sm font-medium rounded-bl-lg z-10">
          已匹配
        </div>
      )}

      {!sizeOk && (
        <div className="absolute top-0 right-0 bg-gray-400 text-white px-3 py-1 text-sm font-medium rounded-bl-lg z-10 flex items-center gap-1">
          <AlertCircle size={14} />
          体型不符
        </div>
      )}

      <div className={`h-2 bg-gradient-to-r ${PACKAGE_TYPE_COLORS[pkg.type]}`} />

      <div className="p-5">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <div
              className="cursor-grab text-gray-400 hover:text-gray-600 active:cursor-grabbing"
              title="拖拽排序"
            >
              <GripVertical size={20} />
            </div>
            <span className="text-2xl">{PACKAGE_TYPE_ICONS[pkg.type]}</span>
            <div>
              <span className={`inline-block px-2 py-0.5 text-xs rounded-full text-white bg-gradient-to-r ${PACKAGE_TYPE_COLORS[pkg.type]}`}>
                {PACKAGE_TYPE_LABELS[pkg.type]}
              </span>
              <h3 className="font-bold text-lg text-gray-800 mt-1">{pkg.name}</h3>
            </div>
          </div>
          <div className="flex gap-1">
            <button
              onClick={() => setEditingPackage(pkg)}
              className="p-2 text-gray-500 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
              title="编辑"
            >
              <Edit2 size={18} />
            </button>
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="p-2 text-gray-500 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
              title="删除"
            >
              <Trash2 size={18} />
            </button>
          </div>
        </div>

        <p className="text-gray-600 text-sm mb-3">{pkg.description}</p>

        {pkg.promoText && (
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-lg px-3 py-2 mb-3">
            <span className="text-amber-700 text-sm font-medium">🔥 {pkg.promoText}</span>
          </div>
        )}

        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="text-gray-500 text-xs">单日单价</div>
            <div className="text-xl font-bold text-gray-800">¥{pkg.dailyPrice}</div>
          </div>
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="text-gray-500 text-xs">容纳体型</div>
            <div className="text-xl font-bold text-gray-800">{PET_SIZE_LABELS[pkg.maxPetSize]}</div>
          </div>
          {pkg.extendedStayDiscount > 0 && (
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="text-gray-500 text-xs">续住折扣</div>
              <div className="text-xl font-bold text-green-600">{pkg.extendedStayDiscount}%</div>
            </div>
          )}
          {pkg.monthlyPrice && (
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="text-gray-500 text-xs">包月价格</div>
              <div className="text-xl font-bold text-purple-600">¥{pkg.monthlyPrice}</div>
            </div>
          )}
          {(pkg.minDays || pkg.maxDays) && (
            <div className="col-span-2 bg-gray-50 rounded-lg p-3">
              <div className="text-gray-500 text-xs">适用天数</div>
              <div className="text-lg font-bold text-gray-800">
                {pkg.minDays && `${pkg.minDays}天`}
                {pkg.minDays && pkg.maxDays && ' - '}
                {pkg.maxDays && `${pkg.maxDays}天`}
                {pkg.minDays && !pkg.maxDays && ' 以上'}
              </div>
            </div>
          )}
        </div>

        {estimate && (
          <div className={`mt-3 rounded-lg p-3 border-2 ${
            isMatched
              ? 'bg-green-50 border-green-300'
              : !sizeOk
                ? 'bg-gray-100 border-gray-300'
                : !daysOk
                  ? 'bg-amber-50 border-amber-200'
                  : 'bg-blue-50 border-blue-200'
          }`}>
            <div className="flex items-center justify-between">
              <span className={`text-xs font-medium ${
                isMatched
                  ? 'text-green-700'
                  : !sizeOk
                    ? 'text-gray-500'
                    : !daysOk
                      ? 'text-amber-700'
                      : 'text-blue-700'
              }`}>
                {isMatched ? '✓ 匹配价' : !sizeOk ? '体型不符 · 参考价' : !daysOk ? '天数不适用 · 参考价' : '预计费用'}
              </span>
              <span className={`text-lg font-bold ${
                isMatched
                  ? 'text-green-700'
                  : !sizeOk
                    ? 'text-gray-500'
                    : !daysOk
                      ? 'text-amber-600'
                      : 'text-blue-700'
              }`}>
                ¥{estimate.totalPrice}
              </span>
            </div>
            {estimate.fullMonths !== undefined && estimate.fullMonths > 0 && (
              <div className="text-xs text-gray-500 mt-1">
                含{estimate.fullMonths}个月包月 + {estimate.remainingDays}天日计
                {estimate.remainingDaysDiscount! > 0 && ` (续住${pkg.extendedStayDiscount}%折)`}
              </div>
            )}
            {!isMatched && estimate.discount > 0 && estimate.fullMonths === undefined && (
              <div className="text-xs text-gray-500 mt-1">
                含续住{pkg.extendedStayDiscount}%折优惠
              </div>
            )}
          </div>
        )}
      </div>

      {showDeleteConfirm && (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-10">
          <div className="bg-white rounded-xl p-5 m-4 shadow-2xl">
            <p className="text-gray-800 font-medium mb-4">确定要删除这个套餐吗？</p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
              >
                删除
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
