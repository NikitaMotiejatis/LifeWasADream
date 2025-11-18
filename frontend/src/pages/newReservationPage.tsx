'use client';

import { useState } from 'react';
import Sidebar from '../components/sidebar';
import Topbar from '../components/topbar';

export default function NewReservationPage() {
  const [selectedStaff, setSelectedStaff] = useState<string | null>(null);
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

  const staff = [
    { id: 'anyone', name: 'Anyone', role: 'Any available staff' },
    { id: 'james', name: 'James Chen', role: 'Colorist' },
    { id: 'sarah', name: 'Sarah Johnson', role: 'Nail Technician' },
  ];

  const services = [
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

  /* TODO: SOME ACTUAL LOGIC WILL BE NEEDED */
  const generateCode = () => `RES-${Math.floor(100 + Math.random() * 900)}`;

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });

    setTimeout(() => {
      setToast(null);
    }, 5800);
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
    const formattedPhone = customerPhone.trim() || '+370 00 00000';

    showToast(
      `Reservation confirmed!\nConfirmation code: ${code}\nSMS sent to ${formattedPhone}`,
      'success',
    );

    console.log('Booking confirmed:', {
      customerName,
      customerPhone,
      selectedService,
      selectedDate,
      selectedTime,
      code,
    });

    setCustomerName('');
    setCustomerPhone('');
    setSelectedStaff(null);
    setSelectedService(null);
    setSelectedDate(null);
    setSelectedTime(null);
  };

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const firstDay = new Date(year, month, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const startingDayOfWeek = firstDay.getDay();

  const days = [];
  for (let i = 0; i < startingDayOfWeek; i++) days.push(null);
  for (let d = 1; d <= daysInMonth; d++) days.push(d);

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

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />

      <div className="flex flex-1 flex-col overflow-hidden">
        <Topbar />

        <div className="flex-1 overflow-y-auto p-4 md:p-6">
          <div className="mx-auto grid max-w-6xl grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="rounded-xl bg-white p-5 shadow">
              <h2 className="mb-5 text-xl font-bold">Select Staff & Service</h2>

              <div className="mb-6">
                <h3 className="mb-3 text-sm font-medium text-gray-600 uppercase">
                  Staff Member
                </h3>
                {staff.map(s => (
                  <div
                    key={s.id}
                    onClick={() =>
                      setSelectedStaff(s.id === 'anyone' ? null : s.id)
                    }
                    className={`mb-2 flex cursor-pointer items-center justify-between rounded-lg border p-4 transition ${
                      selectedStaff === s.id ||
                      (!selectedStaff && s.id === 'anyone')
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <div>
                      <div className="font-medium">{s.name}</div>
                      <div className="text-xs text-gray-500">{s.role}</div>
                    </div>
                    {(selectedStaff === s.id ||
                      (!selectedStaff && s.id === 'anyone')) && (
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
                    <div className="text-xs text-gray-500">
                      {service.duration}
                    </div>
                  </div>
                  <div className="font-semibold">${service.price}</div>
                </div>
              ))}
            </div>

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
                      onClick={() =>
                        day && setSelectedDate(new Date(year, month, day))
                      }
                      className={`mt-2 mr-2 mb-2 flex h-8 w-8 items-center justify-center rounded-lg transition ${
                        day
                          ? selectedDate &&
                            selectedDate.getDate() === day &&
                            selectedDate.getMonth() === month &&
                            selectedDate.getFullYear() === year
                            ? 'bg-blue-600 text-white'
                            : 'hover:bg-gray-100'
                          : 'cursor-default'
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

            <div className="rounded-xl bg-white p-5 shadow-lg">
              <h3 className="mb-6 text-xl font-bold">Booking Summary</h3>

              {/* TODO: VALIDATION NEEDED */}
              <input
                type="text"
                placeholder="Customer name"
                value={customerName}
                onChange={e => setCustomerName(e.target.value)}
                className="mb-4 w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-blue-500 focus:outline-none"
              />

              {/* TODO: VALIDATION NEEDED */}
              <input
                type="tel"
                placeholder="Phone number"
                value={customerPhone}
                onChange={e => setCustomerPhone(e.target.value)}
                className="mb-6 w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-blue-500 focus:outline-none"
              />

              <div className="mb-5 space-y-3 rounded-lg border border-gray-200 bg-gray-50 p-4 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Date:</span>
                  <span className="font-medium">
                    {selectedDate
                      ? selectedDate.toLocaleDateString()
                      : '[Not selected]'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Time:</span>
                  <span className="font-medium">
                    {selectedTime || '[Not selected]'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Staff:</span>
                  <span className="font-medium">
                    {staff.find(s => s.id === selectedStaff)?.name || 'Anyone'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Service:</span>
                  <span className="font-medium">
                    {services.find(s => s.id === selectedService)?.title ||
                      '[Not selected]'}
                  </span>
                </div>
                {selectedService && (
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total:</span>
                    <span>
                      ${services.find(s => s.id === selectedService)?.price}
                    </span>
                  </div>
                )}
              </div>

              <button
                onClick={handleConfirm}
                className="w-full rounded-lg bg-blue-600 py-4 font-semibold text-white hover:bg-blue-700"
              >
                Confirm Reservation
              </button>

              <p className="mt-3 text-center text-xs text-gray-500">
                Confirmation will be sent via SMS
              </p>
            </div>
          </div>
        </div>

        {/* Toast */}
        {toast && (
          <div
            key={toast.message}
            className="fixed top-20 right-4 z-50 max-w-sm"
            style={{
              animation:
                'slideIn 0.5s ease-out forwards, fadeOut 0.8s ease-in forwards 5s',
            }}
          >
            <div
              className={`flex items-start gap-4 rounded-xl border-l-8 bg-white p-5 shadow-2xl ${toast.type === 'success' ? 'border-green-500' : 'border-orange-400'} `}
            >
              <div className="shrink-0">
                {toast.type === 'success' ? (
                  <svg
                    className="h-8 w-8 text-green-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={3}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                ) : (
                  <svg
                    className="h-8 w-8 text-orange-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <circle cx="12" cy="12" r="10" strokeWidth={2} />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={3}
                      d="M12 8v4m0 4h.01"
                    />
                  </svg>
                )}
              </div>
              <div className="flex-1 text-sm leading-relaxed font-medium whitespace-pre-line text-gray-800">
                {toast.message}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
