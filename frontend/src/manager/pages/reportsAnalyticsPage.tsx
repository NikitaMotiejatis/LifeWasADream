import { useTranslation } from 'react-i18next';
import { useState, useEffect } from 'react';
import ManagerLayout from '../components/managerLayout';
import { Download } from 'lucide-react';
import { mockReports, ReportData } from '../mockData';

// Simple Mock Chart Component for Reports
const ReportChart = ({ title, data, isLoading }: { title: string, data: { label: string; value: number }[], isLoading: boolean }) => {
  const { t } = useTranslation();
  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
      {isLoading ? (
        <div className="h-48 w-full bg-gray-200 animate-pulse rounded"></div>
      ) : (
        <div className="h-48 flex flex-col justify-around p-2">
          {data.map((item, index) => (
            <div key={index} className="flex items-center space-x-2">
              <span className="text-sm text-gray-600 w-32">{item.label}</span>
              <div className="flex-1 bg-gray-200 rounded-full h-4">
                <div
                  className="bg-blue-600 h-4 rounded-full transition-all duration-500"
                  style={{ width: `${(item.value / 6000) * 100}%` }} // Max value is 6000 for scaling
                ></div>
              </div>
              <span className="text-sm font-medium text-gray-900 w-16 text-right">${item.value}</span>
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
  const [selectedReport, setSelectedReport] = useState<'sales' | 'employee'>('sales');
  const [timePeriod, setTimePeriod] = useState<'month' | 'quarter' | 'year'>('month');

  useEffect(() => {
    // Simulate data fetching
    setTimeout(() => {
      setData(mockReports);
      setIsLoading(false);
    }, 200);
  }, []);

  const handleExport = () => {
    alert(t('manager.reports.exporting', { report: t(`manager.reports.${selectedReport}Report`) }));
  };

  const salesData = data?.salesByCategory.map(item => ({
    label: t(`manager.reports.categories.${item.category}`, item.category),
    value: item.revenue,
  })) || [];

  const employeeData = data?.employeePerformance.map(item => ({
    label: t('manager.reports.employeeLabel', { name: item.name, orders: item.orders }),
    value: item.sales,
  })) || [];

  return (
    <ManagerLayout>
      <header className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900">{t('manager.reports.pageTitle')}</h1>
        <p className="text-sm text-gray-500">{t('manager.reports.pageSubtitle')}</p>
      </header>

      <div className="mb-6 flex items-center justify-between p-4 bg-white rounded-lg shadow-md">
        <div className="flex space-x-4 items-center">
          {/* Report Selector */}
          <select
            id="report-select"
            value={selectedReport}
            onChange={(e) => setSelectedReport(e.target.value as 'sales' | 'employee')}
            className="block pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md shadow-sm"
          >
            <option value="sales">{t('manager.reports.salesReport')}</option>
            <option value="employee">{t('manager.reports.employeeReport')}</option>
          </select>

          {/* Time Period Filter */}
          <select
            id="time-period-select"
            value={timePeriod}
            onChange={(e) => setTimePeriod(e.target.value as 'month' | 'quarter' | 'year')}
            className="block pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md shadow-sm"
          >
            <option value="month">{t('manager.reports.timePeriod.month')}</option>
            <option value="quarter">{t('manager.reports.timePeriod.quarter')}</option>
            <option value="year">{t('manager.reports.timePeriod.year')}</option>
          </select>
        </div>
        <button
          onClick={handleExport}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-150"
        >
          <Download className="w-4 h-4 mr-2" />
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
    </ManagerLayout>
  );
}
