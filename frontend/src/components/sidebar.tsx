export default function Sidebar() {
  return (
    <div className="flex w-56 flex-col border-r border-gray-300 bg-white p-4">
      <h1 className="mb-6 text-xl font-semibold">Dream-PoS</h1>

      <button className="mb-2 rounded-lg bg-gray-200 px-3 py-2 text-left">
        Checkout
      </button>

      <button className="rounded-lg bg-gray-200 px-3 py-2 text-left">
        Reservations
      </button>
    </div>
  );
}
