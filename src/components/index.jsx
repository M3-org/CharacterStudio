import { createTheme, ThemeProvider } from "@mui/material"
import React, { Suspense, useState, useEffect, Fragment } from "react"
import { sceneService } from "../services"
import { AnimationManager } from "../library/animations/animationManager"
import Scene from "./Scene"
import { useSpring, animated } from 'react-spring'
import * as THREE from 'three'
import { useRandomFlag, useAvatar, useLoadedTraits, useScene, useTemplateInfo, useModel, useLoading, useEnd } from "../store"

export default function CharacterEditor(props) {
  const { theme } = props;

  const templateInfo = useTemplateInfo((state) => state.templateInfo)
  const avatar = useAvatar((state) => state.avatar)
  const setScene = useScene((state) => state.setScene)
  const model = useModel((state) => state.model)
  const setModel = useModel((state) => state.setModel)

  const defaultTheme = createTheme({
    palette: {
      mode: "dark",
      primary: {
        main: "#de2a5e",
      },
    },
  })

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

    if (templateInfo.file) {
      
      const newScene = new THREE.Scene();
      setScene(newScene)

      sceneService.loadModel(templateInfo.file)
        .then(async (vrm)=>{
          const animationManager = new AnimationManager(templateInfo.offset);
          sceneService.addModelData(vrm, {animationManager:animationManager});

          if (templateInfo.animationPath){
            await animationManager.loadAnimations(templateInfo.animationPath);
            animationManager.startAnimation(vrm);
          }
            setTimeout(()=>{
              newScene.add (vrm.scene);
              sceneService.addModelData(vrm, {cullingLayer:0});

              sceneService.getSkinColor(vrm.scene,templateInfo.bodyTargets)
              setModel(vrm);
            },50);
        })
    }
  }, [templateInfo.file])

  const animatedStyle = useSpring({
    from: { opacity: "0"},
    to: { opacity: "1" },
    config: { duration: "2500" }
  })

 
  return (
    <Suspense fallback="loading...">
      <ThemeProvider theme={theme && defaultTheme}>
        {templateInfo && (
          <Fragment>
            <animated.div style={animatedStyle} >
              <Scene type={templateInfo.name} />  
            </animated.div>
          </Fragment>
        )}
      </ThemeProvider>
    </Suspense>
  )
}
