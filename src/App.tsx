import { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/tauri";
import "./App.css";
import FindModule from "./components/FindModule";
import PackageList from "./components/PackageList";
import { IPublicGame } from "./components/RenderFunctions";

function App() {
  const [pkgName, setPkgName] = useState("");
  const [contractAddress, setContractAddress] = useState("");
  const [hostingResponse, setHostingResponse] = useState("");
  const [userAccount, setUserAccount] = useState({});

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
      setHostingResponse(resp);
    } catch (error) {
      console.error("Error publishing to devnet:", error);
    }
  }

  async function getUserAccount() {
    try {
      const account: string = await invoke("get_account_details");
      console.log("account: ", account);
    } catch (error) {
      console.error("Error getting user account:", error);
    }
  }

  useEffect(() => {
    getUserAccount();
  }, []);

  return (
    <div className="container mx-auto my-10">
      <h1 className="text-4xl font-bold">
        Mod<span className="italic text-blue-500">Hub</span>
      </h1>
      <FindModule
        setPkgName={setPkgName}
        contractAddress={contractAddress}
        setContractAddress={setContractAddress}
        setModuleWithFunctions={setModuleWithFunctions}
      />
      <PackageList
        pkg={pkgName}
        modules={moduleWithFunctions}
        hostToDevnetHandler={hostToDevnetHandler}
        hostingResponse={hostingResponse}
      />
    </div>
  );
}

export default App;
