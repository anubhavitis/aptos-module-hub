const PackageList = ({
  pkg,
  modules,
  hostToDevnetHandler,
  hostingResponse,
}: {
  pkg: string;
  modules: string[];
  hostToDevnetHandler: () => void;
  hostingResponse: string;
}) => {
  if (!pkg) {
    return null;
  }

  return (
    <div className="flex flex-col mt-8">
      <p className="text-lg font-semibold text-gray-500">
        Package Name: <span className="text-black">{pkg}</span>
      </p>
      <p className="font-semibold text-gray-500 mt-4 ">All Modules</p>
      <div className="flex flex-wrap gap-5 mt-2">
        {modules.map((module) => (
          <button
            key={module}
            className="px-6 py-2 rounded-lg border font-semibold text-blue-500 border-blue-200 flex items-center gap-2 justify-center"
          >
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
            {module}
          </button>
        ))}
      </div>

      <div className="border rounded-xl p-8 bg-gray-50 mt-10">
        <p className="text-lg font-semibold">
          You can deploy it on{" "}
          <span className="italic text-blue-500">Devnet</span>
        </p>

        <button
          onClick={hostToDevnetHandler}
          className="mt-5 w-28 font-semibold px-4 py-2 bg-blue-500 text-white rounded-lg"
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

export default PackageList;
