import { Avatar } from "@mui/material"
import React, { useEffect, Fragment, useState, useContext } from "react"
import * as THREE from "three"
import useSound from "use-sound"
import cancel from "../../public/ui/selector/cancel.png"
import { disposeVRM } from "../library/utils"
import Skin from "./Skin"

import sectionClick from "../../public/sound/section_click.wav"
import tick from "../../public/ui/selector/tick.svg"
import { AudioContext } from "../context/AudioContext"

import styled from 'styled-components';
import { SceneContext } from "../context/SceneContext"

export const SelectorContainerPos = styled.div`
    {   
        position: absolute;
        left: 10em;
        bottom: 5em;
        top: 6.5em;
    
        .selector-container{
            height: 80vh;
            box-sizing: border-box;
            padding: .5em !important;
            background: rgba(56; 64; 78; 0.1);
            backdrop-filter: blur(22.5px);
            border-bottom: 2px solid rgb(58; 116; 132);
            transform: perspective(400px) rotateY(5deg);
            border-radius : 10px;
            display: flex;
            flex-direction: column;
            user-select : none;

            .selector-container-header{
                height : 3em;
                border-bottom : 2px solid #3A7484;
                position : relative;
                display : flex;
                align-items: center;
                overflow : hidden;
                justify-content : space-between;

                .categoryTitle{
                    display : inline-block;
                    font-family: Proxima;
                    font-style: normal;
                    font-weight: 800;
                    font-size: 35px;
                    line-height: 91.3%;
                    color: #FFFFFF;
                    padding-left : .5em;
                    user-select : none;
                }

                .titleIcon{
                    width: 3em;
                    right : 0px;
                    top : 0px;
                }
            }
            
            .traitPanel{
                overflow-y : auto;
                flex : 1;
                height : 80vh;

                /* make the scrollbar transparent and cyberpunk looking */
                scrollbar-color: #3A7484 #3A7484;
                scrollbar-width: thin;
                ::-webkit-scrollbar {
                    width: 10px;
                }

                /* Track */
                ::-webkit-scrollbar-track {
                    background: #3A7484;
                }

                /* Handle */
                ::-webkit-scrollbar-thumb {
                    background: #3A7484;
                }

                /* Handle on hover */
                ::-webkit-scrollbar-thumb:hover {
                    background: #3A7484;
                }


                Webkit-mask-image:-webkit-gradient(linear, 70% 80%, 70% 100%, from(rgba(0,0,0,1)), to(rgba(0,0,0,0)));
                mask-image: linear-gradient(to bottom, 
                    rgba(0,0,0,1) 0px, 
                    rgba(0,0,0,1) 300px,
                    rgba(0,0,0,0));

                .traits {
                    display: grid;
                    grid-template-columns: repeat(1, 1fr);
                    .sub-category{
                        .sub-category-header{
                            display: flex;
                            gap: 20px;
                        }
                    }
                    .selectorButtonActive{
                        display: flex;
                        justify-content: center;
                        cursor: pointer;
                        padding: 1em;
                        gap: 1em;
                        width: 4em;
                        height: 4em;
                        margin: .25em;
                        background: rgba(81, 90, 116, 0.2);
                        backdrop-filter: blur(22.5px);
                        border-radius: 5px;
                        border-bottom  : 4px solid #61E5F9;
                        .icon{
                            max-width : auto;
                            height : 60%;
                            text-align: center;
                            margin:auto;
                        }
                    }
                    .selector-button {
                        margin: .25em;
                    }
                    .selectorButton{
                        display: flex;
                        justify-content: center;
                        items-align : center;
                        cursor: pointer;
                        width: 4em;
                        height: 4em;
                        margin: .25em;
                        padding: 1em;
                        background: rgba(81, 90, 116, 0.2);
                        backdrop-filter: blur(22.5px);
                        border-radius: 5px;
                        .icon{
                            max-width : auto;
                            height : 60%;
                            text-align: center;
                            margin:auto;
                        }
                    }
                    .trait-icon{
                        max-width : auto;
                        height : 4em;
                        margin : auto;
                    }
                    .tickStyle{
                        width: 20%;
                        position: absolute;
                        right : -15px;
                        top : -15px;
                    }
                    .tickStyleInActive{
                        display : none;
                    }
                    .loading-trait{
                        height: 52px;
                        width: 52px;
                        text-align: center;
                        line-height: 52px;
                        background-color: rgba(16,16,16,0.6);
                        z-index: 2;
                        position: absolute;
                        color: #efefef;
                        left: 0;
                        top: 0;
                    }
                    .icon-hidden{
                        visibility: hidden;
                    }

                }
            }
            .loading-trait-overlay{
                position: fixed;
                left: 0;
                top: 0;
                width: 100%;
                height: 98%;
                backgroundColor: rgba(16,16,16,0.8);
                cursor: wait;
            }
            .loading-trait-overlay-show {
                display : none;
            }
        }
    }
`

export default function Selector({templateInfo}) {
  const {
    loadModel,
    avatar,
    setAvatar,
    currentTemplate,
    scene,
    setCurrentTrait,
    currentTrait,
    model,
   } = useContext(SceneContext);

  function getCategoriesFromTemplate(template) {
    const categories = template.attributes.map((attribute) => {
      return attribute.trait_type;
    });
    return categories;
  }

  const { isMute } = useContext(AudioContext)

  const [selectValue, setSelectValue] = useState("0")

  const [collection, setCollection] = useState([])
  const [traitName, setTraitName] = useState("")
  const [loadingTraitOverlay, setLoadingTraitOverlay] = useState(false)
  const [noTrait, setNoTrait] = useState(true)
  const [textureOptions, setTextureOptions] = useState([])

  const [play] = useSound(sectionClick, { volume: 1.0 })

  const selectorButton = {
    display: "flex",
    justifyContent: "center",
    cursor: "pointer",
    width: "4em",
    height: "4em",
    padding: "1em",

    background: "rgba(81, 90, 116, 0.2)",
    backdropFilter: "blur(22.5px)",
    borderRadius: "5px",
  }

  const selectorButtonActive = {
    display: "flex",
    justifyContent: "center",
    cursor: "pointer",
    width: "4em",
    height: "4em",
    padding: "1em",
    background: "rgba(81, 90, 116, 0.2)",
    backdropFilter: "blur(22.5px)",
    borderRadius: "5px",
    borderBottom: "4px solid #61E5F9",
  }

  useEffect(() => {
    if (!templateInfo || !templateInfo[currentTemplate.index]) return;
    localStorage.removeItem("color")
    (async () => {
      const lists = getCategoriesFromTemplate(templateInfo[currentTemplate.index])
      let ranItem
      let buffer = { ...avatar }
      let loaded = 0
      for (let i = 0; i < lists.length; i++) {
        // TODO: this may be throwing errors, we need to pass the traits parsed tom the json
        const traits = templateInfo[lists[i]]
          const collection = traits.collection
          ranItem =
            collection[Math.floor(Math.random() * collection.length)]
          if (avatar[traits.trait]) {
            if (avatar[traits.trait].traitInfo != ranItem) {
              const temp = await itemLoader(ranItem, traits, false)
              loaded += 100 / lists.length
              buffer = { ...buffer, ...temp }
            }
          }
      }
      for (const property in buffer) {
        if (buffer[property].vrm) {
          if (avatar[property].vrm != buffer[property].vrm) {
            if (avatar[property].vrm != null) {
              disposeVRM(avatar[property].vrm)
            }
          }
          model.data.animationManager.startAnimation(buffer[property].vrm)
          // wait one frame before adding to scene so animation doesn't glitch
          setTimeout(() => {
            model.scene.add(buffer[property].vrm.scene)
          }, 1)
        }
      }
      setAvatar({
        ...avatar,
        ...buffer,
      })
    })()
  }, [currentTemplate])

  const selectTrait = (trait, textureIndex) => {
    if (trait.bodyTargets) {
      setCurrentTrait(trait.id)
    }
    if (scene) {
      if (trait === "0") {
        setNoTrait(true)
        setTextureOptions([])
        if (avatar[traitName] && avatar[traitName].vrm) {
          disposeVRM(avatar[traitName].vrm)
          setAvatar({
            ...avatar,
            [traitName]: {},
          })
        }
      } else {
        if (trait.bodyTargets) {
          setCurrentTrait(trait.id)
        } else {
          setLoadingTraitOverlay(true)
          setNoTrait(false)
          templateInfo.selectionTraits.map((item) => {
            if (item.name === currentTrait && item.type === "texture") {
              textureTraitLoader(item, trait)
            } else if (item.name === currentTrait) {
              if (trait.textureCollection && textureIndex) {
                const txtrs = traits[trait.textureCollection]
                    const localDir = txtrs.collection[textureIndex].directory
                    const texture = templateInfo.traitsDirectory + localDir
                    const loader = new THREE.TextureLoader()
                    loader.load(texture, (txt) => {
                      txt.encoding = THREE.sRGBEncoding
                      txt.flipY = false
                      itemLoader(trait, null, true, txt)
                    })
              } else {
                console.warn("no texture collection")
                itemLoader(trait, null, true)
              }
            }
          })
        }
      }
    }
    setSelectValue(trait && trait.id)
  }
  let loading

  const itemLoader = async (
    item,
    traits = null,
    addToScene = true,
    texture,
  ) => {
    let r_vrm
    const vrm = await loadModel(
      `${templateInfo.traitsDirectory}${item && item.directory}`,
    )
    addModelData(vrm, {
      cullingLayer: item.cullingLayer || -1,
      cullingDistance: item.cullingDistance || null,
    })
    r_vrm = vrm

    if (addToScene) {
      if (model.data.animationManager)
        model.data.animationManager.startAnimation(vrm)
        if (texture) {
          vrm.scene.traverse((child) => {
            if (child.isMesh) {
              child.material[0].map = texture
              child.material[0].shadeMultiplyTexture = texture
            }
          })
        }

        if (avatar[traitName]) {
          const traitData = templateInfo.selectionTraits.find(
            (element) => element.name === traitName,
          )

          // set the new trait
          const newAvatarData = {}
          newAvatarData[traitName] = {
            traitInfo: item,
            model: vrm.scene,
            vrm: vrm,
          }

          // search in the trait data for restricted traits and restricted types  => (todo)
          if (traitData) {
            if (traitData.restrictedTraits) {
              traitData.restrictedTraits.forEach((restrictTrait) => {
                if (avatar[restrictTrait] !== undefined)
                  newAvatarData[restrictTrait] = {}
              })
            }

            // first check for every trait type in avatar properties if we have restricted types
            if (traitData.restrictedTypes) {
              for (const property in avatar) {
                console.log("property", avatar[property])
                if (
                  !avatar[property].traitInfo ||
                  !avatar[property].traitInfo.type
                )
                  continue
                const itemTypes = Array.isArray(avatar[property].traitInfo.type)
                  ? avatar[property].traitInfo.type
                  : [avatar[property].traitInfo.type]

                for (let i = 0; i < traitData.restrictedTypes.length; i++) {
                  const restrictedType = traitData.restrictedTypes[i]

                  // remove if  its type is restricted
                  for (let j = 0; j < itemTypes.length; j++) {
                    const itemType = itemTypes[j]
                    if (itemType === restrictedType) {
                      newAvatarData[property] = {}
                      break
                    }
                  }
                }
              }
            }
            // now check inside every property if they dont have this type as restriction keep going
            if (item.type) {
              const itemTypes = getAsArray(item.type)
              for (const property in avatar) {
                const tData = templateInfo.selectionTraits.find(
                  (element) => element.name === property,
                )
                if (tData != null) {
                  if (tData.restrictedTypes) {
                    const restrictedTypeArray = tData.restrictedTypes
                    for (let i = 0; i < restrictedTypeArray.length; i++) {
                      const restrictedType = tData.restrictedTypes[i]

                      for (let j = 0; j < itemTypes.length; j++) {
                        const itemType = itemTypes[j]
                        if (itemType === restrictedType) {
                          newAvatarData[property] = {}
                          break
                        }
                      }
                    }
                  }
                }
              }
              // this array include the names of the traits as property and the types it cannot include
              if (templateInfo.typeRestrictions) {
                // we should check every type this trait has
                for (let i = 0; i < itemTypes.length; i++) {
                  const itemType = itemTypes[i]
                  console.log(itemType)
                  // and get the restriction included in each array if exists
                  const typeRestrictions = getAsArray(
                    templateInfo.typeRestrictions[itemType],
                  )
                  // now check if the avatar properties include this restrictions to remove
                  for (const property in avatar) {
                    if (property !== traitName) {
                      typeRestrictions.forEach((typeRestriction) => {
                        if (avatar[property].traitInfo?.type) {
                          const types = avatar[property].traitInfo.type
                          for (let i = 0; i < types.length; i++) {
                            if (types[i] === typeRestriction) {
                              newAvatarData[property] = {}
                              break
                            }
                          }
                        }
                      })
                      // check also if any of the current trait is of type
                      if (avatar[property].vrm) {
                        const propertyTypes = getAsArray(
                          avatar[property].traitInfo.type,
                        )
                        propertyTypes.forEach((t) => {
                          const typeRestrictionsSecondary = getAsArray(
                            templateInfo.typeRestrictions[t],
                          )
                          if (typeRestrictionsSecondary.includes(itemType))
                            newAvatarData[property] = {}
                        })
                      }
                    }
                  }
                }
              }
            }
          }

          const newAvatar = {
            ...avatar,
            ...newAvatarData,
          }

          for (const property in newAvatar) {
            if (property !== traitName) {
              if (newAvatar[property].vrm) {
                const tdata = templateInfo.selectionTraits.find(
                  (element) => element.name === property,
                )
                const restricted = tdata.restrictedTraits
                if (restricted) {
                  for (let i = 0; i < restricted.length; i++) {
                    if (restricted[i] === traitName) {
                      // if one of their restrcited elements match, remove him and break
                      newAvatarData[property] = {}
                      break
                    }
                  }
                }
              }
            }
          }
          setAvatar({ ...newAvatar, ...newAvatarData })

          for (const property in newAvatarData) {
            if (avatar[property].vrm) {
              disposeVRM(avatar[property].vrm)
            }
          }
        }
        //texture area
        setTimeout(() => {
          model.scene.add(vrm.scene)
        }, 1)
    }

    return (
      traits && {
        [traits.trait]: {
          traitInfo: item,
          model: r_vrm.scene,
          vrm: r_vrm,
        },
      }
    )
    // });
  }
  // always return an array
  const getAsArray = (target) => {
    if (target == null) return []

    return Array.isArray(target) ? target : [target]
  }

  const textureTraitLoader = (props, trait) => {
    if (typeof props.target != "string") {
      for (let i = 0; i < props.target.length; i++) {
        const object = scene.getObjectByName(props.target[i])
        if (typeof trait.directory != "string") {
          let texture = ""

          if (trait.directory[i] != null)
            //grab the texture with same object position
            texture = templateInfo.traitsDirectory + trait.directory[i]
          //else grab the latest texture in the array
          else
            texture =
              templateInfo.traitsDirectory +
              trait.directory[trait.directory.length - 1]

          new THREE.TextureLoader().load(texture, (txt) => {
            txt.encoding = THREE.sRGBEncoding
            txt.flipY = false
            object.material[0].map = txt
            object.material[0].shadeMultiplyTexture = txt
            setTimeout(() => {
              setLoadingTraitOverlay(false)
            }, 500)
          })
        } else {
          const texture = templateInfo.traitsDirectory + trait.directory
          new THREE.TextureLoader().load(texture, (txt) => {
            txt.encoding = THREE.sRGBEncoding
            txt.flipY = false
            object.material[0].map = txt
            setTimeout(() => {
              setLoadingTraitOverlay(false)
            }, 500)
          })
        }
      }
    } else {
      const object = scene.getObjectByName(props.target)
      const texture =
        typeof trait.directory === "string"
          ? templateInfo.traitsDirectory + trait.directory
          : templateInfo.traitsDirectory + trait.directory[0]
      new THREE.TextureLoader().load(texture, (txt) => {
        txt.encoding = THREE.sRGBEncoding
        txt.flipY = false
        object.material[0].map = txt
        setTimeout(() => {
          setLoadingTraitOverlay(false)
        }, 500)
      })
    }
  }

  const getActiveStatus = (item) => {
    return (
      avatar[currentTrait] &&
      avatar[currentTrait].traitInfo &&
      avatar[currentTrait].traitInfo.id === item.id
    )
  }
  return (
    <SelectorContainerPos loadingOverlay={loadingTraitOverlay}>
      <div className="selector-container">
        <div className="traitPanel">
          {currentTrait !== "head" ? (
            <Fragment>
              <div
                className={noTrait ? "selectorButtonActive" : "selectorButton"}
                onClick={() => {
                  selectTrait("0")
                  !isMute && play()
                }}
              >
                <img
                  className="icon"
                  src={cancel}
                  style={{
                    width: "3em",
                    height: "3em",
                  }}
                />
              </div>
              {collection &&
                collection.map((item, index) => {
                  if (!item.thumbnailOverrides) {
                    return (
                      <div
                        key={index}
                        style={
                          getActiveStatus(item)
                            ? selectorButtonActive
                            : selectorButton
                        }
                        className={`selector-button coll-${traitName} ${
                          selectValue === item.id ? "active" : ""
                        }`}
                        onClick={() => {
                          !isMute && play()
                          selectTrait(item)
                        }}
                      >
                        <img
                          className="trait-icon"
                          src={
                            item.thumbnailsDirectory
                              ? item.thumbnail
                              : `${templateInfo.thumbnailsDirectory}${item.thumbnail}`
                          }
                        />
                        <img
                          src={tick}
                          className={
                            getActiveStatus(item)
                              ? "tickStyle"
                              : "tickStyleInActive"
                          }
                        />
                        {selectValue === item.id && loadedPercent > 0 && (
                          <div className="loading-trait">{loadedPercent}%</div>
                        )}
                      </div>
                    )
                  } else {
                    item.thumbnailOverrides.map((icn, icnindex) => {
                      return (
                        <div
                          key={index + "_" + icnindex}
                          style={selectorButton}
                          className={`selector-button coll-${traitName} ${
                            selectValue === item.id ? "active" : ""
                          }`}
                          onClick={() => {
                            !isMute && play()
                            selectTrait(item, icnindex)
                          }}
                        >
                          <img
                            className="trait-icon"
                            src={`${templateInfo.thumbnailsDirectory}${icn}`}
                          />
                          <img
                            src={tick}
                            className={
                              getActiveStatus(item)
                                ? "tickStyle"
                                : "tickStyleInActive"
                            }
                          />
                          {selectValue === item.id && loadedPercent > 0 && (
                            <div className="loading-trait">
                              {loadedPercent}%
                            </div>
                          )}
                        </div>
                      )
                    })
                  }
                })}
              <div className="icon-hidden">
                <Avatar className="icon" />
              </div>
            </Fragment>
          ) : (
            <Skin templateInfo={templateInfo} avatar={avatar} />
          )}
        </div>
      </div>
    </SelectorContainerPos>
  )
}
