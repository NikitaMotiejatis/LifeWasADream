export default function OrderSummary() {
  return (
    <div className="bg-white border rounded-lg p-4 shadow-sm h-full flex flex-col">
      <h3 className="text-lg font-semibold mb-4">Current Order</h3>

      <div className="flex flex-col gap-4 flex-1">
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

      <div className="mt-4 border-t pt-4">
        <div className="flex justify-between text-lg font-semibold">
          <span>Total</span>
          <span>$13.00</span>
        </div>

        <button className="w-full bg-blue-600 text-white py-2 rounded-lg mt-4">
          Complete Payment
        </button>
      </div>
    </div>
  );
}
