import { createTheme, ThemeProvider } from "@mui/material"
import React, { Suspense, useState, useEffect, Fragment } from "react"
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader"
//import DownloadCharacter from "./Download"
//import LoadingOverlayCircularStatic from "./LoadingOverlay"
import { sceneService } from "../services"
import { startAnimation } from "../library/animations/animation"
import { VRM, VRMSchema } from "@pixiv/three-vrm"
import Scene from "./Scene"
import { useSpring, animated } from 'react-spring'
import create from 'zustand';
import {MeshIsHidden} from '../library/cull-mesh.js'

const useAvatar = create((set)=>({
  traits:['body', 'chest'] ,
  addTrait: (trait) =>
    set((state) => ({traits:[...state.traits, trait]}))
}))
console.log(useAvatar)

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

  const { theme, templates, mintPopup, setLoading } = props
  // Selected category State Hook
  const [category, setCategory] = useState("color")
  // 3D Model Content State Hooks ( Scene, Nodes, Materials, Animations e.t.c ) //
  const [model, setModel] = useState<object>(Object)

  const [scene, setScene] = useState<object>(Object)
  
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

  
  const renameVRMBones = (vrm) =>{
    for (const bone in VRMSchema.HumanoidBoneName) {
      const bn = vrm.humanoid.getBoneNode(VRMSchema.HumanoidBoneName[bone]);
      if (bn != null)
         bn.name = VRMSchema.HumanoidBoneName[bone];
    } 
  }


  const animatedStyle = useSpring({
    from: { opacity: "0"},
    to: { opacity: "1" },
    config: { duration: "2500" }
  })
  // const animatedStyle = {
  //   backgroundColor: "rgba(16,16,16,0.6)",
  //   color: "#efefef"
  // }

  // function miniloop(mesh){
  //   setTimeout(() => {
      
  //     miniloop(mesh);
  //   }, 1000);
  // }
  useEffect(() => {
    if(model)
    sceneService.setModel(model);
  }, [model])
  useEffect(() => {
    if (templateInfo.file && templateInfo.format) {
      
      const loader = new GLTFLoader()
      loader
        .loadAsync(templateInfo.file, (e) => {
          
          props.setLoadingProgress((e.loaded * 100) / e.total)
        })
        .then((gltf) => {
          // yield before placing avatar to avoid lag
          setTimeout(()=>{
            console.log("new vrm")
            VRM.from(gltf).then((vrm) => {
              renameVRMBones(vrm);
              vrm.scene.traverse((o) => {
                o.frustumCulled = false
                let pas = false;
                if(o.isMesh && pas === false){
                  MeshIsHidden(o);
                  pas = true;
                }
              })
              console.log(vrm);
              vrm.scene.rotation.set(Math.PI, 0, Math.PI)
              setLoading(false)
              startAnimation(vrm)
              setTimeout(()=>{
                setScene(vrm.scene)
                sceneService.getSkinColor(vrm.scene,templateInfo.bodyTargets)
                setModel(vrm)
              },50);
            })
            
          },1000);
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
                wrapClass="generator"
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
              />  
            </animated.div>
          </Fragment>
        )}
      </ThemeProvider>
    </Suspense>
  )
}
