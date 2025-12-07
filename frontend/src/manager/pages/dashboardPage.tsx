import { useTranslation } from 'react-i18next';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ManagerLayout from '../components/managerLayout';
import { Package, AlertTriangle, DollarSign, ShoppingCart } from 'lucide-react';
import RefundApprovalModal from '../components/refundApprovalModal';
import { useCurrency } from '@/global/contexts/currencyContext';
import { mockRefundRequests, RefundRequest } from '../mockData';

// Mock Data Structure
interface DashboardData {
  sales: number;
  inventoryValue: number;
  pendingRefunds: number;
  salesTrend: { month: string; value: number }[];
  topProducts: { name: string; sales: number }[];
}

const mockDashboardData: DashboardData = {
  sales: 12500.5,
  inventoryValue: 45000.0,
  pendingRefunds: 7,
  salesTrend: [
    { month: 'Jan', value: 8000 },
    { month: 'Feb', value: 9500 },
    { month: 'Mar', value: 11000 },
    { month: 'Apr', value: 12500 },
  ],
  topProducts: [
    { name: 'Espresso', sales: 3200 },
    { name: 'Croissant', sales: 2100 },
    { name: 'Iced Latte', sales: 1800 },
  ],
};

// Card Component matching the LOFI design
const StatCard = ({
  title,
  value,
  subtext,
  icon: Icon,
  iconColor,
  isLoading,
}: {
  title: string;
  value: string | number;
  subtext: string;
  icon: React.ElementType;
  iconColor: string;
  isLoading: boolean;
}) => (
  <div className="flex h-full flex-col justify-between rounded-lg bg-white p-6 shadow-md">
    <div className="flex items-start justify-between">
      <p className="text-sm font-medium text-gray-500 uppercase">{title}</p>
      <Icon className={`h-5 w-5 ${iconColor}`} />
    </div>
    {isLoading ? (
      <div className="mt-2 h-10 w-3/4 animate-pulse rounded bg-gray-200"></div>
    ) : (
      <p className="mt-2 text-3xl font-semibold text-gray-900">{value}</p>
    )}
    <p className="mt-1 text-xs text-gray-500">{subtext}</p>
  </div>
);

// Mock Chart Component - Placeholder for Sales Trends
const SalesTrendChart = ({ isLoading }: { isLoading: boolean }) => {
  const { t } = useTranslation();

  return (
    <div className="col-span-full rounded-lg bg-white p-6 shadow-md">
      <h3 className="mb-4 text-lg font-semibold text-gray-900">
        {t('manager.dashboard.salesTrendHeading')}
      </h3>
      {isLoading ? (
        <div className="h-64 w-full animate-pulse rounded bg-gray-200"></div>
      ) : (
        <div className="flex h-64 items-center justify-center rounded-lg border border-dashed text-gray-400">
          {t('manager.dashboard.salesTrendPlaceholder')}
        </div>
      )}
    </div>
  );
};

const LowStockAlerts = ({ isLoading }: { isLoading: boolean }) => {
  const { t } = useTranslation();
  const alertItems = [
    { key: 'coffeeBeans', current: 12, min: 20, status: 'urgent' as const },
    { key: 'oatMilk', current: 5, min: 15, status: 'urgent' as const },
    { key: 'paperCups', current: 50, min: 100, status: 'low' as const },
  ];
  const statusClasses: Record<'urgent' | 'low', string> = {
    urgent: 'bg-red-100 text-red-800',
    low: 'bg-yellow-100 text-yellow-800',
  };

  return (
    <div className="rounded-lg bg-white p-6 shadow-md lg:col-span-1">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">
          {t('manager.dashboard.lowStockAlerts.title')}
        </h3>
        <button className="rounded-md bg-indigo-100 px-3 py-1 text-sm font-medium text-indigo-800 transition-colors duration-150 hover:bg-indigo-200">
          {t('manager.dashboard.lowStockAlerts.cta')}
        </button>
      </div>
      {isLoading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="h-10 w-full animate-pulse rounded bg-gray-200"
            ></div>
          ))}
        </div>
      ) : (
        <table className="min-w-full divide-y divide-gray-200">
          <thead>
            <tr>
              <th className="px-2 py-2 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                {t('manager.dashboard.lowStockAlerts.table.item')}
              </th>
              <th className="px-2 py-2 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                {t('manager.dashboard.lowStockAlerts.table.current')}
              </th>
              <th className="px-2 py-2 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                {t('manager.dashboard.lowStockAlerts.table.min')}
              </th>
              <th className="px-2 py-2 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                {t('manager.dashboard.lowStockAlerts.table.status')}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {alertItems.map(item => (
              <tr key={item.key}>
                <td className="px-2 py-2 text-sm whitespace-nowrap text-gray-900">
                  {t(`manager.dashboard.lowStockAlerts.items.${item.key}`)}
                </td>
                <td className="px-2 py-2 text-sm whitespace-nowrap text-gray-500">
                  {item.current}
                </td>
                <td className="px-2 py-2 text-sm whitespace-nowrap text-red-500">
                  {item.min}
                </td>
                <td className="px-2 py-2 text-sm whitespace-nowrap">
                  <span
                    className={`inline-flex rounded-full px-2 text-xs leading-5 font-semibold ${statusClasses[item.status]}`}
                  >
                    {t(
                      `manager.dashboard.lowStockAlerts.statuses.${item.status}`,
                    )}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

// Mock Table Component for Refund Queue
const RefundQueue = ({
  isLoading,
  requests,
  onReview,
  onSeeAll,
}: {
  isLoading: boolean;
  requests: RefundRequest[];
  onReview: (request: RefundRequest) => void;
  onSeeAll: () => void;
}) => {
  const { t } = useTranslation();
  const { formatPrice } = useCurrency();
  const visibleRequests = requests.slice(0, 3);

  return (
    <div className="rounded-lg bg-white p-6 shadow-md lg:col-span-1">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">
          {t('manager.dashboard.refundQueue.title')}
        </h3>
        <button
          className="rounded-md bg-indigo-100 px-3 py-1 text-sm font-medium text-indigo-800 transition-colors duration-150 hover:bg-indigo-200"
          onClick={onSeeAll}
        >
          {t('manager.dashboard.refundQueue.cta')}
        </button>
      </div>
      {isLoading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="h-10 w-full animate-pulse rounded bg-gray-200"
            ></div>
          ))}
        </div>
      ) : visibleRequests.length === 0 ? (
        <p className="text-sm text-gray-500">
          {t('manager.dashboard.refundQueue.empty')}
        </p>
      ) : (
        <table className="min-w-full divide-y divide-gray-200">
          <thead>
            <tr>
              <th className="px-2 py-2 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                {t('manager.dashboard.refundQueue.table.refId')}
              </th>
              <th className="px-2 py-2 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                {t('manager.dashboard.refundQueue.table.date')}
              </th>
              <th className="px-2 py-2 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                {t('manager.dashboard.refundQueue.table.amount')}
              </th>
              <th className="px-2 py-2 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                {t('manager.dashboard.refundQueue.table.reason')}
              </th>
              <th className="px-2 py-2 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                {t('manager.dashboard.refundQueue.table.action')}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {visibleRequests.map(request => (
              <tr key={request.id}>
                <td className="px-2 py-2 text-sm whitespace-nowrap text-gray-900">
                  {request.id}
                </td>
                <td className="px-2 py-2 text-sm whitespace-nowrap text-gray-500">
                  {request.date}
                </td>
                <td className="px-2 py-2 text-sm whitespace-nowrap text-gray-900">
                  {formatPrice(request.amount)}
                </td>
                <td className="px-2 py-2 text-sm text-gray-500">
                  {t(request.reason)}
                </td>
                <td className="px-2 py-2 text-sm font-medium whitespace-nowrap">
                  <button
                    className="rounded-md bg-indigo-600 px-3 py-1 text-xs font-medium text-white transition-colors hover:bg-indigo-700"
                    onClick={() => onReview(request)}
                  >
                    {t('manager.dashboard.refundQueue.review')}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default function DashboardPage() {
  const { t } = useTranslation();
  const { formatPrice } = useCurrency();
  const navigate = useNavigate();
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [refundRequests, setRefundRequests] = useState<RefundRequest[]>([]);
  const [refundLoading, setRefundLoading] = useState(true);
  const [selectedRefund, setSelectedRefund] = useState<RefundRequest | null>(
    null,
  );
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    setTimeout(() => {
      setData(mockDashboardData);
      setRefundRequests(mockRefundRequests.filter(r => r.status === 'Pending'));
      setIsLoading(false);
      setRefundLoading(false);
    }, 200);
  }, []);

  const handleApprove = (id: string) => {
    setRefundRequests(prev => prev.filter(r => r.id !== id));
  };

  const handleReject = (id: string) => {
    setRefundRequests(prev => prev.filter(r => r.id !== id));
  };

  const openModal = (request: RefundRequest) => {
    setSelectedRefund(request);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setSelectedRefund(null);
    setIsModalOpen(false);
  };

  const goToRefunds = () => {
    navigate('/refunds');
  };

  return (
    <ManagerLayout>
      <header className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900">
          {t('manager.dashboard.pageTitle')}
        </h1>
        <p className="text-sm text-gray-500">
          {t('manager.dashboard.pageSubtitle')}
        </p>
      </header>

      <section className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-4">
        <StatCard
          title={t('manager.dashboard.cards.todaysSales.title')}
          value={data ? `${formatPrice(data.sales)}` : '...'}
          subtext={t('manager.dashboard.cards.todaysSales.subtext')}
          icon={DollarSign}
          iconColor="text-green-500"
          isLoading={isLoading}
        />
        <StatCard
          title={t('manager.dashboard.cards.orders.title')}
          value={data ? data.inventoryValue : '...'}
          subtext={t('manager.dashboard.cards.orders.subtext')}
          icon={ShoppingCart}
          iconColor="text-blue-500"
          isLoading={isLoading}
        />
        <StatCard
          title={t('manager.dashboard.cards.lowStock.title')}
          value={data ? data.pendingRefunds : '...'}
          subtext={t('manager.dashboard.cards.lowStock.subtext')}
          icon={Package}
          iconColor="text-yellow-500"
          isLoading={isLoading}
        />
        <StatCard
          title={t('manager.dashboard.cards.pendingRefunds.title')}
          value={data ? data.pendingRefunds : '...'}
          subtext={t('manager.dashboard.cards.pendingRefunds.subtext')}
          icon={AlertTriangle}
          iconColor="text-red-500"
          isLoading={isLoading}
        />
      </section>

      <section className="mb-8">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">
          {t('manager.dashboard.salesTrendHeading')}
        </h2>
        <SalesTrendChart isLoading={isLoading} />
      </section>

      <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <RefundQueue
          isLoading={refundLoading}
          requests={refundRequests}
          onReview={openModal}
          onSeeAll={goToRefunds}
        />
        <LowStockAlerts isLoading={isLoading} />
      </section>

      {selectedRefund && (
        <RefundApprovalModal
          request={selectedRefund}
          isOpen={isModalOpen}
          onClose={closeModal}
          onApprove={handleApprove}
          onReject={(id, reason) => {
            console.info('Rejected', id, reason);
            handleReject(id);
          }}
        />
      )}
    </ManagerLayout>
  );
}
