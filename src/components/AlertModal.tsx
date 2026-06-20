import { usePackageStore } from '../store/usePackageStore';
import { AlertTriangle, X } from 'lucide-react';

export default function AlertModal() {
  const { showAlert, alertMessage, setShowAlert } = usePackageStore();

  if (!showAlert) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-slideUp">
        <div className="bg-gradient-to-r from-red-500 to-rose-600 p-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-white/20 rounded-full">
                <AlertTriangle size={28} />
              </div>
              <div>
                <h3 className="text-xl font-bold">无法计算</h3>
                <p className="text-sm opacity-90">寄养方案不匹配</p>
              </div>
            </div>
            <button
              onClick={() => setShowAlert(false)}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        <div className="p-6">
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
            <p className="text-red-700 text-center">{alertMessage}</p>
          </div>

          <div className="space-y-3 text-sm text-gray-600">
            <h4 className="font-medium text-gray-800">可能的原因：</h4>
            <ul className="space-y-2 list-disc list-inside">
              <li>宠物体型超出套餐容纳范围</li>
              <li>寄养天数不在套餐适用范围内</li>
              <li>当前没有配置符合条件的套餐</li>
            </ul>
          </div>

          <div className="mt-6 pt-4 border-t">
            <button
              onClick={() => setShowAlert(false)}
              className="w-full py-3 bg-gradient-to-r from-red-500 to-rose-600 text-white rounded-xl font-medium hover:from-red-600 hover:to-rose-700 transition-all shadow-lg"
            >
              我知道了
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px) scale(0.95); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
        .animate-slideUp {
          animation: slideUp 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}
