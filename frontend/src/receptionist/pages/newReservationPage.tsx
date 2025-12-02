'use client';

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useCurrency } from '@/global/contexts/currencyContext';
import SidebarCashier from '@/receptionist/components/sidebarCashier';
import Topbar from '@/global/components/topbar';
import Toast from '@/global/components/toast';

type Staff = { id: string; name: string; role: string };
type Service = { id: string; title: string; price: number; duration: string };

const staff: Staff[] = [
  { id: 'anyone', name: 'Anyone', role: 'Any available staff' },
  { id: 'james', name: 'James Chen', role: 'Colorist' },
  { id: 'sarah', name: 'Sarah Johnson', role: 'Nail Technician' },
];

const services: Service[] = [
  { id: '1', title: 'Haircut & Style', price: 65, duration: '60 min' },
  { id: '2', title: 'Hair Color', price: 120, duration: '120 min' },
  { id: '3', title: 'Manicure', price: 35, duration: '45 min' },
  { id: '4', title: 'Pedicure', price: 50, duration: '60 min' },
];

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
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [toast, setToast] = useState<{
    message: string;
    type: 'success' | 'error';
  } | null>(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const generateCode = () => `RES-${Math.floor(100 + Math.random() * 900)}`;

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 5800);
  };

  const handleConfirm = () => {
    if (!customerName.trim() || !customerPhone.trim()) {
      showToast(t('reservation.toast.missingInfo'), 'error');
      return;
    }
    if (!selectedService || !selectedDate || !selectedTime) {
      showToast(t('reservation.toast.incomplete'), 'error');
      return;
    }

    const code = generateCode();
    showToast(
      t('reservation.toast.success', { code, phone: customerPhone.trim() }),
      'success',
    );

    setCustomerName('');
    setCustomerPhone('');
    setSelectedStaff('anyone');
    setSelectedService(null);
    setSelectedDate(null);
    setSelectedTime(null);
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
            />

            <DateTimePicker
              currentMonth={currentMonth}
              setCurrentMonth={setCurrentMonth}
              selectedDate={selectedDate}
              setSelectedDate={setSelectedDate}
              selectedTime={selectedTime}
              setSelectedTime={setSelectedTime}
            />

            <BookingSummary
              customerName={customerName}
              setCustomerName={setCustomerName}
              customerPhone={customerPhone}
              setCustomerPhone={setCustomerPhone}
              selectedDate={selectedDate}
              selectedTime={selectedTime}
              selectedStaff={selectedStaff}
              selectedService={selectedService}
              formatPrice={formatPrice}
              onConfirm={handleConfirm}
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
}: {
  selectedStaff: string;
  setSelectedStaff: (id: string) => void;
  selectedService: string | null;
  setSelectedService: (id: string | null) => void;
  formatPrice: (price: number) => string;
}) {
  const { t } = useTranslation();

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
                {t(`reservation.staff.${s.name}`)}
              </div>
              <div className="text-xs text-gray-500">
                {t(`reservation.staff.${s.role}`)}
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
              {t(`reservation.services.${service.title}`)}
            </div>
            <div className="text-xs text-gray-500">
              {t(`reservation.durations.${service.duration}`)}
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
}: {
  currentMonth: Date;
  setCurrentMonth: (date: Date) => void;
  selectedDate: Date | null;
  setSelectedDate: (date: Date | null) => void;
  selectedTime: string | null;
  setSelectedTime: (time: string | null) => void;
}) {
  const { t } = useTranslation();
  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const weekdayKeys = ['su', 'mo', 'tu', 'we', 'th', 'fr', 'sa'] as const;
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
  setCustomerName,
  customerPhone,
  setCustomerPhone,
  selectedDate,
  selectedTime,
  selectedStaff,
  selectedService,
  formatPrice,
  onConfirm,
}: {
  customerName: string;
  setCustomerName: (name: string) => void;
  customerPhone: string;
  setCustomerPhone: (phone: string) => void;
  selectedDate: Date | null;
  selectedTime: string | null;
  selectedStaff: string;
  selectedService: string | null;
  formatPrice: (price: number) => string;
  onConfirm: () => void;
}) {
  const { t } = useTranslation();
  const selectedServiceObj = services.find(s => s.id === selectedService);
  const [nameError, setNameError] = useState(false);
  const [phoneError, setPhoneError] = useState(false);

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;
    const valid = /^[\p{L}\s'-]*$/u.test(input);
    const filtered = input.replace(/[^\p{L}\s'-]/gu, '').trimStart();
    setNameError(!valid && input !== '');
    setCustomerName(filtered);
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;
    const filtered = input
      .replace(/[^0-9+]/g, '')
      .replace(/\+/g, (m, o) => (o === 0 ? '+' : ''))
      .slice(0, 16);
    setPhoneError(input !== filtered);
    setCustomerPhone(filtered);
  };

  const handleConfirmWithClear = () => {
    setNameError(false);
    setPhoneError(false);

    onConfirm();
  };

  return (
    <div className="rounded-xl bg-white p-5 shadow-lg">
      <h3 className="mb-6 text-xl font-bold">
        {t('reservation.bookingSummary')}
      </h3>

      <input
        type="text"
        placeholder={t('reservation.customerNamePlaceholder')}
        value={customerName}
        onChange={handleNameChange}
        className={`mb-4 w-full rounded-lg border px-4 py-3 focus:outline-none ${
          nameError ? 'border-red-500' : 'border-gray-300 focus:border-blue-500'
        }`}
      />
      {nameError && (
        <p className="mt-1 text-sm text-red-600">
          {t('reservation.nameError')}
        </p>
      )}

      <input
        type="tel"
        placeholder={t('reservation.customerPhonePlaceholder')}
        value={customerPhone}
        onChange={handlePhoneChange}
        className={`mb-6 w-full rounded-lg border px-4 py-3 focus:outline-none ${
          phoneError
            ? 'border-red-500'
            : 'border-gray-300 focus:border-blue-500'
        }`}
      />
      {phoneError && (
        <p className="mt-1 text-sm text-red-600">
          {t('reservation.phoneError')}
        </p>
      )}

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
          value={t(
            `reservation.staff.${staff.find(s => s.id === selectedStaff)?.name || 'Anyone'}`,
          )}
        />
        <SummaryRow
          label={t('reservation.summary.service')}
          value={
            selectedServiceObj
              ? t(`reservation.services.${selectedServiceObj.title}`)
              : t('reservation.summary.notSelected')
          }
        />
        {selectedServiceObj && (
          <div className="flex justify-between border-t pt-3 text-lg font-bold">
            <span>{t('reservation.summary.total')}:</span>
            <span>{formatPrice(selectedServiceObj.price)}</span>
          </div>
        )}
      </div>

      <button
        onClick={handleConfirmWithClear}
        className="w-full rounded-lg bg-blue-600 py-4 font-semibold text-white transition hover:bg-blue-700"
      >
        {t('reservation.confirmButton')}
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
