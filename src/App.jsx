import React from "react"
import ReactDOM from "react-dom/client"
import { Web3ReactProvider } from "@web3-react/core"
import { Web3Provider } from "@ethersproject/providers"
import CharacterEditor from "./components"
import { createTheme } from "@mui/material"
import defaultTemplates from "./data/base_models"
import Landing from "./components/Landing"
import LoadingOverlayCircularStatic from "./components/LoadingOverlay"
import backgroundImg from '../public/ui/background.png'

import {
  useDefaultTemplates,
  useLoading,
  useModelClass,
  useLoadedTraits,
} from "./store"
import AudioSettings from "./components/AudioSettings"

const defaultTheme = createTheme({
  palette: {
    mode: "dark",
    primary: {
      main: "#de2a5e",
    },
  },
})
const dropHunter = "../3d/models/landing/drop-noWeapon.vrm"
const neuroHacker = "../3d/models/landing/neuro-noWeapon.vrm"

const anim_drophunter = "../3d/animations/idle_drophunter.fbx";
const anim_neurohacker = "../3d/animations/idle_neurohacker.fbx";

    const models = [
      {
          index: 1,
          model: dropHunter,
          text: 'Dropunter',
          animation: anim_drophunter
      },
      {
          index: 2,
          model: neuroHacker,
          text: 'Neurohacker',
          animation: anim_neurohacker
      }
    ];

function App() {
  const setDefaultModel = useDefaultTemplates(
    (state) => state.setDefaultTemplates,
  )
  const loading = useLoading((state) => state.loading)
  const modelClass = useModelClass((state) => state.modelClass)
  const loadedTraits = useLoadedTraits((state) => state.loadedTraits)
  setDefaultModel(defaultTemplates)
  const getLibrary = (provider) => {
    const library = new Web3Provider(provider)
    library.pollingInterval = 12000
    return library
  }

  return (
      <Web3ReactProvider getLibrary={getLibrary}>
        <AudioSettings />
        <div 
          className='backgroundImg'
          style = {{
              backgroundImage : `url(${backgroundImg})`,
              backgroundAttachment : 'fixed',
              backgroundRepeat : "no-repeat",
              backgroundPosition : "center center",
              height: '100vh',
              width: '100vw',
              backgroundSize : 'cover',
              display : 'flex',
              flexDirection : 'column',
              alignItems : 'center',
              overflow : 'hidden',
              position: 'absolute',
              zIndex: 0,
          }}
        >
          <div className="backgroundBlur">

          </div>
        </div>
        {loading && (
          <div>
            <LoadingOverlayCircularStatic
              style={{
                position: "absolute",
                zIndex: 100,
              }}
              loadingModelProgress={loadedTraits}
              title={"Loading"}
              background={"#000000"}
            />
          </div>
        )}
        {!modelClass && <Landing models={models} />}
       {modelClass && <CharacterEditor theme={defaultTheme} />}
      </Web3ReactProvider>
  )
}

const root = ReactDOM.createRoot(document.getElementById("root"))

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
