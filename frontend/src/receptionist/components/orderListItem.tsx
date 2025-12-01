import { formatDateTime } from '@/utils/formatDateTime';

interface Order {
  id: string;
  total: number;
  createdAt: Date;
  status: 'active' | 'closed' | 'refund_pending';
}

interface Props {
  order: Order;
  formatPrice: (value: number) => string;
  onAction: (type: 'edit' | 'pay' | 'refund' | 'cancel', order: Order) => void;
}

export default function OrderListItem({ order, formatPrice, onAction }: Props) {
  return (
    <div className="group rounded-lg bg-white p-5 shadow-sm transition-all hover:shadow-lg hover:ring-2 hover:ring-blue-500/20">
      <div className="flex items-center justify-between gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex items-baseline gap-3">
            <h3 className="text-xl font-bold text-blue-600">#{order.id}</h3>
            <span className="text-sm text-gray-500">
              {formatDateTime(order.createdAt)}
            </span>
          </div>
        </div>

        <div className="text-right">
          <div className="text-2xl font-bold text-gray-900">
            {formatPrice(order.total)}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {order.status === 'active' ? (
            <>
              <button
                onClick={() => onAction('edit', order)}
                className="rounded-lg border border-gray-300 px-4 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50"
              >
                Edit
              </button>
              <button
                onClick={() => onAction('pay', order)}
                className="rounded-lg bg-blue-600 px-5 py-2 text-xs font-medium text-white shadow-sm hover:bg-blue-700"
              >
                Close
              </button>
            </>
          ) : order.status === 'closed' ? (
            <button
              onClick={() => onAction('refund', order)}
              className="rounded-lg border border-purple-400 bg-purple-50 px-5 py-2 text-xs font-medium text-purple-700 hover:bg-purple-100"
            >
              Refund
            </button>
          ) : (
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-orange-600">
                Refund in progress
              </span>
              <button
                onClick={() => onAction('cancel', order)}
                className="rounded-lg border border-orange-400 bg-orange-50 px-5 py-2 text-xs font-medium text-orange-700 hover:bg-orange-100"
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
