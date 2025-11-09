// TODO: Probably should be generic (i.e. not only for business pages) in the future

import type React from "react";
import type { IconType } from "react-icons";
import { BsGraphUpArrow } from "react-icons/bs";
import { CiDiscount1 } from "react-icons/ci";
import { FaUserGroup } from "react-icons/fa6";
import { GrUserManager } from "react-icons/gr";
import { IoBusiness, IoLocationSharp } from "react-icons/io5";
import { MdOutlineRoomService, MdWork } from "react-icons/md";
import { TbMoneybag, TbReportAnalytics } from "react-icons/tb";

type Item = {
  name: string;
  linkToPage: string;
  Icon: IconType;
};

const BusinessSidebar: React.FC = () => {
  const selectedItem: string = "Business";

  const items: Item[] = [
    { name: "Business"  ,linkToPage: "#"  ,Icon: IoBusiness           },
    { name: "Co-owners" ,linkToPage: "#"  ,Icon: GrUserManager        },
    { name: "Employees" ,linkToPage: "#"  ,Icon: FaUserGroup          },
    { name: "Jobs"      ,linkToPage: "#"  ,Icon: MdWork               },
    { name: "Locations" ,linkToPage: "#"  ,Icon: IoLocationSharp      },
    { name: "Taxes"     ,linkToPage: "#"  ,Icon: TbMoneybag           },
    { name: "Reports"   ,linkToPage: "#"  ,Icon: BsGraphUpArrow       },
    { name: "Inventory" ,linkToPage: "#"  ,Icon: TbReportAnalytics    },
    { name: "Services"  ,linkToPage: "#"  ,Icon: MdOutlineRoomService },
    { name: "Discount"  ,linkToPage: "#"  ,Icon: CiDiscount1          },
  ];

  return (
    <div className="w-64 border-r border-gray-200 p-4">
      
      {/* Start Working Button */}
      <button className="w-full bg-black text-white py-2 rounded-lg font-medium mb-8 hover:bg-gray-800 transition">
        Start working
      </button>

      {/* Business Link */}
      {items.map(item => { return (
        <a href={item.linkToPage}>
          <div className={
              "flex items-center gap-2 p-2 text-black rounded-lg hover:bg-gray-200 hover:border-l-5 transition "
              + (selectedItem === item.name ? "border-l-4 border-black bg-gray-100" : "")}>
            <item.Icon className="w-5 h-5 fill-black" />
            <span className={"text-sm text-black " + (item.name === "Business" ? "font-bold" : "")}>{item.name}</span>
          </div>
        </a>
      )})}

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
}

export default BusinessSidebar;
