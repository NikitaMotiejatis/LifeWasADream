const API_BASE_URL = 'http://localhost:8081/api/refund';

export type RefundStatus =
  | 'Pending'
  | 'Approved'
  | 'Disapproved'
  | 'Processing'
  | 'Completed'
  | 'Failed';

export interface Refund {
  id: number;
  orderId: number;
  amount: number;
  reason: string;
  status: RefundStatus;
  requestedAt: string;
  processedAt?: string;
  stripeRefundId?: string;
}

export interface RefundActionRequest {
  action: 'approve' | 'disapprove';
  reason?: string;
}

/**
 * Fetches a list of all pending refund requests.
 * @returns A promise that resolves to an array of Refund objects.
 */
export const getPendingRefunds = async (): Promise<Refund[]> => {
  const response = await fetch(API_BASE_URL, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to fetch pending refunds: ${error}`);
  }

  return response.json();
};

/**
 * Sends an action (approve or disapprove) for a specific refund request.
 * This will call the Stripe API to process the refund.
 * @param refundId The ID of the refund to process.
 * @param action The action to take ('approve' or 'disapprove').
 * @param reason Optional reason for disapproval.
 * @returns A promise that resolves to the server's response message.
 */
export const processRefundAction = async (
  refundId: number,
  action: 'approve' | 'disapprove',
  reason?: string,
): Promise<{ message: string }> => {
  const requestBody: RefundActionRequest = { action, reason };

  const response = await fetch(`${API_BASE_URL}/${refundId}/action`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify(requestBody),
  });

  const responseBody = await response.json();

  if (!response.ok) {
    throw new Error(`Failed to process refund action: ${responseBody.message || response.statusText}`);
  }

  return responseBody;
};
