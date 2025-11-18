export default function Sidebar() {
  return (
    <div className="w-56 bg-white border-r border-gray-300 flex flex-col p-4">
        <h1 className="text-xl font-semibold mb-6">Dream-PoS</h1>

        <button className="px-3 py-2 rounded-lg bg-gray-200 mb-2 text-left">
            Checkout
        </button>

        <button className="px-3 py-2 rounded-lg bg-gray-200 text-left">
            Reservations
        </button>
    </div>
  );
}
