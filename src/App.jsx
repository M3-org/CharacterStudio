import { Web3Provider } from "@ethersproject/providers"
import { Web3ReactProvider } from "@web3-react/core"
import React from "react"
import ReactDOM from "react-dom/client"
import Background from "./components/Background"
import { AudioProvider } from "./context/AudioContext"
import Landing from "./components/Landing"

import AudioButton from "./components/AudioButton"
import Scene from "./components/Scene"
import { ViewProvider } from "./context/ViewContext"
import { SceneProvider } from "./context/SceneContext"

import Gate from "./components/Gate"

function App() {
  return (
    <Web3ReactProvider getLibrary={getLibrary}>
      <AudioProvider>
        <SceneProvider>
          <ViewProvider>
            <Background />
            <Gate />
            <Landing />
            <AudioButton />
            {/* <Scene /> */}
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
