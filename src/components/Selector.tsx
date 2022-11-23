import DoNotDisturbIcon from "@mui/icons-material/DoNotDisturb"
import { Avatar, Slider, Stack, Typography } from "@mui/material"
import Divider from "@mui/material/Divider"
import React, { useState } from "react"
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader"
import { apiService, sceneService } from "../services"
import useSound from 'use-sound';
import { startAnimation } from "../library/animations/animation"
import { VRM } from "@pixiv/three-vrm"
import Skin from "./Skin"
import '../styles/font.scss'
import { Margin } from "@mui/icons-material"
import cancel from '../ui/selector/cancel.png'
import hairStyleImg from '../ui/traits/hairStyle.png';
import hairColorImg from '../ui/traits/hairColor.png';
import gsap from 'gsap';

import tick from '../ui/selector/tick.svg'
import sectionClick from "../sound/section_click.wav"
import {useMuteStore} from '../store'

import {MeshBasicMaterial} from 'three'
import { ColorSelectButton } from "./ColorSelectButton"
import optionClick from "../sound/option_click.wav"
import { useHideStore } from "../store"
import FadeInOut from "./FadeAnimation";

export default function Selector(props) {
  const {
    templates,
    category,
    scene,
    avatar,
    setAvatar,
    setTemplate,
    template,
    setTemplateInfo,
    templateInfo,
    randomFlag,
    controls,
    model, 
    modelClass
  }: any = props
  const isMute = useMuteStore((state) => state.isMute)
  const isHide = useHideStore((state) => state.ishidden)
  
  const [selectValue, setSelectValue] = useState("0")
  const [hairCategory, setHairCategory] = useState("style")
  const [colorCategory, setColorCategory] = useState("color")

  const [collection, setCollection] = useState([])
  const [traitName, setTraitName] = useState("")

  const [loadingTrait, setLoadingTrait] = useState(null)
  const [loadingTraitOverlay, setLoadingTraitOverlay] = useState(false)

  const [noTrait, setNoTrait] = useState(true)
  const [loaded, setLoaded] = useState(false)
  const [ inverse, setInverse ] = useState(false)
  const container = React.useRef();
  const [play] = useSound(
    sectionClick,
    { volume: 1.0 }
  );
  const iconPath = "./3d/icons-gradient/" + category + ".svg";

  const hairSubCategories = [
    {
      id: 'style',
      image: hairStyleImg,
      activeImage: hairStyleImg,
    },
    {
      id: 'color',
      image: hairColorImg,
      activeImage: hairColorImg,
    },
  ]

  const selectorContainer = {
    height: "614px",
    boxSizing: "border-box" as "border-box",
    padding: "14px 0px 14px 32px !important",
    background: 'rgba(56, 64, 78, 0.1)',
    backdropFilter: 'blur(22.5px)',
    borderBottom: "2px solid rgb(58, 116, 132)",
    transform: 'perspective(400px) rotateY(5deg)',
    borderRadius : "10px",
    display: 'flex',
    flexDirection: 'column',
    userSelect : 'none'
  }
  const selectorContainerPos = {
    position: "absolute" as "absolute",
    left: "215px",
    bottom: "93px",
    width: "528px",
    top: '164px',
  }
  const loadingTraitStyle = {
    height: "52px",
    width: "52px",
    textAlign: "center" as "center",
    lineHeight: "52px",
    backgroundColor: "rgba(16,16,16,0.6)",
    zIndex: "2",
    position: "absolute" as "absolute",
    color: "#efefef",
    left: "0",
    top: "0",
  }

  const traitsImgStyle = {
    maxWidth : "auto",
    height : '90%',
    margin:"auto"
  }
  const traitsCancelStyle = {
    maxWidth : "auto",
    height : '60%',
    textAlign: "center" as "center",
    margin:"auto"
  }

  const selectorButton = {
    // color: "#999999",
    // textAlign: "center" as "center",
    // fontSize: "12px",
    // minWidth: "60px",
    // margin: "20px 0",
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
  // loading-trait-overlay
  const loadingTraitOverlayStyle = {
    position: "fixed" as "fixed",
    left: "0",
    top: "0",
    width: "100%,",
    height: "100%,",
    backgroundColor: "rgba(16,16,16,0.8)",
  }

  const tickStyle = {
    width: "20%",
    position: "absolute",
    right : "-15px",
    top : "-15px"
  }
  const tickStyleInActive = {
    display : 'none'
  }

  const selectOption = (option:any) =>{
    console.log('aaaaaaaaa', option)
    moveCamera(option.cameraTarget)
    !isMute && play();
  }

  const moveCamera = (value:any) => {
    console.log('aaaaaaaaa', value)
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
    console.log('aaaaaaaaaaaa', isHide)
  }, [isHide])

  React.useEffect(  () => {
    (async ()=>{

      if(randomFlag === -1) return;
      
      let lists = apiService.fetchCategoryList();
      let ranItem;
      Object.entries(avatar).map((props : any) => {
        let traitName = props[0];
        console.log(props)
        scene.remove(avatar[traitName].model);
      })
      let buffer={};
      for(let i=0; i < lists.length ; i++){
       await apiService.fetchTraitsByCategory(lists[i]).then(
         async (traits) => {
          if (traits) {
            let collection = traits.collection;
            ranItem = collection[Math.floor(Math.random()*collection.length)];
            var temp = await itemLoader(ranItem,traits);
            console.log(temp)
            buffer = {...buffer,...temp};
            if(i == lists.length-1)
            setAvatar({
              ...avatar,
              ...buffer
            })   
          }
        })
      }
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
          itemLoader(trait)
        }
      }
    }
    setSelectValue(trait?.id)
  }
//console.log("5")
  //console.log(avatar.accessories.traitInfo.id)
const itemLoader =  async(item, traits = null) => {
  let r_vrm;
  await sceneService.loadModel(`${templateInfo.traitsDirectory}${item?.directory}`,setLoadingTrait)
    .then((vrm) => {
      sceneService.addModelData(vrm,{cullingLayer: item.cullingLayer || 1})
      console.log(vrm)
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
      //console.log("check here");
      startAnimation(vrm);
      setLoadingTrait(null)
      setLoadingTraitOverlay(false)
      setTimeout(()=>{
        model.scene.add(vrm.scene)
      },100);
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
          setTimeout(() => {
            sceneService.disposeVRM(avatar[traitName].vrm);
          },60);
        }
      }
    })
  
  return {
      [traits?.trait]: {
        traitInfo: item,
        model: r_vrm.scene,
      }
    }
  // });
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
    <FadeInOut show={!isHide} duration={1000} >
        <div style={selectorContainerPos}>
          <div className="selector-container" style={selectorContainer}>
            <div className="selector-container-header" style={{
              height : "73px",
              borderBottom : "2px solid #3A7484",
              position : 'relative',
              display : 'flex',
              alignItems: 'center',
              overflow : 'hidden',
              justifyContent : "space-between",
            }}>
              <span style={{
                display : 'inline-block',
                fontFamily: 'Proxima',
                fontStyle: 'normal',
                fontWeight: '800',
                fontSize: '35px',
                lineHeight: '91.3%',
                color: '#FFFFFF',
                paddingLeft : "46px",
                userSelect : "none"
              }}>{category.charAt(0).toUpperCase() + category.slice(1)}</span>
              <img src={iconPath} style={{
                width: '100px',
                right : '0px',
                top : '0px',
              }}/>
            </div>
            <div style={{
                  overflowY : "auto",
                  flex : "1",
                  height : "30%",
                  top : "70%",
                  WebkitMaskImage:"-webkit-gradient(linear, 70% 80%, 70% 100%, from(rgba(0,0,0,1)), to(rgba(0,0,0,0)))",
                  maskImage: "linear-gradient(to bottom, rgba(0,0,0,1), rgba(0,0,0,0))",
                }}>
                {
                  category === 'head' && 
                    (
                      <div 
                        className="hair-sub-category"
                        style={{
                          display: 'flex',
                          gap: '20px',
                          padding : "24px 24px 24px"
                        }}
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
                <Stack
                  // spacing={2}
                  justifyContent="inherit"
                  alignItems="left"
                  divider={<Divider orientation="vertical" flexItem />}
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: category !== "gender" ? ('repeat(3, 1fr)'):('repeat(2, 1fr)'),
                    gap: 3,
                    p: 3,
                  }}
                >
                  {category === "color" ? (
                    <div>
                      <div 
                        className="sub-category-header"
                        style={{
                          display: 'flex',
                          gap: '20px',
                        }}
                      >
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
                          {category !== "gender" ?(<div
                            style={noTrait ? selectorButtonActive : selectorButton }
                            className={`selector-button ${noTrait ? "active" : ""}`}
                            onClick={() => {
                              selectTrait("0");
                              !isMute && play();
                            }}
                          >
                            <img style={traitsCancelStyle}
                                    className="icon"
                                    src={cancel}
                                  />
                          </div>):("")}
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
                                    if (category === "gender") {
                                      setLoaded(true)
                                      setTempInfo(item.id)
                                    }
                                    !isMute && play();
                                    selectTrait(item)
                                  }}
                                >
                                  <img style={traitsImgStyle}
                                    className="icon"
                                    src={
                                      item.thumbnailsDirectory
                                        ? item.thumbnail
                                        : `${templateInfo?.thumbnailsDirectory}${item?.thumbnail}`
                                    }
                                  />
                                  <img src={tick}
                                    style = {getActiveStatus(item) ? tickStyle : tickStyleInActive}
                                  />
                                  {selectValue === item?.id && loadingTrait > 0 && (
                                    <Typography
                                      className="loading-trait"
                                      style={loadingTraitStyle}
                                    >
                                      {loadingTrait}%
                                    </Typography>
                                  )}
                                </div>
                              )
                            })}
                          <div style={{ visibility: "hidden" }}>
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
                </Stack>
              )}
            </div>
        {/*   <div style={{
              width: "100%",
              height : '100px',
              border : "1px solid red",
              
            }}></div>*/}
            <div
              className={
                loadingTraitOverlay
                  ? "loading-trait-overlay show"
                  : "loading-trait-overlay"
              }
              style={
                loadingTraitOverlay ? loadingTraitOverlayStyle : { display: "none" }
              }
            />
          </div>
        </div>
    </FadeInOut>
  )
}