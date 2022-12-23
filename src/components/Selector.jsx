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
    currentOptions,
    model,
    traitsNecks,
    setTraitsNecks,
    traitsSpines,
    setTraitsSpines
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

  const selectTrait = (option) => {
    const trait = option?.item;
    console.log(option)
    console.log("TRAIT IS: " , trait)

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
    const currentTrait = traits.find((t) => t.name === currentTraitName);
    // find the key that matches the current trait.textureCollection

    //const localDir = option.item.directory;
    //const model = templateInfo.traitsDirectory + localDir
    //console.log("model location is: ", model)
    // if avatar has a trait, dispose it
    if (avatar[currentTraitName] && avatar[currentTraitName].vrm) {
      disposeVRM(avatar[currentTraitName].vrm)
    }

    // check if option has set texture trait
    if(option.textureTrait) {
      const textureLocations = getAsArray(option.textureTrait.directory)

      const textures = []
      const textureLoadManager = new THREE.LoadingManager()
      const textureLoader = new THREE.TextureLoader(textureLoadManager)

      textureLoadManager.onLoad = function ( ) {
        itemLoader(trait, textures).then((newTrait) => {
          setAvatar({...avatar, ...newTrait});
        })
      }
      textureLoadManager.onError = function ( url ) {
        console.log( 'There was an error loading ' + url );
      }
      
      console.log(textureLocations.length)
      
      for (let i =0; i < textureLocations.length;i++)
      {
        textureLoader.load(templateInfo.traitsDirectory + textureLocations[i],(txt)=>{
          txt.flipY = false;
          textures[i] = (txt)
        })
      }
      return;
    }

    // if there is no texture trait, load it normally, but also check for colorTrait
    itemLoader(trait,null, option.colorTrait?.value).then((newTrait) => {
      setAvatar({...avatar, ...newTrait});
    })

  }

  const itemLoader = async (item, textures, color) => {
    let r_vrm
    const itemDirectory = templateInfo.traitsDirectory + item.directory;
    console.log(itemDirectory)
    const vrm = await loadModel(itemDirectory)
    if(Object.keys(vrm).length !== 0) {
      vrm.scene.traverse(o => {

      });
    }
    // 1 
    console.log("TEXTURES ARE: ", textures)
    addModelData(vrm, {
      cullingLayer: item.cullingLayer || -1,
      cullingDistance: item.cullingDistance || null,
    })
    r_vrm = vrm

      if (model.data.animationManager){
        model.data.animationManager.startAnimation(vrm)
      }
      console.log("VRM IS: ", vrm)
      // if user defined target meshes, assign the textures depending on their selection
      if (item.textureTargets){
        const targets = getAsArray(item.textureTargets) 
        for (let i =0 ; i < targets.length ; i++){
          const obj = vrm.scene.getObjectByName ( targets[i] )
          console.log(targets[i])
          if (obj == null) console.warn("Mesh with name " + targets[i] + ", was not found")
          if (obj && textures){
            if (obj.isMesh && textures[i] != null){
              console.log(obj)
              obj.material[0].map = textures[i]
              obj.material[0].shadeMultiplyTexture = textures[i]
            }
          }
          if (obj && color){
            if (obj.isMesh && color[i] != null){
              const newColor = new THREE.Color( color[i] )
              obj.material[0].uniforms.litFactor.value = newColor; // to do: right now it only takes the first color of array, this is an array in case user target more than one mesh
              obj.material[0].uniforms.shadeColorFactor.value = new THREE.Color( newColor.r*0.8, newColor.g*0.8, newColor.b*0.8 )
            }
          }
        }
      }
      // if not assign to every single mesh
      else{
        vrm.scene.traverse((child) => {
          if (child.isMesh) {
            if (textures){
              child.material[0].map = textures[0]
              child.material[0].shadeMultiplyTexture = textures[0]
            }
            if (color){
              const newColor = new THREE.Color( color[0] )
              child.material[0].uniforms.litFactor.value = newColor; // to do: right now it only takes the first color of array, this is an array in case user target more than one mesh
              child.material[0].uniforms.shadeColorFactor.value = new THREE.Color( newColor.r*0.8, newColor.g*0.8, newColor.b*0.8 )
            }
          }
        })
      }
      // add neck and spine bone to context
      vrm.scene.traverse((child) => {
        if (child.isBone && child.name == 'neck') { 
          setTraitsNecks(current => [...current , child])
        }
        if (child.isBone && child.name == 'spine') { 
          setTraitsSpines(current => [...current , child])
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

      setTimeout(() => {
        model.scene.add(vrm.scene)
      }, 60)
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
          style={{ width: "4em", height: "4em" }}
        />
      </div>
    )
  }

  return (
    !!currentTraitName && (
      <div className={styles["SelectorContainerPos"]}>
        <div className={styles["selector-container"]}>
          <ClearTraitButton />
          {currentOptions.map((option) =>{
            const active = selectValue === option.item.id
            return(<div
              key={option.key}
              className={`${styles["selectorButton"]} ${
                styles["selector-button"]
              } ${active ? styles["active"] : ""}`}
              onClick={() => {
                !isMute && play()
                console.log("select trait", option.item)
                console.log(option.iconHSL)
                selectTrait(option)
              }}
            >
              <img
                className={styles["trait-icon"]}
                style={option.iconHSL ? {filter: "brightness("+((option.iconHSL.l)+0.5)+") hue-rotate("+(option.iconHSL.h * 360)+"deg) saturate("+(option.iconHSL.s * 100)+"%)"} : {}}
                // style={option.iconHSL ? 
                //   `filter: brightness(${option.iconHSL.l}) 
                //   saturate(${option.iconHSL.s * 100}%) 
                //   hue(${option.iconHSL.s * 360}deg);`:""}
                src={`${templateInfo.thumbnailsDirectory}${option.icon}`}
              />
              <img
                src={tick}
                className={
                  avatar[currentTraitName] &&
                  avatar[currentTraitName].id === option.item.id  // todo (pending fix): this only considers the item id and not the subtraits id
                    ? styles["tickStyle"]
                    : styles["tickStyleInActive"]
                }
              />
              {selectValue === option.item.id && loadedPercent > 0 && (
                <div className={styles["loading-trait"]}>
                  {loadedPercent}%
                </div>
              )}
            </div>)
          })}
        </div>
      </div>
    )
  )
}
