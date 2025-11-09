import { HiDotsVertical, HiOutlineBriefcase, HiOutlineUser } from "react-icons/hi";
import { MdOutlineAddBox, MdOutlineViewModule, MdViewList } from "react-icons/md";
import PagePathDisplay from "../../component/page-path-display";
import OptionCard from "../../component/option-card";

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

type BusinessCardProps = {
  id: number;
  title: string;
  isCoOwned: boolean;
};

const BusinessCard: React.FC<BusinessCardProps> = ({ id, title, isCoOwned }) => {
  return (
    <a href={"/business/" + id.toString()}>
    <div className="w-64 text-black border border-gray-300 rounded-lg p-3 shadow-sm flex flex-col justify-between hover:bg-gray-200 transition">
      
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <h4 className="font-medium text-sm pr-4">{title}</h4>
        <HiDotsVertical className="w-5 h-5 text-gray-400 cursor-pointer flex-shrink-0" />
      </div>

      {/* Content Box (Placeholder) */}
      <div className="h-20 bg-gray-50 border border-dashed border-gray-300 rounded mb-4"></div>

      {/* Footer */}
      <div className="flex justify-between items-center text-xs text-gray-500">
        <div className="flex items-center gap-1">
          {isCoOwned && <HiOutlineUser className="w-4 h-4" />}
          <span>You viewed * Oct 9, 2025</span>
        </div>
        <button className="bg-white border border-black text-black text-xs px-3 py-1 rounded hover:bg-gray-100 transition">
          Open
        </button>
      </div>
    </div>
    </a>
  );
};

const BusinessMainPage: React.FC = () => {
  
  // TODO: should be fetched from DB
  const businesses: BusinessCardProps[] = [
    { id: 1, title: "Business 1", isCoOwned: false },
    { id: 2, title: "Business 2", isCoOwned: false },
    { id: 3, title: "Business 3", isCoOwned: true },
    { id: 4, title: "Business 4", isCoOwned: true },
  ];

  return (
    <div className="flex text-black bg-white">
      
      <Sidebar />
      
      {/* Main Content Area */}
      <div className="flex-1 p-8 overflow-y-auto">
        
        {/* Header - Business */}
        <PagePathDisplay steps={["Business"]} />

        {/* Section 1: Manage Businesses */}
        <div className="mb-10 text-left">
          <h3 className="text-lg font-semibold mb-2">Manage businesses</h3>
          <p className="text-sm text-gray-500 mb-4">
            Choose quick actions for businesses management.
          </p>
          <OptionCard name="Create new business" linkPath="business/create" Icon={MdOutlineAddBox} />
        </div>

        {/* Section 2: Your Businesses */}
        <div className="mb-10 text-left">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Your businesses</h3>
            <div className="flex items-center gap-2 text-gray-500">
              <MdViewList className="w-5 h-5 cursor-pointer hover:text-black" />
              <MdOutlineViewModule className="w-5 h-5 text-black cursor-pointer" />
            </div>
          </div>
          <p className="text-sm text-gray-500 mb-4">
            Check out your owned businesses individually.
          </p>
          <div className="flex gap-6">
            {businesses
              .filter(b => !b.isCoOwned)
              .map((b) => <BusinessCard id={b.id} title={b.title} isCoOwned={b.isCoOwned} />)
            }
          </div>
        </div>

        {/* Section 3: Co-owned Businesses */}
        <div className="mb-10 text-left">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Co-owned businesses</h3>
            <div className="flex items-center gap-2 text-gray-500">
              <MdViewList className="w-5 h-5 cursor-pointer hover:text-black" />
              <MdOutlineViewModule className="w-5 h-5 text-black cursor-pointer" />
            </div>
          </div>
          <p className="text-sm text-gray-500 mb-4">
            Check businesses that you own partially.
          </p>
          <div className="flex gap-6">
            {businesses
              .filter(b => b.isCoOwned)
              .map((b) => <BusinessCard id={b.id} title={b.title} isCoOwned={b.isCoOwned} />)
            }
          </div>
        </div>
      </div>
    </div>
  );
};

export default BusinessMainPage;
