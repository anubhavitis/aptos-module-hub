import { IUserAccount } from "../App";
import RenderFunctions, { IPublicGame } from "./RenderFunctions";

const RenderModule = ({
  module,
  userAccount,
  deployedInfo,
}: {
  module: { module_name: string; fns: IPublicGame[] };
  userAccount: IUserAccount;
  deployedInfo: {
    tx_hash: string;
    address: string;
  };
}) => {
  return (
    <div className="px-5 py-2 rounded-lg border font-semibold flex flex-col gap-2 divide-y">
      <button className="rounded-lg text-blue-500 font-semibold flex items-center gap-2 justify-center w-min">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="w-5"
          viewBox="0 0 16 16"
        >
          <path
            fill="currentColor"
            d="m8 2l5.196 3v.178l-.866.468V5.5L8 3L3.67 5.5v5L8 13l4.33-2.5V5.77l.866-.474V11L8 14l-5.196-3V5z"
          />
          <path
            fill="currentColor"
            d="M5.243 4.429L9.597 7.04L8 7.928L3.743 5.563a.5.5 0 1 0-.486.874L7.5 8.794V13.5h1V8.794l4.243-2.357a.508.508 0 0 0 .06-.04l.392-.202V5.047l-.917.505a.573.573 0 0 0-.02.01l-.106.06l-.191.105l-1.355.753l-4.849-2.909z"
          />
        </svg>
        {module.module_name}
      </button>

      <p className="text-sm text-gray-500 pt-3">
        {module.fns.length} functions
      </p>
      <RenderFunctions
        functions={module.fns}
        userAccount={userAccount}
        deployedInfo={deployedInfo}
      />
    </div>
  );
};

export default RenderModule;
