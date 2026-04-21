import { useApp } from '../contexts/AppContext';

function ToastItem({ toast, onRemove }) {
  const colors = {
    success: 'bg-green-700 border-green-500',
    error: 'bg-red-800 border-red-600',
    info: 'bg-gray-700 border-gray-500',
  };

  return (
    <div
      className={`flex items-center gap-3 px-4 py-3 rounded-lg border text-white text-sm shadow-xl animate-fade-in ${colors[toast.type] || colors.success}`}
      style={{ animation: 'slideIn 0.3s ease' }}
    >
      <span className="text-lg">
        {toast.type === 'success' ? '✅' : toast.type === 'error' ? '❌' : 'ℹ️'}
      </span>
      <span className="flex-1">{toast.message}</span>
      <button
        onClick={() => onRemove(toast.id)}
        className="ml-2 text-white/60 hover:text-white text-lg leading-none"
      >
        ×
      </button>
    </div>
  );
}

export default function ToastContainer() {
  const { toasts, removeToast } = useApp();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-2 max-w-sm w-full">
      <style>{`
        @keyframes slideIn {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
      `}</style>
      {toasts.map(t => (
        <ToastItem key={t.id} toast={t} onRemove={removeToast} />
      ))}
    </div>
  );
}
