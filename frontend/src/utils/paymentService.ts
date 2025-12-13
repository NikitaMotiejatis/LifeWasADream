const API_BASE_URL = 'http://localhost:8081/api/payment';

export interface StripeCheckoutRequest {
  order_id: number;
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
  currency: string = 'eur',
): Promise<StripeCheckoutResponse> => {
  const response = await fetch(`${API_BASE_URL}/stripe/create-checkout-session`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include', // Include cookies for authentication
    body: JSON.stringify({
      order_id: orderId,
      amount,
      currency,
    } as StripeCheckoutRequest),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to create checkout session: ${error}`);
  }

  return response.json();
};

export const verifyStripePayment = async (
  sessionId: string,
): Promise<PaymentVerification> => {
  const response = await fetch(`${API_BASE_URL}/stripe/verify/${sessionId}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to verify payment: ${error}`);
  }

  return response.json();
};

export const redirectToStripeCheckout = (sessionUrl: string): void => {
  window.location.href = sessionUrl;
};
