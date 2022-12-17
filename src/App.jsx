import { Web3Provider } from "@ethersproject/providers"
import { Web3ReactProvider } from "@web3-react/core"
import React, { useEffect } from "react"
import ReactDOM from "react-dom/client"
import Background from "./components/Background"
import { AudioProvider } from "./context/AudioContext"
import Landing from "./components/Landing"

import AudioButton from "./components/AudioButton"
import Scene from "./components/Scene"
import { ViewProvider } from "./context/ViewContext"
import { SceneProvider } from "./context/SceneContext"

import Gate from "./components/Gate"

// dynamically import the manifest
const assetImportPath = import.meta.env.VITE_ASSET_PATH + "/manifest.json";
  
function App() {
  const [templateInfo, setTemplateInfo] = React.useState(null);
    // fetch the manifest, then set it
    useEffect(() => {
      async function fetchManifest() {
        const response = await fetch(assetImportPath);
        const data = await response.json();
        return data;
      }
  
      fetchManifest().then((data) => {
        setTemplateInfo(data)
      });
    }, []);
  return templateInfo && (
      <Web3ReactProvider getLibrary={getLibrary}>
        <AudioProvider>
          <SceneProvider>
            <ViewProvider>
              <Background />
              <Gate />
              <Landing  />
              <AudioButton />
             <Scene template={templateInfo} />
            </ViewProvider>
          </SceneProvider>
        </AudioProvider>
      </Web3ReactProvider>
  )
}

const getLibrary = (provider) => {
  const library = new Web3Provider(provider)
  library.pollingInterval = 12000
  return library
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />)
