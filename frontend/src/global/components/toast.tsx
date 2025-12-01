'use client';

import SuccessIcon from '@/icons/successIcon';
import ErrorIcon from '@/icons/errorIcon';

type ToastProps = {
  toast: { message: string; type: 'success' | 'error' } | null;
};

export default function Toast({ toast }: ToastProps) {
  if (!toast) return null;

  return (
    <div
      key={toast.message}
      className="fixed top-20 right-4 z-50 max-w-sm"
      style={{
        animation:
          'slideIn 0.5s ease-out forwards, fadeOut 0.8s ease-in forwards 5s',
      }}
    >
      <div
        className={`flex items-start gap-4 rounded-xl border-l-8 bg-white p-5 shadow-2xl ${
          toast.type === 'success' ? 'border-green-500' : 'border-orange-400'
        }`}
      >
        <div className="shrink-0">
          {toast.type === 'success' ? (
            <SuccessIcon className="h-8 w-8 text-green-500" />
          ) : (
            <ErrorIcon className="h-8 w-8 text-orange-400" />
          )}
        </div>
        <div className="flex-1 text-sm font-medium whitespace-pre-line text-gray-800">
          {toast.message}
        </div>
      </div>
    </div>
  );
}
