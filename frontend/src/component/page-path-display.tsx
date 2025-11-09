// TODO: might be a good idea to put somewhere in near business
// if its not gonna be used anywhere else.

import React from "react";
import { IoBusiness } from "react-icons/io5";

type PagePath = {
  steps: string[];
};

type StepElement = {
  stepLink: string;
  stepName: string;
};

const elementClasses: string = "text-sm text-black text-left font-bold";

const StepElement: React.FC<StepElement> = ({stepLink, stepName}) => {
  return (
    <a href={stepLink}>
      <div className={elementClasses}>{stepName}</div>
    </a>
  );
}

const SlashElement: React.FC = () => {
  return (
    <div className={elementClasses}> / </div>
  );
}

const PagePathDisplay: React.FC<PagePath> = ({steps}) => {
  const firstStep = steps.at(0);
  if (firstStep === undefined) {
    return (<></>);
  }

  return (
    <div className="flex justify-start items-center gap-1 w-screen mb-10 pr-auto">
      <IoBusiness />

      <StepElement stepLink={firstStep} stepName={firstStep} />

      {steps
        .slice(1)
        .reduce((acc, val) => [...acc, [...(acc.at(-1) ?? [firstStep]), val]], [] as string[][]) // nice
        .map(path => { return (
          <>
            <SlashElement />
            <StepElement stepLink={path.join("/").toLowerCase()} stepName={path.at(-1) ?? ""} />
          </>
      )})}
    </div>
  );
}

export default PagePathDisplay;
