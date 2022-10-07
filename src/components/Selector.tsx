import DoNotDisturbIcon from "@mui/icons-material/DoNotDisturb"
import { Avatar, Slider, Stack, Typography } from "@mui/material"
import Divider from "@mui/material/Divider"
import React, { useState } from "react"
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader"
import { apiService, sceneService } from "../services"
import { startAnimation } from "../library/animations/animation"
import { VRM, VRMSchema } from "@pixiv/three-vrm"
import Skin from "./Skin"
import '../styles/font.scss'

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
    randomFlag
  }: any = props

  const [selectValue, setSelectValue] = useState("0")

  const [collection, setCollection] = useState([])
  const [traitName, setTraitName] = useState("")

  const [loadingTrait, setLoadingTrait] = useState(null)
  const [loadingTraitOverlay, setLoadingTraitOverlay] = useState(false)

  const [noTrait, setNoTrait] = useState(true)
  const [loaded, setLoaded] = useState(false)
  
  const iconPath = "icons-gradient/" + category + ".svg";
  const selectorContainer = {
    height: "614px",
    boxSizing: "border-box" as "border-box",
    padding: "14px 0px 14px 32px !important",
    background: 'rgba(56, 64, 78, 0.1)',
    backdropFilter: 'blur(22.5px)',
    borderBottom: "2px solid rgb(58, 116, 132)"
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

  const traitStyle = {
    width: '100%',
  }

  const selectorButton = {
    // color: "#999999",
    // textAlign: "center" as "center",
    // fontSize: "12px",
    // minWidth: "60px",
    // margin: "20px 0",
    cursor: "pointer" as "pointer",
    width: '100%',
    height: '134px',
    background: "rgba(81, 90, 116, 0.2)",
    backdropFilter: "blur(22.5px)",
    borderRadius: "5px",
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
  const okButton = {
      width: '241px',
      height: '66px',
      background: 'rgba(81, 90, 116, 0.25)',
      border:'2px solid #434B58',
      borderRadius: '78px',
      fontFamily: 'Proxima Nova',
      fontStyle: 'normal',
      fontWeight: '400',
      fontSize: '25px',
      lineHeight: '91.3%',
      display:"flex",
      justifyContent:"center",
      alignItems  :"center",
      marginTop :"27px"
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
          console.log('traits are', traits)
          console.log('templateInof is', templateInfo)
          setCollection(traits?.collection)
          setTraitName(traits?.trait)
        }
      })
    }
  }, [category, scene, templateInfo])


  React.useEffect(() => {
    if(scene){
      sceneService.setScene(scene);
    }
  }, [scene])
  
  React.useEffect(() => {
    if (!scene) return
    async function _get() {
      if (!loaded) {
        setTempInfo("2")
      }
    }
    _get()
  }, [
    loaded,
    scene,
    templateInfo ? Object.keys(templateInfo).length : templateInfo,
  ])

  React.useEffect( async () => {
    if(randomFlag === -1) return;
    
    let lists = apiService.fetchCategoryList();
    let ranItem;
    Object.entries(avatar).map((props : any) => {
      let traitName = props[0];
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
          buffer = {...buffer,...temp};
          if(i == lists.length-1)
          setAvatar({
            ...avatar,
            ...buffer
          })          
        }
      })
    }

  }, [randomFlag])

  const setTempInfo = (id) => {
    apiService.fetchTemplate(id).then((res) => {
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
        if (avatar[traitName] && avatar[traitName].model) {
          scene.remove(avatar[traitName].model)
        }
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
const renameVRMBones = (vrm) =>{
  for (let bone in VRMSchema.HumanoidBoneName) {
    let bn = vrm.humanoid.getBoneNode(VRMSchema.HumanoidBoneName[bone]);
    if (bn != null)
        bn.name = VRMSchema.HumanoidBoneName[bone];
  } 
}
const itemLoader =  async(item, traits = null) => {
 const loader =  new GLTFLoader()
 var vrm;
 await loader
  .loadAsync(
    `${templateInfo.traitsDirectory}${item?.directory}`,
    (e) => {
      // console.log((e.loaded * 100) / e.total);
      setLoadingTrait(Math.round((e.loaded * 100) / e.total))
    },
  )
  .then( (gltf) => {
     vrm = gltf
    // VRM.from(gltf).then(async (vrm) => {
    // vrm.scene.scale.z = -1;
    // console.log("scene.add", scene.add)
    // TODO: This is a hack to prevent early loading, but we seem to be loading traits before this anyways
    // await until scene is not null
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
    VRM.from(gltf).then((vrm2) => {
      vrm2.scene.traverse((o) => {
        o.frustumCulled = false
      })
      //vrm2.scene.rotation.set(Math.PI, 0, Math.PI)
      renameVRMBones(vrm2);
      setLoadingTrait(null)
      setLoadingTraitOverlay(false)
      startAnimation(vrm2)
    })

    scene.add(vrm.scene)
      // vrm.humanoid.getBoneNode(
      //   VRMSchema.HumanoidBoneName.Hips,
      // ).rotation.y = Math.PI
    vrm.scene.frustumCulled = false
    if (avatar[traitName]) {
      setAvatar({
        ...avatar,
        [traitName]: {
          traitInfo: item,
          model: vrm.scene,
        }
      })
      if (avatar[traitName].model) {
        scene.remove(avatar[traitName].model)
      }
    }
  })
  return {
      [traits?.trait]: {
        traitInfo: item,
        model: vrm.scene,
      }
    }
  // });
}
  return (
    <div style={selectorContainerPos} >
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
            fontFamily: 'Proxima Nova',
            fontStyle: 'normal',
            fontWeight: '800',
            fontSize: '35px',
            lineHeight: '91.3%',
            color: '#FFFFFF',
            paddingLeft : "46px"
          }}>{category.charAt(0).toUpperCase() + category.slice(1)}</span>
          <img src={iconPath} style={{
            width: '100px',
            right : '0px',
            top : '0px',
          }}/>
        </div>
        {templateInfo?.traitsDirectory && (
          <Stack
            // spacing={2}
            justifyContent="inherit"
            alignItems="left"
            divider={<Divider orientation="vertical" flexItem />}
            sx={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: 3,
              p: 3
            }}
          >
            {category === "color" ? (
              <Skin
                scene={scene}
                templateInfo={templateInfo}
              />
            ) : (
              <React.Fragment>
                <div
                  style={selectorButton}
                  className={`selector-button ${noTrait ? "active" : ""}`}
                  onClick={() => selectTrait("0")}
                >
                  <Avatar className="icon">
                    <DoNotDisturbIcon />
                  </Avatar>
                </div>
                {collection &&
                  collection.map((item: any, index) => {
                    return (
                      <div
                        key={index}
                        style={selectorButton}
                        className={`selector-button coll-${traitName} ${selectValue === item?.id ? "active" : ""
                          }`}
                        onClick={() => {
                          if (category === "gender") {
                            setLoaded(true)
                            setTempInfo(item.id)
                          }
                          selectTrait(item)
                        }}
                      >
                        <Avatar
                          className="icon"
                          src={
                            item.thumbnailsDirectory
                              ? item.thumbnail
                              : `${templateInfo?.thumbnailsDirectory}${item?.thumbnail}`
                          }
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
            )}
          </Stack>
        )}
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
      <div style = {{
        display: 'flex',
        gap: '48px'
      }}>
        <div style={okButton}>Cancel
        </div>
        <div style={okButton}>Apply
        </div>
      </div>
    </div>
  )
}