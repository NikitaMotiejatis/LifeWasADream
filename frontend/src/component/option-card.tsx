import React from "react";
import type { IconType } from "react-icons";

type Option = {
  name: string;
  linkPath: string;
  Icon: IconType;
}

const OptionCard: React.FC<Option> = ({name, linkPath, Icon}) => {
  return (
    <a href={linkPath}>
        <div className="w-48 h-32 text-center cursor-pointer border-1 border-black hover:bg-gray-200 transition p-4 rounded-xl">
            <div className="w-16 h-16 border border-gray-400 rounded-full mx-auto mb-2 flex items-center justify-center">
                <Icon className="w-10 h-10 text-gray-600" />
            </div>
            <span className="text-sm text-black font-medium">{name}</span>
        </div>
    </a>
  );
};

export default OptionCard;
