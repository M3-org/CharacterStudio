import { createTheme, ThemeProvider } from "@mui/material"
import React, { Suspense, useState, useEffect, Fragment } from "react"
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader"
//import DownloadCharacter from "./Download"
//import LoadingOverlayCircularStatic from "./LoadingOverlay"
import { sceneService } from "../services"
import { startAnimation } from "../library/animations/animation"
import { VRM  } from "@pixiv/three-vrm"
import Scene from "./Scene"
import { useSpring, animated } from 'react-spring'
import * as THREE from 'three'

interface Avatar{
  body:Record<string, unknown>,
  chest:Record<string, unknown>,
  head:Record<string, unknown>,
  neck:Record<string, unknown>,
  hand:Record<string, unknown>,
  ring:Record<string, unknown>,
  waist:Record<string, unknown>,
  weapon:Record<string, unknown>,
  legs:Record<string, unknown>,
  foot:Record<string, unknown>,
  accessories:Record<string, unknown>
}

export default function CharacterEditor(props: any) {
  // State Hooks For Character Editor ( Base ) //
  // ---------- //
  // Charecter Name State Hook ( Note: this state will also update the name over the 3D model. )
  // const [characterName, setCharacterName] =
  //   useState<string>("Character Name");
  // Categories State and Loaded Hooks
  // const [categories, setCategories] = useState([]);
  // const [categoriesLoaded, setCategoriesLoaded] =
  //   useState<boolean>(false);
  // TODO: Where is setNodes
  // const [nodes, setNodes] = useState<object>(Object);
  // const [materials, setMaterials] = useState<object>(Object);
  // const [animations, setAnimations] = useState<object>(Object);
  // const [body, setBody] = useState<any>();


  const { theme, templates, mintPopup, setLoading, setLoadingProgress, setModelClass, modelClass, setEnd } = props
  
  // Selected category State Hook
  const [category, setCategory] = useState("color")
  // 3D Model Content State Hooks ( Scene, Nodes, Materials, Animations e.t.c ) //
  const [model, setModel] = useState<VRM>(Object)

  const [scene, setScene] = useState<any>(Object)
  
  // States Hooks used in template editor //
  const [templateInfo, setTemplateInfo] = useState({ file: null, format: null, bodyTargets:null })

  //const [downloadPopup, setDownloadPopup] = useState<boolean>(false)
  const [template, setTemplate] = useState<number>(1)
  //const [loadingModelProgress, setLoadingModelProgress] = useState<number>(0)
  const [ avatar,setAvatar] = useState<Avatar>({
    body:{},
    chest:{},
    head:{},
    neck:{},
    hand:{},
    ring:{},
    waist:{},
    weapon:{},
    legs:{},
    foot:{},
    accessories:{},
  })
  //const [loadingModel, setLoadingModel] = useState<boolean>(false)

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
      console.log("temp info")
      sceneService.setAvatarTemplateInfo(templateInfo);
    }
  }, [templateInfo])


  const animatedStyle = useSpring({
    from: { opacity: "0"},
    to: { opacity: "1" },
    config: { duration: "2500" }
  })
  // const animatedStyle = {
  //   backgroundColor: "rgba(16,16,16,0.6)",
  //   color: "#efefef"
  // }



  useEffect(() => {
    if(model)
    sceneService.setAvatarModel(model);
  }, [model])
  
  useEffect(() => {
    if (templateInfo.file) {
      
      // create a scene that will hold all elements (decoration and avatar)
      const newScene = new THREE.Scene();
      setScene(newScene)

      // load part of the decoration (spinning base)
      sceneService.loadLottie('../Rotation.json',2,true).then((mesh) => {
        newScene.add(mesh);
        mesh.rotation.x = Math.PI / 2;
      });

      // load the avatar
      sceneService.loadModel(templateInfo.file,setLoadingProgress)
        .then((vrm)=>{
          setTimeout(()=>{
            setLoading(false)
            startAnimation(vrm)
            setTimeout(()=>{
              newScene.add (vrm.scene);

              // wIP
              sceneService.addModelData(vrm, {cullingLayer:0});

              console.log(vrm);
              
              sceneService.getSkinColor(vrm.scene,templateInfo.bodyTargets)
              setModel(vrm);
              //setAvatar(vrm)
            },50);
          },1000)
        })
    }
  }, [templateInfo.file])
 
  return (
    <Suspense fallback="loading...">
      <ThemeProvider theme={theme ?? defaultTheme}>
        {templateInfo && (
          <Fragment>
            <animated.div style={animatedStyle} >
              <Scene
                templates={templates}
                scene={scene}
                //downloadPopup={downloadPopup}
                mintPopup={mintPopup}
                category={category}
                setCategory={setCategory}
                avatar = {avatar}
                setAvatar={setAvatar}
                setTemplate={setTemplate}
                template={template}
                setTemplateInfo={setTemplateInfo}
                templateInfo={templateInfo}
                model={model}
                setModelClass={setModelClass}
                modelClass = {modelClass}
                setEnd={setEnd}
              />  
            </animated.div>
          </Fragment>
        )}
      </ThemeProvider>
    </Suspense>
  )
}
