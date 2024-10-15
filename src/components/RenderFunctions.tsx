import { useState, useEffect } from "react";
import { aptosClient, getAccountFromPrivateKey } from "../utils/util";
import { IUserAccount } from "../App";
import { AccountAddress } from "@aptos-labs/ts-sdk";
import Loader from "./Loader";

export interface IPublicGame {
  name: string;
  visibility: string;
  is_entry: boolean;
  is_view: boolean;
  generic_type_params: any[];
  params: string[];
  return: any[];
}

const RenderFunctions = ({
  functions,
  userAccount,
  deployedInfo,
}: {
  functions: IPublicGame[];
  userAccount: IUserAccount;
  deployedInfo: {
    tx_hash: string;
    address: string;
  };
}) => {
  const [selectedFunction, setSelectedFunction] = useState("");
  const [executionStatus, setExecutionStatus] = useState<string | null>(null);
  const [inputValues, setInputValues] = useState<{
    [key: string]: string | boolean;
  }>({});
  const [isLoading, setIsLoading] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);

  // useEffect(() => {
  //   if (selectedFunction) {
  //     const selectedFunctionData = functions.find(
  //       (fn) => fn.name === selectedFunction
  //     );
  //     const hasSigner =
  //       selectedFunctionData?.params.includes("&signer") || false;
  //     setInputValues((prevValues) => ({ ...prevValues, hasSigner }));
  //   }
  // }, [selectedFunction, functions]);

  const handleInputChange = (index: number, value: string) => {
    setInputValues((prevValues) => {
      const newValues = { ...prevValues };
      newValues[index] = value;
      return newValues;
    });
  };

  const renderInputField = (param: string, index: number) => {
    let inputType = "text";
    let placeholder = param;

    if (param === "u64") {
      inputType = "number";
    } else if (param === "&signer") {
      return null;
    } else if (param.startsWith("vector<")) {
      inputType = "text";
      placeholder = `${param} (comma-separated values)`;
    } else if (param === "0x1::string::String") {
      inputType = "text";
      placeholder = "String";
    }

    return (
      <input
        key={param}
        type={inputType}
        placeholder={placeholder}
        onChange={(e) => handleInputChange(index, e.target.value)}
        className="mt-2 px-4 py-2 rounded-lg border focus:outline-none w-full"
      />
    );
  };

  const selectedFunctionData = functions.find(
    (fn) => fn.name === selectedFunction
  );

  const handleExecute = async () => {
    setExecutionStatus(null);
    setTxHash(null);
    console.log("inputValues", inputValues);

    try {
      if (!selectedFunctionData) throw new Error("No function selected");

      const functionArguments = selectedFunctionData.params
        .filter((param) => param !== "&signer")
        .map((param, index) => {
          if (param === "u64") {
            const value = inputValues[index] as string;
            if (!value || isNaN(Number(value))) {
              throw new Error(`Invalid u64 value: ${value}`);
            }
            return BigInt(Math.floor(Number(value)));
          }
          if (param.startsWith("vector<")) {
            // Assuming vector of strings for simplicity
            return (inputValues[index] as string)
              .split(",")
              .map((v) => v.trim());
          }
          return inputValues[index] as string;
        });

      console.log(
        "functionArguments",
        functionArguments,
        selectedFunction,
        deployedInfo
      );
      setIsLoading(true);
      const tx = await aptosClient.transaction.build.simple({
        sender: AccountAddress.from(userAccount.account),
        data: {
          function: `${deployedInfo.address}::dragon::${selectedFunction}`,
          functionArguments: functionArguments,
        },
      });

      console.log("simulated tx", tx);

      const account = await getAccountFromPrivateKey(userAccount.private_key);
      console.log("account", account);

      const pendingTransaction = await aptosClient.signAndSubmitTransaction({
        signer: account,
        transaction: tx,
      });

      console.log("pendingTransaction", pendingTransaction);

      const response = await aptosClient.waitForTransaction({
        transactionHash: pendingTransaction.hash,
      });

      console.log("response", response);
      setTxHash(response.hash);
    } catch (error) {
      console.error("Error executing function:", error);
      setExecutionStatus(`Error: ${(error as Error).message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-2 pt-3">
      <select
        className="px-4 h-10 rounded-xl focus:outline-none bg-transparent"
        onChange={(e) => setSelectedFunction(e.target.value)}
      >
        <option value="">Select a function</option>
        {functions.map((fn, i) => (
          <option key={i} value={fn.name}>
            {fn.name}
          </option>
        ))}
      </select>

      {selectedFunction && (
        <div className="flex flex-wrap gap-2">
          {selectedFunctionData?.params
            .filter((param) => param !== "&signer")
            .map((param, i) => (
              <div key={i} className="w-full">
                {renderInputField(param, i)}
              </div>
            ))}
          <button
            onClick={handleExecute}
            className="mt-2 px-4 py-2 w-28 bg-blue-500 text-white rounded-xl disabled:opacity-50 flex justify-center items-center disabled:cursor-not-allowed"
            disabled={isLoading}
          >
            {isLoading ? <Loader /> : "Execute"}
          </button>
        </div>
      )}

      {executionStatus ||
        (txHash && (
          <div className="mt-4 p-4 bg-gray-100 rounded-lg">
            {txHash && <p>Transaction successful!</p>}
            <a
              href={`https://aptoscan.com/transaction/${txHash}?network=devnet`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500"
            >
              <span className="text-black/60">Tx Hash:</span>{" "}
              {txHash?.slice(0, 10)}...{txHash?.slice(-4)}
            </a>
            {executionStatus && <p>{executionStatus}</p>}
          </div>
        ))}
    </div>
  );
};

export default RenderFunctions;
