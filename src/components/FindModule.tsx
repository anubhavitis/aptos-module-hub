import { invoke } from "@tauri-apps/api";
import { useState } from "react";
import Loader from "./Loader";

const FindModule = ({
  setPkgName,
  setModules,
  contractAddress,
  setContractAddress,
}: {
  setPkgName: (pkgName: string) => void;
  setModules: (modules: string[]) => void;
  contractAddress: string;
  setContractAddress: (contractAddress: string) => void;
}) => {
  const [loading, setLoading] = useState(false);

  async function getModule() {
    if (!contractAddress) {
      return;
    }
    setLoading(true);
    try {
      const resp: string[] = await invoke("account_modules", {
        account: contractAddress,
      });
      console.log("response received is: ", resp);

      let respModules: string[] = resp[1].split(",");
      setPkgName(resp[0]);
      setModules(respModules);
    } catch (error) {
      console.error("Error executing shell command:", error);
      setPkgName("Failed to execute shell command.");
    } finally {
      setLoading(false);
    }
  }
  return (
    <div className="flex flex-col mt-10">
      <p className="text-2xl font-semibold">
        Lets try, Enter the contract Address
      </p>
      <input
        type="text"
        placeholder="Enter contract address"
        className="px-4 py-2.5 rounded-lg focus:outline-none border focus-within:border-black mt-2 duration-300 transition"
        value={contractAddress}
        onChange={(e) => setContractAddress(e.currentTarget.value)}
      />

      <button
        disabled={loading}
        onClick={getModule}
        className="bg-black text-white px-4 py-2.5 rounded-lg mt-4 w-36 flex justify-center items-center font-medium"
      >
        {loading ? <Loader /> : "Get Module"}
      </button>
    </div>
  );
};

export default FindModule;
