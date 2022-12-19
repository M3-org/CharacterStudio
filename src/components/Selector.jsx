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

export default function Selector() {
  const {
    loadModel,
    avatar,
    setAvatar,
    currentTemplate,
    scene,
    setCurrentTrait,
    currentTrait,
    template,
    model,
   } = useContext(SceneContext);
   console.log('selector currentTemplate is', currentTemplate)
    console.log('selector currentTrait is', currentTrait)
    console.log('selector templateInfo is', template)
   // cast currentTemplate.index to int
    const currentTemplateIndex = parseInt(currentTemplate.index)
   console.log('currentTemplateIndex is', currentTemplateIndex)
   const templateInfo = template[currentTemplate.index];
   const traits = templateInfo.traits
   console.log('state traits is', traits)
   const traitTypes = templateInfo.traits.map((trait) => trait.type);

   console.log('selector traits is', traits)

  const { isMute } = useContext(AudioContext)

  const [selectValue, setSelectValue] = useState("0")

  const [traitName, setTraitName] = useState("")
  const [loadingTraitOverlay, setLoadingTraitOverlay] = useState(false)

  const getAsArray = (target) => {
    if (target == null) return []
  
    return Array.isArray(target) ? target : [target]
  }
  
  const selectTrait = (trait, textureIndex, templateInfo, setLoadingTraitOverlay, setSelectValue, setAvatar) => {
    if (trait === null) {
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
          templateInfo.traits.map((item) => {
            if (item.name === currentTrait && item.type === "texture") {
              textureTraitLoader(item, trait, templateInfo, setLoadingTraitOverlay)
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
    trait,
    addToScene = true,
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
          const traitData = templateInfo.traits.find(
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
                const tdata = templateInfo.traits.find(
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
    let ranItem
    let buffer = { ...(avatar ?? {}) };

    (async () => {
      let newAvatar = {}
      // for trait in traits
      for (let trait of traits) {
        console.log("setting rando trait", trait);
        // TODO: this may be throwing errors, we need to pass the traits parsed tom the json
          const collection = trait.collection
          ranItem = collection[Math.floor(Math.random() * collection.length)]
              const temp = await itemLoader(ranItem, traits, false)
              loaded += 100 / traitTypes.length
              newAvatar[trait.name] = temp
      }
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


  return (
    <div className={styles['SelectorContainerPos']}>
      <div className={styles["selector-container"]}>
              <div className={!currentTrait ? styles["selectorButtonActive"] : styles["selectorButton"]}
                onClick={() => {
                  selectTrait(null)
                  !isMute && play()
                }}>
                <img className={styles["icon"]} src={cancel} style={{ width: "3em", height: "3em", }} />
              </div>
              {currentTrait && currentTrait.collection &&
                currentTrait.collection.map((item, index) => {
                  if (!item.thumbnailOverrides) {
                    return (
                      <div
                        key={index}
                        classname={
                          avatar[currentTrait].traitInfo.id === item.id
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
                            avatar[currentTrait].traitInfo.id === item.id
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
                              avatar[currentTrait].traitInfo.id === item.id
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
      </div>
    </div>
  )
}
