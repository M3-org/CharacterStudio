import { Web3Provider } from "@ethersproject/providers"
import { Web3ReactProvider } from "@web3-react/core"
import React, { Suspense } from "react"
import ReactDOM from "react-dom/client"
import { AudioProvider } from "./context/AudioContext"

import { AccountProvider } from "./context/AccountContext"
import { SceneProvider } from "./context/SceneContext"
import { ViewProvider } from "./context/ViewContext"

import LoadingOverlay from "./components/LoadingOverlay"

import App from "./App"

const getLibrary = (provider) => {
  const library = new Web3Provider(provider)
  library.pollingInterval = 12000
  return library
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Web3ReactProvider getLibrary={getLibrary}>
      <AccountProvider>
        <AudioProvider>
          <ViewProvider>
            <SceneProvider>
              <Suspense>
                <App />
              </Suspense>
            </SceneProvider>
          </ViewProvider>
        </AudioProvider>
      </AccountProvider>
    </Web3ReactProvider>
  </React.StrictMode>,
)
