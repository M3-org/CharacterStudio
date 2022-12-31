import { Web3Provider } from "@ethersproject/providers"
import { Web3ReactProvider } from "@web3-react/core"
import React, { Fragment, useContext, useState, useEffect, useRef} from "react"
import ReactDOM from "react-dom/client"
import { AudioProvider } from "./context/AudioContext"

import Scene from "./components/Scene"
import ARScene from "./components/ARScene"
import { AccountProvider } from "./context/AccountContext"
import { SceneContext, SceneProvider } from "./context/SceneContext"
import { CameraMode, ViewContext, ViewProvider, ViewStates } from "./context/ViewContext"
// import Gate from "./components/Gate"

/* eslint-disable react/no-unknown-property */
import { BackButton } from "./components/BackButton"
import ChatComponent from "./components/ChatComponent"
import Editor from "./components/Editor"
import Selector from "./components/Selector"
// import MintPopup from "./components/MintPopup"

import AudioButton from "./components/AudioButton"
import Background from "./components/Background"

// import Landing from "./components/Landing"
import { UserMenu } from "./components/UserMenu"

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
  const { template, setTemplate, currentTemplate, setCurrentTemplate } = useContext(SceneContext)
  const { setCurrentView, currentCameraMode } = useContext(ViewContext)

  const controls = useRef()
  const templateInfo = template && currentTemplate && template[currentTemplate.index]

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
      console.log('template', data)
      console.log('currentTemplate', Classes.DROPHUNTER)

    })
  }, [])

  const [showChat, setShowChat] = useState(false);
  
  useEffect(() => {
    // if user presses ctrl h, show chat
    const handleKeyDown = (e) => {
      if (e.ctrlKey && e.key === 'h') {
        e.preventDefault();
        setShowChat(!showChat);
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => {
        window.removeEventListener('keydown', handleKeyDown);
    }
}, [])

  return (
    template && (
      <Fragment>
        <Background />
        {/* <Gate /> 
        <Landing />so far ARGs have only been demonstrated as
        <MintPopup />*/}
        <UserMenu />
        {templateInfo && template && currentTemplate && currentCameraMode !== CameraMode.AR && <Scene />}


        <BackButton onClick={() => {
          setCurrentTemplate(null)
          setCurrentView(ViewStates.LANDER_LOADING)
        }}/>
        <AudioButton />

        {showChat && <ChatComponent />}
          {!showChat && <Editor templateInfo={templateInfo} controls={controls.current} />}
          {!showChat && currentTemplate && templateInfo && <Selector templateInfo={templateInfo} />}
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
