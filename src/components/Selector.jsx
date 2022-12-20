import React, { useEffect, Fragment, useState, useContext } from "react"
import * as THREE from "three"
import useSound from "use-sound"
import cancel from "../../public/ui/selector/cancel.png"
import { disposeVRM } from "../library/utils"
import Skin from "./Skin"
import { addModelData, getSkinColor } from "../library/utils"

import sectionClick from "../../public/sound/section_click.wav"
import tick from "../../public/ui/selector/tick.svg"
import { AudioContext } from "../context/AudioContext"
import { SceneContext } from "../context/SceneContext"

import styles from './Selector.module.css'

export default function Selector() {
  const {
    loadModel,
    avatar,
    setAvatar,
    currentTemplate,
    scene,
    setCurrentTraitName,
    currentTraitName,
    template,
    model,
   } = useContext(SceneContext);
    const currentTemplateIndex = parseInt(currentTemplate.index)
   const templateInfo = template[currentTemplateIndex];
   const traits = templateInfo.traits
   const traitTypes = templateInfo.traits.map((trait) => trait.name);
  const { isMute } = useContext(AudioContext)

  const [selectValue, setSelectValue] = useState("0")

  const [loadingTraitOverlay, setLoadingTraitOverlay] = useState(false)
  const [loadedPercent, setLoadedPercent] = useState(0)

  const getAsArray = (target) => {
    if (target == null) return []
  
    return Array.isArray(target) ? target : [target]
  }
  
  const selectTrait = (trait, textureIndex, templateInfo, setLoadingTraitOverlay, setSelectValue, setAvatar) => {
    // clear the trait
    if (trait === null && avatar[currentTraitName] && avatar[currentTraitName].vrm) {
        disposeVRM(avatar[currentTraitName].vrm)
        setAvatar({
          ...avatar,
          [currentTraitName]: {},
        })
      return;
    }

    templateInfo.traits.map((item) => {
      if (item.name === currentTraitName && item.type === "texture") {
        textureTraitLoader(item, trait, templateInfo, setLoadingTraitOverlay)
      } else if (item.name === currentTraitName) {
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

    // explain the above map function
    // the map function is used to loop through the traits array
    // and check if the current trait name is equal to the name of the trait in the array

    setSelectValue(trait && trait.id)
  }
  
  const itemLoader = async (
    item,
    trait,
    addToScene = true,
  ) => {
    let r_vrm
    console.log('loading model', item, trait)
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
  
          const traitData = templateInfo.traits.find(
            (element) => element.name === currentTraitName,
          )
  
          // set the new trait
          const newAvatarData = {}
          newAvatarData[currentTraitName] = {
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
                const tData = templateInfo.traits.find(
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
                    if (property !== currentTraitName) {
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
                          avatar[property].item.type,
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
            if (property !== currentTraitName) {
              if (newAvatar[property].vrm) {
                const tdata = templateInfo.traits.find(
                  (element) => element.name === property,
                )
                const restricted = tdata.restrictedTraits
                if (restricted) {
                  for (let i = 0; i < restricted.length; i++) {
                    if (restricted[i] === currentTraitName) {
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
        //texture area
        setTimeout(() => {
          model.scene.add(vrm.scene)
        }, 1)
    }
  
    return ({
        [trait.trait]: {
          traitInfo: item,
          model: r_vrm.scene,
          vrm: r_vrm,
        },
      }
    )
  }
  
  const textureTraitLoader = (props, trait) => {
    console.log('typeof props.target is', typeof props.target)
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
        (typeof trait.directory === "string")
          ? (templateInfo.traitsDirectory + trait.directory)
          : (templateInfo.traitsDirectory + trait.directory[0])
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

  const [play] = useSound(sectionClick, { volume: 1.0 })

  useEffect(() => {
    console.log('')

    console.log('templateInfo.traits is', templateInfo.traits)
    console.log('traitTypes is', traitTypes)
    let buffer = { ...(avatar ?? {}) };

    (async () => {
      let newAvatar = {}
      // for trait in traits
      for (const property in buffer) {
        if (buffer[property].vrm) {
          if (newAvatar[property].vrm != buffer[property].vrm) {
            if (newAvatar[property].vrm != null) {
              disposeVRM(newAvatar[property].vrm)
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
  }, [])
  
  // if head <Skin templateInfo={templateInfo} avatar={avatar} />

  function ClearTraitButton () {
    // clear the current trait
    return (
      <div className={!currentTraitName ? styles["selectorButtonActive"] : styles["selectorButton"]}
      onClick={() => {
        selectTrait(null)
        !isMute && play()
      }}>
      <img className={styles["icon"]} src={cancel} style={{ width: "3em", height: "3em", }} />
    </div>
    )
  }

  return !!currentTraitName && (
    <div className={styles['SelectorContainerPos']}>
      <div className={styles["selector-container"]}>
        <ClearTraitButton />
              {templateInfo.traits.find((trait) => trait.name === currentTraitName).collection.map((item, index) => {
                console.log('mapping item, index', item, index)  
                if (item.thumbnailOverrides) {
                  return item.thumbnailOverrides.map((icn, icnindex) => {
                    const active = selectValue === item.id;
                    return (
                      <div
                        key={index + "_" + icnindex}
                        className={`${styles['selectorButton']} ${styles['selector-button']} ${styles[`coll-${currentTraitName}`]} ${
                          active ? styles['active'] : ""
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
                            avatar[currentTraitName] && avatar[currentTraitName].id === item.id
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
                else {
                  console.log('avatar', avatar)
                  console.log('currentTraitName', currentTraitName)
                  console.log('avatar[currentTraitName]', avatar[currentTraitName])
                  const traitActive = avatar[currentTraitName] && avatar[currentTraitName].traitInfo.id === item.id
                    return (
                      <div
                        key={index}
                        classname={traitActive ? styles['selectorButtonActive'] : styles['selectorButton']}
                        className={`selector-button coll-${currentTraitName} ${
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
                            avatar[currentTraitName].item.id === item.id
                            ? styles["tickStyle"]
                              : styles["tickStyleInActive"]
                          }
                        />
                        {selectValue === item.id && loadedPercent > 0 && (
                          <div className={styles["loading-trait"]}>{loadedPercent}%</div>
                        )}
                      </div>
                    )
                  }
                })}
      </div>
    </div>
  )
}
