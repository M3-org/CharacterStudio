import React, { useContext, useEffect, useState } from "react"
import * as THREE from "three"
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader"
import { VRMLoaderPlugin } from "@pixiv/three-vrm"
import useSound from "use-sound"
import cancel from "../../public/ui/selector/cancel.png"
import { addModelData, disposeVRM } from "../library/utils"

import sectionClick from "../../public/sound/section_click.wav"
import tick from "../../public/ui/selector/tick.svg"
import { AudioContext } from "../context/AudioContext"
import { SceneContext } from "../context/SceneContext"
import {
  renameVRMBones,
  createFaceNormals,
  createBoneDirection,
} from "../library/utils"

import styles from "./Selector.module.css"

export default function Selector() {
  const {
    loadModel,
    avatar,
    setAvatar,
    currentTemplate,
    currentTraitName,
    template,
    currentOptions,
    selectedOptions,
    model,
    animationManager,
    setTraitsNecks,
    setTraitsSpines
  } = useContext(SceneContext)
  const currentTemplateIndex = parseInt(currentTemplate.index)
  const templateInfo = template[currentTemplateIndex]
  const { isMute } = useContext(AudioContext)

  const [selectValue, setSelectValue] = useState("0")

  const getAsArray = (target) => {
    if (target == null) return []
    return Array.isArray(target) ? target : [target]
  }

  const getRestrictions = () => {
    
    const traitRestrictions = templateInfo.traitRestrictions
    const typeRestrictions = {};

    for (const prop in traitRestrictions){

      // create the counter restrcitions traits
      getAsArray(traitRestrictions[prop].restrictedTraits).map((traitName)=>{

        // check if the trait restrictions exists for the other trait, if not add it
        if (traitRestrictions[traitName] == null) traitRestrictions[traitName] = {}
        // make sure to have an array setup, if there is none, create a new empty one
        if (traitRestrictions[traitName].restrictedTraits == null) traitRestrictions[traitName].restrictedTraits = []

        // finally merge existing and new restrictions
        traitRestrictions[traitName].restrictedTraits = [...new Set([
          ...traitRestrictions[traitName].restrictedTraits ,
          ...[prop]])]  // make sure to add prop as restriction
      })

      // do the same for the types
      getAsArray(traitRestrictions[prop].restrictedTypes).map((typeName)=>{
        console.log("TYPE NAME IS: ", typeName)
        //notice were adding the new data to typeRestrictions and not trait
        if (typeRestrictions[typeName] == null) typeRestrictions[typeName] = {}
        //create the restricted trait in this type
        if (typeRestrictions[typeName].restrictedTraits == null) typeRestrictions[typeName].restrictedTraits = []

        typeRestrictions[typeName].restrictedTraits = [...new Set([
          ...typeRestrictions[typeName].restrictedTraits ,
          ...[prop]])]  // make sure to add prop as restriction
      })
    }

    // now merge defined type to type restrictions
    for (const prop in templateInfo.typeRestrictions){
      // check if it already exsits
      if (typeRestrictions[prop] == null) typeRestrictions[prop] = {}
      if (typeRestrictions[prop].restrictedTypes == null) typeRestrictions[prop].restrictedTypes = []
      typeRestrictions[prop].restrictedTypes = [...new Set([
        ...typeRestrictions[prop].restrictedTypes ,
        ...getAsArray(templateInfo.typeRestrictions[prop])])]  

      // now that we have setup the type restrictions, lets counter create for the other traits
      getAsArray(templateInfo.typeRestrictions[prop]).map((typeName)=>{
        // prop = boots
        // typeName = pants
        console.log(prop)
        if (typeRestrictions[typeName] == null) typeRestrictions[typeName] = {}
        if (typeRestrictions[typeName].restrictedTypes == null) typeRestrictions[typeName].restrictedTypes =[]
        typeRestrictions[typeName].restrictedTypes = [...new Set([
          ...typeRestrictions[typeName].restrictedTypes ,
          ...[prop]])]  // make sure to add prop as restriction
      })
    }

    return {
      traitRestrictions,
      typeRestrictions
    }
  }
  const restrictions = getRestrictions()

  // options are selected by random or start
  useEffect(() => {
    console.log("SELECTED OPTIONS: ", selectedOptions)

    
    loadOptions(selectedOptions).then((loadedData)=>{
      let newAvatar = {};
      loadedData.map((data)=>{
        newAvatar = {...newAvatar, ...itemAssign(data)}
      })
      setAvatar({...avatar, ...newAvatar})
    })

  },[selectedOptions])

  // user selects an option
  const selectTraitOption = (option) => {
    if (option == null){
      option = {
        item:null,
        trait:templateInfo.traits.find((t) => t.name === currentTraitName)
      }
    }

    console.log(restrictions)

    loadOptions([option]).then((loadedData)=>{
      let newAvatar = {};
      
      loadedData.map((data)=>{
        newAvatar = {...newAvatar, ...itemAssign(data)}
      })
      setAvatar({...avatar, ...newAvatar})
    })

    return;
  }

  // load options first
  const loadOptions = (options) => {

    // validate if there is at least a non null option
    let nullOptions = true;
    options.map((option)=>{
      if(option.item != null)
        nullOptions = false;
    })
    if (nullOptions === true){
      console.log("has null options")
      return new Promise((resolve) => {
        resolve(options)
      });
    }

    //create the manager for all the options
    const loadingManager = new THREE.LoadingManager()

    //create a gltf loader for the 3d models
    const gltfLoader = new GLTFLoader(loadingManager)
    gltfLoader.register((parser) => {
      return new VRMLoaderPlugin(parser)
    })

    // and a texture loaders for all the textures
    const textureLoader = new THREE.TextureLoader(loadingManager)

    

    // return a promise, resolve = once everything is loaded
    return new Promise((resolve) => {

      // resultData will hold all the results in the array that was given this function
      const resultData = [];
      loadingManager.onLoad = function (){
        resolve(resultData);
      };
      loadingManager.onError = function (url){
        console.warn("error loading " + url)
      }

      const baseDir = templateInfo.traitsDirectory// (maybe set in loading manager)
      
      // load necesary assets for the options
      options.map((option, index)=>{
        console.log("option is: ", option)

        if (option == null){
          console.log("ïs null")
          resultData[index] = null;
          return;
        }
        // load model trait
        const loadedModels = []; 
        getAsArray(option?.item.directory).map((modelDir, i)=>{
          gltfLoader.loadAsync (baseDir + modelDir).then((mod)=>{
            loadedModels[i] = mod;
          })
        })
        
        // load texture trait
        const loadedTextures = []; 
        getAsArray(option?.textureTrait?.directory).map((textureDir, i)=>{
          textureLoader.load(baseDir + textureDir,(txt)=>{
            txt.flipY = false;
            loadedTextures[i] = (txt)
          })
        })

        // and just create colors
        const loadedColors = [];
        getAsArray(option?.colorTrait?.value).map((colorValue, i)=>{
          loadedColors[i] = new THREE.Color(colorValue);
        })
        resultData[index] = {
          item:option?.item,
          trait:option?.trait,
          models:loadedModels,          
          textures:loadedTextures, 
          colors:loadedColors      
        }
      })
    });
  }

  // once loaded, assign
  const itemAssign = (itemData) => {

    const item = itemData.item;
    const traitData = itemData.trait;
    const models = itemData.models;
    const textures = itemData.textures;
    const colors = itemData.colors;

    // null section (when user selects to remove an option)
    if ( item == null) {
      if ( avatar[traitData.name] && avatar[traitData.name].vrm ){
        disposeVRM(avatar[traitData.name].vrm)
        // setAvatar({
        //   ...avatar,
        //   [traitData.name]: {},
        // })
        setSelectValue(item && item.id)
      }
      return {
        [traitData.name]: {}
      }
    }

    // save an array of mesh targets
    const meshTargets = [];
    

    // add culling data to each model TODO,  if user defines target culling meshes set them before here
    // models are vrm in some cases!, beware
    let vrm = null
    models.map((m)=>{
      console.log(m)
      // basic vrm setup (only if model is vrm)
      vrm = m.userData.vrm;
      renameVRMBones(vrm)

      // animation setup section
      // play animations on this vrm  TODO, letscreate a single animation manager per traitInfo, as model may change since it is now a trait option
      console.log("ANIMATION MANAGER IS:", animationManager)
      if (animationManager){
        animationManager.startAnimation(vrm)
      }

      // culling layers setup section
      addModelData(vrm, {
        cullingLayer: item.cullingLayer || -1,
        cullingDistance: item.cullingDistance || null,
      })
      

      // mesh target setup section
      if (item.meshTargets){
        getAsArray(item.meshTargets).map((target) => {
          const mesh = vrm.scene.getObjectByName ( target )
          if (mesh?.isMesh) meshTargets.push(mesh);
        })
      }
      
      vrm.scene.traverse((child) => {
        // mesh target setup secondary swection
        if (!item.meshTargets && child.isMesh) meshTargets.push(child);

        // basic setup
        child.frustumCulled = false
        if (child.isMesh) {
          createFaceNormals(child.geometry)
          if (child.isSkinnedMesh) createBoneDirection(child)
        }
        
        if (child.isBone && child.name == 'neck') { 
          setTraitsNecks(current => [...current , child])
        }
        if (child.isBone && child.name == 'spine') { 
          setTraitsSpines(current => [...current , child])
        }
      })

      
    })

    // once the setup is done, assign them
    meshTargets.map((mesh, index)=>{
      if (textures){
        const txt = textures[index] || textures[0]
        if (txt != null){
          mesh.material[0].map = txt
          mesh.material[0].shadeMultiplyTexture = txt
        }
      }
      if (colors){
        const col = colors[index] || colors[0]
        if (col != null){
          mesh.material[0].uniforms.litFactor.value = col
          mesh.material[0].uniforms.shadeColorFactor.value = new THREE.Color( col.r*0.8, col.g*0.8, col.b*0.8 )
        }
      }
    })
    
    
    // if there was a previous loaded model, remove it (maybe also remove loaded textures?)
    if (avatar[traitData.name] && avatar[traitData.name].vrm) {
      //if (avatar[traitData.name].vrm != vrm)  // make sure its not the same vrm as the current loaded
        disposeVRM(avatar[traitData.name].vrm)
    }

    // add the now model to the current scene
    model.add(vrm.scene)
    
    

    // and then add the new avatar data
    // to do, we are now able to load multiple vrm models per options, set the options to include vrm arrays
    return {
      [traitData.name]: {
        traitInfo: item,
        name: item.name,
        model: vrm.scene,
        vrm: vrm,
      }
    }
    //setAvatar({...avatar, ...newTrait})

    //console.log("AVATAR IS: ", avatar)

  }

  const itemLoader = async (item, textures, colors) => {
    let r_vrm
    const itemDirectory = templateInfo.traitsDirectory + item.directory;
    const vrm = await loadModel(itemDirectory)

    // 1 
    addModelData(vrm, {
      cullingLayer: item.cullingLayer || -1,
      cullingDistance: item.cullingDistance || null,
    })
    r_vrm = vrm

      if (animationManager){
        animationManager.startAnimation(vrm)
      }

      // mesh targets to apply textures or colors 
      const meshTargets = [];
      if (item.meshTargets){
        getAsArray(item.meshTargets).map((target) => {
          const mesh = vrm.scene.getObjectByName ( target )
          if (mesh?.isMesh) meshTargets.push(mesh);
        })
      }
      // when mesh targets are not defined by user, grab all mesh children of vrm scene
      vrm.scene.traverse((child) => {
        if (!item.meshTargets && child.isMesh)
          meshTargets.push(child);

        if (child.isBone && child.name == 'neck') { 
          setTraitsNecks(current => [...current , child])
        }
        if (child.isBone && child.name == 'spine') { 
          setTraitsSpines(current => [...current , child])
        }
      })

      meshTargets.map((mesh, index)=>{
        if (textures){
          if (textures[index] != null){
            mesh.material[0].map = textures[index]
            mesh.material[0].shadeMultiplyTexture = textures[index]
          }
        }
        if (colors){
          if (colors[index] != null){
            const newColor = new THREE.Color( colors[index] )
            mesh.material[0].uniforms.litFactor.value = newColor; // to do: right now it only takes the first color of array, this is an array in case user target more than one mesh
            mesh.material[0].uniforms.shadeColorFactor.value = new THREE.Color( newColor.r*0.8, newColor.g*0.8, newColor.b*0.8 )
          }
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
        name: item.name,
        model: vrm.scene,
        vrm: vrm,
      }


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
                    const propertyTypes = getAsArray(avatar[property].item?.type)
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
        model.add(vrm.scene)
      }, 60)
    return {
      [currentTraitName]: {
        traitInfo: item,
        name: item.name,
        model: r_vrm.scene,
        vrm: r_vrm,
      }
    }
  }

  const [play] = useSound(sectionClick, { volume: 1.0 })

  // useEffect(() => {
  //   let buffer = { ...(avatar ?? {}) }

  //   ;(async () => {
  //     let newAvatar = {}
  //     // for trait in traits
  //     for (const property in buffer) {
  //       if (buffer[property].vrm) {
  //         if (newAvatar[property] && newAvatar[property].vrm != buffer[property].vrm) {
  //           if (newAvatar[property].vrm != null) {
  //             disposeVRM(newAvatar[property].vrm)
  //           }
  //         }
  //         animationManager.startAnimation(buffer[property].vrm)
  //         // wait one frame before adding to scene so animation doesn't glitch
  //         setTimeout(() => {
  //           model.add(buffer[property].vrm.scene)
  //         }, 1)
  //       }
  //     }
  //     setAvatar({
  //       ...avatar,
  //       ...buffer,
  //     })
  //   })()
  // }, [])

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
          selectTraitOption(null)
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
                selectTraitOption(option)
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
              {/* {selectValue === option.item.id && loadedPercent > 0 && (
                <div className={styles["loading-trait"]}>
                  {loadedPercent}%
                </div>
              )} */}
            </div>)
          })}
        </div>
      </div>
    )
  )
}
