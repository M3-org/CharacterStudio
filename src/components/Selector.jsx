import React, { useEffect, Fragment, useState, useContext } from "react"
import * as THREE from "three"
import useSound from "use-sound"
import cancel from "../../public/ui/selector/cancel.png"
import { disposeVRM } from "../library/utils"
import Skin from "./Skin"

import sectionClick from "../../public/sound/section_click.wav"
import tick from "../../public/ui/selector/tick.svg"
import { AudioContext } from "../context/AudioContext"
import { SceneContext } from "../context/SceneContext"

import styles from './Selector.module.css'

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

  const [traitName, setTraitName] = useState("")
  const [loadingTraitOverlay, setLoadingTraitOverlay] = useState(false)
  const [noTrait, setNoTrait] = useState(true)
  const [textureOptions, setTextureOptions] = useState([])

  const [play] = useSound(sectionClick, { volume: 1.0 })

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
        const traits = templateInfo[currentTemplate.index][lists[i]]
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
    if (trait === null) {
      setNoTrait(true)
      setTextureOptions([])
      if (avatar[traitName] && avatar[traitName].vrm) {
        disposeVRM(avatar[traitName].vrm)
        setAvatar({
          ...avatar,
          [traitName]: {},
        })
      }
      return;
    } 
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
    setSelectValue(trait && trait.id)
  }

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
      currentTrait && {
        [currentTrait.trait]: {
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
    <div className={styles['SelectorContainerPos']} loadingOverlay={loadingTraitOverlay}>
      <div className={styles["selector-container"]}>
        <div className={styles["traitPanel"]}>
          {currentTrait !== "head" ? (
            <Fragment>
              <div className={noTrait ? styles["selectorButtonActive"] : styles["selectorButton"]}
                onClick={() => {
                  selectTrait(null)
                  !isMute && play()
                }}
              >
                <img className={styles["icon"]} src={cancel} style={{ width: "3em", height: "3em", }} />
              </div>
              {currentTrait && currentTrait.collection &&
                currentTrait.collection.map((item, index) => {
                  if (!item.thumbnailOverrides) {
                    return (
                      <div
                        key={index}
                        classname={
                          getActiveStatus(item)
                            ? 'selectorButtonActive'
                            : 'selectorButton'
                        }
                        className={`selector-button coll-${traitName} ${
                          selectValue === item.id ? "active" : ""
                        }`}
                        onClick={() => {
                          !isMute && play()
                          console.log('select trait', item)
                          selectTrait(item)
                        }}
                      >
                        <img
                          className={styles["trait-icon"]}
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
                              ? styles["tickStyle"]
                              : styles["tickStyleInActive"]
                          }
                        />
                        {selectValue === item.id && loadedPercent > 0 && (
                          <div className={styles["loading-trait"]}>{loadedPercent}%</div>
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
                            console.log('select trait', item)
                            selectTrait(item, icnindex)
                          }}
                        >
                          <img
                            className={styles["trait-icon"]}
                            src={`${templateInfo.thumbnailsDirectory}${icn}`}
                          />
                          <img
                            src={tick}
                            className={
                              getActiveStatus(item)
                                ? styles["tickStyle"]
                                : styles["tickStyleInActive"]
                            }
                          />
                          {selectValue === item.id && loadedPercent > 0 && (
                            <div className={styles["loading-trait"]}>
                              {loadedPercent}%
                            </div>
                          )}
                        </div>
                      )
                    })
                  }
                })}
            </Fragment>
          ) : (
            <Skin templateInfo={templateInfo} avatar={avatar} />
          )}
        </div>
      </div>
    </div>
  )
}
