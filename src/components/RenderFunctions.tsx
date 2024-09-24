import { useState } from "react";

export interface IPublicGame {
  name: string;
  visibility: string;
  is_entry: boolean;
  is_view: boolean;
  generic_type_params: any[];
  params: string[];
  return: any[];
}

const RenderFunctions = ({ functions }: { functions: IPublicGame[] }) => {
  const [selectedFunction, setSelectedFunction] = useState("");
  const [inputValues, setInputValues] = useState<{ [key: string]: string }>({});

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
      return null; // Signer is handled by the wallet
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

  const handleExecute = () => {
    console.log("inputValues", inputValues);
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
