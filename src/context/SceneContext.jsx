import React, { createContext, useEffect, useState } from "react"
import { disposeVRM } from "../library/utils"
import * as THREE from "three"
import {
  getRandomizedTemplateOptions,
  getOptionsFromAvatarData
} from "../library/option-utils"

import gsap from "gsap"
import { local } from "../library/store"
import { CharacterManager } from "../library/characterManager"
import { sceneInitializer } from "../library/sceneInitializer"

export const SceneContext = createContext()

export const SceneProvider = (props) => {

  const [vrmHelperRoot, setVrmHelperRoot] = useState(null);
  const [characterManager, setCharacterManager] = useState(null)
  const [animationManager, setAnimationManager] = useState(null)
  const [lookAtManager, setLookAtManager] = useState(null)
  const [scene, setScene] = useState(null)
  //const [characterManifest, setCharacterManifest] = useState(initializeCharacterManifest)
  

  const [currentTraitName, setCurrentTraitName] = useState(null)
  const [currentOptions, setCurrentOptions] = useState([])

  const [currentVRM, setCurrentVRM] = React.useState(null)

  const [model, setModel] = useState(new THREE.Object3D())

  const [camera, setCamera] = useState(null)

  const [selectedOptions, setSelectedOptions] = useState([])
  const [removeOption, setRemoveOption] = useState(false)
  const [awaitDisplay, setAwaitDisplay] = useState(false)

  const [colorStatus, setColorStatus] = useState("")
  const [skinColor, setSkinColor] = useState(new THREE.Color(1, 1, 1))
  const [avatar, _setAvatar] = useState(null)

  const [blinkManager, setBlinkManager] = useState(null)

  const [controls, setControls] = useState(null)

  const [lipSync, setLipSync] = useState(null)

  const [mousePosition, setMousePosition] = useState({x: 0, y: 0})

  const [templateInfo, setTemplateInfo] = useState() 
  const [manifest, setManifest] = useState(null)
  const [manifestSelectionIndex, setManifestSelectionIndex] = useState(null)
  const [sceneModel, setSceneModel] = useState(null)

  const [isChangingWholeAvatar, setIsChangingWholeAvatar] = useState(false)

  const [debugMode, setDebugMode] = useState(false);

  let loaded = false
  let [isLoaded, setIsLoaded] = useState(false)
  useEffect(()=>{
    // hacky prevention of double render
    if (loaded || isLoaded) return
    setIsLoaded(true)
    loaded = true;

    const {
      scene,
      camera,
      controls,
      characterManager
    } = sceneInitializer("editor-scene");

    setCamera(camera);
    setScene(scene);
    setCharacterManager(characterManager);
    setAnimationManager(characterManager.animationManager)
    setLookAtManager(characterManager.lookAtManager)
    setControls(controls);
  },[])

  const setAvatar = (state) => {
    _setAvatar(state)
  }

  const toggleDebugMNode = (isDebug) => {
    if (isDebug == null)
      isDebug = !debugMode;

    setDebugMode(isDebug);
    scene.traverse((child) => {
      if (child.isMesh) {
        if (child.setDebugMode){
          child.setDebugMode(isDebug);
        }
      }
    });
  }
  const loadAvatar = (avatarData) =>{
    const data = getOptionsFromAvatarData(avatarData,manifest)
    if (data != null){
      resetAvatar();
      setSelectedOptions(data);
    }
  }
  const loadAvatarFromLocalStorage = (loadName) =>{
    const avatarData = local[`${templateInfo.id}12223_${loadName}`]
    console.log(avatarData)
    if (avatarData){
      loadAvatar(avatarData);
    }
    else{
      console.log("no local storage for " + loadName + " was found")
    }
  }
  const getSelectedCharacterBaseData = () => {
    return manifest[manifestSelectionIndex];
  }
  const saveAvatarToLocalStorage = (saveName) =>{
    const saveAvatar = getSaveAvatar()
    local[`${templateInfo.id}12223_${saveName}`] = saveAvatar
  }
  const getSaveAvatar = () => {
    // saves the current avatar, it also saves the class
    const avatarJson = {}
    templateInfo.traits.forEach(trait => {
      const prop = trait.trait;
      avatarJson[prop] = {
        traitInfo: avatar[prop]?.traitInfo,
        textureInfo: avatar[prop]?.textureInfo,
        colorInfo: avatar[prop]?.colorInfo,
      }
    });
    avatarJson.class = templateInfo.id;
    return avatarJson;
  }

  const saveUserSelection = (options) =>{
    const newSelection = loadUserSelection (manifestSelectionIndex) || []
    options.map((opt)=>{
      let newOpt = true;
      for (let i =0; i < newSelection.length;i++ ) {
        if(newSelection[i].trait.trait === opt.trait.trait){
          newSelection[i] = opt
          newOpt = false;
          break
        }
      }
      if (newOpt === true)
        newSelection.push(opt)
    })
    local[manifestSelectionIndex] = newSelection;
  }

  const loadUserSelection = (index) => {
    return local[index]
  }

  const getRandomCharacter = () => {
    setSelectedOptions(getRandomizedTemplateOptions(templateInfo))
  }

  const resetAvatar = () => {
    if (avatar){
      for (const prop in avatar){
        if (avatar[prop].vrm){
          disposeVRM (avatar[prop].vrm)
        }
      }
    }
    setAvatar({})
  }

  const moveCamera = (value) => {
    if (!controls) return
    gsap.to(controls.target, {
      x: value.targetX ?? 0,
      y: value.targetY ?? 0,
      z: value.targetZ ?? 0,
      duration: 1,
    })

    gsap
      .fromTo(
        controls,
        {
          maxDistance: controls.getDistance(),
          minDistance: controls.getDistance(),
          minPolarAngle: controls.getPolarAngle(),
          maxPolarAngle: controls.getPolarAngle(),
          minAzimuthAngle: controls.getAzimuthalAngle(),
          maxAzimuthAngle: controls.getAzimuthalAngle(),
        },
        {
          maxDistance: value.distance,
          minDistance: value.distance,
          minPolarAngle: Math.PI / 2 - 0.11,
          maxPolarAngle: Math.PI / 2 - 0.11,
          minAzimuthAngle: -0.78,
          maxAzimuthAngle: -0.78,
          duration: 1,
        },
      )
      .then(() => {
        controls.minPolarAngle = 0
        controls.maxPolarAngle = 3.1415
        controls.minDistance = 0.5
        controls.maxDistance = 5
        controls.minAzimuthAngle = Infinity
        controls.maxAzimuthAngle = Infinity
      })
  }

  return (
    <SceneContext.Provider
      value={{
        vrmHelperRoot,
        currentVRM,
        setCurrentVRM,
        
        awaitDisplay, 
        setAwaitDisplay,
        templateInfo,
        setTemplateInfo,
        blinkManager,
        setBlinkManager,
        manifest,
        setManifest,
        manifestSelectionIndex,
        setManifestSelectionIndex,
        getSelectedCharacterBaseData,
        sceneModel,
        setSceneModel,
        lipSync,
        setLipSync,
        scene,
        setScene,
        characterManager,
        currentTraitName,
        setCurrentTraitName,
        currentOptions,

        getSaveAvatar,
        saveAvatarToLocalStorage,
        loadAvatarFromLocalStorage,

        debugMode,
        toggleDebugMNode,

        setCurrentOptions,
        setSelectedOptions,
        getRandomCharacter,
        saveUserSelection,
        loadUserSelection,
        selectedOptions,
        setRemoveOption,
        removeOption,
        model,
        setModel,
        animationManager,
        lookAtManager,
        setAnimationManager,
        camera,
        setCamera,
        colorStatus,
        setColorStatus,
        skinColor,
        setSkinColor,
        avatar,
        setAvatar,
        resetAvatar,
        moveCamera,
        controls,
        setControls,
        //initializeScene,
        mousePosition, 
        setMousePosition,
        isChangingWholeAvatar,
        setIsChangingWholeAvatar,
      }}
    >
      {props.children}
    </SceneContext.Provider>
  )
}
