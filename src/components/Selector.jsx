import React, { useEffect, Fragment, useState, useContext } from "react"
import * as THREE from "three"
import useSound from "use-sound"
import cancel from "../../public/ui/selector/cancel.png"
import { disposeVRM, addModelData } from "../library/utils"

import sectionClick from "../../public/sound/section_click.wav"
import tick from "../../public/ui/selector/tick.svg"
import { AudioContext } from "../context/AudioContext"
import { SceneContext } from "../context/SceneContext"

import styles from "./Selector.module.css"

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
  } = useContext(SceneContext)
  const currentTemplateIndex = parseInt(currentTemplate.index)
  const templateInfo = template[currentTemplateIndex]
  const traits = templateInfo.traits
  const traitTypes = templateInfo.traits.map((trait) => trait.name)
  const { isMute } = useContext(AudioContext)

  const [texture, setTexture] = useState(null)

  const [selectValue, setSelectValue] = useState("0")
  const [loadingTraitOverlay, setLoadingTraitOverlay] = useState(false)
  const [loadedPercent, setLoadedPercent] = useState(0)

  const getAsArray = (target) => {
    if (target == null) return []

    return Array.isArray(target) ? target : [target]
  }

  const selectTrait = (trait, textureIndex) => {
    // clear the trait
    if (
      trait === null &&
      avatar[currentTraitName] &&
      avatar[currentTraitName].vrm
    ) {
      disposeVRM(avatar[currentTraitName].vrm)
      setAvatar({
        ...avatar,
        [currentTraitName]: {},
      })
      setSelectValue(trait && trait.id)
      return;
    }
    // filter by item.name === currentTraitName
    traits
      .filter((item) => item.name === currentTraitName)
      .map((item) => {
        const currentTrait = traits.find((t) => t.name === currentTraitName);
        // find the key that matches the current trait.textureCollection
        const newAsset = currentTrait.collection.find((t) => {
          console.log('evaluating', t.textureCollection, '===', trait.textureCollection, '')
          return t.textureCollection === trait.textureCollection
        })

        console.log('newModel', newAsset)

        const localDir = newAsset.directory
        const model = templateInfo.traitsDirectory + localDir

        // get the textureCollection
        const textureCollection = model.textureCollection
        console.log('textureCollection', textureCollection)

        console.log('templateInfo.textureCollections', templateInfo.textureCollections)

        const textureCollectionData = templateInfo.textureCollections.find((t) => {
          return t.name === textureCollection
        }).collection;

        console.log('textureCollectionData', textureCollectionData)

        const texture = templateInfo.traitsDirectory + textureCollectionData[textureIndex].directory

        console.log('texture', texture)

        // if avatar has a trait, dispose it
        if (avatar[currentTraitName] && avatar[currentTraitName].vrm) {
          disposeVRM(avatar[currentTraitName].vrm)
        }

        // load the texture with THREE.TextureLoader
        const textureLoader = new THREE.TextureLoader()
        textureLoader.load(texture, (texture) => {
        itemLoader(model, texture).then((newTrait) => {
          setAvatar({...avatar, ...newTrait});
        })
      })
      })
  }

  const itemLoader = async (item, texture) => {
    let r_vrm
    const vrm = await loadModel(item)

    // 1 

    addModelData(vrm, {
      cullingLayer: item.cullingLayer || -1,
      cullingDistance: item.cullingDistance || null,
    })
    r_vrm = vrm

      if (model.data.animationManager){
        model.data.animationManager.startAnimation(vrm)
      }

        // add texture
        vrm.scene.traverse((child) => {
          if (child.isMesh) {
            child.material[0].map = texture
            child.material[0].shadeMultiplyTexture = texture
          }
        })

      const traitData = templateInfo.traits.find(
        (element) => element.name === currentTraitName,
      )

      if(!traitData) throw new Error('Trait data not found')

      // set the new trait
      const newAvatarData = { ...avatar }
      newAvatarData[currentTraitName] = {
        traitInfo: item,
        model: vrm.scene,
        vrm: vrm,
      }

      console.log('doing stuff')

      // search in the trait data for restricted traits and restricted types  => (todo)
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
            if (!avatar[property].traitInfo || !avatar[property].traitInfo.type)
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
                  if (avatar[property] && avatar[property].vrm) {
                    const propertyTypes = getAsArray(avatar[property].item.type)
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

      //texture area
      setTimeout(() => {
        model.scene.add(vrm.scene)
      }, 1)
    console.log("trait is", currentTraitName)
    return {
      [currentTraitName]: {
        traitInfo: item,
        model: r_vrm.scene,
        vrm: r_vrm,
      },
    }
  }

  const [play] = useSound(sectionClick, { volume: 1.0 })

  useEffect(() => {
    console.log("")

    console.log("templateInfo.traits is", templateInfo.traits)
    console.log("traitTypes is", traitTypes)
    let buffer = { ...(avatar ?? {}) }

    ;(async () => {
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

  function ClearTraitButton() {
    // clear the current trait
    return (
      <div
        className={
          !currentTraitName
            ? styles["selectorButtonActive"]
            : styles["selectorButton"]
        }
        onClick={() => {
          selectTrait(null)
          !isMute && play()
        }}
      >
        <img
          className={styles["icon"]}
          src={cancel}
          style={{ width: "3em", height: "3em" }}
        />
      </div>
    )
  }

  return (
    !!currentTraitName && (
      <div className={styles["SelectorContainerPos"]}>
        <div className={styles["selector-container"]}>
          <ClearTraitButton />
          {templateInfo.traits
            .find((trait) => trait.name === currentTraitName)
            .collection.map((item, index) => {
              if (item.thumbnailOverrides) {
                return item.thumbnailOverrides.map((icn, icnindex) => {
                  const active = selectValue === item.id
                  return (
                    <div
                      key={index + "_" + icnindex}
                      className={`${styles["selectorButton"]} ${
                        styles["selector-button"]
                      } ${styles[`coll-${currentTraitName}`]} ${
                        active ? styles["active"] : ""
                      }`}
                      onClick={() => {
                        !isMute && play()
                        console.log("select trait", item)
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
                          avatar[currentTraitName] &&
                          avatar[currentTraitName].id === item.id
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
              } else {
                console.log("avatar", avatar)
                console.log("currentTraitName", currentTraitName)
                console.log(
                  "avatar[currentTraitName]",
                  avatar[currentTraitName],
                )
                const traitActive =
                  avatar[currentTraitName] &&
                  avatar[currentTraitName].traitInfo.id === item.id
                return (
                  <div
                    key={index}
                    className={
                      `${(traitActive
                        ? styles["selectorButtonActive"]
                        : styles["selectorButton"])} ${selectValue === item.id ? "active" : ""}`
                    }
                    onClick={() => {
                      !isMute && play()
                      console.log("select trait", item)
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
                        traitActive
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
              }
            })}
        </div>
      </div>
    )
  )
}
