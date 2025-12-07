import { useTranslation } from 'react-i18next';
import { useState, useEffect } from 'react';
import ManagerLayout from '../components/managerLayout';
import { mockRefundRequests, RefundRequest } from '../mockData';
import RefundApprovalModal from '../components/refundApprovalModal';
import { Clock, DollarSign, AlertTriangle } from 'lucide-react';
import { useCurrency } from '@/global/contexts/currencyContext';
import Toast from '@/global/components/toast';

// Simple Card Component for consistency
const StatCard = ({
  title,
  value,
  subtext,
  icon: Icon,
  iconColor,
}: {
  title: string;
  value: string | number;
  subtext: string;
  icon: React.ElementType;
  iconColor: string;
}) => (
  <div className="flex h-full flex-col justify-between rounded-lg bg-white p-6 shadow-md">
    <div className="flex items-start justify-between">
      <p className="text-sm font-medium text-gray-500 uppercase">{title}</p>
      <Icon className={`h-5 w-5 ${iconColor}`} />
    </div>
    <p className="mt-2 text-3xl font-semibold text-gray-900">{value}</p>
    <p className="mt-1 text-xs text-gray-500">{subtext}</p>
  </div>
);

export default function RefundApprovalsPage() {
  const { t } = useTranslation();
  const { formatPrice } = useCurrency();
  const [requests, setRequests] = useState<RefundRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<RefundRequest | null>(
    null,
  );

  useEffect(() => {
    // Simulate data fetching
    setTimeout(() => {
      setRequests(mockRefundRequests.filter(r => r.status === 'Pending'));
      setIsLoading(false);
    }, 200);
  }, []);

  const [toast, setToast] = useState<{
    message: string;
    type: 'success' | 'error';
  } | null>(null);

  const showToast = (
    message: string,
    type: 'success' | 'error' = 'success',
  ) => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 5800);
  };

  const handleApprove = (id: string) => {
    setIsLoading(true);
    setTimeout(() => {
      setRequests(prev => prev.filter(r => r.id !== id));
      setIsLoading(false);
      showToast(t('manager.refunds.approved', { id }));
    }, 200);
  };

  const handleReject = (id: string, reason: string) => {
    setIsLoading(true);
    setTimeout(() => {
      setRequests(prev => prev.filter(r => r.id !== id));
      setIsLoading(false);
      showToast(t('manager.refunds.rejected', { id, reason }));
    }, 200);
  };

  const openModal = (request: RefundRequest) => {
    setSelectedRequest(request);
    setModalOpen(true);
  };

  const closeModal = () => {
    setSelectedRequest(null);
    setModalOpen(false);
  };

  const pendingRequests = requests.filter(r => r.status === 'Pending');

  // Mock stats for the cards
  const totalPendingAmount = pendingRequests.reduce(
    (sum, req) => sum + req.amount,
    0,
  );
  const pendingCount = pendingRequests.length;
  const avgResponseTime = '8 min'; // Mock value

  const statCards = [
    {
      key: 'pendingRequests',
      value: pendingCount,
      icon: AlertTriangle,
      iconColor: 'text-yellow-500',
    },
    {
      key: 'totalAmount',
      value: `${formatPrice(totalPendingAmount)}`,
      icon: DollarSign,
      iconColor: 'text-green-500',
    },
    {
      key: 'avgResponse',
      value: avgResponseTime,
      icon: Clock,
      iconColor: 'text-green-500',
    },
  ];

  return (
    <ManagerLayout>
      <header className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900">
          {t('manager.refunds.pageTitle')}
        </h1>
        <p className="text-sm text-gray-500">
          {t('manager.refunds.pageSubtitle')}
        </p>
      </header>

      {/* Stat Cards */}
      <section className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-3">
        {statCards.map(card => (
          <StatCard
            key={card.key}
            title={t(`manager.refunds.stats.${card.key}.title`)}
            value={card.value}
            subtext={t(`manager.refunds.stats.${card.key}.subtext`)}
            icon={card.icon}
            iconColor={card.iconColor}
          />
        ))}
      </section>

      {/* Refund Request Cards */}
      <section className="space-y-6">
        {isLoading ? (
          <div className="space-y-4">
            <div className="h-40 w-full animate-pulse rounded-lg bg-gray-200 shadow-md"></div>
            <div className="h-40 w-full animate-pulse rounded-lg bg-gray-200 shadow-md"></div>
          </div>
        ) : pendingRequests.length === 0 ? (
          <p className="py-10 text-center text-gray-500">
            {t('manager.refunds.noRefunds')}
          </p>
        ) : (
          pendingRequests.map(request => (
            <div
              key={request.id}
              className="rounded-lg border-l-4 border-yellow-500 bg-white p-6 shadow-md"
            >
              <div className="mb-4 flex items-start justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">
                    {t('manager.refunds.card.orderTitle', {
                      orderId: request.orderId,
                    })}
                  </h2>
                  <p className="text-xs text-gray-500">
                    {t('manager.refunds.card.requestMeta', {
                      id: request.id,
                      date: request.date,
                    })}
                  </p>
                </div>
                <span className="rounded-full bg-yellow-100 px-3 py-1 text-xs font-medium text-yellow-800">
                  {t('manager.refunds.card.status')}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4 border-t pt-4">
                <div>
                  <p className="mb-1 text-xs font-medium text-gray-500 uppercase">
                    {t('manager.refunds.card.customerInfo')}
                  </p>
                  <p className="text-base font-medium text-gray-900">
                    {request.customerName}
                  </p>
                  <p className="text-sm text-gray-500">
                    {t('manager.refunds.card.requestedBy', {
                      user: request.requestedBy,
                    })}
                  </p>
                </div>

                <div className="text-right">
                  <p className="mb-1 text-xs font-medium text-gray-500 uppercase">
                    {t('manager.refunds.card.refundAmount')}
                  </p>
                  <p className="text-xl font-bold text-gray-900">
                    {formatPrice(request.amount)}
                  </p>
                  <p className="text-sm text-gray-500">
                    {t('manager.refunds.card.branch')}
                  </p>
                </div>
              </div>

              <div className="mt-4 border-t pt-4">
                <p className="mb-2 text-xs font-medium text-gray-500 uppercase">
                  {t('manager.refunds.card.reasonTitle')}
                </p>
                <p className="mb-4 text-base font-medium text-red-600">
                  {t(request.reason)}
                </p>

                <p className="mb-1 text-xs font-medium text-gray-500 uppercase">
                  {t('manager.refunds.card.itemsTitle')}
                </p>
                <div className="space-y-1">
                  {request.orderItems.map((item, index) => (
                    <div
                      key={index}
                      className="flex justify-between text-sm text-gray-700"
                    >
                      <span>
                        {item.quantity}x {t(item.name)}
                      </span>
                      <span>{formatPrice(item.quantity * item.price)}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-6 flex border-t pt-4">
                <button
                  onClick={() => openModal(request)}
                  className="flex flex-1 items-center justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-base font-medium text-white shadow-sm transition-colors hover:bg-indigo-700"
                >
                  {t('manager.refunds.review')}
                </button>
              </div>
            </div>
          ))
        )}
      </section>

      {selectedRequest && (
        <RefundApprovalModal
          request={selectedRequest}
          isOpen={modalOpen}
          onClose={closeModal}
          onApprove={handleApprove}
          onReject={handleReject}
        />
      )}
      <Toast toast={toast} />
    </ManagerLayout>
  );
}
