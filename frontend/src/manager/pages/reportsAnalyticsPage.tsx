import { useTranslation } from 'react-i18next';
import { useState, useEffect } from 'react';
import ManagerLayout from '../components/managerLayout';
import { Download } from 'lucide-react';
import { mockReports, ReportData } from '../mockData';
import { useCurrency } from '@/global/contexts/currencyContext';
import Toast from '@/global/components/toast';
import DropdownSelector from '@/global/components/dropdownSelector';

// Simple Mock Chart Component for Reports
const ReportChart = ({
  title,
  data,
  isLoading,
}: {
  title: string;
  data: { label: string; value: number }[];
  isLoading: boolean;
}) => {
  const { t } = useTranslation();
  const { formatPrice } = useCurrency();
  return (
    <div className="rounded-lg bg-white p-6 shadow-md">
      <h3 className="mb-4 text-lg font-semibold text-gray-900">{title}</h3>
      {isLoading ? (
        <div className="h-48 w-full animate-pulse rounded bg-gray-200"></div>
      ) : (
        <div className="flex h-48 flex-col justify-around p-2">
          {data.map((item, index) => (
            <div key={index} className="flex items-center space-x-2">
              <span className="w-32 text-sm text-gray-600">
                {t(item.label)}
              </span>
              <div className="h-4 flex-1 rounded-full bg-gray-200">
                <div
                  className="h-4 rounded-full bg-blue-600 transition-all duration-500"
                  style={{ width: `${(item.value / 6000) * 100}%` }} // Max value is 6000 for scaling
                ></div>
              </div>
              <span className="w-16 text-right text-sm font-medium text-gray-900">
                {formatPrice(item.value)}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default function ReportsAnalyticsPage() {
  const { t } = useTranslation();
  const [data, setData] = useState<ReportData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState<'sales' | 'employee'>(
    'sales',
  );
  const [timePeriod, setTimePeriod] = useState<'month' | 'quarter' | 'year'>(
    'month',
  );

  useEffect(() => {
    // Simulate data fetching
    setTimeout(() => {
      setData(mockReports);
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

  const handleExport = () => {
    showToast(
      t('manager.reports.exporting', {
        report: t(`manager.reports.${selectedReport}Report`),
      }),
    );
  };

  const salesData =
    data?.salesByCategory.map(item => ({
      label: t(`manager.reports.categories.${item.category}`, item.category),
      value: item.revenue,
    })) || [];

  const employeeData =
    data?.employeePerformance.map(item => ({
      label: t('manager.reports.employeeLabel', {
        name: item.name,
        orders: item.orders,
      }),
      value: item.sales,
    })) || [];

  return (
    <ManagerLayout>
      <header className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900">
          {t('manager.reports.pageTitle')}
        </h1>
        <p className="text-sm text-gray-500">
          {t('manager.reports.pageSubtitle')}
        </p>
      </header>

      <div className="mb-6 flex items-center justify-between rounded-lg bg-white p-4 shadow-md">
        <div className="flex items-center space-x-4">
          {/* Report Selector */}
          <DropdownSelector
            options={[
              { value: 'sales', label: t('manager.reports.salesReport') },
              { value: 'employee', label: t('manager.reports.employeeReport') },
            ]}
            selected={selectedReport}
            onChange={value => setSelectedReport(value as 'sales' | 'employee')}
            buttonClassName="w-48 px-3 py-2 text-sm"
          />

          {/* Time Period Filter */}
          <DropdownSelector
            options={[
              { value: 'month', label: t('manager.reports.timePeriod.month') },
              {
                value: 'quarter',
                label: t('manager.reports.timePeriod.quarter'),
              },
              { value: 'year', label: t('manager.reports.timePeriod.year') },
            ]}
            selected={timePeriod}
            onChange={value =>
              setTimePeriod(value as 'month' | 'quarter' | 'year')
            }
            buttonClassName="w-36 px-3 py-2 text-sm"
          />
        </div>
        <button
          onClick={handleExport}
          className="inline-flex items-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors duration-150 hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:outline-none"
        >
          <Download className="mr-2 h-4 w-4" />
          {t('manager.reports.export')}
        </button>
      </div>

      <section className="grid grid-cols-1 gap-6">
        {selectedReport === 'sales' && (
          <ReportChart
            title={`${t('manager.reports.salesReport')} (${timePeriod})`}
            data={salesData}
            isLoading={isLoading}
          />
        )}
        {selectedReport === 'employee' && (
          <ReportChart
            title={`${t('manager.reports.employeeReport')} (${timePeriod})`}
            data={employeeData}
            isLoading={isLoading}
          />
        )}
      </section>
      <Toast toast={toast} />
    </ManagerLayout>
  );
}
