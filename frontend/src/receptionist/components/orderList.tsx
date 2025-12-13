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
    filter.searchTerm  ? `includes=${filter.searchTerm}`  : '',
    filter.from        ? `from=${filter.from}`            : '',
    filter.to          ? `to=${filter.to}`                : '',
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
  });
  const [orders, setOrders] = useState<Order[]>([]);
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
  const { data: counts } = useSWR(
    `order/counts${toQueryString(orderFilter)}`,
    (url) => authFetch<Counts>(url, "GET"),
    {
      revalidateOnMount: true,
    }
  );

  const openModal = (
    type: 'edit' | 'pay' | 'refund' | 'cancel',
    order: Order,
  ) => {
    if (type === 'edit') {
      navigate(`/edit-order/${order.id}`);
    } else {
      setModalType(type);
      setSelectedOrder(order);
      setModalOpen(true);
    }
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelectedOrder(null);
  };

  const updateOrderStatus = (id: number, status: OrderStatus) => {
    setOrders(prev => prev.map(o => (o.id === id ? { ...o, status } : o)));
    closeModal();
  };

  const showToast = (
    message: string,
    type: 'success' | 'error' = 'success',
  ) => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 5800);
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
            setOrderFilter={setOrderFilter}
            counts={counts}
          />
        </div>

        <div className="mt-6 space-y-3">
          <Suspense fallback={<div>Loading...</div>}>
            <Orders 
              orderFilter={orderFilter}
              openModal={openModal} />
          </Suspense>
        </div>
      </div>

      <OrderModal
        open={modalOpen}
        type={modalType}
        order={selectedOrder}
        onClose={closeModal}
        onConfirm={() => {
          if (!selectedOrder) return;

          switch (modalType) {
            case 'pay':
              updateOrderStatus(selectedOrder.id, 'closed');
              break;
            case 'refund':
              updateOrderStatus(selectedOrder.id, 'refund_pending');
              showToast(t('orders.toast.refundRequested'));
              break;
            case 'cancel':
              updateOrderStatus(selectedOrder.id, 'closed');
              showToast(t('orders.toast.refundCancelled'));
              break;
            default:
              break;
          }
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
  const { authFetch } = useAuth();

  const { data: orders, error } = useSWR(
    `order${toQueryString(orderFilter)}`,
    (url: string) => authFetch<Order[]>(url, "GET"),
    {
      suspense: true,
      revalidateOnMount: true,
    }
  );

  if (error) {
    // TODO: translations
    return (
        <p className="py-12 text-center text-gray-400">
          Something went wrong.
        </p>
    );
  }

  if (orders.length < 1) {
    return (
        <p className="py-12 text-center text-gray-400">
          {t('orders.noOrders')}
        </p>
    );
  }

  return (
    <>
      {
        orders?.map(order => (
          <OrderListItem
            key={order.id}
            order={order}
            formatPrice={formatPrice}
            onAction={openModal}
          />
        ))
      }
    </>
  );
}
