import DoNotDisturbIcon from "@mui/icons-material/DoNotDisturb"
import { Avatar, Slider, Stack, Typography } from "@mui/material"
import Divider from "@mui/material/Divider"
import React, { useState } from "react"
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader"
import { apiService, sceneService } from "../services"
import { startAnimation } from "../library/animations/animation"

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
  }: any = props
  const [selectValue, setSelectValue] = useState("0")

  const [collection, setCollection] = useState([])
  const [traitName, setTraitName] = useState("")

  const [loadingTrait, setLoadingTrait] = useState(null)
  const [loadingTraitOverlay, setLoadingTraitOverlay] = useState(false)

  const [noTrait, setNoTrait] = useState(true)
  const [loaded, setLoaded] = useState(false)

  const handleChangeSkin = (event: Event, value: number | number[]) => {
    for (const bodyTarget of templateInfo.bodyTargets) {
      sceneService.setMaterialColor(scene, value, bodyTarget)
    }
  }

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
    if (!scene) return
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
  }, [category, scene])


  React.useEffect(() => {
    if(scene){
      sceneService.setScene(scene);
    }
  }, [scene])

  React.useEffect(() => {
    if (!scene) return
    async function _get() {
      if (!loaded) {
        setTempInfo("1")
      }
    }
    _get()
  }, [
    loaded,
    scene,
    templateInfo ? Object.keys(templateInfo).length : templateInfo,
  ])

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
          const loader = new GLTFLoader()
          loader
            .loadAsync(
              `${templateInfo.traitsDirectory}${trait?.directory}`,
              (e) => {
                // console.log((e.loaded * 100) / e.total);
                setLoadingTrait(Math.round((e.loaded * 100) / e.total))
              },
            )
            .then(async (gltf) => {
              const vrm = gltf
              // VRM.from(gltf).then(async (vrm) => {
                // vrm.scene.scale.z = -1;
                // console.log("scene.add", scene.add)
                // TODO: This is a hack to prevent early loading, but we seem to be loading traits before this anyways
                // await until scene is not null
                await new Promise<void>((resolve) => {
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
                // console.log(trait);
                if (avatar[traitName]) {
                  setAvatar({
                    ...avatar,
                    [traitName]: {
                      traitInfo: trait,
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
            // })
        }
      }
    }
    setSelectValue(trait?.id)
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
           
           <Slider
            defaultValue={255}
            valueLabelDisplay="off"
            step={1}
            max={255}
            min={0}
            onChange={handleChangeSkin}
            sx={{ width: "50%", margin: "30px 0" }}
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
                          item.thubnailsDirectory
                            ? item.thumbnail
                            : `${templateInfo?.thubnailsDirectory}${item?.thumbnail}`
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
