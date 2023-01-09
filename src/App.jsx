import React, { Fragment, Suspense, useEffect, useState } from "react"

import Scene from "./components/Scene"

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
  
  // randomly roll a number between 0 and the data length
  const randomIndex = Math.floor(Math.random() * manifest.length)
  const templateInfo = manifest && manifest[randomIndex]

//   // fetch the manifest, then set it
  // useEffect(() => {
  //     setCurrentView(ViewStates.CREATOR)
  // }, [])

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
  <Suspense fallback={<LoadingOverlay />}>
    <Fragment>
        <ChatButton />
        <ARButton />
        <Background />
        <Scene templateInfo={templateInfo} />
        <UserMenu />
        {<ChatComponent />}
        {<Editor templateInfo={templateInfo} />}
      </Fragment>
    </Suspense>
  )
}