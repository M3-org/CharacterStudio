import { Web3Provider } from "@ethersproject/providers"
import { Web3ReactProvider } from "@web3-react/core"
import React, { Fragment, useContext, useEffect } from "react"
import ReactDOM from "react-dom/client"
import Background from "./components/Background"
import { AudioProvider } from "./context/AudioContext"
import Landing from "./components/Landing"
import { UserMenu } from "./components/UserMenu"

import Scene from "./components/ARScene"
import { ViewProvider, ViewContext, ViewStates } from "./context/ViewContext"
import { SceneContext, SceneProvider } from "./context/SceneContext"
import { AccountProvider } from "./context/AccountContext"
import MintPopup from "./components/MintPopup"
// import Gate from "./components/Gate"


// dynamically import the manifest
const assetImportPath = import.meta.env.VITE_ASSET_PATH + "/manifest.json"
const dropHunter = "../3d/models/landing/drop-noWeapon.vrm"
const neuroHacker = "../3d/models/landing/neuro-noWeapon.vrm"

const anim_drophunter = "../3d/animations/idle_drophunter.fbx"
const anim_neurohacker = "../3d/animations/idle_neurohacker.fbx"

const Classes = {
  DROPHUNTER: {
    index: 0,
    model: dropHunter,
    text: "Dropunter",
    animation: anim_drophunter,
  },
  NEUROHACKER: {
    index: 1,
    model: neuroHacker,
    text: "Neurohacker",
    animation: anim_neurohacker,
  },
}

function App() {
  const { template, setTemplate, setCurrentTemplate } = useContext(SceneContext)
  const { setCurrentView } = useContext(ViewContext)
  // fetch the manifest, then set it
  useEffect(() => {
    async function fetchManifest() {
      const response = await fetch(assetImportPath)
      const data = await response.json()
      return data
    }

    fetchManifest().then((data) => {
      setCurrentView(ViewStates.CREATOR_LOADING)
      console.log('data', data)
      setTemplate(data)
      setCurrentTemplate(Classes.DROPHUNTER)
    })
  }, [])
  return (
    template && (
      <Fragment>
        {/*<Background />
         <Gate /> 
        <Landing />
        <MintPopup />
        <UserMenu />*/}
        <Scene />

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
