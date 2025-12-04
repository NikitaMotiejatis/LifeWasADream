export type Reservation = {
  id: string;
  service: string;
  serviceKey?: string;
  staff: string;
  staffKey?: string;
  date: Date | string;
  time: string;
  duration: number;
  customerName: string;
  customerPhone: string;
  email?: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'no_show' | 'refund_pending';
  notes?: string;
  price?: number;
};

export type Service = {
  id: string;
  name: string;
  nameKey: string;
  duration: number;
  price: number;
};

export type Staff = {
  id: string;
  name: string;
  nameKey: string;
  role: string;
  services: string[];
};

export type EditReservationPanelProps = {
  mode: 'edit';
  reservationId: string;
  onSave?: (reservation: Reservation) => void;
  onCancel?: () => void;
};