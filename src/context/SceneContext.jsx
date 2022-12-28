import React, { createContext, useEffect, useState } from "react"
import * as THREE from "three"
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader"
import { VRMLoaderPlugin } from "@pixiv/three-vrm"
import { cullHiddenMeshes } from "../library/utils"
import {
  renameVRMBones,
  createFaceNormals,
  createBoneDirection,
} from "../library/utils"

export const SceneContext = createContext()

export const SceneProvider = (props) => {
  const loadingManager = new THREE.LoadingManager()

  const gltfLoader = new GLTFLoader(loadingManager)
  gltfLoader.register((parser) => {
    return new VRMLoaderPlugin(parser)
  })

  async function loadModel(file, onProgress) {
    return gltfLoader.loadAsync(file, onProgress).then((model) => {
      return addModel(model);
    })
  }

  // separated to call it after load manager finishes
  function addModel(model){
    const vrm = model.userData.vrm
    renameVRMBones(vrm)

    vrm.scene?.traverse((child) => {
      child.frustumCulled = false

      if (child.isMesh) {
        createFaceNormals(child.geometry)
        if (child.isSkinnedMesh) createBoneDirection(child)
      }
    })
    return vrm
  }

  const [template, setTemplate] = useState(null)
  const [scene, setScene] = useState(new THREE.Scene())
  const [currentTraitName, setCurrentTraitName] = useState(null)
  const [currentOptions, setCurrentOptions] = useState([])
  const [model, setModel] = useState(null)
  const [animationManager, setAnimationManager] = useState(null)
  const [camera, setCamera] = useState(null)

  const [selectedOptions, setSelectedOptions] = useState([])
  const [selectedRandomTraits, setSelectedRandomTraits] = React.useState([])

  const [colorStatus, setColorStatus] = useState("")
  const [traitsNecks, setTraitsNecks] = useState([])
  const [traitsSpines, setTraitsSpines] = useState([])
  const [skinColor, setSkinColor] = useState(new THREE.Color(1, 1, 1))
  const [avatar, _setAvatar] = useState(null);

  const [lipSync, setLipSync] = useState(null);
  
  const setAvatar = (state) => {
    //console.log(state)
    //cullHiddenMeshes(avatar, scene, template)
    _setAvatar(state)
    //console.log(avatar)
  }
  useEffect(()=>{
    if (avatar){
      console.log("WIP[PENDING")
      cullHiddenMeshes(avatar, scene, template)
    }
  },[avatar])

  const [currentTemplate, setCurrentTemplate] = useState(null)
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
        loadModel,
        setSelectedOptions,
        selectedOptions,
        setSelectedRandomTraits,
        selectedRandomTraits,
        addModel,
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
        currentTemplate,
        setCurrentTemplate,
        template,
        setTemplate,
        traitsNecks,
        setTraitsNecks,
        traitsSpines,
        setTraitsSpines
      }}
    >
      {props.children}
    </SceneContext.Provider>
  )
}
