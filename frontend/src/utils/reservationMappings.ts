export const serviceIdMapping: Record<string, string> = {
  haircut: '1',
  color: '2',
  manicure: '3',
  pedicure: '4',
};

export const reverseServiceMapping: Record<string, string> = {
  '1': 'haircut',
  '2': 'color',
  '3': 'manicure',
  '4': 'pedicure',
};

export const staffIdMapping: Record<string, string> = {
  james: 'james',
  sarah: 'sarah',
  anyone: 'anyone',
};

export const serviceDetails: Record<string, { 
  price: number; 
  duration: number;
  nameKey: string;
}> = {
  haircut: { price: 65, duration: 60, nameKey: 'haircut' },
  color: { price: 120, duration: 120, nameKey: 'color' },
  manicure: { price: 35, duration: 45, nameKey: 'manicure' },
  pedicure: { price: 50, duration: 60, nameKey: 'pedicure' },
};

export const servicesMap: Record<string, { 
  title: string; 
  price: number;
  duration?: number;
}> = {
  '1': { title: 'Haircut & Style', price: 65, duration: 60 },
  '2': { title: 'Hair Color', price: 120, duration: 120 },
  '3': { title: 'Manicure', price: 35, duration: 45 },
  '4': { title: 'Pedicure', price: 50, duration: 60 },
};

export const getServiceId = (editPanelKey: string): string => 
  serviceIdMapping[editPanelKey] || '1';

export const getEditServiceId = (listId: string): string =>
  reverseServiceMapping[listId] || 'haircut';

export const getStaffId = (key: string): string => 
  staffIdMapping[key] || 'anyone';

export const getServiceDetails = (key: string) => 
  serviceDetails[key] || serviceDetails.haircut;

export const getServiceDetailsFromListId = (listId: string) => {
  const editId = getEditServiceId(listId);
  return serviceDetails[editId] || serviceDetails.haircut;
};

export const mapReservationForEdit = (reservationFromList: any) => {
  const serviceId = getEditServiceId(reservationFromList.serviceId);
  const details = getServiceDetails(serviceId);

  return {
    id: reservationFromList.id,
    service: serviceId,
    staff: getStaffId(reservationFromList.staffId),
    datetime: new Date(reservationFromList.datetime),
    duration: details.duration,
    customerName: reservationFromList.customerName,
    customerPhone: reservationFromList.customerPhone,
    status: reservationFromList.status,
    notes: '',
    price: details.price,
  };
};

export const getDefaultServices = (t: any) => {
  return Object.entries(serviceDetails).map(([id, details]) => ({
    id,
    name: t(`reservations.services.${serviceIdMapping[id]}`),
    nameKey: details.nameKey,
    duration: details.duration,
    price: details.price,
  }));
};

export const getDefaultStaff = (t: any) => {
  return [
    {
      id: 'james',
      name: t('reservations.staff.james'),
      nameKey: 'james',
      role: t('reservation.staff.Colorist'),
      services: ['haircut', 'color'],
    },
    {
      id: 'sarah',
      name: t('reservations.staff.sarah'),
      nameKey: 'sarah',
      role: t('reservation.staff.Nail Technician'),
      services: ['color'],
    },
    {
      id: 'anyone',
      name: t('reservations.staff.anyone'),
      nameKey: 'anyone',
      role: t('reservation.staff.Anyone'),
      services: ['haircut', 'color', 'manicure', 'pedicure'],
    },
  ];
};
export const DEFAULT_AVAILABLE_TIMES = [
  '08:00', '09:00', '10:00', '11:00', '12:00', 
  '13:00', '14:00', '15:00', '16:00', '17:00', '18:00'
];