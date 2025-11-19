'use client';

import { useState } from 'react';
import { useCurrency } from '../contexts/currencyContext';
import SidebarCashier from '../components/sidebarCashier';
import Topbar from '../components/topbar';
import Toast from '../components/toast';

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

const monthNames = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

export default function NewReservationPage() {
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
      showToast(
        'Missing customer information.\nPlease enter customer name and phone number.',
        'error',
      );
      return;
    }
    if (!selectedService || !selectedDate || !selectedTime) {
      showToast(
        'Please complete all booking details: service, date and time.',
        'error',
      );
      return;
    }

    const code = generateCode();
    const formattedPhone = customerPhone.trim();

    showToast(
      `Reservation confirmed!\nConfirmation code: ${code}\nSMS sent to ${formattedPhone}`,
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
  return (
    <div className="rounded-xl bg-white p-5 shadow">
      <h2 className="mb-5 text-xl font-bold">Select Staff & Service</h2>

      <div className="mb-6">
        <h3 className="mb-3 text-sm font-medium text-gray-600 uppercase">
          Staff Member
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
              <div className="font-medium">{s.name}</div>
              <div className="text-xs text-gray-500">{s.role}</div>
            </div>
            {selectedStaff === s.id && (
              <span className="text-xl text-blue-600">✓</span>
            )}
          </div>
        ))}
      </div>

      <h3 className="mb-3 text-sm font-medium text-gray-600 uppercase">
        Service
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
            <div className="font-medium">{service.title}</div>
            <div className="text-xs text-gray-500">{service.duration}</div>
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
  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const days: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) days.push(null);
  for (let d = 1; d <= daysInMonth; d++) days.push(d);

  return (
    <div className="rounded-xl bg-white p-5 shadow">
      <h3 className="mb-5 text-xl font-bold">Select Date & Time</h3>

      <div className="mb-6 rounded-lg border border-gray-200 p-4">
        <div className="mb-4 flex items-center justify-between">
          <button
            onClick={() => setCurrentMonth(new Date(year, month - 1))}
            className="rounded p-2 hover:bg-gray-100"
          >
            ←
          </button>
          <span className="font-semibold">
            {monthNames[month]} {year}
          </span>
          <button
            onClick={() => setCurrentMonth(new Date(year, month + 1))}
            className="rounded p-2 hover:bg-gray-100"
          >
            →
          </button>
        </div>

        <div className="grid grid-cols-7 text-center text-xs font-medium text-gray-600">
          {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => (
            <div key={d}>{d}</div>
          ))}
        </div>

        <div className="mt-2 mr-2 grid grid-cols-7 gap-1 text-sm">
          {days.map((day, i) => (
            <button
              key={i}
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
  const selectedServiceObj = services.find(s => s.id === selectedService);

  const [nameError, setNameError] = useState(false);
  const [phoneError, setPhoneError] = useState(false);

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;
    const filtered = input.replace(/[^a-zA-ZąčęėįšųūžĄČĘĖĮŠŲŪŽ\s'-]/g, '');

    if (input !== filtered) {
      setNameError(true);
    } else if (
      nameError &&
      filtered.match(/^[a-zA-ZąčęėįšųūžĄČĘĖĮŠŲŪŽ\s'-]*$/)
    ) {
      setNameError(false);
    }

    setCustomerName(filtered);
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let input = e.target.value;

    let cleaned = input;
    let hadInvalid = false;

    if (input.startsWith('+')) {
      const rest = input.slice(1);
      if (/[^0-9]/.test(rest)) hadInvalid = true;
      cleaned = '+' + rest.replace(/[^0-9]/g, '');
    } else {
      if (/[^0-9]/.test(input)) hadInvalid = true;
      cleaned = input.replace(/[^0-9]/g, '');
    }

    if (cleaned.length > 15) return;

    if (hadInvalid) {
      setPhoneError(true);
    } else if (phoneError) {
      setPhoneError(false);
    }

    setCustomerPhone(cleaned);
  };

  const handleConfirmWithClear = () => {
    setNameError(false);
    setPhoneError(false);

    onConfirm();
  };

  return (
    <div className="rounded-xl bg-white p-5 shadow-lg">
      <h3 className="mb-6 text-xl font-bold">Booking Summary</h3>

      <div className="mb-4">
        <input
          type="text"
          placeholder="Customer name"
          value={customerName}
          onChange={handleNameChange}
          className={`className="mb-4 w-full rounded-lg border px-4 py-3 focus:outline-none ${
            nameError
              ? 'border-red-500 focus:border-red-500'
              : 'border-gray-300 focus:border-blue-500'
          }`}
        />
        {nameError && (
          <p className="animate-fade-in mt-1 text-sm text-red-600">
            Only letters, spaces, hyphens and apostrophes allowed
          </p>
        )}
      </div>
      <div className="mb-6">
        <input
          type="tel"
          placeholder="Phone number"
          value={customerPhone}
          onChange={handlePhoneChange}
          className={`w-full rounded-lg border px-4 py-3 transition-all focus:outline-none ${
            phoneError
              ? 'border-red-500 focus:border-red-500'
              : 'border-gray-300 focus:border-blue-500'
          }`}
        />
        {phoneError && (
          <p className="animate-fade-in mt-1 text-sm text-red-600">
            Only numbers and optional "+" at the beginning
          </p>
        )}
      </div>

      <div className="mb-5 space-y-3 rounded-lg border border-gray-200 bg-gray-50 p-4 text-sm">
        <SummaryRow
          label="Date"
          value={selectedDate?.toLocaleDateString() || '[Not selected]'}
        />
        <SummaryRow label="Time" value={selectedTime || '[Not selected]'} />
        <SummaryRow
          label="Staff"
          value={staff.find(s => s.id === selectedStaff)?.name || 'Anyone'}
        />
        <SummaryRow
          label="Service"
          value={selectedServiceObj?.title || '[Not selected]'}
        />
        {selectedServiceObj && (
          <div className="flex justify-between border-t pt-2 text-lg font-bold">
            <span>Total:</span>
            <span>{formatPrice(selectedServiceObj.price)}</span>
          </div>
        )}
      </div>

      <button
        onClick={handleConfirmWithClear}
        className="w-full rounded-lg bg-blue-600 py-4 font-semibold text-white transition hover:bg-blue-700"
      >
        Confirm Reservation
      </button>

      <p className="mt-3 text-center text-xs text-gray-500">
        Confirmation will be sent via SMS
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
