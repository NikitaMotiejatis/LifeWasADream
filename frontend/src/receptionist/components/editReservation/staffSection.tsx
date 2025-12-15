import { useTranslation } from 'react-i18next';
import type { Reservation, Staff } from './types';
import i18n from '@/i18n';

interface StaffSectionProps {
  staffMembers: Staff[];
  reservation: Reservation;
  handleChange: (field: keyof Reservation, value: any) => void;
}

export function StaffSection({
  staffMembers,
  reservation,
  handleChange,
}: StaffSectionProps) {
  const { t } = useTranslation();

  return (
    <div className="rounded-xl bg-white p-5 shadow">
      <h3 className="mb-3 text-sm font-medium text-gray-600 uppercase">
        {t('reservation.staffMember')}
      </h3>
      <div className="space-y-2">
        {staffMembers.map(staff => (
          <div
            key={staff.id}
            onClick={() => handleChange('staff', staff.id)}
            className={`flex cursor-pointer items-center justify-between rounded-lg border p-4 transition ${
              reservation.staff === staff.id
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-300 hover:bg-gray-50'
            }`}
          >
            <div>
              <div className="font-medium">
                {staff.name == 'Anyone'
                  ? t(`reservations.staff.anyone`)
                  : staff.name}
              </div>
              <div className="text-xs text-gray-500">
                {staff.role === 'Any'
                  ? t('reservation.staff.Any')
                  : i18n.exists(`reservation.staff.${staff.role}`)
                    ? t(`reservation.staff.${staff.role}`)
                    : staff.role}
              </div>
            </div>
            {reservation.staff === staff.id && (
              <span className="text-xl text-blue-600">✓</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
