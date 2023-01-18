import React, { createContext, useEffect, useState } from "react"
import * as THREE from "three"
import { cullHiddenMeshes } from "../library/utils"

export const SceneContext = createContext()

export const SceneProvider = (props) => {
  const initializeScene = () => {
    const scene = new THREE.Scene()
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
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

  const [colorStatus, setColorStatus] = useState("")
  const [traitsNecks, setTraitsNecks] = useState([])
  const [traitsSpines, setTraitsSpines] = useState([])
  const [traitsLeftEye, setTraitsLeftEye] = useState([])
  const [traitsRightEye, setTraitsRightEye] = useState([])
  const [skinColor, setSkinColor] = useState(new THREE.Color(1, 1, 1))
  const [avatar, _setAvatar] = useState(null)

  const [controls, setControls] = useState(null)

  const [lipSync, setLipSync] = useState(null)

  const [mousePosition, setMousePosition] = useState({x: 0, y: 0})

  const setAvatar = (state) => {
    _setAvatar(state)
  }
  useEffect(() => {
    if (avatar) {
      if (Object.keys(avatar).length > 0) {
        cullHiddenMeshes(avatar)
      }
    }
  }, [avatar])

  return (
    <SceneContext.Provider
      value={{
        lipSync,
        setLipSync,
        scene,
        setScene,
        currentTraitName,
        setCurrentTraitName,
        currentOptions,
        setCurrentOptions,
        setSelectedOptions,
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
      }}
    >
      {props.children}
    </SceneContext.Provider>
  )
}
