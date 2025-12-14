'use client';

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import i18n from '@/i18n';
import { useCurrency } from '@/global/contexts/currencyContext';
import SidebarCashier from '@/receptionist/components/sidebarCashier';
import Topbar from '@/global/components/topbar';
import Toast from '@/global/components/toast';
import {
  useNameValidation,
  usePhoneValidation,
} from '@/utils/useInputValidation';
import useSWR from 'swr';
import { useAuth } from '@/global/hooks/auth';
import type { Cents } from '@/receptionist/contexts/cartContext';
import { ReservationTipSection } from '@/receptionist/components/reservationTipSection';

type Service = {
  id: string;
  nameKey: string;
  price: Cents;
  duration: number;
};

type Staff = {
  id: string;
  name: string;
  role: string;
  services: Service[];
};

const timeSlots = [
  '09:00',
  '10:00',
  '11:00',
  '12:00',
  '13:00',
  '14:00',
  '15:00',
  '16:00',
  '17:00',
  '18:00',
];

export default function NewReservationPage() {
  const { t } = useTranslation();
  const { formatPrice } = useCurrency();
  const [selectedStaff, setSelectedStaff] = useState<string>('anyone');
  const [selectedService, setSelectedService] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [tipAmount, setTipAmount] = useState<number>(0);
  const [toast, setToast] = useState<{
    message: string;
    type: 'success' | 'error';
  } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const { authFetch, authFetchJson } = useAuth();

  const { data: staff } = useSWR(
    'reservation/staff',
    url => authFetchJson<Staff[]>(url, 'GET'),
    { revalidateOnMount: true },
  );
  const { data: services } = useSWR(
    'reservation/services',
    url => authFetchJson<Service[]>(url, 'GET'),
    { revalidateOnMount: true },
  );

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 5800);
  };

  const customerName = useNameValidation();
  const customerPhone = usePhoneValidation();

  const handleTipAdded = (amount: number) => {
    setTipAmount(amount);
  };

  const handleConfirm = async () => {
    if (!customerName.value.trim() || !customerPhone.value.trim()) {
      showToast(t('reservation.toast.missingInfo'), 'error');
      return;
    }
    if (!selectedService || !selectedDate || !selectedTime) {
      showToast(t('reservation.toast.incomplete'), 'error');
      return;
    }

    const selectedServiceObj = services?.find(s => s.id === selectedService);
    const totalAmount = (selectedServiceObj?.price || 0) + tipAmount;

    const [hours, minutes] = selectedTime.split(':').map(Number);
    const dt = new Date(selectedDate);
    dt.setHours(hours);
    dt.setMinutes(minutes);
    dt.setSeconds(0);
    dt.setMilliseconds(0);

    const payload = {
      customerName: customerName.value.trim(),
      customerPhone: customerPhone.value.trim(),
      staffId: selectedStaff === 'anyone' ? '' : selectedStaff,
      serviceId: selectedService,
      datetime: dt.toISOString(),
      status: 'confirmed', // This will trigger SMS sending
    };

    try {
      setIsSubmitting(true);
      const response = await authFetch(
        'reservation',
        'POST',
        JSON.stringify(payload),
      );
      showToast(
        t('reservation.toast.success', {
          code: dt.getTime(),
          phone: customerPhone.value.trim(),
        }),
        'success',
      );

      // Reset form
      customerName.reset();
      customerPhone.reset();
      setSelectedStaff('anyone');
      setSelectedService(null);
      setSelectedDate(null);
      setSelectedTime(null);
      setTipAmount(0);
    } catch (error) {
      console.error('Failed to create reservation:', error);
      showToast(t('reservation.toast.error'), 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex h-screen">
      <SidebarCashier />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Topbar />

        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <div className="mx-auto grid max-w-6xl grid-cols-1 gap-6 lg:grid-cols-3">
            <StaffAndServiceSelector
              selectedStaff={selectedStaff}
              setSelectedStaff={setSelectedStaff}
              selectedService={selectedService}
              setSelectedService={setSelectedService}
              formatPrice={formatPrice}
              staff={staff || []}
              services={services || []}
              t={t}
            />

            <DateTimePicker
              currentMonth={currentMonth}
              setCurrentMonth={setCurrentMonth}
              selectedDate={selectedDate}
              setSelectedDate={setSelectedDate}
              selectedTime={selectedTime}
              setSelectedTime={setSelectedTime}
              t={t}
              i18n={i18n}
            />

            <BookingSummary
              customerName={customerName}
              customerPhone={customerPhone}
              selectedDate={selectedDate}
              selectedTime={selectedTime}
              selectedStaff={selectedStaff}
              selectedService={selectedService}
              formatPrice={formatPrice}
              onConfirm={handleConfirm}
              isSubmitting={isSubmitting}
              staff={staff || []}
              services={services || []}
              t={t}
            />
          </div>
        </main>

        <Toast toast={toast} />
      </div>
    </div>
  );
}

function StaffAndServiceSelector({
  selectedStaff,
  setSelectedStaff,
  selectedService,
  setSelectedService,
  formatPrice,
  staff,
  services,
  t,
}: {
  selectedStaff: string;
  setSelectedStaff: (id: string) => void;
  selectedService: string | null;
  setSelectedService: (id: string | null) => void;
  formatPrice: (price: number) => string;
  staff: Staff[];
  services: Service[];
  t: any;
}) {
  return (
    <div className="rounded-xl bg-white p-5 shadow">
      <h2 className="mb-5 text-xl font-bold">
        {t('reservation.staffServiceTitle')}
      </h2>

      <div className="mb-6">
        <h3 className="mb-3 text-sm font-medium text-gray-600 uppercase">
          {t('reservation.staffMember')}
        </h3>
        {staff.map(s => (
          <div
            key={s.id}
            onClick={() => setSelectedStaff(s.id)}
            className={`mb-2 flex cursor-pointer items-center justify-between rounded-lg border p-4 transition ${
              selectedStaff === s.id
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-300 hover:bg-gray-50'
            }`}
          >
            <div>
              <div className="font-medium">
                {s.name == 'Anyone' ? t(`reservations.staff.anyone`) : s.name}
              </div>
              <div className="text-xs text-gray-500">
                {s.role === 'Any'
                  ? t('reservation.staff.Any')
                  : i18n.exists(`reservation.staff.${s.role}`)
                    ? t(`reservation.staff.${s.role}`)
                    : s.role}
              </div>
            </div>
            {selectedStaff === s.id && (
              <span className="text-xl text-blue-600">✓</span>
            )}
          </div>
        ))}
      </div>

      <h3 className="mb-3 text-sm font-medium text-gray-600 uppercase">
        {t('reservation.service')}
      </h3>
      {services.map(service => (
        <div
          key={service.id}
          onClick={() => setSelectedService(service.id)}
          className={`mb-2 flex cursor-pointer justify-between rounded-lg border p-4 transition ${
            selectedService === service.id
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-300 hover:bg-gray-50'
          }`}
        >
          <div>
            <div className="font-medium">
              {t(`reservations.services.${service.id}`)}
            </div>
            <div className="text-xs text-gray-500">
              {service.duration + ' ' + t(`reservation.durations.min`)}
            </div>
          </div>
          <div className="font-semibold text-blue-600">
            {formatPrice(service.price)}
          </div>
        </div>
      ))}
    </div>
  );
}

function DateTimePicker({
  currentMonth,
  setCurrentMonth,
  selectedDate,
  setSelectedDate,
  selectedTime,
  setSelectedTime,
  t,
  i18n,
}: {
  currentMonth: Date;
  setCurrentMonth: (date: Date) => void;
  selectedDate: Date | null;
  setSelectedDate: (date: Date | null) => void;
  selectedTime: string | null;
  setSelectedTime: (time: string | null) => void;
  t: any;
  i18n: any;
}) {
  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const firstDayOriginal = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const isLT = i18n.language.startsWith('lt');
  let weekdayKeys: string[] = isLT
    ? ['mo', 'tu', 'we', 'th', 'fr', 'sa', 'su']
    : ['su', 'mo', 'tu', 'we', 'th', 'fr', 'sa'];

  let firstDay = firstDayOriginal;
  if (isLT) firstDay = (firstDay + 6) % 7;

  const days: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) days.push(null);
  for (let d = 1; d <= daysInMonth; d++) days.push(d);

  return (
    <div className="rounded-xl bg-white p-5 shadow">
      <h3 className="mb-5 text-xl font-bold">
        {t('reservation.dateTimeTitle')}
      </h3>

      <div className="mb-6 rounded-lg border border-gray-200 p-4">
        <div className="mb-4 flex items-center justify-between">
          <button
            onClick={() => setCurrentMonth(new Date(year, month - 1))}
            className="rounded p-2 hover:bg-gray-100"
          >
            ←
          </button>
          <span className="font-semibold">
            {t(`reservation.months.${month}`)} {year}
          </span>
          <button
            onClick={() => setCurrentMonth(new Date(year, month + 1))}
            className="rounded p-2 hover:bg-gray-100"
          >
            →
          </button>
        </div>

        <div className="grid grid-cols-7 text-center text-xs font-medium text-gray-600">
          {weekdayKeys.map(key => (
            <div key={key}>{t(`reservation.weekdays.${key}`)}</div>
          ))}
        </div>

        <div className="mt-2 mr-2 grid grid-cols-7 gap-1 text-sm">
          {days.map((day, index) => (
            <button
              key={index}
              disabled={!day}
              onClick={() => day && setSelectedDate(new Date(year, month, day))}
              className={`h-10 w-10 rounded-lg transition ${
                day
                  ? selectedDate?.getDate() === day &&
                    selectedDate.getMonth() === month &&
                    selectedDate.getFullYear() === year
                    ? 'bg-blue-600 text-white'
                    : 'hover:bg-gray-100'
                  : ''
              }`}
            >
              {day || ''}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {timeSlots.map(time => (
          <button
            key={time}
            onClick={() => setSelectedTime(time)}
            className={`rounded-lg border py-3 text-sm font-medium transition ${
              selectedTime === time
                ? 'border-blue-500 bg-blue-50 text-blue-700'
                : 'border-gray-300 hover:bg-gray-50'
            }`}
          >
            {time}
          </button>
        ))}
      </div>
    </div>
  );
}

function BookingSummary({
  customerName,
  customerPhone,
  selectedDate,
  selectedTime,
  selectedStaff,
  selectedService,
  formatPrice,
  onConfirm,
  onTipAdded,
  tipAmount,
  staff,
  services,
  t,
  isSubmitting = false,
}: {
  customerName: ReturnType<typeof useNameValidation>;
  customerPhone: ReturnType<typeof usePhoneValidation>;
  selectedDate: Date | null;
  selectedTime: string | null;
  selectedStaff: string;
  selectedService: string | null;
  formatPrice: (price: number) => string;
  onConfirm: () => void;
  onTipAdded: (amount: number) => void;
  tipAmount: number;
  staff: Staff[];
  services: Service[];
  t: any;
  isSubmitting?: boolean;
}) {
  const selectedServiceObj = services.find(s => s.id === selectedService);
  const servicePrice = selectedServiceObj?.price || 0;
  const totalAmount = servicePrice + tipAmount;

  const handleConfirmWithTip = () => {
    onConfirm();
  };

  return (
    <div className="rounded-xl bg-white p-5 shadow-lg">
      <h3 className="mb-6 text-xl font-bold">
        {t('reservation.bookingSummary')}
      </h3>

      <div className="mb-4">
        <input
          type="text"
          placeholder={t('reservation.customerNamePlaceholder')}
          value={customerName.value}
          onChange={customerName.handleChange}
          className={`mb-4 w-full rounded-lg border px-4 py-3 focus:outline-none ${
            customerName.error
              ? 'border-red-500'
              : 'border-gray-300 focus:border-blue-500'
          }`}
        />
        {customerName.error && (
          <p className="animate-fade-in mt-1 text-sm text-red-600">
            {t('reservation.nameError')}
          </p>
        )}
      </div>
      <div className="mb-6">
        <input
          type="tel"
          placeholder={t('reservation.customerPhonePlaceholder')}
          value={customerPhone.value}
          onChange={customerPhone.handleChange}
          className={`mb-4 w-full rounded-lg border px-4 py-3 focus:outline-none ${
            customerPhone.error
              ? 'border-red-500'
              : 'border-gray-300 focus:border-blue-500'
          }`}
        />
        {customerPhone.error && (
          <p className="animate-fade-in mt-1 text-sm text-red-600">
            {t('reservation.phoneError')}
          </p>
        )}
      </div>

      <div className="mb-5 space-y-3 rounded-lg border border-gray-200 bg-gray-50 p-4 text-sm">
        <SummaryRow
          label={t('reservation.summary.date')}
          value={
            selectedDate?.toLocaleDateString() ||
            t('reservation.summary.notSelected')
          }
        />
        <SummaryRow
          label={t('reservation.summary.time')}
          value={selectedTime || t('reservation.summary.notSelected')}
        />
        <SummaryRow
          label={t('reservation.summary.staff')}
          value={
            selectedStaff == 'anyone'
              ? t(`reservations.staff.anyone`)
              : staff.find(s => s.id === selectedStaff)?.name || t('reservation.summary.notSelected')
          }
        />
        <SummaryRow
          label={t('reservation.summary.service')}
          value={
            selectedServiceObj
              ? t(`reservation.services.${selectedServiceObj.nameKey}`)
              : t('reservation.summary.notSelected')
          }
        />
        
        {/* Price breakdown with tip */}
        {selectedServiceObj && (
          <>
            <div className="pt-3">
              <ReservationTipSection
                onTipAdded={onTipAdded}
                disabled={!selectedServiceObj}
              />
            </div>
            
            <div className="space-y-2 border-t pt-3">
              <div className="flex justify-between">
                <span className="text-gray-600">{t('reservation.summary.service')}:</span>
                <span className="font-medium">{formatPrice(servicePrice)}</span>
              </div>
              
              {tipAmount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span className="text-gray-600">{t('reservation.tip')}:</span>
                  <span className="font-medium">+{formatPrice(tipAmount)}</span>
                </div>
              )}
              
              <div className="flex justify-between border-t pt-2 text-lg font-bold">
                <span>{t('reservation.summary.total')}:</span>
                <span>{formatPrice(totalAmount)}</span>
              </div>
            </div>
          </>
        )}
      </div>

      <button
        onClick={handleConfirmWithTip}
        disabled={isSubmitting}
        className="w-full rounded-lg bg-blue-600 py-4 font-semibold text-white transition hover:bg-blue-700"
      >
        {isSubmitting
          ? t('payment.processing')
          : t('reservation.confirmButton')}
      </button>

      <p className="mt-3 text-center text-xs text-gray-500">
        {t('reservation.smsNote')}
      </p>
    </div>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <span className="text-gray-600">{label}:</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}
