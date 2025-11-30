import { useState, useEffect, useMemo } from 'react';
import { useCurrency } from '../contexts/currencyContext';
import OrderFilters from './orderFilters';
import OrderListItem from './orderListItem';
import OrderModal from './orderModal';
import Toast from './toast';

interface Order {
  id: string;
  total: number;
  createdAt: Date;
  status: 'active' | 'closed' | 'refund_pending';
}

export default function OrderList() {
  const { formatPrice } = useCurrency();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [timeFrom, setTimeFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [timeTo, setTimeTo] = useState('');
  const [filterStatus, setFilterStatus] = useState<
    'all' | 'open' | 'closed' | 'pending'
  >('open');
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState<
    'edit' | 'pay' | 'refund' | 'cancel'
  >('pay');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [toast, setToast] = useState<{
    message: string;
    type: 'success' | 'error';
  } | null>(null);

  useEffect(() => {
    const load = async () => {
      await new Promise(r => setTimeout(r, 500));
      const mock: Order[] = [
        {
          id: '1821',
          total: 87.4,
          createdAt: new Date('2025-11-25T16:45:00'),
          status: 'active',
        },
        {
          id: '1820',
          total: 54.0,
          createdAt: new Date('2025-11-25T16:30:00'),
          status: 'active',
        },
        {
          id: '1819',
          total: 12.5,
          createdAt: new Date('2025-11-25T16:20:00'),
          status: 'active',
        },
        {
          id: '1818',
          total: 178.9,
          createdAt: new Date('2025-11-25T15:55:00'),
          status: 'active',
        },
        {
          id: '1817',
          total: 31.2,
          createdAt: new Date('2025-11-25T15:10:00'),
          status: 'closed',
        },
        {
          id: '1816',
          total: 92.0,
          createdAt: new Date('2025-11-25T14:40:00'),
          status: 'closed',
        },
        {
          id: '1815',
          total: 45.0,
          createdAt: new Date('2025-11-25T13:20:00'),
          status: 'refund_pending',
        },
      ];
      setOrders(mock);
      setLoading(false);
    };
    load();
  }, []);

  const sortedAndFiltered = useMemo(() => {
    const buildDateTime = (
      dateStr: string,
      timeStr: string,
      isEnd: boolean = false,
    ) => {
      if (!dateStr) return null;

      let time = timeStr;
      if (!time) {
        time = isEnd ? '23:59' : '00:00';
      }

      return new Date(`${dateStr}T${time}`);
    };

    const fromDateTime = buildDateTime(dateFrom, timeFrom, false);
    const toDateTime = buildDateTime(dateTo, timeTo, true);

    let filtered = orders.filter(o => {
      if (filterStatus === 'open' && o.status !== 'active') return false;
      if (filterStatus === 'closed' && o.status !== 'closed') return false;
      if (filterStatus === 'pending' && o.status !== 'refund_pending')
        return false;
      if (searchTerm && !o.id.includes(searchTerm)) return false;
      const orderTime = o.createdAt.getTime();
      if (fromDateTime && orderTime < fromDateTime.getTime()) return false;
      if (toDateTime && orderTime > toDateTime.getTime()) return false;
      return true;
    });

    return [...filtered].sort((a, b) => {
      const order = { active: 0, refund_pending: 1, closed: 2 };
      const diff = order[a.status] - order[b.status];
      return diff !== 0 ? diff : parseInt(b.id) - parseInt(a.id);
    });
  }, [orders, filterStatus, searchTerm, dateFrom, timeFrom, dateTo, timeTo]);

  const openModal = (
    type: 'edit' | 'pay' | 'refund' | 'cancel',
    order: Order,
  ) => {
    setModalType(type);
    setSelectedOrder(order);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelectedOrder(null);
  };

  const updateOrderStatus = (id: string, status: Order['status']) => {
    setOrders(prev => prev.map(o => (o.id === id ? { ...o, status } : o)));
    closeModal();
  };

  if (loading)
    return (
      <div className="p-10 text-center text-gray-500">Loading orders...</div>
    );

  const counts = {
    all: orders.length,
    open: orders.filter(o => o.status === 'active').length,
    closed: orders.filter(o => o.status === 'closed').length,
    pending: orders.filter(o => o.status === 'refund_pending').length,
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
          <h2 className="mb-5 text-xl font-bold text-gray-800">Orders</h2>

          <OrderFilters
            filterStatus={filterStatus}
            setFilterStatus={setFilterStatus}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            dateFrom={dateFrom}
            setDateFrom={setDateFrom}
            timeFrom={timeFrom}
            setTimeFrom={setTimeFrom}
            dateTo={dateTo}
            setDateTo={setDateTo}
            timeTo={timeTo}
            setTimeTo={setTimeTo}
            counts={counts}
          />
        </div>

        <div className="mt-6 space-y-3">
          {sortedAndFiltered.length === 0 ? (
            <p className="py-12 text-center text-gray-400">No orders found</p>
          ) : (
            sortedAndFiltered.map(order => (
              <OrderListItem
                key={order.id}
                order={order}
                formatPrice={formatPrice}
                onAction={openModal}
              />
            ))
          )}
        </div>
      </div>

      <OrderModal
        open={modalOpen}
        type={modalType}
        order={selectedOrder}
        onClose={closeModal}
        onConfirm={() => {
          if (!selectedOrder) return;

          if (modalType === 'pay') {
            updateOrderStatus(selectedOrder.id, 'closed');
          }

          if (modalType === 'refund') {
            updateOrderStatus(selectedOrder.id, 'refund_pending');
            showToast('Order refund request sent successfully.');
          }

          if (modalType === 'cancel') {
            updateOrderStatus(selectedOrder.id, 'closed');
            showToast('Order refund request cancelled.');
          }
        }}
      />
      <Toast toast={toast} />
    </>
  );
}
