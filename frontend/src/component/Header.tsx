import React from 'react';
import { FaSearch, FaBell, FaClipboardCheck, FaUser, FaLanguage } from 'react-icons/fa';

type NavLinkProps = {
  href: string;
  children: React.ReactNode;
  isActive?: boolean;
};

const NavLink: React.FC<NavLinkProps> = ({ href, children, isActive = false }) => {
  return (
    <li>
      <a
        href={href}
        className={`
          flex items-center h-16 px-1
          text-sm font-medium
          ${
            isActive
              ? 'text-black font-bold border-b-[3px] border-black'
              : 'text-gray-600 border-b-[3px] border-transparent hover:text-black'
          }
        `}
      >
        {children}
      </a>
    </li>
  );
};

// Define the Header component as a Functional Component (FC)
const Header: React.FC = () => {
  return (
    <nav className="flex items-center justify-between h-16 bg-white px-8 border-b border-gray-200 shadow-sm">
      
      {/* Left Side: Logo and Navigation */}
      <div className="flex items-center gap-10">
        
        {/* Logo */}
        <div className="flex items-center gap-2 cursor-pointer">
          <div className="w-9 h-9 border-[3px] border-black rounded-full"></div>
          <span className="text-2xl font-semibold text-black">UniServe</span>
        </div>

        {/* Navigation Links */}
        <ul className="flex items-center h-full gap-8">
          <NavLink href="#" isActive={true}>Home</NavLink>
          <NavLink href="#">Stared</NavLink>
          <NavLink href="#">Recent</NavLink>
          <NavLink href="#">Business</NavLink>
          <NavLink href="#">Work</NavLink>
        </ul>
      </div>

      {/* Right Side: Support and Icons */}
      <div className="flex items-center gap-6">
        <a href="#" className="text-sm font-medium text-gray-600 hover:text-black">
          Support
        </a>
        
        {/* Icon Links */}
        <a href="#" className="text-xl text-gray-600 hover:text-black"><FaSearch /></a>
        <a href="#" className="text-xl text-gray-600 hover:text-black"><FaBell /></a>
        <a href="#" className="text-xl text-gray-600 hover:text-black"><FaClipboardCheck /></a>
        <a href="#" className="text-xl text-gray-600 hover:text-black"><FaUser /></a>
        <a href="#" className="text-xl text-gray-600 hover:text-black"><FaLanguage /></a>
      </div>

    </nav>
  );
}

export default Header;
