import { useState, Suspense } from 'react';
import { useTranslation } from 'react-i18next';
import { useCurrency } from '@/global/contexts/currencyContext';
import OrderFilters from '@/receptionist/components/orderFilters';
import OrderListItem from '@/receptionist/components/orderListItem';
import OrderModal from '@/receptionist/components/orderModal';
import Toast from '@/global/components/toast';
import { useNavigate } from 'react-router-dom';
import useSWR from 'swr';
import { useAuth } from '@/global/hooks/auth';

type OrderStatus = 'open' | 'closed' | 'refund_pending' | 'refunded';

type Order = {
  id: number;
  total: number;
  createdAt: Date;
  status: OrderStatus;
};

export type OrderFilter = {
  orderStatus: 'all' | OrderStatus;
  searchTerm?: string;
  from?: string;
  to?: string;
  // Pagination
  limit?: number;
  offset?: number;
};

export type Counts = {
  all: number;
  open: number;
  closed: number;
  refund_pending: number;
  refunded: number;
};

const toQueryString = (filter: OrderFilter) => {
  // TODO: timezones
  const queryArgs = [
    `orderStatus=${filter.orderStatus}`,
    // Search: if numeric, treat as id filter
    filter.searchTerm && /^\d+$/.test(filter.searchTerm.trim())
      ? `id=${filter.searchTerm.trim()}`
      : '',
    filter.from ? `from=${filter.from}` : '',
    filter.to ? `to=${filter.to}` : '',
    // Pagination
    typeof filter.limit === 'number' ? `limit=${filter.limit}` : '',
    typeof filter.offset === 'number' ? `offset=${filter.offset}` : '',
  ].filter(a => a.length > 0);

  return queryArgs.length > 0 ? `?${queryArgs.join('&')}` : '';
};

export default function OrderList() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [orderFilter, setOrderFilter] = useState<OrderFilter>({
    orderStatus: 'all',
    searchTerm: undefined,
    from: undefined,
    to: undefined,
    limit: 10,
    offset: 0,
  });
  const [page, setPage] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState<
    'edit' | 'pay' | 'refund' | 'cancel'
  >('pay');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [toast, setToast] = useState<{
    message: string;
    type: 'success' | 'error';
  } | null>(null);

  const { authFetch } = useAuth();

  const openModal = (
    type: 'edit' | 'pay' | 'refund' | 'cancel',
    order: Order,
  ) => {
    if (type === 'edit') {
      navigate(`/edit-order/${order.id}`);
      return;
    }

    setModalType(type);
    setSelectedOrder(order);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelectedOrder(null);
  };

  const showToast = (
    message: string,
    type: 'success' | 'error' = 'success',
  ) => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 5800);
  };

  // Keep offset in sync with page
  const setPageAndOffset = (newPage: number) => {
    const safePage = Math.max(0, newPage);
    setPage(safePage);
    setOrderFilter(prev => ({ ...prev, offset: safePage * (prev.limit ?? 20) }));
  };

  return (
    <>
      <div className="space-y-6">
        <div className="rounded-lg bg-white p-5 shadow">
          <h2 className="mb-5 text-xl font-bold text-gray-800">
            {t('orders.title')}
          </h2>

          <OrderFilters
            orderFilter={orderFilter}
            setOrderFilter={f => {
              // Reset pagination when filters change
              setPageAndOffset(0);
              setOrderFilter({ ...orderFilter, ...f, offset: 0 });
            }}
          />
        </div>

        <div className="mt-6 space-y-3">
          <Suspense fallback={<div>{t('orders.loading')}</div>}>
            <Orders orderFilter={orderFilter} openModal={openModal} />
          </Suspense>

          {/* Pagination controls */}
          <div className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-3">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">{t('common.page')}</span>
              <span className="rounded bg-gray-100 px-2 py-1 text-sm font-semibold">
                {page + 1}
              </span>
            </div>
            <div className="flex gap-2 items-center">
              <label className="text-sm text-gray-600">
                {t('common.pageSize')}
                <select
                  className="ml-2 rounded border border-gray-300 px-2 py-1 text-sm"
                  value={orderFilter.limit ?? 20}
                  onChange={e => {
                    const newLimit = parseInt(e.target.value) || 20;
                    // reset to first page with new limit
                    setPage(0);
                    setOrderFilter(prev => ({ ...prev, limit: newLimit, offset: 0 }));
                  }}
                >
                  {[10, 20, 50].map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </label>
              <button
                className="rounded-lg border border-gray-300 px-3 py-2 text-sm hover:bg-gray-100 disabled:opacity-50"
                onClick={() => setPageAndOffset(page - 1)}
                disabled={page <= 0}
              >
                {t('common.prev')}
              </button>
              <button
                className="rounded-lg border border-gray-300 px-3 py-2 text-sm hover:bg-gray-100"
                onClick={() => setPageAndOffset(page + 1)}
              >
                {t('common.next')}
              </button>
            </div>
          </div>
        </div>
      </div>

      <OrderModal
        open={modalOpen}
        type={modalType}
        order={selectedOrder}
        onClose={closeModal}
        onConfirm={async refundData => {
          if (!selectedOrder) return;

          if (modalType === 'refund') {
            const response = await authFetch(
              `order/${selectedOrder.id}/ask-refund`,
              'POST',
              JSON.stringify(refundData),
            );

            if (response.ok) {
              showToast(t('orders.toast.refundRequested'));
            } else {
              showToast('Failed to create refund request', 'error');
            }
          } else if (modalType === 'cancel') {
            const response = await authFetch(
              `order/${selectedOrder.id}/ask-refund/cancel`,
              'DELETE',
            );

            if (response.ok) {
              showToast('Canceled refund request.');
            } else {
              showToast('Failed to cancel refund request.', 'error');
            }
          }

          closeModal();
          setOrderFilter(() => {
            return { ...orderFilter, orderStatus: 'closed' };
          });
        }}
      />
      <Toast toast={toast} />
    </>
  );
}

type OrdersProps = {
  orderFilter: OrderFilter;
  openModal: (type: 'edit' | 'pay' | 'refund' | 'cancel', order: Order) => void;
};

function Orders({ orderFilter, openModal }: OrdersProps) {
  const { t } = useTranslation();
  const { formatPrice } = useCurrency();
  const { authFetchJson } = useAuth();

  const { data: orders, error } = useSWR(
    `order${toQueryString(orderFilter)}`,
    (url: string) => authFetchJson<Order[]>(url, 'GET'),
    {
      suspense: true,
      revalidateOnMount: true,
    },
  );

  if (error) {
    return (
      <p className="py-12 text-center text-gray-400">
        {t('somethingWentWrong')}
      </p>
    );
  }

  if (!orders || orders.length < 1) {
    return (
      <p className="py-12 text-center text-gray-400">{t('orders.noOrders')}</p>
    );
  }

  return (
    <>
      {orders?.map(order => (
        <OrderListItem
          key={order.id}
          order={order}
          formatPrice={formatPrice}
          onAction={openModal}
        />
      ))}
    </>
  );
}
