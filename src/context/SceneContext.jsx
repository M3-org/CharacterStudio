import { createContext, useState } from "react"
import * as THREE from "three"
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader"
import { VRMLoaderPlugin } from "@pixiv/three-vrm"
import {
  renameVRMBones,
  createFaceNormals,
  createBoneDirection,
} from "../library/utils"

export const SceneContext = createContext()

export const SceneProvider = (props) => {
  const loader = new GLTFLoader()
  loader.register((parser) => {
    return new VRMLoaderPlugin(parser)
  })

  async function loadModel(file, onProgress) {
    return loader.loadAsync(file, onProgress).then((model) => {
      const vrm = model.userData.vrm
      renameVRMBones(vrm)

      model.scene.traverse((node) => {
        if (node.isMesh) {
          node.material.map.encoding = THREE.sRGBEncoding
        }
      })

      vrm.scene?.traverse((child) => {
        child.frustumCulled = false

        if (child.isMesh) {
          createFaceNormals(child.geometry)
          if (child.isSkinnedMesh) createBoneDirection(child)
        }
      })
      return vrm
    })
  }

  const [scene, useScene] = useState(new THREE.Scene())
  const [selectorCategory, setSelectorCategory] = useState({
    selectorCategory: "head", // should default to categoryList[0]
  })
  const [model, setModel] = useState({})
  const [controls, setControls] = useState({})
  const [camera, setCamera] = useState({})

  const [colorStatus, setColorStatus] = useState("")
  const [randomFlag, setRandomFlag] = useState(-1) // TODO: wtf?
  const [skinColor, setSkinColor] = useState(new THREE.Color(1, 1, 1))
  const [avatar, _setAvatar] = useState({
    // should be loaded from JSON
    skin: {},
    body: {},
    chest: {},
    head: {},
    neck: {},
    hand: {},
    ring: {},
    waist: {},
    weapon: {},
    legs: {},
    feet: {},
    accessories: {},
    eyes: {},
    outer: {},
    solo: {},
  })

  const [categoryList, setSelectorCategoryList] = useState([
    // LOAD from JSON
    "chest",
    "head",
    "neck",
    "legs",
    "feet",
  ])

  const setAvatar = (state) => {
    cullHiddenMeshes(avatar, scene, templateInfo)
    _setAvatar(state)
  }

  const [currentTemplateId, setCurrentTemplateId] = useState(null)
  const [templateInfo, setTemplateInfo] = useState({
    file: null,
    format: null,
    bodyTargets: null,
  })
  return (
    <SceneContext.Provider
      value={{
        scene,
        useScene,
        selectorCategory,
        setSelectorCategory,
        loadModel,
        model,
        setModel,
        controls,
        setControls,
        camera,
        setCamera,
        colorStatus,
        setColorStatus,
        randomFlag,
        setRandomFlag,
        skinColor,
        setSkinColor,
        avatar,
        setAvatar,
        currentTemplateId,
        setCurrentTemplateId,
        templateInfo,
        setTemplateInfo,
        categoryList,
        setSelectorCategoryList,
      }}
    >
      {props.children}
    </SceneContext.Provider>
  )
}
