import { IUserAccount } from "../App";
import { IPublicGame } from "./RenderFunctions";
import RenderModule from "./RenderModule";

const PackageList = ({
  pkg,
  modules,
  userAccount,
  deployedInfo,
}: {
  pkg: string;
  modules: {
    module_name: string;
    fns: IPublicGame[];
  }[];
  userAccount: IUserAccount;
  deployedInfo: {
    tx_hash: string;
    address: string;
  };
}) => {
  if (modules?.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-col mt-8">
      <p className="text-lg font-semibold text-gray-500">
        Package Name: <span className="text-black">{pkg}</span>
      </p>
      <p className="font-semibold text-gray-500 mt-4 ">All Modules</p>
      <div className="flex flex-col gap-5 mt-2">
        {modules.map((module, i) => (
          <RenderModule
            key={i}
            module={module}
            userAccount={userAccount}
            deployedInfo={deployedInfo}
          />
        ))}
      </div>
    </div>
  );
};

export default PackageList;
