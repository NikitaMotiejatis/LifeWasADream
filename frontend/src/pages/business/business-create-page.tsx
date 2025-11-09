import { useState } from "react";
import { HiOutlineBriefcase } from "react-icons/hi";
import { IoBusiness } from "react-icons/io5";

const Sidebar: React.FC = () => {
  return (
    <div className="w-64 border-r border-gray-200 p-4">
      
      {/* Start Working Button */}
      <button className="w-full bg-black text-white py-2 rounded-lg font-medium mb-8 hover:bg-gray-800 transition">
        Start working
      </button>

      {/* Business Link */}
      <div className="flex items-center gap-2 mb-8 p-2 bg-gray-100 rounded-lg border-l-4 border-black">
        <HiOutlineBriefcase className="w-5 h-5 text-black" />
        <span className="font-semibold text-sm">Business</span>
      </div>

      {/* Quick Access */}
      <h3 className="text-gray-500 text-xs uppercase tracking-wider mb-3">Quick access</h3>
      <div className="space-y-2">
        {['My business for...', 'My business for...', 'My business for...'].map((text, index) => (
          <label key={index} className="flex items-center text-sm">
            <input type="checkbox" className="form-checkbox h-4 w-4 text-black rounded" />
            <span className="ml-2">{text}</span>
          </label>
        ))}
        <a href="#" className="text-xs text-blue-600 hover:underline block pt-2">
          More businesses...
        </a>
      </div>
    </div>
  );
};

const CreateBusinessForm: React.FC = () => {
  const [name, setName] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [type, setType] = useState<string>("order-based");
  const [country, setCountry] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [phone, setPhone] = useState<string>("");

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    // Here you would typically send the form data to an API
    console.log({
      name,
      description,
      type,
      country,
      email,
      phone,
    });
    alert('Form submitted! Check console for data.');
    // Reset form or handle success
  };

  return (
    <div className="max-w-xl mx-auto p-0 ml-0 bg-white rounded-lg text-left">

      {/* Page Header */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-800">Create business</h2>
        <p className="text-gray-600 text-sm">Create your new business with basic information</p>
      </div>

      <form onSubmit={handleSubmit}>
        {/* General Information Section */}
        <div className="mb-8 pl-0">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">General information</h2>

          {/* Name Field */}
          <div className="mb-5">
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              * Name
            </label>
            <input
              type="text"
              id="name"
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-black focus:border-black outline-none transition"
              placeholder="Enter the name of your business"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          {/* Description Field */}
          <div className="mb-5">
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              id="description"
              rows={4} // Allows for multiple lines as per design
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-black focus:border-black outline-none transition resize-y" // resize-y allows vertical resizing
              placeholder="Enter the description of your business"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            ></textarea>
          </div>

          {/* Type Radios */}
          <div className="mb-5">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              * Type
            </label>
            <div className="flex flex-col gap-2">
              <label className="flex items-center text-sm text-gray-700">
                <input
                  type="radio"
                  name="businessType"
                  value="order-based"
                  checked={type === 'order-based'}
                  onChange={(e) => setType(e.target.value)}
                  className="form-radio h-4 w-4 text-black focus:ring-black"
                />
                <span className="ml-2">Order-based</span>
              </label>
              <label className="flex items-center text-sm text-gray-700">
                <input
                  type="radio"
                  name="businessType"
                  value="appointment-based"
                  checked={type === 'appointment-based'}
                  onChange={(e) => setType(e.target.value)}
                  className="form-radio h-4 w-4 text-black focus:ring-black"
                />
                <span className="ml-2">Appointment-based</span>
              </label>
            </div>
          </div>

          {/* Country Dropdown */}
          <div className="mb-5">
            <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-1">
              * Country
            </label>
            <select
              id="country"
              className="w-full p-3 border border-gray-300 rounded-md bg-white focus:ring-black focus:border-black outline-none appearance-none pr-8 transition"
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              required
            >
              <option value="" disabled>Select your country</option>
              {/* Add more country options as needed */}
              <option value="USA">United States</option>
              <option value="CAN">Canada</option>
              <option value="GBR">United Kingdom</option>
              <option value="AUS">Australia</option>
            </select>
          </div>

          {/* Business Support Email */}
          <div className="mb-5">
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Business support email
            </label>
            <input
              type="email"
              id="email"
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-black focus:border-black outline-none transition"
              placeholder="Business support email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          {/* Business Support Phone */}
          <div className="mb-8">
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
              Business support phone
            </label>
            <input
              type="tel" // Use type="tel" for phone numbers
              id="phone"
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-black focus:border-black outline-none transition"
              placeholder="Business support phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>
        </div>

        {/* Create Button */}
        <button
          type="submit"
          className="w-40 py-2.5 bg-gray-200 text-gray-800 rounded-md font-medium hover:bg-gray-300 transition"
        >
          Create
        </button>
      </form>
    </div>
  );
};

export const BusinessCreatePage: React.FC = () => {
  return (
    <div className="flex text-black bg-white">
      
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 p-8 overflow-y-auto">
        <div className="flex justify-start items-center gap-1 w-screen mb-10 pr-auto">
          <IoBusiness />
            <a href="/business">
              <div className="text-sm text-black text-left font-bold">Business</div>
            </a>
            <div className="text-sm text-black text-left font-bold"> / </div>
            <a href="/business/create">
              <div className="text-sm text-black text-left font-bold">Create</div>
            </a>
        </div>
      
        <CreateBusinessForm />
      </div>
    </div>
  );
};
