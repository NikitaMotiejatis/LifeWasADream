export default function Topbar() {
  return (
    <div className="border-b bg-white px-6 py-3 flex justify-between items-center">
      <div className="flex items-center gap-3">
        <select className="border rounded px-2 py-1">
          <option>Downtown Branch</option>
        </select>

        <input
          type="text"
          placeholder="Search products, orders..."
          className="border px-3 py-1 rounded w-96"
        />
      </div>

      <div className="flex items-center gap-4">
        <span>John Doe</span>
        <div className="w-8 h-8 rounded-full bg-gray-200" />
      </div>
    </div>
  );
}
