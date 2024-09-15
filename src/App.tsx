import { useState } from "react";
import { invoke } from "@tauri-apps/api/tauri";
import "./App.css";
import { join } from "@tauri-apps/api/path";

function App() {
  const [pkgName, setPkgName] = useState("");
  const [account, setAccount] = useState("");
  const [modules, setModules] = useState<string[]>([]);
  const [modulesDisplay, setmodulesDisplay] = useState<string>("none");
  const [hostingResponse, setHostingResponse] = useState("");

  async function getModule() {
    // Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
    try {
      const resp: string[] = await invoke("account_modules", { account });
      console.log(resp);

      let respModules: string[] = resp[1].split(",");
      setPkgName(resp[0]);
      setModules(respModules);
    } catch (error) {
      console.error("Error executing shell command:", error);
      setPkgName("Failed to execute shell command.");
    }
  }

  async function hostToDevnetHandler() {
    console.log(`account: ${account} pkg_name: ${pkgName}`);
    try {
      const resp: string = await invoke("publish_to_devnet", {
        account,
        pkgName,
      });
      console.log("response received is: ", resp);
      setHostingResponse(resp);
    } catch (error) {
      console.error("Error publishing to devnet:", error);
    }
  }

  return (
    <div>
      <div>
        <img
          src="../public/aptos.png"
          alt="Aptos Banner"
          style={{ backgroundColor: "black", width: "100%" }}
        />
      </div>
      <div className="container">
        <h2> Welcome to Aptos Module Hub </h2>

        <form
          className="row"
          onSubmit={(e) => {
            e.preventDefault();
            getModule();
          }}
        >
          <input
            id="greet-input"
            onChange={(e) => setAccount(e.currentTarget.value)}
            placeholder="Enter account 0x.."
          />
          <button type="submit">Find package</button>
        </form>

        {pkgName && (
          <div
            style={{
              margin: "1px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <h4 style={{ margin: "1px" }}> Package name: </h4>
            <p style={{ margin: "1px" }}> {pkgName} </p>
          </div>
        )}

        {modules.length > 0 && (
          <div>
            <div>
              <button
                style={{
                  padding: "5px 10px",
                  margin: "2px",
                  border: "none",
                }}
                onClick={() =>
                  setmodulesDisplay(
                    modulesDisplay === "block" ? "none" : "block"
                  )
                }
              >
                show/hide modules
              </button>
            </div>
            <div
              style={{
                border: "1px solid #ddd",
                borderRadius: "8px",
                padding: "10px",
                width: "auto",
                display: modulesDisplay,
              }}
            >
              <h3>Modules</h3>
              <div id="moduleDiv">
                {modules.map((module, index) => (
                  <p key={index}>{module}</p>
                ))}
              </div>
            </div>
          </div>
        )}

        {pkgName && (
          <div style={{ margin: "1em" }}>
            <button onClick={hostToDevnetHandler}> Host to devnet </button>
            <p> {hostingResponse} </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
