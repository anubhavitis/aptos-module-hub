import { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import "./App.css";
import FindModule from "./components/FindModule";
import PackageList from "./components/PackageList";
import { IPublicGame } from "./components/RenderFunctions";
import { formatAddress, fundAccount, getAccountInfo } from "./utils/util";

function extractResultObject(apiResponse: string) {
  // Find the position of the JSON object start
  const jsonStart = apiResponse.indexOf('stdout: "') + 9;
  const jsonEnd = apiResponse.lastIndexOf(
    '"',
    apiResponse.lastIndexOf("stderr:") - 1
  );

  if (jsonStart !== -1 && jsonEnd !== -1) {
    try {
      // Extract the JSON string and unescape it
      const jsonString = apiResponse
        .slice(jsonStart, jsonEnd)
        .replace(/\\n/g, "\n")
        .replace(/\\"/g, '"');

      // Find the actual JSON object within the unescaped string
      const match = jsonString.match(/\{[\s\S]*\}/);

      if (match) {
        // Parse the JSON string
        const jsonData = JSON.parse(match[0]);

        // Return the Result object
        return jsonData.Result;
      }
    } catch (error) {
      console.error("Error parsing JSON:", error);
    }
  }

  console.error("No valid JSON found in the response");
  return null;
}

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
  const [deployedInfo, setDeployedInfo] = useState({
    tx_hash: "",
    address: "",
  });
  const [moduleWithFunctions, setModuleWithFunctions] = useState<
    {
      module_name: string;
      fns: IPublicGame[];
    }[]
  >([]);
  const [deploying, setDeploying] = useState(false);
  async function hostToDevnetHandler() {
    console.log(`account: ${contractAddress} pkg_name: ${pkgName}`);
    try {
      setDeploying(true);
      let resp = (await invoke("publish_to_devnet", {
        account: contractAddress,
        pkgName,
      })) as string;
      console.log("response received is in app.tsx: ", resp);
      const result = extractResultObject(resp);
      setDeployedInfo({
        tx_hash: result.transaction_hash,
        address: result.sender,
      });
    } catch (error) {
      console.error("Error publishing to devnet:", error);
    } finally {
      setDeploying(false);
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
          <p className="border border-gray-300 rounded-xl p-2 text-sm">
            Balance: {balance} APT
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between mt-6">
        <p className="text-sm flex items-center gap-2">
          Account: {formatAddress(userAccount.account)}
          <button
            className="bg-blue-500 text-white py-1.5 px-3 rounded-xl text-sm"
            onClick={() => navigator.clipboard.writeText(userAccount.account)}
          >
            Copy
          </button>
        </p>
        <button
          onClick={async () => {
            await fundAccount(userAccount.account, 100000000);
            fetchBalance();
          }}
          className="bg-blue-500 text-white py-2 px-4 rounded-xl text-sm"
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
        deployedInfo={deployedInfo}
        deploying={deploying}
        hostingResponse={hostingResponse}
      />

      <PackageList
        pkg={pkgName}
        modules={moduleWithFunctions}
        userAccount={userAccount}
        deployedInfo={deployedInfo}
      />
    </div>
  );
}

export default App;
