import { useTranslation } from 'react-i18next';
import type { Reservation, Service } from './types';
import { useCurrency } from '@/global/contexts/currencyContext';
type ServiceSectionProps = {
  services: Service[];
  reservation: Reservation;
  handleChange: (field: keyof Reservation, value: any) => void;
};

export function ServiceSection({
  services,
  reservation,
  handleChange,
}: ServiceSectionProps) {
  const { t } = useTranslation();
  const { formatPrice } = useCurrency();

  if (services.length === 0) {
    return (
      <div className="rounded-xl bg-white p-5 shadow">
        <h3 className="mb-3 text-sm font-medium text-gray-600 uppercase">
          {t('reservation.service')}
        </h3>
        <div className="py-8 text-center">
          <div className="mx-auto mb-3 h-10 w-10 text-gray-400"></div>
          <p className="text-gray-500">No services available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl bg-white p-5 shadow">
      <h3 className="mb-3 text-sm font-medium text-gray-600 uppercase">
        {t('reservation.service')}
      </h3>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {services.map(service => (
          <div
            key={service.id}
            onClick={() => handleChange('service', service.id)}
            className={`cursor-pointer rounded-xl border-2 p-4 transition-all duration-200 ${
              reservation.service === service.id
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
            }`}
          >
            <div className="mb-2 flex items-start justify-between">
              <div>
                <h3 className="font-semibold text-gray-900">
                  {t(`reservations.services.${service.id}`)}
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  {service.duration} {t('reservations.min')}
                </p>
              </div>
              <span className="font-bold text-blue-600">
                {formatPrice(service.price)}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
