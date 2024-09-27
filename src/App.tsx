import { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import "./App.css";
import FindModule from "./components/FindModule";
import PackageList from "./components/PackageList";
import { IPublicGame } from "./components/RenderFunctions";
import { formatAddress, fundAccount, getAccountInfo } from "./utils/util";

export interface IUserAccount {
  account: string;
  private_key: string;
  public_key: string;
}

function App() {
  const [pkgName, setPkgName] = useState("");
  const [contractAddress, setContractAddress] = useState("");
  const [hostingResponse, setHostingResponse] = useState("");
  const [balance, setBalance] = useState(0);
  const [userAccount, setUserAccount] = useState<IUserAccount>({
    account: "",
    private_key: "",
    public_key: "",
  });
  const [deployedAddress, setDeployedAddress] = useState("");
  const [moduleWithFunctions, setModuleWithFunctions] = useState<
    {
      module_name: string;
      fns: IPublicGame[];
    }[]
  >([]);
  async function hostToDevnetHandler() {
    console.log(`account: ${contractAddress} pkg_name: ${pkgName}`);
    try {
      const resp: string = await invoke("publish_to_devnet", {
        account: contractAddress,
        pkgName,
      });
      console.log("response received is: ", resp);
      // console.log("parsed response is: ", parsedResponse);
      setHostingResponse(resp);
    } catch (error) {
      console.error("Error publishing to devnet:", error);
    }
  }

  const fetchBalance = async () => {
    if (!userAccount.account) return;
    const balance = await getAccountInfo(userAccount.account);
    setBalance(balance);
  };
  async function getUserAccount() {
    try {
      const details: IUserAccount = await invoke("get_account_details");
      setUserAccount({
        account: details?.account,
        private_key: details?.private_key,
        public_key: details?.public_key,
      });
    } catch (error) {
      console.error("Error getting user account:", error);
    }
  }

  useEffect(() => {
    if (userAccount?.account === "") {
      getUserAccount();
    }
    fetchBalance();
  }, [userAccount]);

  return (
    <div className="container mx-auto my-10">
      <div className="flex flex-row justify-between">
        <h1 className="text-4xl font-bold">
          Mod<span className="italic text-blue-500">Hub</span>
        </h1>
        <div className="flex flex-col gap-4">
          <p className="border border-gray-300 rounded-md p-2">
            Balance: {balance} APT
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between mt-6">
        <p className="text-sm flex items-center gap-2">
          Account: {formatAddress(userAccount.account)}
          <button
            className="bg-blue-500 text-white py-1.5 px-3 rounded-md text-sm"
            onClick={() => navigator.clipboard.writeText(userAccount.account)}
          >
            Copy
          </button>
        </p>
        <button
          onClick={() => fundAccount(userAccount.account, 100000000)}
          className="bg-blue-500 text-white py-2 px-4 rounded-md text-sm"
        >
          Fund Account
        </button>
      </div>

      <FindModule
        setPkgName={setPkgName}
        contractAddress={contractAddress}
        setContractAddress={setContractAddress}
        setModuleWithFunctions={setModuleWithFunctions}
        hostToDevnetHandler={hostToDevnetHandler}
        pkgName={pkgName}
        setDeployedAddress={setDeployedAddress}
        deployedAddress={deployedAddress}
        hostingResponse={hostingResponse}
      />

      <PackageList
        pkg={pkgName}
        modules={moduleWithFunctions}
        userAccount={userAccount}
      />
    </div>
  );
}

export default App;
