import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import Topbar from '@/global/components/topbar';
import SidebarStockClerk from '@/stock/components/sidebarStockClerk';

type TransferRequest = {
  id: string;
  productName: 'Coffee Beans' | 'Milk' | 'Paper Cups' | 'Sugar';
  quantity: number;
  unit: 'kg' | 'liters' | 'pcs';
  fromBranch: string;
  toBranch: string;
  status: 'PENDING' | 'APPROVED' | 'COMPLETED';
  requestedBy: string;
  date: string;
  time?: string;
  note?: string;
};

type TransferFormState = {
  productName: TransferRequest['productName'];
  quantity: string;
  unit: TransferRequest['unit'];
  fromBranch: string;
  toBranch: string;
  requestedBy: string;
  note: string;
};

const branchOptions = [
  'Downtown Branch',
  'Eastside Branch',
  'North Branch',
  'Westside Branch',
];

const productOptions: TransferRequest['productName'][] = [
  'Coffee Beans',
  'Milk',
  'Paper Cups',
  'Sugar',
];

const unitOptions: TransferRequest['unit'][] = ['kg', 'liters', 'pcs'];

export default function TransferRequestsPage() {
  const { t } = useTranslation();

  const buildInitialFormState = (): TransferFormState => ({
    productName: 'Coffee Beans',
    quantity: '',
    unit: 'kg',
    fromBranch: '',
    toBranch: '',
    requestedBy: t('topbar.userName') ?? '',
    note: '',
  });

  const [transfers, setTransfers] = useState<TransferRequest[]>([
    {
      id: 'TR-001',
      productName: 'Coffee Beans',
      quantity: 10,
      unit: 'kg',
      fromBranch: 'Westside Branch',
      toBranch: 'Downtown Branch',
      status: 'PENDING',
      requestedBy: 'James B.',
      date: 'Today',
      time: '10:30',
    },
    {
      id: 'TR-002',
      productName: 'Milk',
      quantity: 15,
      unit: 'liters',
      fromBranch: 'Downtown Branch',
      toBranch: 'Eastside Branch',
      status: 'APPROVED',
      requestedBy: 'Sarah K.',
      date: 'Today',
      time: '09:15',
    },
    {
      id: 'TR-003',
      productName: 'Paper Cups',
      quantity: 200,
      unit: 'pcs',
      fromBranch: 'North Branch',
      toBranch: 'Downtown Branch',
      status: 'COMPLETED',
      requestedBy: 'James B.',
      date: 'Yesterday',
    },
    {
      id: 'TR-004',
      productName: 'Sugar',
      quantity: 25,
      unit: 'kg',
      fromBranch: 'Downtown Branch',
      toBranch: 'Westside Branch',
      status: 'PENDING',
      requestedBy: 'Mike J.',
      date: 'Today',
      time: '08:45',
    },
  ]);
  const [selectedStatus, setSelectedStatus] = useState<
    'ALL' | 'PENDING' | 'APPROVED' | 'COMPLETED'
  >('ALL');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [formData, setFormData] = useState<TransferFormState>(() =>
    buildInitialFormState(),
  );
  const [formErrors, setFormErrors] = useState<
    Partial<Record<keyof TransferFormState, string>>
  >({});
  const [formFeedback, setFormFeedback] = useState<
    { type: 'success' | 'error'; message: string } | null
  >(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const filteredTransfers = transfers.filter(t =>
    selectedStatus === 'ALL' ? true : t.status === selectedStatus,
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'APPROVED':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'COMPLETED':
        return 'bg-green-100 text-green-800 border-green-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const generateTransferId = () => {
    const maxId = transfers.reduce((max, transfer) => {
      const match = transfer.id.match(/TR-(\d+)/);
      if (!match) return max;
      const value = Number(match[1]);
      return Number.isNaN(value) ? max : Math.max(max, value);
    }, 0);
    return `TR-${String(maxId + 1).padStart(3, '0')}`;
  };

  const handleNewTransfer = () => {
    setFormData(buildInitialFormState());
    setFormErrors({});
    setFormFeedback(null);
    setIsDrawerOpen(true);
  };

  const closeDrawer = () => {
    setIsDrawerOpen(false);
    setIsSubmitting(false);
    setFormErrors({});
  };

  const validateForm = () => {
    const errors: Partial<Record<keyof TransferFormState, string>> = {};
    if (!formData.productName) {
      errors.productName = t('transferRequests.form.errors.productRequired');
    }
    if (!formData.quantity) {
      errors.quantity = t('transferRequests.form.errors.quantityRequired');
    } else if (Number(formData.quantity) <= 0) {
      errors.quantity = t('transferRequests.form.errors.quantityPositive');
    }
    if (!formData.unit) {
      errors.unit = t('transferRequests.form.errors.unitRequired');
    }
    if (!formData.fromBranch) {
      errors.fromBranch = t('transferRequests.form.errors.fromBranchRequired');
    }
    if (!formData.toBranch) {
      errors.toBranch = t('transferRequests.form.errors.toBranchRequired');
    } else if (formData.toBranch === formData.fromBranch) {
      errors.toBranch = t('transferRequests.form.errors.distinctBranches');
    }
    if (!formData.requestedBy.trim()) {
      errors.requestedBy = t('transferRequests.form.errors.requesterRequired');
    }
    return errors;
  };

  const handleFormChange = (
    field: keyof TransferFormState,
    value: string,
  ) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setFormErrors(prev => ({ ...prev, [field]: undefined }));
    setFormFeedback(null);
  };

  const handleSubmitNewTransfer = async (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    setIsSubmitting(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 600));
      const newTransfer: TransferRequest = {
        id: generateTransferId(),
        productName: formData.productName,
        quantity: Number(formData.quantity),
        unit: formData.unit,
        fromBranch: formData.fromBranch,
        toBranch: formData.toBranch,
        status: 'PENDING',
        requestedBy: formData.requestedBy.trim(),
        date: 'Today',
        time: new Date().toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        }),
        note: formData.note.trim() || undefined,
      };
      setTransfers(prev => [newTransfer, ...prev]);
      setFormFeedback({
        type: 'success',
        message: t('transferRequests.form.success'),
      });
      setFormData(buildInitialFormState());
      setIsDrawerOpen(false);
    } catch (error) {
      setFormFeedback({
        type: 'error',
        message: t('transferRequests.form.errors.generic'),
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const tUnit = (unit: string, count: number) => {
    return t(`transferRequests.units.${unit}`, { count });
  };

  const formatDate = (date: string, time?: string) => {
    if (date === 'Today' && time) {
      return t('transferRequests.date.today', { time });
    }
    if (date === 'Yesterday') {
      return t('transferRequests.date.yesterday');
    }
    return date;
  };

  return (
    <div className="flex h-screen w-full">
      <SidebarStockClerk />

      <div className="flex flex-1 flex-col">
        <Topbar />

        <div className={`flex-1 overflow-auto bg-gray-100 p-6 ${isDrawerOpen ? 'pr-0' : ''}`}>
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="mb-2 text-3xl font-bold text-gray-900">
                {t('transferRequests.pageTitle')}
              </h1>
              <p className="text-gray-600">
                {t('transferRequests.pageSubtitle')}
              </p>
            </div>
            <button
              onClick={handleNewTransfer}
              className="rounded-lg bg-blue-600 px-6 py-2 font-medium text-white shadow-md transition-all duration-200 hover:bg-blue-700 active:scale-95"
            >
              {t('transferRequests.newButton')}
            </button>
          </div>

          {isDrawerOpen && (
            <div className="fixed inset-y-0 right-0 z-20 w-full max-w-md border-l border-gray-200 bg-white shadow-xl">
              <div className="flex h-full flex-col">
                <div className="flex items-start justify-between border-b border-gray-200 p-4">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">
                      {t('transferRequests.form.title')}
                    </h2>
                    <p className="text-sm text-gray-500">
                      {t('transferRequests.form.subtitle')}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={closeDrawer}
                    className="rounded-full p-1 text-gray-500 transition hover:bg-gray-100"
                    aria-label={t('common.close')}
                  >
                    ×
                  </button>
                </div>
                <form
                  className="flex flex-1 flex-col gap-4 overflow-auto p-4"
                  onSubmit={handleSubmitNewTransfer}
                >
                  <label className="flex flex-col gap-1 text-sm font-semibold text-gray-900">
                    {t('transferRequests.form.productLabel')}
                    <select
                      value={formData.productName}
                      onChange={e => handleFormChange('productName', e.target.value)}
                      className={`rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 ${formErrors.productName ? 'border-red-300 focus:ring-red-300' : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500/30'}`}
                    >
                      {productOptions.map(product => (
                        <option key={product} value={product}>
                          {t(`transferRequests.products.${product}`)}
                        </option>
                      ))}
                    </select>
                    {formErrors.productName && (
                      <span className="text-xs font-normal text-red-600">
                        {formErrors.productName}
                      </span>
                    )}
                  </label>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <label className="flex flex-col gap-1 text-sm font-semibold text-gray-900">
                      {t('transferRequests.form.quantityLabel')}
                      <input
                        type="number"
                        min="0"
                        value={formData.quantity}
                        onChange={e => handleFormChange('quantity', e.target.value)}
                        className={`rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 ${formErrors.quantity ? 'border-red-300 focus:ring-red-300' : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500/30'}`}
                      />
                      {formErrors.quantity && (
                        <span className="text-xs font-normal text-red-600">
                          {formErrors.quantity}
                        </span>
                      )}
                    </label>
                    <label className="flex flex-col gap-1 text-sm font-semibold text-gray-900">
                      {t('transferRequests.form.unitLabel')}
                      <select
                        value={formData.unit}
                        onChange={e => handleFormChange('unit', e.target.value)}
                        className={`rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 ${formErrors.unit ? 'border-red-300 focus:ring-red-300' : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500/30'}`}
                      >
                        {unitOptions.map(unit => (
                          <option key={unit} value={unit}>
                            {t(`transferRequests.units.${unit}`, { count: 1 })}
                          </option>
                        ))}
                      </select>
                      {formErrors.unit && (
                        <span className="text-xs font-normal text-red-600">
                          {formErrors.unit}
                        </span>
                      )}
                    </label>
                  </div>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <label className="flex flex-col gap-1 text-sm font-semibold text-gray-900">
                      {t('transferRequests.form.fromBranchLabel')}
                      <select
                        value={formData.fromBranch}
                        onChange={e => handleFormChange('fromBranch', e.target.value)}
                        className={`rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 ${formErrors.fromBranch ? 'border-red-300 focus:ring-red-300' : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500/30'}`}
                      >
                        <option value="">{t('transferRequests.form.selectBranch')}</option>
                        {branchOptions.map(branch => (
                          <option key={branch} value={branch}>
                            {t(`transferRequests.branches.${branch}`)}
                          </option>
                        ))}
                      </select>
                      {formErrors.fromBranch && (
                        <span className="text-xs font-normal text-red-600">
                          {formErrors.fromBranch}
                        </span>
                      )}
                    </label>
                    <label className="flex flex-col gap-1 text-sm font-semibold text-gray-900">
                      {t('transferRequests.form.toBranchLabel')}
                      <select
                        value={formData.toBranch}
                        onChange={e => handleFormChange('toBranch', e.target.value)}
                        className={`rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 ${formErrors.toBranch ? 'border-red-300 focus:ring-red-300' : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500/30'}`}
                      >
                        <option value="">{t('transferRequests.form.selectBranch')}</option>
                        {branchOptions.map(branch => (
                          <option key={branch} value={branch}>
                            {t(`transferRequests.branches.${branch}`)}
                          </option>
                        ))}
                      </select>
                      {formErrors.toBranch && (
                        <span className="text-xs font-normal text-red-600">
                          {formErrors.toBranch}
                        </span>
                      )}
                    </label>
                  </div>
                  <label className="flex flex-col gap-1 text-sm font-semibold text-gray-900">
                    {t('transferRequests.form.requestedByLabel')}
                    <input
                      type="text"
                      value={formData.requestedBy}
                      onChange={e => handleFormChange('requestedBy', e.target.value)}
                      className={`rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 ${formErrors.requestedBy ? 'border-red-300 focus:ring-red-300' : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500/30'}`}
                    />
                    {formErrors.requestedBy && (
                      <span className="text-xs font-normal text-red-600">
                        {formErrors.requestedBy}
                      </span>
                    )}
                  </label>
                  <label className="flex flex-col gap-1 text-sm font-semibold text-gray-900">
                    {t('transferRequests.form.noteLabel')}
                    <textarea
                      rows={3}
                      maxLength={200}
                      value={formData.note}
                      onChange={e => handleFormChange('note', e.target.value)}
                      className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                      placeholder={t('transferRequests.form.notePlaceholder')}
                    />
                  </label>

                  {formFeedback && (
                    <div
                      className={`rounded-md border px-3 py-2 text-sm ${
                        formFeedback.type === 'success'
                          ? 'border-green-200 bg-green-50 text-green-900'
                          : 'border-red-200 bg-red-50 text-red-900'
                      }`}
                    >
                      {formFeedback.message}
                    </div>
                  )}

                  <div className="mt-auto flex gap-3 border-t border-gray-200 pt-4">
                    <button
                      type="button"
                      onClick={closeDrawer}
                      className="flex-1 rounded-lg border border-gray-300 px-4 py-2 font-medium text-gray-700 transition hover:bg-gray-50"
                    >
                      {t('common.cancel')}
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="flex-1 rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white transition disabled:opacity-70"
                    >
                      {isSubmitting
                        ? t('transferRequests.form.submitting')
                        : t('transferRequests.form.submitButton')}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Filter Tabs */} {/*TODO: Make filtration combinable */}
          <div className="mb-6 flex flex-wrap gap-2 rounded-lg bg-white p-4 shadow-sm">
            {(['ALL', 'PENDING', 'APPROVED', 'COMPLETED'] as const).map(
              status => (
                <button
                  key={status}
                  onClick={() => setSelectedStatus(status)}
                  className={`rounded-lg px-4 py-2 font-medium transition-all ${
                    selectedStatus === status
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {t(`transferRequests.filters.${status}`)}
                </button>
              ),
            )}
          </div>
          {/* Transfer Requests List */}
          {/*TODO: Make filtration combinable */}
          <div className="space-y-4">
            {filteredTransfers.map(transfer => (
              <div
                key={transfer.id}
                className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm transition hover:shadow-md"
              >
                <div className="mb-4 flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {t(`transferRequests.products.${transfer.productName}`)}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {t('transferRequests.labels.requestId')}: {transfer.id}
                    </p>
                  </div>
                  <span
                    className={`rounded-full border px-3 py-1 text-sm font-semibold ${getStatusColor(transfer.status)}`}
                  >
                    {t(`transferRequests.status.${transfer.status}`)}
                  </span>
                </div>

                <div className="mb-4 grid grid-cols-2 gap-4 md:grid-cols-4">
                  <div>
                    <p className="text-xs font-semibold text-gray-600">
                      {t('transferRequests.labels.from')}
                    </p>
                    <p className="mt-1 text-sm text-gray-900">
                      {t(`transferRequests.branches.${transfer.fromBranch}`)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-600">
                      {t('transferRequests.labels.to')}
                    </p>
                    <p className="mt-1 text-sm text-gray-900">
                      {t(`transferRequests.branches.${transfer.toBranch}`)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-600">
                      {t('transferRequests.labels.quantity')}
                    </p>
                    <p className="mt-1 text-sm font-bold text-gray-900">
                      {tUnit(transfer.unit, transfer.quantity)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-600">
                      {t('transferRequests.labels.requestedBy')}
                    </p>
                    <p className="mt-1 text-sm text-gray-900">
                      {transfer.requestedBy}
                    </p>
                  </div>
                </div>

                <div className="border-t border-gray-200 pt-4">
                  <p className="text-xs text-gray-500">
                    {formatDate(transfer.date, transfer.time)}
                  </p>
                </div>
              </div>
            ))}
          </div>
          {filteredTransfers.length === 0 && (
            <div className="rounded-lg border border-gray-200 bg-white p-12 text-center">
              <p className="text-gray-600">
                {t('transferRequests.noRequests')}
              </p>
            </div>
          )}
        </div>
      </div>

      {isDrawerOpen && (
        <div className="fixed inset-0 z-10 bg-black/40" onClick={closeDrawer} aria-hidden="true" />
      )}
    </div>
  );
}
