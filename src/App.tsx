import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster } from "sonner";
import { useState } from "react";
import { invoke } from "@tauri-apps/api/tauri";
import Home from "./pages/Home";
import Navbar from "./components/Navbar";
import ModuleInteraction from "./pages/ModuleInteraction";

function App() {
  const [pkgName, setPkgName] = useState("");
  const [account, setAccount] = useState("");
  const [modulesDisplay, setmodulesDisplay] = useState<string>("none");
  const [hostingResponse, setHostingResponse] = useState("");

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
    <BrowserRouter>
      <Toaster />
      <Navbar />
      <main className="max-w-6xl mx-auto px-4">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/app" element={<ModuleInteraction />} />
        </Routes>
      </main>

      {/* <div>
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
      </div> */}
    </BrowserRouter>
  );
}

export default App;
