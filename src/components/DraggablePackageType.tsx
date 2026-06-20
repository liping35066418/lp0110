import type { PackageType } from '../types';
import { PACKAGE_TYPE_LABELS, PACKAGE_TYPE_ICONS, PACKAGE_TYPE_COLORS } from '../types';
import { usePackageStore } from '../store/usePackageStore';

interface DraggablePackageTypeProps {
  type: PackageType;
}

export default function DraggablePackageType({ type }: DraggablePackageTypeProps) {
  const { setDraggedType } = usePackageStore();

  const handleDragStart = (e: React.DragEvent) => {
    setDraggedType(type);
    e.dataTransfer.effectAllowed = 'copy';
    e.dataTransfer.setData('packageType', type);
  };

  const handleDragEnd = () => {
    setDraggedType(null);
  };

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      className={`cursor-grab active:cursor-grabbing p-4 rounded-xl bg-gradient-to-r ${PACKAGE_TYPE_COLORS[type]} text-white shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-200 select-none`}
    >
      <div className="flex items-center gap-3">
        <span className="text-3xl">{PACKAGE_TYPE_ICONS[type]}</span>
        <div>
          <div className="font-bold text-lg">{PACKAGE_TYPE_LABELS[type]}</div>
          <div className="text-sm opacity-90">拖拽创建套餐</div>
        </div>
      </div>
    </div>
  );
}
