    import { useTranslation } from 'react-i18next';
    import type { Reservation, Service } from './types';

type ServiceSectionProps = {
  services: Service[];
  reservation: Reservation;
  handleChange: (field: keyof Reservation, value: any) => void;
};

    export function ServiceSection({ services, reservation, handleChange }: ServiceSectionProps) {
    const { t } = useTranslation();

    if (services.length === 0) {
        return (
        <div className="rounded-xl bg-white p-5 shadow">
            <h3 className="mb-3 text-sm font-medium text-gray-600 uppercase">
            {t('reservation.service')}
            </h3>
            <div className="text-center py-8">
            <div className="mx-auto h-10 w-10 text-gray-400 mb-3">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            </div>
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
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                <div className="flex justify-between items-start mb-2">
                <div>
                    <h3 className="font-semibold text-gray-900">
                    {t(`reservation.services.${service.id}`, service.name)}
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">
                    {service.duration} {t('reservation.durations.min', 'min')}
                    </p>
                </div>
                <span className="font-bold text-blue-600">
                    ${service.price}
                </span>
                </div>

            </div>
            ))}
        </div>
        

        </div>
    );
    }