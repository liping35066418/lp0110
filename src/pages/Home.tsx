import { useEffect, useState, useCallback } from 'react';
import { usePackageStore } from '../store/usePackageStore';
import DraggablePackageType from '../components/DraggablePackageType';
import PackageCard from '../components/PackageCard';
import PackageEditor from '../components/PackageEditor';
import PriceCalculator from '../components/PriceCalculator';
import AlertModal from '../components/AlertModal';
import type { PackageType } from '../types';
import { PACKAGE_TYPE_LABELS, PACKAGE_TYPE_ICONS } from '../types';
import { PawPrint, Plus, Package, Settings } from 'lucide-react';

export default function Home() {
  const {
    packages,
    loadPackages,
    reorder,
    setEditingPackage,
    draggedType,
    setDraggedType,
    loading,
  } = usePackageStore();

  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [showNewEditor, setShowNewEditor] = useState(false);
  const [newPackageType, setNewPackageType] = useState<PackageType | undefined>(undefined);
  const [isDragOver, setIsDragOver] = useState(false);

  useEffect(() => {
    loadPackages();
  }, [loadPackages]);

  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDraggedId(id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    if (!draggedId || draggedId === targetId) {
      setDraggedId(null);
      return;
    }

    const newOrder = packages.map((p) => p.id);
    const draggedIndex = newOrder.indexOf(draggedId);
    const targetIndex = newOrder.indexOf(targetId);

    newOrder.splice(draggedIndex, 1);
    newOrder.splice(targetIndex, 0, draggedId);

    reorder(newOrder);
    setDraggedId(null);
  };

  const handleAreaDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (draggedType) {
      setIsDragOver(true);
      e.dataTransfer.dropEffect = 'copy';
    }
  };

  const handleAreaDragLeave = () => {
    setIsDragOver(false);
  };

  const handleAreaDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const type = e.dataTransfer.getData('packageType') as PackageType;
    if (type) {
      setNewPackageType(type);
      setShowNewEditor(true);
    }
    setDraggedType(null);
  };

  const handleQuickCreate = (type: PackageType) => {
    setNewPackageType(type);
    setShowNewEditor(true);
  };

  const handleCloseNewEditor = useCallback(() => {
    setShowNewEditor(false);
    setNewPackageType(undefined);
  }, []);

  const packageTypes: PackageType[] = ['daycare', 'shortstay', 'longstay'];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <header className="bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-40 border-b border-slate-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl text-white">
                <PawPrint size={28} />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-800">寄养套餐计费演算系统</h1>
                <p className="text-sm text-slate-500">调试页面 · 3871端口 · 后端服务8880端口</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <span>在线调试中</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-3 space-y-6">
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex items-center gap-2 mb-4">
                <Package size={20} className="text-blue-500" />
                <h2 className="text-lg font-bold text-slate-800">组件面板</h2>
              </div>
              <p className="text-sm text-slate-500 mb-4">拖拽下方组件到右侧套餐区域创建新套餐</p>
              <div className="space-y-3">
                {packageTypes.map((type) => (
                  <DraggablePackageType key={type} type={type} />
                ))}
              </div>
              <div className="mt-4 pt-4 border-t border-slate-100">
                <p className="text-sm text-slate-500 mb-3">或点击快速创建</p>
                <div className="grid grid-cols-3 gap-2">
                  {packageTypes.map((type) => (
                    <button
                      key={type}
                      onClick={() => handleQuickCreate(type)}
                      className="p-2 rounded-lg border-2 border-dashed border-slate-200 hover:border-blue-400 hover:bg-blue-50 transition-all text-center"
                    >
                      <div className="text-xl">{PACKAGE_TYPE_ICONS[type]}</div>
                      <div className="text-xs text-slate-600 mt-1">{PACKAGE_TYPE_LABELS[type]}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex items-center gap-2 mb-4">
                <Settings size={20} className="text-blue-500" />
                <h2 className="text-lg font-bold text-slate-800">操作说明</h2>
              </div>
              <ul className="space-y-3 text-sm text-slate-600">
                <li className="flex items-start gap-2">
                  <span className="text-blue-500 mt-0.5">1.</span>
                  <span>拖拽左侧组件到套餐区域创建新套餐</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-500 mt-0.5">2.</span>
                  <span>拖拽套餐卡片可调整显示顺序</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-500 mt-0.5">3.</span>
                  <span>点击编辑按钮修改套餐参数</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-500 mt-0.5">4.</span>
                  <span>右侧计算器输入天数和体型自动计费</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-500 mt-0.5">5.</span>
                  <span>超出套餐体型会弹窗提示拦截</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="lg:col-span-6 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                <span className="text-2xl">📋</span>
                寄养套餐列表
                <span className="text-sm font-normal text-slate-500">({packages.length}个套餐)</span>
              </h2>
              <button
                onClick={() => handleQuickCreate('daycare')}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl hover:from-blue-600 hover:to-indigo-700 transition-all shadow-lg"
              >
                <Plus size={18} />
                新建套餐
              </button>
            </div>

            <div
              onDragOver={handleAreaDragOver}
              onDragLeave={handleAreaDragLeave}
              onDrop={handleAreaDrop}
              className={`min-h-[400px] rounded-2xl border-2 border-dashed transition-all duration-300 p-6 ${
                isDragOver
                  ? 'border-blue-500 bg-blue-50 scale-[1.01]'
                  : 'border-slate-200 bg-white shadow-lg'
              }`}
            >
              {packages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-slate-400 py-20">
                  <div className="text-6xl mb-4">📦</div>
                  <p className="text-lg font-medium">拖拽左侧组件到此处创建套餐</p>
                  <p className="text-sm mt-2">或点击左上角按钮快速创建</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {packages.map((pkg, index) => (
                    <PackageCard
                      key={pkg.id}
                      pkg={pkg}
                      index={index}
                      onDragStart={handleDragStart}
                      onDragOver={handleDragOver}
                      onDrop={handleDrop}
                    />
                  ))}
                </div>
              )}

              {isDragOver && draggedType && (
                <div className="absolute inset-0 flex items-center justify-center bg-blue-500/10 rounded-2xl pointer-events-none">
                  <div className="bg-white px-6 py-4 rounded-xl shadow-xl flex items-center gap-3">
                    <span className="text-3xl">{PACKAGE_TYPE_ICONS[draggedType]}</span>
                    <span className="text-lg font-medium text-blue-700">
                      释放创建{PACKAGE_TYPE_LABELS[draggedType]}套餐
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="lg:col-span-3">
            <PriceCalculator />
          </div>
        </div>
      </main>

      {showNewEditor && newPackageType && (
        <PackageEditor isNew initialType={newPackageType} onClose={handleCloseNewEditor} />
      )}
      <PackageEditor />

      <AlertModal />

      {loading && (
        <div className="fixed bottom-6 right-6 bg-slate-800 text-white px-4 py-2 rounded-full shadow-lg flex items-center gap-2 z-50">
          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          <span className="text-sm">处理中...</span>
        </div>
      )}
    </div>
  );
}
