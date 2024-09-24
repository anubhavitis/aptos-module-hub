import { IPublicGame } from "./RenderFunctions";
import RenderModule from "./RenderModule";

const PackageList = ({
  pkg,
  modules,
  hostToDevnetHandler,
  hostingResponse,
}: {
  pkg: string;
  modules: {
    module_name: string;
    fns: IPublicGame[];
  }[];
  hostToDevnetHandler: () => void;
  hostingResponse: string;
}) => {
  console.log("modules: ", modules);

  if (modules?.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-col mt-8">
      <p className="text-lg font-semibold text-gray-500">
        Package Name: <span className="text-black">{pkg}</span>
      </p>
      <p className="font-semibold text-gray-500 mt-4 ">All Modules</p>
      <div className="flex flex-col gap-5 mt-2">
        {modules.map((module, i) => (
          <RenderModule key={i} module={module} />
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
