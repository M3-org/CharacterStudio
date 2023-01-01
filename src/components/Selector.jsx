import React, { useContext, useEffect, useState } from "react"
import * as THREE from "three"
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader"
import { VRMLoaderPlugin } from "@pixiv/three-vrm"
import useSound from "use-sound"
import cancel from "../../public/ui/selector/cancel.png"
import { addModelData, disposeVRM } from "../library/utils"
import { computeBoundsTree, disposeBoundsTree, acceleratedRaycast, SAH } from 'three-mesh-bvh';

import sectionClick from "../../public/sound/section_click.wav"
import tick from "../../public/ui/selector/tick.svg"
import { AudioContext } from "../context/AudioContext"
import { SceneContext } from "../context/SceneContext"
import {
  renameVRMBones,
  createFaceNormals,
  createBoneDirection,
} from "../library/utils"
import { LipSync } from '../library/lipsync'

import styles from "./Selector.module.css"

THREE.BufferGeometry.prototype.computeBoundsTree = computeBoundsTree;
THREE.BufferGeometry.prototype.disposeBoundsTree = disposeBoundsTree;
THREE.Mesh.prototype.raycast = acceleratedRaycast;

export default function Selector({templateInfo}) {
  const {
    avatar,
    setAvatar,
    currentTraitName,
    currentOptions,
    selectedOptions,
    setSelectedOptions,
    model,
    animationManager,
    setTraitsNecks,
    setTraitsSpines,
    setTraitsLeftEye,
    setTraitsRightEye,
    getAsArray,
    setLipSync
  } = useContext(SceneContext)
  const { isMute } = useContext(AudioContext)

  const [selectValue, setSelectValue] = useState("0")
  const [loadPercentage, setLoadPercentage] = useState(1)

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
    if (selectedOptions.length > 0){
      loadOptions(selectedOptions).then((loadedData)=>{
        let newAvatar = {};
        loadedData.map((data)=>{
          newAvatar = {...newAvatar, ...itemAssign(data)}
        })
        setAvatar({...avatar, ...newAvatar})
      })
      setSelectedOptions([]);
    }

  },[selectedOptions])
  // user selects an option
  const selectTraitOption = (option) => {
    if (option == null){
      option = {
        item:null,
        trait:templateInfo.traits.find((t) => t.name === currentTraitName)
      }
    }

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
    // filter options by restrictions
    options = filterRestrictedOptions(options);

    // validate if there is at least a non null option
    let nullOptions = true;
    options.map((option)=>{
      if(option.item != null)
        nullOptions = false;
    })
    if (nullOptions === true){
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
    loadingManager.onProgress = function(url, loaded, total){
      setLoadPercentage(Math.round(loaded/total * 100 ))
    }
    // return a promise, resolve = once everything is loaded
    return new Promise((resolve) => {

      // resultData will hold all the results in the array that was given this function
      const resultData = [];
      loadingManager.onLoad = function (){
        setLoadPercentage(0)
        resolve(resultData);
      };
      loadingManager.onError = function (url){
        console.warn("error loading " + url)
      }
      loadingManager.onProgress = function(url, loaded, total){
        setLoadPercentage(Math.round(loaded/total * 100 ))
      }

      const baseDir = templateInfo.traitsDirectory// (maybe set in loading manager)
      
      // load necesary assets for the options
      options.map((option, index)=>{
        setSelectValue(option.key)
        if (option == null){
          resultData[index] = null;
          return;
        }
        // load model trait
        const loadedModels = [];
        getAsArray(option?.item?.directory).map((modelDir, i) => {
          gltfLoader.loadAsync (baseDir + modelDir).then((mod) => {
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

  const filterRestrictedOptions = (options) =>{
    let removeTraits = [];
    for (let i =0; i < options.length;i++){
      const option = options[i];
      
     //if this option is not already in the remove traits list then:
     if (!removeTraits.includes(option.trait.name)){
        const typeRestrictions = restrictions?.typeRestrictions;
        // type restrictions = what `type` cannot go wit this trait or this type
        if (typeRestrictions){
          getAsArray(option.item?.type).map((t)=>{
            //combine to array
            removeTraits = [...new Set([
              ...removeTraits , // get previous remove traits
              ...findTraitsWithTypes(getAsArray(typeRestrictions[t]?.restrictedTypes)),  //get by restricted traits by types coincidence
              ...getAsArray(typeRestrictions[t]?.restrictedTraits)])]  // get by restricted trait setup

          })
        }

        // trait restrictions = what `trait` cannot go wit this trait or this type
        const traitRestrictions = restrictions?.traitRestrictions;
        if (traitRestrictions){
          removeTraits = [...new Set([
            ...removeTraits,
            ...findTraitsWithTypes(getAsArray(traitRestrictions[option.trait.name]?.restrictedTypes)),
            ...getAsArray(traitRestrictions[option.trait.name]?.restrictedTraits),

          ])]
        }
      }
    }

    // now update uptions
    removeTraits.forEach(trait => {
      let removed = false;
      
      for (let i =0; i < options.length;i++){
        // find an option with the trait name 
        if (options[i].trait?.name === trait){
          options[i] = {
            item:null,
            trait:templateInfo.traits.find((t) => t.name === trait)
          }
          removed = true;
          break;
        }
      }
      // if no option setup was found, add a null option to remove in case user had it added before
      if (!removed){
        options.push({
          item:null,
          trait:templateInfo.traits.find((t) => t.name === trait)
        })
      }
    });
   
    return options;
  }

  const findTraitsWithTypes = (types) => {
    const typeTraits = [];
    for (const prop in avatar){
      for (let i = 0; i < types.length; i++){
        const t = types[i]
       
        if (avatar[prop].traitInfo?.type?.includes(t)){
          typeTraits.push(prop);
          break;
        }
      }
    }
    return typeTraits;
  }

  // once loaded, assign
  const itemAssign = (itemData) => {

    const item = itemData.item;
    const traitData = itemData.trait;
    const models = itemData.models;
    const textures = itemData.textures;
    const colors = itemData.colors;
    // null section (when user selects to remove an option)
    if ( item == null && avatar) {
      if ( avatar[traitData.name] && avatar[traitData.name].vrm ){
        disposeVRM(avatar[traitData.name].vrm)
        setSelectValue("")
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
      // basic vrm setup (only if model is vrm)
      vrm = m.userData.vrm;
      setLipSync(new LipSync(vrm));
      renameVRMBones(vrm)
      // animation setup section
      // play animations on this vrm  TODO, letscreate a single animation manager per traitInfo, as model may change since it is now a trait option
      if (animationManager){
        animationManager.startAnimation(vrm)
      }

      // culling layers setup section

      addModelData(vrm, {
        cullingLayer: 
          item.cullingLayer != null ? item.cullingLayer: 
          traitData.cullingLayer != null ? traitData.cullingLayer: 
          templateInfo.defaultCullingLayer != null?templateInfo.defaultCullingLayer: -1,
        cullingDistance: 
          item.cullingDistance != null ? item.cullingDistance: 
          traitData.cullingDistance != null ? traitData.cullingDistance:
          templateInfo.defaultCullingDistance != null ? templateInfo.defaultCullingDistance: null,
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
          if (child.geometry.boundsTree == null)
            child.geometry.computeBoundsTree({strategy:SAH});

          createFaceNormals(child.geometry)
          if (child.isSkinnedMesh) createBoneDirection(child)
        }
        if (child.isBone && child.name == 'neck') { 
          setTraitsNecks(current => [...current , child])
        }
        if (child.isBone && child.name == 'spine') { 
          setTraitsSpines(current => [...current , child])
        }
        if (child.isBone && child.name === 'leftEye') { 
          setTraitsLeftEye(current => [...current , child])
        }
        if (child.isBone && child.name === 'rightEye') { 
          setTraitsRightEye(current => [...current , child])
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
    if (avatar){
      if (avatar[traitData.name] && avatar[traitData.name].vrm) {
        //if (avatar[traitData.name].vrm != vrm)  // make sure its not the same vrm as the current loaded
          disposeVRM(avatar[traitData.name].vrm)
      }
    }

    if(vrm) {
    // add the now model to the current scene
    model.add(vrm.scene)
    }
    

    // and then add the new avatar data
    // to do, we are now able to load multiple vrm models per options, set the options to include vrm arrays
    return {
      [traitData.name]: {
        traitInfo: item,
        name: item.name,
        model: vrm && vrm.scene,
        vrm: vrm,
      }
    }
    //setAvatar({...avatar, ...newTrait})

    //console.log("AVATAR IS: ", avatar)

  }

  const [play] = useSound(sectionClick, { volume: 1.0 })

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
            const active = option.key === selectValue
            return(
            <div
              key={option.key}
              className={`${styles["selectorButton"]} ${
                styles["selector-button"]
              } ${ active ? styles["active"] : ""}`}
              onClick={() => {
                !isMute && play()
                selectTraitOption(option)
                setLoadPercentage(1)
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
              {active && loadPercentage > 0 && loadPercentage < 100 && (
                <div className={styles["loading-trait"]}>
                  Loading...
                </div>
              )}
            </div>)
          })}
        </div>
      </div>
    )
  )
}
