export default function OrderSummary() {
  return (
    <div className="flex h-full flex-col rounded-lg bg-white p-4 shadow-sm">
      <h3 className="mb-4 text-lg font-semibold">Current Order</h3>

      <div className="flex flex-1 flex-col gap-4">
        {/* Example items */}
        <div className="flex justify-between">
          <div>Latte x2</div>
          <div>$9.00</div>
        </div>

        <div className="flex justify-between">
          <div>Lemonade x1</div>
          <div>$4.00</div>
        </div>
      </div>

      <div className="mt-4 border-t border-gray-300 pt-4">
        <div className="flex justify-between text-lg font-semibold">
          <span>Total</span>
          <span>$13.00</span>
        </div>

        <button className="mt-4 w-full rounded-lg bg-blue-600 py-2 text-white">
          Complete Payment
        </button>
      </div>
    </div>
  );
}
