import { useTranslation } from 'react-i18next';
import { useState, useEffect, useCallback } from 'react';
import ManagerLayout from '../components/managerLayout';
import { Refund, getPendingRefunds, processRefundAction } from '@/utils/refundService';
import RefundApprovalModal from '../components/refundApprovalModal';
import { Clock, DollarSign, AlertTriangle } from 'lucide-react';

// Simple Card Component for consistency
const StatCard = ({ title, value, subtext, icon: Icon, iconColor }: { title: string, value: string | number, subtext: string, icon: React.ElementType, iconColor: string }) => (
  <div className="bg-white p-6 rounded-lg shadow-md flex flex-col justify-between h-full">
    <div className="flex justify-between items-start">
      <p className="text-sm font-medium text-gray-500 uppercase">{title}</p>
      <Icon className={`w-5 h-5 ${iconColor}`} />
    </div>
    <p className="mt-2 text-3xl font-semibold text-gray-900">{value}</p>
    <p className="text-xs text-gray-500 mt-1">{subtext}</p>
  </div>
);

export default function RefundApprovalsPage() {
  const { t } = useTranslation();
  const [requests, setRequests] = useState<Refund[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<Refund | null>(null);

  const fetchRefunds = useCallback(async () => {
    setIsLoading(true);
    try {
      const pendingRefunds = await getPendingRefunds();
      setRequests(pendingRefunds || []); // Ensure it's always an array
    } catch (error) {
      console.error('Failed to fetch pending refunds:', error);
      setRequests([]); // Set to empty array on error
      alert('Failed to fetch pending refunds. Check console for details.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRefunds();
  }, [fetchRefunds]);

  const handleApprove = async () => {
    if (!selectedRequest) return;

    const refundId = selectedRequest.id;

    try {
      const response = await processRefundAction(refundId, 'approve');
      await fetchRefunds(); // Re-fetch to update the list
      alert(response.message);
    } catch (error) {
      console.error('Failed to approve refund:', error);
      alert(`Failed to approve refund: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleReject = async (reason: string) => {
    if (!selectedRequest) return;

    const refundId = selectedRequest.id;

    try {
      const response = await processRefundAction(refundId, 'disapprove', reason);
      await fetchRefunds(); // Re-fetch to update the list
      alert(response.message);
    } catch (error) {
      console.error('Failed to reject refund:', error);
      alert(`Failed to reject refund: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const openModal = (request: Refund) => {
    setSelectedRequest(request);
    setModalOpen(true);
  };

  const closeModal = () => {
    setSelectedRequest(null);
    setModalOpen(false);
  };

  const pendingRequests = (requests || []).filter(r => r.status === 'Pending'); // Filter is technically redundant as the backend only returns pending, but kept for safety

  // Mock stats for the cards
  const totalPendingAmount = pendingRequests.reduce((sum, req) => sum + req.amount, 0).toFixed(2);
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
      value: `$${totalPendingAmount}`,
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
        <h1 className="text-2xl font-semibold text-gray-900">{t('manager.refunds.pageTitle')}</h1>
        <p className="text-sm text-gray-500">{t('manager.refunds.pageSubtitle')}</p>
      </header>

      {/* Stat Cards */}
      <section className="grid grid-cols-1 gap-6 md:grid-cols-3 mb-8">
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
          <p className="py-10 text-center text-gray-500">{t('manager.refunds.noRefunds')}</p>
        ) : (
          pendingRequests.map(request => (
            <div key={request.id} className="bg-white p-6 rounded-lg shadow-md border-l-4 border-yellow-500">
              <div className="flex justify-between items-start mb-4">
                <div>
	                  <h2 className="text-lg font-semibold text-gray-900">
	                    {t('manager.refunds.card.orderTitle', { orderId: request.orderId })}
	                  </h2>
	                  <p className="text-xs text-gray-500">
	                    {t('manager.refunds.card.requestMeta', { id: request.id, date: new Date(request.requestedAt).toLocaleDateString() })}
	                  </p>
	                </div>
	                <span className="px-3 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800">
	                  {t('manager.refunds.card.status')}
	                </span>
	              </div>
	
	              <div className="grid grid-cols-2 gap-4 border-t pt-4">
	                <div>
	                  <p className="text-xs font-medium text-gray-500 uppercase mb-1">{t('manager.refunds.card.reasonTitle')}</p>
	                  <p className="text-base font-medium text-red-600">{request.reason}</p>
	                </div>
	
	                <div className="text-right">
	                  <p className="text-xs font-medium text-gray-500 uppercase mb-1">{t('manager.refunds.card.refundAmount')}</p>
	                  <p className="text-xl font-bold text-gray-900">${request.amount.toFixed(2)}</p>
	                  <p className="text-sm text-gray-500">{t('manager.refunds.card.branch')}</p>
	                </div>
	              </div>
	
	              <div className="mt-4 pt-4 border-t">
	                <p className="text-xs font-medium text-gray-500 uppercase mb-2">Order Details (Simplified)</p>
	                <p className="text-sm text-gray-700">Order ID: {request.orderId}</p>
	                <p className="text-sm text-gray-700">Refund ID: {request.id}</p>
	              </div>

              {/* Action Buttons */}
              <div className="mt-6 pt-4 border-t flex">
                <button
                  onClick={() => openModal(request)}
                  className="flex-1 flex items-center justify-center px-4 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 transition-colors"
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
    </ManagerLayout>
  );
}
