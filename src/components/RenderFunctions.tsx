import { useState, useEffect } from "react";
import { aptosClient } from "../utils/util";
import { IUserAccount } from "../App";
import { EntryFunctionPayloadResponse } from "@aptos-labs/ts-sdk";

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
}: {
  functions: IPublicGame[];
  userAccount: IUserAccount;
}) => {
  const [selectedFunction, setSelectedFunction] = useState("");
  const [executionStatus, setExecutionStatus] = useState<string | null>(null);
  const [inputValues, setInputValues] = useState<{
    [key: string]: string | boolean;
  }>({ hasSigner: false });

  useEffect(() => {
    if (selectedFunction) {
      const selectedFunctionData = functions.find(
        (fn) => fn.name === selectedFunction
      );
      const hasSigner =
        selectedFunctionData?.params.includes("&signer") || false;
      setInputValues((prevValues) => ({ ...prevValues, hasSigner }));
    }
  }, [selectedFunction, functions]);

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
    setExecutionStatus("Executing...");
    console.log("inputValues", inputValues);
    if (inputValues.hasSigner) {
      console.log("This function requires a signer.");
    }

    try {
      if (!selectedFunctionData) throw new Error("No function selected");

      const functionArguments = selectedFunctionData.params.map(
        (param, index) => {
          if (param === "&signer") return userAccount.account;
          if (param === "u64") return BigInt(inputValues[index] as string);
          if (param.startsWith("vector<")) {
            // Assuming vector of strings for simplicity
            return (inputValues[index] as string)
              .split(",")
              .map((v) => v.trim());
          }
          return inputValues[index] as string;
        }
      );

      //  const payload: EntryFunctionPayloadResponse = {
      //    function: `${moduleAddress}::${selectedFunction}`,
      //    type_arguments: [], // Assuming no type arguments for simplicity
      //    arguments: functionArguments,
      //  };

      //  const transaction = await aptosClient.generateTransaction({
      //    sender: AccountAddress.from(userAccount.address),
      //    data: payload,
      //  });

      //  const pendingTransaction = await aptos.signAndSubmitTransaction({
      //    signer: userAccount, // Assuming userAccount has the necessary signing methods
      //    transaction,
      //  });

      //  const response = await aptos.waitForTransaction({
      //    transactionHash: pendingTransaction.hash,
      //  });

      //  setExecutionStatus(`Transaction successful! Hash: ${response.hash}`);
    } catch (error) {
      console.error("Error executing function:", error);
      setExecutionStatus(`Error: ${(error as Error).message}`);
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
          {selectedFunctionData?.params.map((param, i) => (
            <div key={i} className="w-full">
              {renderInputField(param, i)}
            </div>
          ))}
          <button
            onClick={handleExecute}
            className="mt-2 px-4 py-2 bg-blue-500 text-white rounded-lg"
          >
            Execute
          </button>
        </div>
      )}
    </div>
  );
};

export default RenderFunctions;
