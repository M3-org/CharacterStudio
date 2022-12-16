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

  const [flagPass, setFlagPass] = useState(false)

  const templateInfo = useTemplateInfo((state) => state.templateInfo)
  
  const loadedTraits = useLoadedTraits((state) => state.loadedTraits)
  const setLoadedTraits = useLoadedTraits((state) => state.setLoadedTraits)
  const setRandomFlag = useRandomFlag((state) => state.setRandomFlag)
  const avatar = useAvatar((state) => state.avatar)
  const setScene = useScene((state) => state.setScene)
  const model = useModel((state) => state.model)
  const setModel = useModel((state) => state.setModel)
  const setLoading = useLoading((state) => state.setLoading)
  const setEnd = useEnd((state) => state.setEnd)

  const defaultTheme = createTheme({
    palette: {
      mode: "dark",
      primary: {
        main: "#de2a5e",
      },
    },
  })

  useEffect(()=>{
    if (loadedTraits === true){
      setTimeout (() => {
        setLoading(false)
        setEnd(true)
      }, 1000)
      setLoadedTraits(false)
    }
  }, [loadedTraits])


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


  const animatedStyle = useSpring({
    from: { opacity: "0"},
    to: { opacity: "1" },
    config: { duration: "2500" }
  })
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
              setFlagPass(true)
            },50);
        })
    }
  }, [templateInfo.file])

  useEffect(() => {
    if(flagPass) setRandomFlag(1)
  }, [flagPass])
 
  return (
    <Suspense fallback="loading...">
      <ThemeProvider theme={theme && defaultTheme}>
        {templateInfo && (
          <Fragment>
            <animated.div style={animatedStyle} >
              <Scene/>  
            </animated.div>
          </Fragment>
        )}
      </ThemeProvider>
    </Suspense>
  )
}
