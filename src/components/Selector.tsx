import DoNotDisturbIcon from "@mui/icons-material/DoNotDisturb"
import { Avatar, Slider, Stack, Typography } from "@mui/material"
import Divider from "@mui/material/Divider"
import React, { useState } from "react"
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader"
import { apiService, sceneService } from "../services"
import useSound from 'use-sound';
import { VRM } from "@pixiv/three-vrm"
import Skin from "./Skin"
import '../styles/font.scss'
import { Margin } from "@mui/icons-material"
import cancel from '../ui/selector/cancel.png'
import hairStyleImg from '../ui/traits/hairStyle.png';
import hairColorImg from '../ui/traits/hairColor.png';
import gsap from 'gsap';
import * as THREE from 'three';

import tick from '../ui/selector/tick.svg'
import sectionClick from "../sound/section_click.wav"
import {useMuteStore, useDefaultTemplates, useHideStore, useRandomFlag, useAvatar} from '../store'

import {MeshBasicMaterial} from 'three'
import { ColorSelectButton } from "./ColorSelectButton"
import optionClick from "../sound/option_click.wav"
import FadeInOut from "./FadeAnimation";
import { SelectorContainerPos } from "../styles/SelectorStyle"

export default function Selector(props) {
  const {
    category,
    scene,
    setTemplate,
    template,
    setTemplateInfo,
    templateInfo,
    setLoadedTraits,
    controls,
    model, 
    modelClass
  }: any = props
  const isMute = useMuteStore((state) => state.isMute)
  const isHide = useHideStore((state) => state.ishidden)
  const setRandomFlag = useRandomFlag((state) => state.setRandomFlag)
  const randomFlag = useRandomFlag((state) => state.randomFlag)
  const avatar = useAvatar((state) => state.avatar)
  const setAvatar = useAvatar((state) => state.setAvatar)

  const templates = useDefaultTemplates((state) => state.defaultTemplates);
  
  const [selectValue, setSelectValue] = useState("0")
  const [hairCategory, setHairCategory] = useState("style")
  const [colorCategory, setColorCategory] = useState("color")

  const [collection, setCollection] = useState([])
  const [traitName, setTraitName] = useState("")

  const [loadingTrait, setLoadingTrait] = useState(null)
  const [loadingTraitOverlay, setLoadingTraitOverlay] = useState(false)
  const [noTrait, setNoTrait] = useState(true)
  const [loaded, setLoaded] = useState(false)
  let loadedPercent = Math.round(loadingTrait?.loaded * 100 / loadingTrait?.total);
  
  const [ inverse, setInverse ] = useState(false)
  const container = React.useRef();
  const [play] = useSound(
    sectionClick,
    { volume: 1.0 }
  );
  const iconPath = "./3d/icons-gradient/" + category + ".svg";

  const selectorButton = {
    display: "flex",
    justifyContent: "center" as "center",
    cursor: "pointer" as "pointer",
    width: '100%',
    height: category !== "gender" ? ('134px'):('200px'),
    background: "rgba(81, 90, 116, 0.2)",
    backdropFilter: "blur(22.5px)",
    borderRadius: "5px",
  }

  const selectorButtonActive = { 
    display: "flex",
    justifyContent: "center" as "center",
    cursor: "pointer" as "pointer",
    width: '100%',
    height: category !== "gender" ? ('134px'):('200px'),
    background: "rgba(81, 90, 116, 0.2)",
    backdropFilter: "blur(22.5px)",
    borderRadius: "5px",
    borderBottom  : "4px solid #61E5F9"
  }

  const selectOption = (option:any) =>{
    moveCamera(option.cameraTarget)
    !isMute && play();
  }

  const moveCamera = (value:any) => {
    if (value){
      setInverse(!inverse);

      gsap.to(controls.target,{
        y:value.height,
        duration: 1,
      })

      gsap.fromTo(controls,
        {
          maxDistance:controls.getDistance(),
          minDistance:controls.getDistance(),
          minPolarAngle:controls.getPolarAngle(),
          minAzimuthAngle:controls.getAzimuthalAngle(),
          maxAzimuthAngle:controls.getAzimuthalAngle(),
        },
        {
          maxDistance:value.distance,
          minDistance:value.distance,
          minPolarAngle:(Math.PI / 2 - 0.11),
          minAzimuthAngle: inverse ? -0.78 : 0.78,
          maxAzimuthAngle: inverse ? -0.78 : 0.78,
          duration: 1,
        }
      ).then(()=>{
        controls.minPolarAngle = 0;
        controls.minDistance = 0.5;
        controls.maxDistance = 2.0;
        controls.minAzimuthAngle = Infinity;
        controls.maxAzimuthAngle = Infinity;
      })
    }
  }
  React.useEffect(() => {
    if (!scene || !templateInfo) return
    if (category) {
      if (category === "gender") {
        setCollection(templates)
        setTraitName("gender")
      }
      apiService.fetchTraitsByCategory(category).then((traits) => {
        if (traits) {
          setCollection(traits?.collection)
          setTraitName(traits?.trait)
        }
      })
    }
  }, [category, scene, templateInfo])

  React.useEffect(() => {
    localStorage.removeItem('color')
  }, [template])

  React.useEffect(() => {
    if(scene){
      sceneService.setScene(scene);
    }
  }, [scene])
  
  React.useEffect(() => {
    if (!scene) return
    async function _get() {
      if (!loaded && modelClass) {
        await setTempInfo(templates[modelClass-1].id)
      }
    }
    _get()
  }, [
    loaded,
    scene,
    templateInfo ? Object.keys(templateInfo).length : templateInfo,
  ])
  React.useEffect(() => {
 
  }, [isHide])
  
  React.useEffect(  () => {
    (async ()=>{
      if(randomFlag === -1) return;
      
      let lists = apiService.fetchCategoryList();
      let ranItem;
      //Object.entries(avatar).map((props : any) => {
        //let traitName = props[0];

        // if (avatar[traitName] && avatar[traitName].vrm) {
        //   sceneService.disposeVRM(avatar[traitName].vrm)
        //   setAvatar({
        //     ...avatar,
        //     [traitName]: {}
        //   })
        // }

        //scene.remove(avatar[traitName].model);
      //})
      let buffer = {...avatar};
      for(let i=0; i < lists.length ; i++){
       await apiService.fetchTraitsByCategory(lists[i]).then(
         async (traits) => {
          if (traits) {
            const collection = traits.collection;
            ranItem = collection[Math.floor(Math.random()*collection.length)];
            if (avatar[traits.trait]){
              if (avatar[traits.trait].traitInfo != ranItem ){
                const temp = await itemLoader(ranItem,traits, false);
                buffer = {...buffer,...temp};
              }
            }
          }
        })
      }
      for (const property in buffer) {
        if (buffer[property].vrm){
          if (avatar[property].vrm != buffer[property].vrm){
            if (avatar[property].vrm != null){
              sceneService.disposeVRM(avatar[property].vrm)
            }
          }
          model.data?.animationManager?.startAnimation(buffer[property].vrm);
          model.scene.add(buffer[property].vrm.scene);
        }
      }
      setAvatar({
      ...avatar,
      ...buffer
      });
      if (randomFlag == 1) {
        setLoadedTraits(true);}
      setRandomFlag(-1);
    })()

  }, [randomFlag])

  const setTempInfo = (id) => {
    apiService.fetchTemplate(templates, id).then((res) => {
      setTemplateInfo(res)
    })
  }
  

  const selectTrait = (trait: any) => {
    if (trait.bodyTargets) {
      setTemplate(trait?.id)
    }

    if (scene) {
      if (trait === "0") {
        setNoTrait(true)
        
        if (avatar[traitName] && avatar[traitName].vrm) {
          sceneService.disposeVRM(avatar[traitName].vrm)
          setAvatar({
            ...avatar,
            [traitName]: {}
          })
        }
        //sceneService.
      } else {
        if (trait.bodyTargets) {
          setTemplate(trait?.id)
        } else {
          setLoadingTraitOverlay(true)
          setNoTrait(false)
          templateInfo.selectionTraits.map((item) =>{
            if(item.name === category && item.type === "texture"){
              textureTraitLoader(item, trait)
            }else if(item.name === category){
              itemLoader(trait)
            }
          })
        }
      }
    }
    setSelectValue(trait?.id)
  }
  let loading;
  const itemLoader =  async(item, traits = null, addToScene = true) => {
  let r_vrm;

  await sceneService.loadModel(`${templateInfo.traitsDirectory}${item?.directory}`, setLoadingTrait)
    .then((vrm) => {
      sceneService.addModelData(vrm,{cullingLayer: item.cullingLayer || 1})
      r_vrm = vrm;
      new Promise<void>( (resolve) => {
      // if scene, resolve immediately
      if (scene && scene.add) {
         resolve()
      } else {
          // if scene is null, wait for it to be set
          const interval = setInterval(() => {
            if (scene && scene.add) {
              clearInterval(interval)
              resolve()
            }
          }, 100)
        }
      })
      setLoadingTrait(null)
      setLoadingTraitOverlay(false)

      if (addToScene){
        model.data?.animationManager?.startAnimation(vrm);
        //startAnimation(vrm);
        setTimeout(() => {  // wait for it to play 
          model.scene.add(vrm.scene);
       
          if (avatar[traitName]) {
            
            setAvatar({
              ...avatar,
              [traitName]: {
                traitInfo: item,
                model: vrm.scene,
                vrm: vrm
              }
            })
            if (avatar[traitName].vrm) {
              //setTimeout(() => {
                sceneService.disposeVRM(avatar[traitName].vrm);
              //},200);
              // small delay to avoid character being with no clothes
            }
          }
        },200)// timeout for animations
      }
    })
  
  return {
      [traits?.trait]: {
        traitInfo: item,
        model: r_vrm.scene,
        vrm: r_vrm
      }
    }
  // });

}

const textureTraitLoader = (props, trait) => {
  const object = scene.getObjectByName(props.target);
  const eyeTexture = templateInfo.traitsDirectory + trait?.directory;
  object.material[0].map = new THREE.TextureLoader().load(eyeTexture)
}

const getActiveStatus = (item) => {
  if(category === 'gender') {
    if(templateInfo.id === item?.id) 
      return true
    return false
  } 
  
  if(avatar[category].traitInfo?.id && avatar[category].traitInfo.id === item?.id) 
    return true
  return false
}
  // selector will onyl get the information of thew data that is being provided
  // this is important as all icons will be updated accodingly to the json file proviided by the user
  // there will be some special cases (skin eye color) were this values will be placed differentluy 
  // return(<></>);
  return (
    <FadeInOut show={!isHide} duration={300} >
      <SelectorContainerPos loadingOverlay = {loadingTraitOverlay}>
        <div className="selector-container">
          <div className="selector-container-header">
            <span className = "categoryTitle">
              {category.charAt(0).toUpperCase() + category.slice(1)}
            </span>
            <img src={iconPath} className = "titleIcon"/>
          </div>
          <div className="traitPanel">
              {
                category === 'head' && 
                  (
                    <div 
                      className="hair-sub-category"
                    >
                      <ColorSelectButton 
                        text="Hair"
                        selected = {hairCategory === 'style'}
                        onClick = {() => {
                          setHairCategory('style')
                        }}
                      />
                      <ColorSelectButton 
                        text="Color"
                        selected = {hairCategory === 'color'}
                        onClick = {() => {
                          setHairCategory('color')
                        }}
                      />
                    </div>
                  )
              }
            {templateInfo?.traitsDirectory && (
              <div className="traits" >
                {category === "color" ? (
                  <div className="sub-category">
                    <div className="sub-category-header">
                      <ColorSelectButton 
                        text="Skin"
                        selected = {colorCategory === 'color'}
                        onClick = {() => {
                          setColorCategory('color')
                          selectOption({
                            cameraTarget:{
                              distance:1.4,
                              height:0.8
                          }})
                        }}
                      />
                      <ColorSelectButton 
                        text="Eye Color"
                        selected = {colorCategory === 'eyeColor'}
                        onClick = {() => {
                          setColorCategory('eyeColor')
                          selectOption({
                            cameraTarget:{
                              distance:0.5,
                              height:1.45
                          }})
                        }}
                      />
                    </div>
                    <Skin
                      scene={scene}
                      templateInfo={templateInfo}
                      category={colorCategory}
                    />
                  </div>
                ) : (
                  (category !== 'head' || hairCategory !== 'color') ? 
                      <React.Fragment>
                        <div
                          className={noTrait ? "selectorButtonActive" : "selectorButton" }
                          onClick={() => {
                            selectTrait("0");
                            !isMute && play();
                          }}
                        >
                          <img className="icon"
                            src={cancel}
                          />
                        </div>
                        {collection &&
                          collection.map((item: any, index) => {
                            return (
                              <div
                                key={index}
                                style={
                                  getActiveStatus(item) ? selectorButtonActive : selectorButton
                                }
                                className={`selector-button coll-${traitName} ${selectValue === item?.id ? "active" : ""
                                  }`}
                                onClick={() => {
                                  !isMute && play();
                                  selectTrait(item)
                                }}
                              >
                                <img 
                                  className="trait-icon"
                                  src={
                                    item.thumbnailsDirectory
                                      ? item.thumbnail
                                      : `${templateInfo?.thumbnailsDirectory}${item?.thumbnail}`
                                  }
                                />
                                <img src={tick}
                                  className = {getActiveStatus(item) ? "tickStyle" : "tickStyleInActive"}
                                />
                                {selectValue === item?.id && loadedPercent > 0 && (
                                  <div
                                    className="loading-trait"
                                  >
                                    {loadedPercent}%
                                  </div>
                                )}
                              </div>
                            )
                          })}
                        <div className="icon-hidden">
                          <Avatar className="icon" />
                        </div>
                      </React.Fragment>
                    : (
                      <Skin
                        scene={scene}
                        templateInfo={templateInfo}
                        category={category}
                        avatar={avatar}
                      />
                    )
                )}
              </div>
            )}
          </div>
          <div
            className={
              loadingTraitOverlay
                ? "loading-trait-overlay"
                : "loading-trait-overlay-show"
            }
          />
        </div>
      </SelectorContainerPos>
    </FadeInOut>
  )
}