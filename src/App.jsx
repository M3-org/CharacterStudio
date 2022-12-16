import React, { useEffect } from "react"
import ReactDOM from "react-dom/client"
import { Web3ReactProvider } from "@web3-react/core"
import { Web3Provider } from "@ethersproject/providers"

import useSound from "use-sound"
import CharacterEditor from "./components"
import { createTheme } from "@mui/material"
import defaultTemplates from "./data/base_models"
import Landing from "./components/Landing"
import LoadingOverlayCircularStatic from "./components/LoadingOverlay"
import bgm from "./sound/cc_bgm_balanced.wav"
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

  const [backWav, {  }] = useSound(bgm, { volume: 1.0, loop: true })

  useEffect(() => {
    backWav()
  }, [])

  return (
    <React.Fragment>
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
              loadingModelProgress={loadedTraits}
              title={"Loading"}
            />
          </div>
        )}
        {!modelClass && <Landing />}
        {modelClass && <CharacterEditor theme={defaultTheme} />}
      </Web3ReactProvider>
    </React.Fragment>
  )
}

const root = ReactDOM.createRoot(document.getElementById("root"))

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
