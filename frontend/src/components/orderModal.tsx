import { useCurrency } from '../contexts/currencyContext';

interface Order {
  id: string;
  total: number;
}

interface Props {
  open: boolean;
  type: 'edit' | 'pay' | 'refund' | 'cancel';
  order: Order | null;
  onClose: () => void;
  onConfirm: () => void;
}

export default function OrderModal({
  open,
  type,
  order,
  onClose,
  onConfirm,
}: Props) {
  const { formatPrice } = useCurrency();

  if (!open || !order) return null;

  const titles: Record<typeof type, string> = {
    pay: 'Complete Payment',
    edit: 'Edit Order',
    refund: 'Refund Order',
    cancel: 'Cancel Refund',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
        <h3 className="mb-5 text-lg font-bold text-gray-800">
          {titles[type]} #{order.id}
        </h3>

        <div className="space-y-4 border-t pt-4 text-sm">
          <div className="flex justify-between text-lg font-bold">
            <span>Total</span>
            <span className="text-blue-600">{formatPrice(order.total)}</span>
          </div>
        </div>

        <div className="mt-6 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 rounded-lg border border-gray-400 py-2 text-xs font-medium transition hover:bg-gray-100"
          >
            Cancel
          </button>

          {type !== 'edit' && (
            <button
              onClick={onConfirm}
              className={`flex-1 rounded-lg py-2 text-xs font-medium text-white transition ${
                type === 'pay'
                  ? 'bg-blue-600 hover:bg-blue-700'
                  : type === 'refund'
                    ? 'bg-purple-600 hover:bg-purple-700'
                    : 'bg-orange-500 hover:bg-orange-600'
              }`}
            >
              {type === 'pay' && 'Confirm Payment'}
              {type === 'refund' && 'Issue Refund'}
              {type === 'cancel' && 'Cancel Refund'}
            </button>
          )}

          {type === 'edit' && (
            <button
              onClick={onClose}
              className="flex-1 rounded-lg bg-blue-600 py-2 text-xs font-medium text-white hover:bg-blue-700"
            >
              Save Changes
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
