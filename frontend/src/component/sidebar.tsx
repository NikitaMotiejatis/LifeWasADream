import React from 'react';
import { HiOutlineBriefcase } from 'react-icons/hi';

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

export default Sidebar;
