import React, { createContext, useEffect, useState } from "react"
import { disposeVRM } from "../library/utils"
import * as THREE from "three"
import {
  getRandomizedTemplateOptions
} from "../library/option-utils"
import gsap from "gsap"

export const SceneContext = createContext()

export const SceneProvider = (props) => {
  const initializeScene = () => {
    const scene = new THREE.Scene()
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
    // rotate the directional light to be a key light
    directionalLight.position.set(0, 1, 1);
    scene.add(directionalLight);

    return scene;
  }

  const [scene, setScene] = useState(initializeScene)

  const [currentTraitName, setCurrentTraitName] = useState(null)
  const [currentOptions, setCurrentOptions] = useState([])
  const [model, setModel] = useState(new THREE.Object3D())
  const [animationManager, setAnimationManager] = useState(null)
  const [camera, setCamera] = useState(null)

  const [selectedOptions, setSelectedOptions] = useState([])
  const [removeOption, setRemoveOption] = useState(false)
  const [awaitDisplay, setAwaitDisplay] = useState(false)

  const [colorStatus, setColorStatus] = useState("")
  const [traitsNecks, setTraitsNecks] = useState([])
  const [traitsSpines, setTraitsSpines] = useState([])
  const [traitsLeftEye, setTraitsLeftEye] = useState([])
  const [traitsRightEye, setTraitsRightEye] = useState([])
  const [skinColor, setSkinColor] = useState(new THREE.Color(1, 1, 1))
  const [avatar, _setAvatar] = useState(null)

  const [blinkManager, setBlinkManager] = useState(null)

  const [initialTraits, setInitialTraits] = useState(null)

  const [controls, setControls] = useState(null)

  const [lipSync, setLipSync] = useState(null)

  const [mousePosition, setMousePosition] = useState({x: 0, y: 0})

  const [templateInfo, setTemplateInfo] = useState() 
  const [manifest, setManifest] = useState(null)
  const [sceneModel, setSceneModel] = useState(null)

  const [isChangingWholeAvatar, setIsChangingWholeAvatar] = useState(false)

  const setAvatar = (state) => {
    _setAvatar(state)
    console.log(state)
  }

  const loadAvatar = (avatarData) =>{
    console.log(avatarData)
  }
  const saveAvatarToLocalStorage = (saveName) =>{

  }
  const getSaveAvatar = () => {
    console.log(avatar)
    const avatarJson = {}
    for (const prop in avatar){
      
      avatarJson[prop] = {
        traitInfo: avatar[prop].traitInfo,
        textureInfo: avatar[prop].textureInfo,
        colorInfo: avatar[prop].colorInfo,
      }
    }
    console.log(avatarJson)
  }

  const saveUserSelection = (name, options) =>{
    const newSelection = loadUserSelection (name) || []
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
    localStorage.setItem(`class2_${name}`, JSON.stringify(newSelection))
  }

  const loadUserSelection = (name) => {
    const opts = localStorage.getItem(`class2_${name}`)
    if (opts)
      return JSON.parse(opts)
    return null
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
        awaitDisplay, 
        setAwaitDisplay,
        templateInfo,
        setTemplateInfo,
        blinkManager,
        setBlinkManager,
        initialTraits,
        setInitialTraits,
        manifest,
        setManifest,
        sceneModel,
        setSceneModel,
        lipSync,
        setLipSync,
        scene,
        setScene,
        currentTraitName,
        setCurrentTraitName,
        currentOptions,
        getSaveAvatar,
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
        traitsNecks,
        setTraitsNecks,
        traitsSpines,
        setTraitsSpines,
        controls,
        setControls,
        traitsLeftEye,
        setTraitsLeftEye,
        traitsRightEye,
        setTraitsRightEye,
        initializeScene,
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
