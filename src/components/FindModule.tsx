import { invoke } from "@tauri-apps/api/core";
import { IPublicGame } from "./RenderFunctions";

const FindModule = ({
  setPkgName,
  contractAddress,
  setContractAddress,
  setModuleWithFunctions,
  hostToDevnetHandler,
  pkgName,
  setDeployedAddress,
  deployedAddress,
  hostingResponse,
}: {
  setPkgName: (pkgName: string) => void;
  contractAddress: string;
  setContractAddress: (contractAddress: string) => void;
  setModuleWithFunctions: React.Dispatch<
    React.SetStateAction<
      {
        module_name: string;
        fns: IPublicGame[];
      }[]
    >
  >;
  hostToDevnetHandler: () => void;
  pkgName: string;
  setDeployedAddress: (deployedAddress: string) => void;
  deployedAddress: string;
  hostingResponse: string;
}) => {
  // const [loading, setLoading] = useState(false);

  async function getModule() {
    if (!contractAddress) {
      return;
    }
    try {
      const resp: string[] = await invoke("account_modules", {
        account: contractAddress,
      });
      console.log("response received is: ", resp);

      setPkgName(resp[0]);
    } catch (error) {
      console.error("Error executing shell command:", error);
      setPkgName("Failed to execute shell command.");
    } finally {
    }
  }

  const getModuleWithFunctions = async () => {
    const apiHost = "https://api.mainnet.aptoslabs.com/v1";
    const url = `${apiHost}/accounts/${contractAddress}/modules`;

    fetch(url)
      .then((response) => response.json())
      .then((data) => {
        if (data.length > 0) {
          const moduleWithFunctions = data.map((module: any) => {
            return {
              module_name: module.abi.name,
              fns: module.abi.exposed_functions,
            };
          });
          setModuleWithFunctions(moduleWithFunctions);
        }
      })
      .catch((error) => {
        console.error("Error fetching modules:", error);
      });
  };
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
        onClick={() => {
          getModule();
          getModuleWithFunctions();
        }}
        className="bg-black text-white px-4 py-2.5 rounded-lg mt-4 w-36 flex justify-center items-center font-medium"
      >
        Get Module
      </button>

      <div className="border rounded-xl p-8 bg-gray-50 mt-10">
        <p className="text-lg font-semibold">
          You can deploy it on{" "}
          <span className="italic text-blue-500">Devnet</span>
        </p>

        <button
          onClick={hostToDevnetHandler}
          disabled={!pkgName || !contractAddress || deployedAddress?.length > 0}
          className="mt-5 w-28 font-semibold px-4 py-2 bg-blue-500 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Deploy
        </button>
      </div>

      {hostingResponse && (
        <div className="border rounded-xl p-8 bg-gray-50 mt-10">
          <p className="text-lg font-semibold">
            Hosting Response:{" "}
            <span className="italic text-blue-500">{hostingResponse}</span>
          </p>
        </div>
      )}
    </div>
  );
};

export default FindModule;
