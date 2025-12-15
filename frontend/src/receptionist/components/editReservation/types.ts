import type { Cents } from '@/receptionist/contexts/cartContext';

export type ReservationStatus =
  | 'pending'
  | 'confirmed'
  | 'completed'
  | 'cancelled'
  | 'no_show'
  | 'refund_pending'
  | 'refunded';

export type Reservation = {
  id: string;
  service: string;
  staff: string;
  datetime: Date;
  duration: number;
  customerName: string;
  customerPhone: string;
  status: ReservationStatus;
  notes: string;
  price: Cents;
};

export type Service = {
  id: string;
  name: string;
  nameKey: string;
  duration: number;
  price: Cents;
};

export type Staff = {
  id: string;
  name: string;
  nameKey: string;
  role: string;
  services: string[];
};

export type EditReservationPanelProps = {
  mode: 'create' | 'edit';
  reservationId?: string;
  initialReservation?: Reservation;
  onSave?: (reservation: Reservation) => void;
  onCancel?: () => void;
  services?: Service[];
  staffMembers?: Staff[];
};
