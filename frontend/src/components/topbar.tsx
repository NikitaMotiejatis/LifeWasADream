export default function Topbar() {
  return (
    <div className="flex items-center justify-between gap-6 border-b border-gray-300 bg-white px-4 py-3 lg:px-6">
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <div className="relative">
          <select className="cursor-pointer appearance-none rounded-md border border-gray-300 bg-white px-3 py-1.5 pr-8 text-sm font-medium transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none">
            <option>Downtown Branch</option>
            <option>North Branch</option>
            <option>West Branch</option>
          </select>
          <svg
            className="pointer-events-none absolute top-1/2 right-2 h-4 w-4 -translate-y-1/2 text-gray-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </div>

        <div className="relative max-w-xl flex-1">
          <input
            type="text"
            placeholder="Search products, orders..."
            className="w-full min-w-0 rounded-md border border-gray-300 px-3 py-1.5 pr-9 pl-3 text-sm placeholder-gray-500 transition placeholder:leading-tight focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
            title="Search products, orders..."
          />
          <svg
            className="pointer-events-none absolute top-1/2 right-2.5 h-5 w-5 -translate-y-1/2 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-3 whitespace-nowrap">
        <span className="hidden text-sm font-medium text-gray-700 sm:block">
          John Doe
        </span>
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-linear-to-br from-blue-500 to-purple-600 text-sm font-semibold text-white shadow-md ring-2 ring-white">
          JD
        </div>
      </div>
    </div>
  );
}
