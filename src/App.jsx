import React, { Suspense, useState, useEffect, Fragment } from "react"
import ReactDOM from "react-dom/client"
import { Web3ReactProvider } from "@web3-react/core"
import { Web3Provider } from "@ethersproject/providers"
import defaultTemplates from "./data/base_models"
import Landing from "./components/Landing"
import LoadingOverlayCircularStatic from "./components/LoadingOverlay"
import backgroundImg from '../public/ui/background.png'

import {
  useDefaultTemplates,
  useLoading,
  useLoadedTraits,
  useScene,
  useAvatar,
  useTemplateInfo,
  useModel,
} from "./store"

import AudioSettings from "./components/AudioSettings"

import { sceneService } from "./services"
import { AnimationManager } from "./library/animations/animationManager"
import Scene from "./components/Scene"
import { useSpring, animated } from 'react-spring'

function App() {
  const setDefaultModel = useDefaultTemplates(
    (state) => state.setDefaultTemplates,
  )
  const loading = useLoading((state) => state.loading)
  const scene = useScene((state) => state.scene)
  const loadedTraits = useLoadedTraits((state) => state.loadedTraits)
  setDefaultModel(defaultTemplates)
  const getLibrary = (provider) => {
    const library = new Web3Provider(provider)
    library.pollingInterval = 12000
    return library
  }

  const templateInfo = useTemplateInfo((state) => state.templateInfo)
  const avatar = useAvatar((state) => state.avatar)
  const model = useModel((state) => state.model)
  const setModel = useModel((state) => state.setModel)

  useEffect(() => {
    if(avatar){
      sceneService.setTraits(avatar);
    }
  }, [avatar])

  useEffect(() => {
    if(templateInfo){
      sceneService.setAvatarTemplateInfo(templateInfo);
    }
  }, [templateInfo])

  useEffect(() => {
    if(model)
    sceneService.setAvatarModel(model);
  }, [model])
  
  useEffect( () => {
    if (!templateInfo.file) return;
    sceneService.loadModel(templateInfo.file)
      .then(async (vrm) => {
        const animationManager = new AnimationManager(templateInfo.offset);
        sceneService.addModelData(vrm, {animationManager:animationManager});

        if (templateInfo.animationPath){
          await animationManager.loadAnimations(templateInfo.animationPath);
          animationManager.startAnimation(vrm);
        }
        sceneService.addModelData(vrm, {cullingLayer:0});

        sceneService.getSkinColor(vrm.scene,templateInfo.bodyTargets)
        setModel(vrm);

        scene.add (vrm.scene);

        // set vrm.scene to invisible
        vrm.scene.visible = false;

          setTimeout(()=>{
            vrm.scene.visible = true;
          },50);
      })
  }, [templateInfo.file])

  const animatedStyle = useSpring({
    from: { opacity: "0"},
    to: { opacity: "1" },
    config: { duration: "2500" }
  })

  return (
    <Fragment>
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
        <Landing />
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
        <Web3ReactProvider getLibrary={getLibrary}>
          <Suspense fallback="loading...">
              {templateInfo && (
                  <animated.div style={animatedStyle} >
                    <Scene type={templateInfo.name} />  
                  </animated.div>
              )}
              </Suspense>
          </Web3ReactProvider>
        </Fragment>
  )
}

const root = ReactDOM.createRoot(document.getElementById("root"))

root.render(
    <App />
)
