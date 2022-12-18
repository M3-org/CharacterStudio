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

  const [scene, setScene] = useState(new THREE.Scene())
  const [currentTrait, setCurrentTrait] = useState(null)
  const [model, setModel] = useState(null)
  const [camera, setCamera] = useState(null)

  const [colorStatus, setColorStatus] = useState("")
  const [skinColor, setSkinColor] = useState(new THREE.Color(1, 1, 1))
  const [avatar, _setAvatar] = useState(null);
  // {
  //   // should be loaded from JSON
  //   skin: {},
  //   body: {},
  //   chest: {},
  //   head: {},
  //   neck: {},
  //   hand: {},
  //   ring: {},
  //   waist: {},
  //   weapon: {},
  //   legs: {},
  //   feet: {},
  //   accessories: {},
  //   eyes: {},
  //   outer: {},
  //   solo: {},
  // })

  const setAvatar = (state) => {
    cullHiddenMeshes(avatar, scene, templateInfo)
    _setAvatar(state)
  }

  const [currentTemplate, setCurrentTemplate] = useState(null)
  return (
    <SceneContext.Provider
      value={{
        scene,
        setScene,
        currentTrait,
        setCurrentTrait,
        loadModel,
        model,
        setModel,
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
      }}
    >
      {props.children}
    </SceneContext.Provider>
  )
}
