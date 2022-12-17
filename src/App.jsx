import { Web3Provider } from "@ethersproject/providers"
import { Web3ReactProvider } from "@web3-react/core"
import React, { Suspense, useContext, useEffect } from "react"
import ReactDOM from "react-dom/client"
import backgroundImg from "../public/ui/background.png"
import {
  ApplicationContext,
  ApplicationContextProvider,
} from "./ApplicationContext"
import Landing from "./components/Landing"
import LoadingOverlayCircularStatic from "./components/LoadingOverlay"

import AudioSettings from "./components/AudioSettings"

import { animated, useSpring } from "react-spring"
import Scene from "./components/Scene"
import { AnimationManager } from "./library/animations/animationManager"
import { sceneService } from "./services"

function App() {
  const {
    setDefaultModel,
    loading,
    scene,
    loadedTraits,
    templateInfo,
    avatar,
    model,
    selectedCharacter,
    setModel,
  } = useContext(ApplicationContext)

  useEffect(() => {
    if (avatar) {
      sceneService.setTraits(avatar)
    }
  }, [avatar])

  useEffect(() => {
    if (templateInfo) {
      sceneService.setAvatarTemplateInfo(templateInfo)
    }
  }, [templateInfo])

  useEffect(() => {
    if (model) sceneService.setAvatarModel(model)
  }, [model])

  useEffect(() => {
    if (!templateInfo.file) return
    sceneService.loadModel(templateInfo.file).then(async (vrm) => {
      const animationManager = new AnimationManager(templateInfo.offset)
      sceneService.addModelData(vrm, { animationManager: animationManager })

      if (templateInfo.animationPath) {
        await animationManager.loadAnimations(templateInfo.animationPath)
        animationManager.startAnimation(vrm)
      }
      sceneService.addModelData(vrm, { cullingLayer: 0 })

      sceneService.getSkinColor(vrm.scene, templateInfo.bodyTargets)
      setModel(vrm)

      scene.add(vrm.scene)

      // set vrm.scene to invisible
      vrm.scene.visible = false

      setTimeout(() => {
        vrm.scene.visible = true
      }, 50)
    })
  }, [templateInfo.file])

  const animatedStyle = useSpring({
    from: { opacity: "0" },
    to: { opacity: "1" },
    config: { duration: "2500" },
  })

  return (
    <Suspense fallback="loading...">
      <div
        className="backgroundImg"
        style={{
          backgroundImage: `url(${backgroundImg})`,
          backgroundAttachment: "fixed",
          backgroundRepeat: "no-repeat",
          backgroundPosition: "center center",
          height: "100vh",
          width: "100vw",
          backgroundSize: "cover",
          display: "fixed",
          flexDirection: "column",
          alignItems: "center",
          overflow: "hidden",
          position: "absolute",
          zIndex: 0,
        }}
      >
        <div className="backgroundBlur"></div>
      </div>
      {!selectedCharacter && <Landing />}
      <AudioSettings />
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
      {templateInfo && (
        <animated.div style={animatedStyle}>
          <Scene type={templateInfo.name} />
        </animated.div>
      )}
    </Suspense>
  )
}

const getLibrary = (provider) => {
  const library = new Web3Provider(provider)
  library.pollingInterval = 12000
  return library
}

const root = ReactDOM.createRoot(document.getElementById("root"))

root.render(
  <ApplicationContextProvider>
    <Web3ReactProvider getLibrary={getLibrary}>
      <App />
    </Web3ReactProvider>
  </ApplicationContextProvider>,
)
