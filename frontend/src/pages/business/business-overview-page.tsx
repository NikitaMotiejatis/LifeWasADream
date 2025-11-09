import type { IconType } from "react-icons";
import { BsGraphUpArrow } from "react-icons/bs";
import { CiDiscount1 } from "react-icons/ci";
import { FaUserGroup } from "react-icons/fa6";
import { GrUserManager } from "react-icons/gr";
import { HiOutlineBriefcase } from "react-icons/hi";
import { IoBusiness, IoLocationSharp } from "react-icons/io5";
import { MdEdit, MdOutlineRoomService, MdWork } from "react-icons/md";
import { TbMoneybag, TbReportAnalytics } from "react-icons/tb";
import { useParams } from "react-router-dom";

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


type ManageYourBusinessOption = {
  name: string;
  Icon: IconType;
}

const ManageYourBusinessOptionCard: React.FC<ManageYourBusinessOption> = ({name, Icon}) => {
  return (
    <a href="/business/create">
        <div className="w-48 h-32 text-center cursor-pointer border-1 border-black hover:bg-gray-200 transition p-4 rounded-xl">
            <div className="w-16 h-16 border border-gray-400 rounded-full mx-auto mb-2 flex items-center justify-center">
                <Icon className="w-10 h-10 text-gray-600" />
            </div>
            <span className="text-sm text-black font-medium">{name}</span>
        </div>
    </a>
  );
};

type PagePath = {
  steps: string[];
};

const PathComponent: React.FC<PagePath> = ({steps}) => {
  let subpaths: string[][] = [];
  for (let i = 1; i <= steps.length; ++i) {
    subpaths.push(steps.slice(0, i));
  }

  return (
    <div className="flex justify-start items-center gap-1 w-screen mb-10 pr-auto">
      <IoBusiness />
      {subpaths.map(subpath => { return (
        <>
          <a href={subpath.join("/").toLowerCase()}>
            <div className="text-sm text-black text-left font-bold">{subpath.at(-1)}</div>
          </a>
          <div className="text-sm text-black text-left font-bold"> / </div>
        </>
      )})}
    </div>
  )
}

type Business = {
  id: number;
  name: string;
};

const BusinessOverviewPage: React.FC = () => {
  const params = useParams();

  // TODO: should be fetched from DB
  const business: Business = { id: Number(params.businessId), name: "Business 1"};

  return (
    <div className="flex text-black bg-white">
      
      <Sidebar />
      
      {/* Main Content Area */}
      <div className="flex-1 p-8 overflow-y-auto">
        
        {/* Header - Business */}
        <PathComponent steps={["Business", business.name]} />

        {/* Section 1: Manage Businesses */}
        <div className="mb-10 text-left">
          <h3 className="text-lg font-semibold mb-2">Manage business</h3>
          <p className="text-sm text-gray-500 mb-4">
            Choose quick actions for {business.name} management.
          </p>
          <div className="grid grid-cols-4 gap-5">
            <ManageYourBusinessOptionCard name="Manage co-owners" Icon={GrUserManager}/>
            <ManageYourBusinessOptionCard name="Manage employees" Icon={FaUserGroup}/>
            <ManageYourBusinessOptionCard name="Manage jobs"      Icon={MdWork}/>
            <ManageYourBusinessOptionCard name="Manage locations" Icon={IoLocationSharp}/>
            <ManageYourBusinessOptionCard name="View taxes"       Icon={TbMoneybag}/>
            <ManageYourBusinessOptionCard name="View reports"     Icon={BsGraphUpArrow}/>
            <ManageYourBusinessOptionCard name="Manage inventory" Icon={TbReportAnalytics}/>
            <ManageYourBusinessOptionCard name="Manage services"  Icon={MdOutlineRoomService}/>
            <ManageYourBusinessOptionCard name="Manage discount"  Icon={CiDiscount1}/>
            <ManageYourBusinessOptionCard name="Edit business"    Icon={MdEdit}/>
          </div>
        </div>

      </div>
    </div>
  );
};

export default BusinessOverviewPage;
