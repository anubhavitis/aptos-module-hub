import { invoke } from "@tauri-apps/api";
import React from "react";
import { toast } from "sonner";

const ModuleInteraction = () => {
  const [contractAddress, setContractAddress] = React.useState("");
  const [modules, setModules] = React.useState<string[]>([]);
  const [pkgName, setPkgName] = React.useState("");
  const [loading, setLoading] = React.useState(false);

  const getModules = async () => {
    try {
      setLoading(true);
      const resp: string[] = await invoke("account_modules", {
        account: contractAddress,
      });
      console.log(resp);

      let respModules: string[] = resp[1].split(",");
      setPkgName(resp[0]);
      setModules(respModules);
    } catch (error) {
      console.error("Error executing shell command:", error);
      toast.error("Error fetching modules");
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="mt-20 flex flex-col">
      <p className="text-4xl font-semibold">
        Lets try, Enter the{" "}
        <span className="font-instrument text-primary text-5xl">contract</span>{" "}
        address
      </p>
      <input
        type="text"
        className="px-4 py-3 mt-6 max-w-2xl rounded-xl border border-white/10 bg-transparent focus:outline-none focus-within:border-white/70 transition duration-300"
        placeholder="Enter contract address"
        value={contractAddress}
        onChange={(e) => setContractAddress(e.target.value)}
      />
      <button
        onClick={getModules}
        disabled={loading}
        className="px-6 py-2.5 w-36 mt-6 bg-primary text-dark rounded-lg font-medium"
      >
        Get Modules
      </button>
    </div>
  );
};

export default ModuleInteraction;
