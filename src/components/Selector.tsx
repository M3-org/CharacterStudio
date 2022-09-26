import DoNotDisturbIcon from "@mui/icons-material/DoNotDisturb"
import { Avatar, Slider, Stack, Typography } from "@mui/material"
import Divider from "@mui/material/Divider"
import React, { useState } from "react"
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader"
import { apiService, sceneService } from "../services"
import { startAnimation } from "../library/animations/animation"
import Skin from "./Skin"

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

  const selectorContainer = {
    position: "absolute" as "absolute",
    height: "5rem",
    left: "0",
    bottom: "93px",
    width: "100vw",
    boxSizing: "border-box" as "border-box",
    backgroundColor: "#111111",
    borderTop: "1px solid #303030",
    padding: "14px 0px 14px 32px !important",
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

  const selectorButton = {
    color: "#999999",
    textAlign: "center" as "center",
    fontSize: "12px",
    minWidth: "60px",
    margin: "20px 0",
    cursor: "pointer" as "pointer",
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

    // lists.map((list) => {
    //   apiService.fetchTraitsByCategory(list).then(
    //    (traits) => {
    //     if (traits) {
    //       let collection = traits.collection;
    //       ranItem = collection[Math.floor(Math.random()*collection.length)];
    //       itemLoader(ranItem,traits);
    //     }
    //   })
    // });
    
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
    setLoadingTrait(null)
    setLoadingTraitOverlay(false)
    startAnimation(vrm)
  })
    return {
        [traits?.trait]: {
          traitInfo: item,
          model: vrm.scene,
        }
      }
}
  return (
    <div className="selector-container" style={selectorContainer}>
      {templateInfo?.traitsDirectory && (
        <Stack
          direction="row"
          spacing={2}
          justifyContent="left"
          alignItems="left"
          divider={<Divider orientation="vertical" flexItem />}
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

  )
}