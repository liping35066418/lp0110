import { useState, useEffect } from 'react';
import type { Package, PackageType, PetSize } from '../types';
import { PACKAGE_TYPE_LABELS, PACKAGE_TYPE_ICONS, PACKAGE_TYPE_COLORS, PET_SIZE_LABELS } from '../types';
import { usePackageStore } from '../store/usePackageStore';
import { X } from 'lucide-react';

interface PackageEditorProps {
  isNew?: boolean;
  initialType?: PackageType;
  onClose?: () => void;
}

export default function PackageEditor({ isNew = false, initialType, onClose }: PackageEditorProps) {
  const { editingPackage, setEditingPackage, addPackage, updatePackageById, packages } = usePackageStore();

  const [validationError, setValidationError] = useState<string | null>(null);

  const handleClose = () => {
    setEditingPackage(null);
    onClose?.();
  };

  const pkg = editingPackage;
  const [formData, setFormData] = useState<Partial<Package>>({
    type: initialType || 'daycare',
    name: '',
    description: '',
    promoText: '',
    maxPetSize: 'medium',
    dailyPrice: 100,
    extendedStayDiscount: 0,
    minDays: undefined,
    maxDays: undefined,
    monthlyPrice: undefined,
    order: 1,
  });

  useEffect(() => {
    if (isNew && initialType) {
      const defaults: Record<string, Partial<Package>> = {
        daycare: {
          name: '日托套餐',
          description: '白天专人看护，适合上班族',
          promoText: '首单立减20元',
          dailyPrice: 88,
          maxPetSize: 'large',
          extendedStayDiscount: 0,
          minDays: 1,
          maxDays: 1,
        },
        shortstay: {
          name: '短期寄养套餐',
          description: '2-14天短期寄养，独立空间',
          promoText: '连住3天享9折',
          dailyPrice: 128,
          maxPetSize: 'large',
          extendedStayDiscount: 10,
          minDays: 2,
          maxDays: 14,
        },
        longstay: {
          name: '长期包月套餐',
          description: '30天以上长期寄养，优惠多多',
          promoText: '包月立省500元',
          dailyPrice: 98,
          maxPetSize: 'medium',
          extendedStayDiscount: 20,
          monthlyPrice: 2580,
          minDays: 30,
        },
      };
      setFormData({
        ...defaults[initialType],
        type: initialType,
        order: packages.length + 1,
      });
    } else if (pkg && !isNew) {
      setFormData(pkg);
    }
  }, [pkg, isNew, initialType, packages.length]);

  const handleChange = (field: keyof Package, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (validationError) setValidationError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    if (!formData.type || !formData.name || !formData.dailyPrice) {
      setValidationError('请填写必填项');
      return;
    }

    const minDays = formData.minDays !== undefined && formData.minDays !== null && formData.minDays !== '' 
      ? Number(formData.minDays) 
      : undefined;
    const maxDays = formData.maxDays !== undefined && formData.maxDays !== null && formData.maxDays !== '' 
      ? Number(formData.maxDays) 
      : undefined;
    const discount = formData.extendedStayDiscount !== undefined && formData.extendedStayDiscount !== null
      ? Number(formData.extendedStayDiscount)
      : 0;

    if (isNaN(minDays!) && minDays !== undefined) {
      setValidationError('最少天数格式不正确');
      return;
    }
    if (isNaN(maxDays!) && maxDays !== undefined) {
      setValidationError('最多天数格式不正确');
      return;
    }
    if (isNaN(discount)) {
      setValidationError('续住折扣格式不正确');
      return;
    }

    if (minDays !== undefined && maxDays !== undefined && minDays > maxDays) {
      setValidationError('最少天数不能大于最多天数');
      return;
    }

    if (discount < 0 || discount > 100) {
      setValidationError('续住折扣必须在0到100之间');
      return;
    }

    const submitData = {
      type: formData.type as PackageType,
      name: formData.name!,
      description: formData.description || '',
      promoText: formData.promoText || '',
      maxPetSize: formData.maxPetSize as PetSize,
      dailyPrice: Number(formData.dailyPrice),
      extendedStayDiscount: discount,
      minDays,
      maxDays,
      monthlyPrice: formData.monthlyPrice ? Number(formData.monthlyPrice) : undefined,
      order: formData.order || packages.length + 1,
    };

    try {
      if (isNew) {
        await addPackage(submitData);
        handleClose();
      } else if (pkg) {
        await updatePackageById(pkg.id, submitData);
        handleClose();
      }
    } catch (err) {
      setValidationError((err as Error).message || '保存失败，请重试');
    }
  };

  const typeOptions: { value: PackageType; label: string }[] = [
    { value: 'daycare', label: '日托' },
    { value: 'shortstay', label: '短期寄养' },
    { value: 'longstay', label: '长期包月' },
  ];

  const sizeOptions: { value: PetSize; label: string }[] = [
    { value: 'small', label: '小型' },
    { value: 'medium', label: '中型' },
    { value: 'large', label: '大型' },
    { value: 'xlarge', label: '超大型' },
  ];

  if (!pkg && !isNew) return null;
  if (isNew && !initialType) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        <div className={`bg-gradient-to-r ${PACKAGE_TYPE_COLORS[formData.type as PackageType]} p-5 text-white flex items-center justify-between`}>
          <div className="flex items-center gap-3">
            <span className="text-3xl">{PACKAGE_TYPE_ICONS[formData.type as PackageType]}</span>
            <div>
              <h2 className="text-xl font-bold">
                {isNew ? '创建' : '编辑'}{PACKAGE_TYPE_LABELS[formData.type as PackageType]}套餐
              </h2>
              <p className="text-sm opacity-90">自定义套餐参数与宣传文案</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto max-h-[calc(90vh-180px)]">
          {validationError && (
            <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-3 text-red-600 text-sm font-medium">
              {validationError}
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">套餐类型</label>
              <div className="grid grid-cols-3 gap-2">
                {typeOptions.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => handleChange('type', opt.value)}
                    className={`p-3 rounded-lg border-2 transition-all ${
                      formData.type === opt.value
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <span className="text-xl mr-1">{PACKAGE_TYPE_ICONS[opt.value]}</span>
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">套餐名称 *</label>
              <input
                type="text"
                value={formData.name || ''}
                onChange={(e) => handleChange('name', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="请输入套餐名称"
                required
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">套餐描述</label>
              <textarea
                value={formData.description || ''}
                onChange={(e) => handleChange('description', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={2}
                placeholder="简要描述套餐内容"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">宣传文案</label>
              <input
                type="text"
                value={formData.promoText || ''}
                onChange={(e) => handleChange('promoText', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="例如：首单立减50元"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">单日单价 (元) *</label>
              <input
                type="number"
                value={formData.dailyPrice || ''}
                onChange={(e) => handleChange('dailyPrice', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                min="0"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">最大容纳体型 *</label>
              <select
                value={formData.maxPetSize || 'medium'}
                onChange={(e) => handleChange('maxPetSize', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {sizeOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">续住折扣 (%)</label>
              <input
                type="number"
                value={formData.extendedStayDiscount || 0}
                onChange={(e) => handleChange('extendedStayDiscount', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                min="0"
                max="100"
              />
              <p className="text-xs text-gray-500 mt-1">连续住3天以上生效</p>
            </div>

            {formData.type === 'longstay' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">包月价格 (元)</label>
                <input
                  type="number"
                  value={formData.monthlyPrice || ''}
                  onChange={(e) => handleChange('monthlyPrice', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  min="0"
                  placeholder="30天优惠价"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">最少天数</label>
              <input
                type="number"
                value={formData.minDays || ''}
                onChange={(e) => handleChange('minDays', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                min="1"
                placeholder="不限留空"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">最多天数</label>
              <input
                type="number"
                value={formData.maxDays || ''}
                onChange={(e) => handleChange('maxDays', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                min="1"
                placeholder="不限留空"
              />
            </div>
          </div>

          <div className="flex gap-3 justify-end mt-6 pt-4 border-t">
            <button
              type="button"
              onClick={handleClose}
              className="px-6 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              取消
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg hover:from-blue-600 hover:to-indigo-700 transition-all shadow-lg"
            >
              {isNew ? '创建套餐' : '保存修改'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
