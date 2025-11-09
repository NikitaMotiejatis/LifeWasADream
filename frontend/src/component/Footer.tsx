import { type JSX } from 'react';
import { Globe, Languages } from 'lucide-react'; // TODO: remove this dep.
import { FaInstagram, FaYoutube } from 'react-icons/fa';

type FooterLink = {
  href: string;
  label: string;
};

type LinkSection = {
  title: string;
  links: FooterLink[];
};

type SocialIcon = {
  href: string;
  name: string;
  icon: JSX.Element;
};

const linkSections: LinkSection[] = [
  {
    title: 'Products',
    links: [
      { href: '#', label: 'Pricing' },
      { href: '#', label: 'Order POS' },
      { href: '#', label: 'Appointment POS' },
    ],
  },
  {
    title: 'Pricing',
    links: [
      { href: '#', label: 'Order POS' },
      { href: '#', label: 'Appointment POS' },
    ],
  },
  {
    title: 'Resources',
    links: [
      { href: '#', label: 'Documentation' },
      { href: '#', label: 'Videos' },
      { href: '#', label: 'Community' },
      { href: '#', label: 'Blog' },
    ],
  },
  {
    title: 'Company',
    links: [
      { href: '#', label: 'About Us' },
      { href: '#', label: 'Careers' },
    ],
  },
  {
    title: 'Support',
    links: [
      { href: '#', label: 'Contact Us' },
    ],
  },
];

const legalLinks: FooterLink[] = [
  { href: '#', label: 'Privacy and Security' },
  { href: '#', label: 'Privacy Notice' },
  { href: '#', label: 'Terms of Use' },
  { href: '#', label: 'Attributions' },
  { href: '#', label: 'Legal' },
];

const socialIcons: SocialIcon[] = [
  { href: '#', name: "YouTube",     icon: <FaYoutube    className="fill-black"/> },
  { href: '#', name: "Instagram",   icon: <FaInstagram  className="fill-black"/> },
];

function Footer() {
  return (
    <footer className="w-full border-t-1 border-t-black bg-white text-gray-800 py-12 px-6 lg:px-16 font-['Inter',_sans-serif]">
      <div className="max-w-7xl mx-auto">
        
        {/* Top Section: Logo + Link Columns */}
        <div className="flex flex-col lg:flex-row lg:justify-between gap-12">
          
          {/* Logo & Address */}
          <div className="flex flex-col gap-4 max-w-xs">
            {/* Logo */}
            <div className="flex items-center gap-3">
              {/* Simple SVG representation of the logo */}
              <svg width="36" height="36" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="20" cy="20" r="19" stroke="black" strokeWidth="2"/>
              </svg>
              <span className="text-2xl font-semibold text-gray-900">UniServe</span>
            </div>
            
            {/* Address */}
            <p className="text-sm text-gray-600">
              MIF fakulteto pastatas,<br />
              Didlaukio g. 47, Vilnius,<br />
              08303 Vilnius m. sav.
            </p>
          </div>
          
          {/* Link Columns */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8">
            {linkSections.map((section) => (
              <div key={section.title} className="flex flex-col gap-4">
                <h3 className="text-sm font-semibold text-gray-900">{section.title}</h3>
                <ul className="flex flex-col gap-3">
                  {section.links.map((link) => (
                    <li key={link.label}>
                      <a href={link.href} className="text-sm text-gray-600 hover:text-gray-900 hover:underline rounded focus:outline-none focus:ring-2 focus:ring-blue-500">
                        {link.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Divider */}
        <hr className="my-10 lg:my-12 border-gray-200" />

        {/* Bottom Section: Socials, Language, Legal */}
        <div className="flex flex-col gap-8">
          
          {/* Socials & Language */}
          <div className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-8">
            
            {/* Social Icons */}
            <div className="flex items-center gap-4">
              {socialIcons.map((social, index) => (
                <a 
                  key={index} 
                  href={social.href} 
                  className="text-gray-500 hover:text-gray-900 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  aria-label={`Visit our ${social.name || 'social media'}`}
                >
                    {social.icon}
                </a>
              ))}
            </div>
            
            {/* Language/Region Selectors */}
            <div className="flex items-center gap-6">
              <button type="button" className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 rounded focus:outline-none focus:ring-2 focus:ring-blue-500">
                <Globe className="w-5 h-5 stroke-white" />
                <span className="text-white">Lithuania</span>
              </button>
              <button type="button" className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 rounded focus:outline-none focus:ring-2 focus:ring-blue-500">
                <Languages className="w-5 h-5 stroke-white" />
                <span className="text-white">English</span>
              </button>
            </div>
          </div>

          {/* Legal Links */}
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
            {legalLinks.map((link) => (
              <a 
                key={link.label} 
                href={link.href} 
                className="text-xs text-gray-500 hover:text-gray-900 hover:underline rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {link.label}
              </a>
            ))}
          </div>
        </div>
        
      </div>
    </footer>
  );
};

export default Footer;
