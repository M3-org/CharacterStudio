import React, { Fragment, Suspense, useContext, useEffect, useState } from "react"

import Scene from "./components/Scene"
import { AppMode, CameraMode, ViewContext, ViewStates } from "./context/ViewContext"

/* eslint-disable react/no-unknown-property */
import ChatComponent from "./components/ChatComponent"
import Editor from "./components/Editor"

import ARButton from "./components/ARButton"
import Background from "./components/Background"
import ChatButton from "./components/ChatButton"
import { UserMenu } from "./components/UserMenu"

import LoadingOverlay from "./components/LoadingOverlay"

// dynamically import the manifest
const assetImportPath = import.meta.env.VITE_ASSET_PATH + "/manifest.json"

async function fetchManifest () {
  const response = await fetch(assetImportPath)
  const data = await response.json()
  return data
}

// async function fetchModel() {
//   // check if the model is available in localstorage
//   // if not, fetch it

// }

const fetchData = () => {
  let status, result

  const manifestPromise = fetchManifest()
  // const modelPromise = fetchModel()
  const suspender = manifestPromise.then(
    (r) => {
      status = "success"
      result = r
    },
    (e) => {
      status = "error"
      result = e
    }
  )

  return {
    read() {
      if (status === "error") {
        throw result
      } else if (status === "success") {
        return result
      }
      throw suspender
    }
  }
}

const resource = fetchData()

export default function App() {
  const manifest = resource.read()
  
  const { currentAppMode, setCurrentAppMode } = useContext(ViewContext)
  // randomly roll a number between 0 and the data length
  const randomIndex = Math.floor(Math.random() * manifest.length)
  const templateInfo = manifest && manifest[randomIndex]

  const [hideUi, setHideUi] = useState(false)

// detect a double tap on the screen or a mouse click
// switch the UI on and off
let lastTap = 0
useEffect(() => {
  const handleTap = () => {
    const now = new Date().getTime()
    const timesince = now - lastTap
    if (timesince < 300 && timesince > 0) {
      setHideUi(!hideUi)
    }
    lastTap = now
  }
  window.addEventListener("touchend", handleTap)
  window.addEventListener("click", handleTap)
  return () => {
    window.removeEventListener("touchend", handleTap)
    window.removeEventListener("click", handleTap)
  }
}, [hideUi])

return (
  <Suspense fallback={<LoadingOverlay />}>
    <Fragment>
      <Background />
        <Scene templateInfo={templateInfo} />
        {!hideUi &&
          <Fragment>
          <ChatButton />
        <ARButton />
        <UserMenu />
        {currentAppMode === AppMode.CHAT && <ChatComponent />}
        {currentAppMode === AppMode.APPEARANCE && <Editor templateInfo={templateInfo} />}
          </Fragment>
      }
      </Fragment>
    </Suspense>
  )
}