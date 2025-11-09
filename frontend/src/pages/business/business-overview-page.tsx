import { BsGraphUpArrow } from "react-icons/bs";
import { CiDiscount1 } from "react-icons/ci";
import { FaUserGroup } from "react-icons/fa6";
import { GrUserManager } from "react-icons/gr";
import { IoLocationSharp } from "react-icons/io5";
import { MdEdit, MdOutlineRoomService, MdWork } from "react-icons/md";
import { TbMoneybag, TbReportAnalytics } from "react-icons/tb";
import { useParams } from "react-router-dom";
import PagePathDisplay from "../../component/page-path-display";
import OptionCard from "../../component/option-card";
import BusinessSidebar from "./business-sidebar";

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
      
      <BusinessSidebar />
      
      {/* Main Content Area */}
      <div className="flex-1 p-8 overflow-y-auto">
        
        {/* Header - Business */}
        <PagePathDisplay steps={["Business", business.name]} />

        {/* Section 1: Manage Businesses */}
        <div className="mb-10 text-left">
          <h3 className="text-lg font-semibold mb-2">Manage business</h3>
          <p className="text-sm text-gray-500 mb-4">
            Choose quick actions for {business.name} management.
          </p>
          <div className="grid grid-cols-4 gap-5">
            <OptionCard name="Manage co-owners" linkPath="#" Icon={GrUserManager}/>
            <OptionCard name="Manage employees" linkPath="#" Icon={FaUserGroup}/>
            <OptionCard name="Manage jobs"      linkPath="#" Icon={MdWork}/>
            <OptionCard name="Manage locations" linkPath="#" Icon={IoLocationSharp}/>
            <OptionCard name="View taxes"       linkPath="#" Icon={TbMoneybag}/>
            <OptionCard name="View reports"     linkPath="#" Icon={BsGraphUpArrow}/>
            <OptionCard name="Manage inventory" linkPath="#" Icon={TbReportAnalytics}/>
            <OptionCard name="Manage services"  linkPath="#" Icon={MdOutlineRoomService}/>
            <OptionCard name="Manage discount"  linkPath="#" Icon={CiDiscount1}/>
            <OptionCard name="Edit business"    linkPath="#" Icon={MdEdit}/>
          </div>
        </div>

      </div>
    </div>
  );
};

export default BusinessOverviewPage;
