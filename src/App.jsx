import React, { Fragment, Suspense, useContext } from "react"

import ARScene from "./components/ARScene"
import Scene from "./components/Scene"
import { CameraMode, ViewContext, ViewStates } from "./context/ViewContext"

/* eslint-disable react/no-unknown-property */
import { BackButton } from "./components/BackButton"
import ChatComponent from "./components/ChatComponent"
import Editor from "./components/Editor"

import ARButton from "./components/ARButton"
import AudioButton from "./components/AudioButton"
import Background from "./components/Background"

import LoadingOverlay from "./components/LoadingOverlay"

// dynamically import the manifest
const assetImportPath = import.meta.env.VITE_ASSET_PATH + "/manifest.json"

async function fetchManifest () {
  const response = await fetch(assetImportPath)
  console.log('response', response)
  const data = await response.json()
  return data
}

// async function fetchModel() {
//   // check if the model is available in localstorage
//   // if not, fetch it

// }

const fetchData = () => {
  // react suspense handler
  console.log('fetchData', assetImportPath)
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

  const { setCurrentView, currentCameraMode } = useContext(ViewContext)

  console.log('manifest', manifest)
  
  // randomly roll a number between 0 and the data length
  const randomIndex = Math.floor(Math.random() * manifest.length)
  const templateInfo = manifest && manifest[randomIndex]

  console.log('templateInfo', templateInfo)

//   // fetch the manifest, then set it
//   useEffect(() => {
//       setCurrentView(ViewStates.CREATOR)
//   }, [])

//   const [showChat, setShowChat] = useState(false);
  
//   useEffect(() => {
//     // if user presses ctrl h, show chat
//     const handleKeyDown = (e) => {
//       if (e.ctrlKey && e.key === 'h') {
//         e.preventDefault();
//         setShowChat(!showChat);
//       }
//     }
//     window.addEventListener('keydown', handleKeyDown);
//     return () => {
//         window.removeEventListener('keydown', handleKeyDown);
//     }
// }, [])

return (
  <Suspense fallback={<LoadingOverlay />}>
  <Fragment>
  
        <Background />
        {currentCameraMode !== CameraMode.AR && <Scene templateInfo={templateInfo} />}
        {currentCameraMode === CameraMode.AR && <ARScene templateInfo={templateInfo} />}

        <BackButton onClick={() => {
          setCurrentView(ViewStates.LANDER)
        }}/>
        <ARButton />
        <AudioButton />

        {<ChatComponent />}
        {<Editor templateInfo={templateInfo} />}
      </Fragment>
    </Suspense>
  )
}