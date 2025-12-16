import { useAuth } from "@/global/hooks/auth";

export interface StripeCheckoutRequest {
  order_id: number;
  amount: number;
  currency: string;
}

export interface StripeReservationCheckoutRequest {
  reservation_id: number;
  amount: number;
  currency: string;
}

export interface StripeCheckoutResponse {
  session_id: string;
  session_url: string;
}

export interface PaymentVerification {
  id: number;
  order_id: number;
  amount: number;
  currency: string;
  payment_method: string;
  stripe_session_id?: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export const createStripeCheckout = async (
  orderId: number,
  amount: number,
  currency: string,
): Promise<StripeCheckoutResponse> => {
  const { authFetch } = useAuth();
  const response = await authFetch(
    'payment/stripe/create-checkout-session',
    'POST',
    JSON.stringify({
      order_id: orderId,
      amount,
      currency,
    } as StripeCheckoutRequest)
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to create checkout session: ${error}`);
  }

  return response.json();
};

export const createStripeReservationCheckout = async (
  reservationId: number,
  amount: number,
  currency: string,
): Promise<StripeCheckoutResponse> => {
  const { authFetch } = useAuth();
  const response = await authFetch(
    'payment/stripe/create-reservation-checkout-session',
    'POST',
    JSON.stringify({
      reservation_id: reservationId,
      amount,
      currency,
    } as StripeReservationCheckoutRequest)
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to create reservation checkout session: ${error}`);
  }

  return response.json();
};

export const verifyStripePayment = async (
  sessionId: string,
): Promise<PaymentVerification> => {
  const { authFetch } = useAuth();
  const response = await authFetch(
    `payment/stripe/verify/${sessionId}`,
    'GET',
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to verify payment: ${error}`);
  }

  return response.json();
};

export const redirectToStripeCheckout = (sessionUrl: string): void => {
  window.location.href = sessionUrl;
};
