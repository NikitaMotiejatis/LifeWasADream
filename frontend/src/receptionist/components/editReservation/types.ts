// In your types.ts file
export type ReservationStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'no_show' | 'refund_pending';

// For EditReservationPanel
export type Reservation = {
  id: string;
  service: string;
  staff: string;
  date: string; // YYYY-MM-DD format
  time: string; // HH:MM format
  duration: number;
  customerName: string;
  customerPhone: string;
  status: ReservationStatus; // Use the union type
  notes: string;
  price: number;
};

// For Service
export type Service = {
  id: string;
  name: string;
  nameKey: string;
  duration: number;
  price: number;
};

// For Staff
export type Staff = {
  id: string;
  name: string;
  nameKey: string;
  role: string;
  services: string[];
};

// For EditReservationPanel props
export type EditReservationPanelProps = {
  mode: 'create' | 'edit';
  reservationId?: string;
  initialReservation?: Reservation;
  onSave?: (reservation: Reservation) => void;
  onCancel?: () => void;
  services?: Service[];
  staffMembers?: Staff[];
};