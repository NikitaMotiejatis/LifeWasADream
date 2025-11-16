export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-semibold">DreamPoS</h1>
        <p className="text-gray-500">Unified Point-of-Sale System</p>
      </div>

      <div className="bg-white p-10 rounded-lg border shadow-md w-[400px] ml-10">
        <h2 className="text-xl mb-6 font-semibold">LOGIN</h2>

        {/* USERNAME */}
        <label className="text-sm font-medium text-gray-600">USERNAME</label>
        <div className="relative mt-1 mb-4">
          <span className="absolute left-3 top-2.5 text-gray-400">
            <svg xmlns="http://www.w3.org/2000/svg" 
                 className="h-5 w-5" fill="none"
                 viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round"
                strokeWidth="1.5"
                d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.5 20.25a8.25 8.25 0 0115 0" />
            </svg>
          </span>
          <input
            type="text"
            placeholder="Enter username..."
            className="w-full border rounded-lg py-2 pl-10 pr-3 bg-gray-100 focus:outline-none focus:ring focus:ring-blue-200"
          />
        </div>

        {/* PASSWORD */}
        <label className="text-sm font-medium text-gray-600">PASSWORD</label>
        <div className="relative mt-1 mb-6">
          <span className="absolute left-3 top-2.5 text-gray-400">
            <svg xmlns="http://www.w3.org/2000/svg"
                 className="h-5 w-5" fill="none"
                 viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round"
                strokeWidth="1.5"
                d="M16.5 10.5V6a4.5 4.5 0 10-9 0v4.5m-.75 0h10.5a1.5 1.5 0 011.5 1.5v7.5a1.5 1.5 0 01-1.5 1.5H6.75a1.5 1.5 0 01-1.5-1.5V12a1.5 1.5 0 011.5-1.5z" />
            </svg>
          </span>
          <input
            type="password"
            placeholder="Enter password..."
            className="w-full border rounded-lg py-2 pl-10 pr-3 bg-gray-100 focus:outline-none focus:ring focus:ring-blue-200"
          />
        </div>

        {/* LOGIN BUTTON */}
        <button
        /* TODO: WILL NEED VALIDATION LOGIC */
          onClick={() => (window.location.href = "/newOrder")}
          className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition disabled:bg-gray-300"
        >
          Login
        </button>
      </div>
    </div>
  );
}
