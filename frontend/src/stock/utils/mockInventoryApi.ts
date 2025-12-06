type AdjustmentPayload = {
  id: string;
  nextQuantity: number;
  note?: string;
};

export async function saveStockAdjustment(
  payload: AdjustmentPayload,
): Promise<{ ok: true }> {
  await new Promise(resolve => setTimeout(resolve, 300));

  if (payload.nextQuantity < 0) {
    throw new Error('Invalid quantity');
  }

  return { ok: true };
}
