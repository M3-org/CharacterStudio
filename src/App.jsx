import { Web3Provider } from "@ethersproject/providers"
import { Web3ReactProvider } from "@web3-react/core"
import React, { Fragment, useContext, useEffect } from "react"
import ReactDOM from "react-dom/client"
import Background from "./components/Background"
import { AudioProvider } from "./context/AudioContext"
import Landing from "./components/Landing"
import { UserMenu } from "./components/UserMenu"

import AudioButton from "./components/AudioButton"
import Scene from "./components/Scene"
import { ViewProvider } from "./context/ViewContext"
import { SceneContext, SceneProvider } from "./context/SceneContext"
import { AccountProvider } from "./context/AccountContext"
import MintPopup from "./components/MintPopup"

import Gate from "./components/Gate"

// dynamically import the manifest
const assetImportPath = import.meta.env.VITE_ASSET_PATH + "/manifest.json"

function App() {
  const { template, setTemplate } = useContext(SceneContext)
  // fetch the manifest, then set it
  useEffect(() => {
    async function fetchManifest() {
      const response = await fetch(assetImportPath)
      const data = await response.json()
      return data
    }

    fetchManifest().then((data) => {
      setTemplate(data)
    })
  }, [])
  return (
    template && (
      <Fragment>
        <Background />
        <Gate />
        <Landing />
        <AudioButton />
        <Scene />
        <MintPopup />
        <UserMenu />
      </Fragment>
    )
  )
}

const getLibrary = (provider) => {
  const library = new Web3Provider(provider)
  library.pollingInterval = 12000
  return library
}

function AppContainer(){
  return (
  <AccountProvider>
  <AudioProvider>
    <ViewProvider>
      <SceneProvider>
        <App />
      </SceneProvider>
    </ViewProvider>
  </AudioProvider>
</AccountProvider>
  )
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <Web3ReactProvider getLibrary={getLibrary}>
    <AppContainer />
  </Web3ReactProvider>,
)
