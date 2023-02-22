import React, { Fragment, useContext, useEffect, useState } from "react"
import * as THREE from "three"

import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader"

import { SceneContext } from "./context/SceneContext"
import { LanguageContext } from "./context/LanguageContext"
import { ViewMode, ViewContext } from "./context/ViewContext"

import { getAsArray } from "./library/utils"
import { BlinkManager } from "./library/blinkManager"
import { LookAtManager } from "./library/lookatManager"
import { EffectManager } from "./library/effectManager"
import { AnimationManager } from "./library/animationManager"

import Scene from "./components/Scene"
import Background from "./components/Background"

import View from "./pages/View"
import Save from "./pages/Save"
import Load from "./pages/Load"
import BioPage from "./pages/Bio"
import Create from "./pages/Create"
import Landing from "./pages/Landing"
import Appearance from "./pages/Appearance"
import LanguageSwitch from "./components/LanguageSwitch"

// dynamically import the manifest
const assetImportPath = import.meta.env.VITE_ASSET_PATH + "/manifest.json"
const peresonalityImportPath =
  import.meta.env.VITE_ASSET_PATH + "/personality.json"

let cameraDistance
const centerCameraTarget = new THREE.Vector3()
const centerCameraPosition = new THREE.Vector3()
let centerCameraPositionLength
let ndcBias

const cameraDistanceChat = 1.4
const centerCameraTargetChat = new THREE.Vector3(0, 1.25, 0)
const centerCameraPositionChat = new THREE.Vector3(
  -0.9786403788721187,
  1.4036900759197288,
  0.9892635490125085,
) // note: get from `moveCamera({ targetY: 1.25, distance: 1.4 })`
const centerCameraPositionLengthChat = centerCameraPositionChat.length()
const ndcBiasChat = 0.35

const cameraDistanceOther = 3.2
const centerCameraTargetOther = new THREE.Vector3(0, 0.8, 0)
const centerCameraPositionOther = new THREE.Vector3(
  -2.2367993753934425,
  1.1512971720174363,
  2.2612065299409223,
) // note: get from `moveCamera({ targetY: 0.8, distance: 3.2 })`
const centerCameraPositionLengthOther = centerCameraPositionOther.length()
const ndcBiasOther = 0.5

const localVector3 = new THREE.Vector3()
const localVector4 = new THREE.Vector4()
const localVector4_2 = new THREE.Vector4()
const xAxis = new THREE.Vector3(1, 0, 0)
const yAxis = new THREE.Vector3(0, 1, 0)

async function fetchManifest() {
  const manifest = localStorage.getItem("manifest")
  if (manifest) {
    return JSON.parse(manifest)
  }
  const response = await fetch(assetImportPath)
  const data = await response.json()
  localStorage.setItem("manifest", JSON.stringify(data))
  return data
}

async function fetchPersonality() {
  const personality = localStorage.getItem("personality")
  if (personality) {
    return JSON.parse(personality)
  }
  const response = await fetch(peresonalityImportPath)
  const data = await response.json()
  localStorage.setItem("personality", JSON.stringify(data))
  return data
}

async function fetchScene() {
  // load environment
  const modelPath = "/3d/Platform.glb"

  const loader = new GLTFLoader()
  // load the modelPath
  const gltf = await loader.loadAsync(modelPath)
  return gltf.scene
}

async function fetchAnimation(templateInfo) {
  // create an animation manager for all the traits that will be loaded
  const newAnimationManager = new AnimationManager(templateInfo.offset)
  await newAnimationManager.loadAnimations(templateInfo.animationPath)
  return newAnimationManager
}

async function fetchAll() {
  const initialManifest = await fetchManifest()
  const personality = await fetchPersonality()
  const sceneModel = await fetchScene()

  const blinkManager = new BlinkManager(0.1, 0.1, 0.5, 5)
  const lookatManager = new LookAtManager(80, "editor-scene")
  const effectManager = new EffectManager()

  return {
    initialManifest,
    personality,
    sceneModel,
    blinkManager,
    lookatManager,
    effectManager,
  }
}

const fetchData = () => {
  let status, result

  const manifestPromise = fetchAll()
  // const modelPromise = fetchModel()
  const suspender = manifestPromise.then(
    (r) => {
      status = "success"
      result = r
    },
    (e) => {
      status = "error"
      result = e
    },
  )

  return {
    read() {
      if (status === "error") {
        throw result
      } else if (status === "success") {
        return result
      }
      throw suspender
    },
  }
}

const resource = fetchData()

export default function App() {
  const {
    initialManifest,
    personality,
    sceneModel,
    blinkManager,
    lookatManager,
    effectManager,
  } = resource.read()

  const [hideUi, setHideUi] = useState(false)
  const [animationManager, setAnimationManager] = useState({})

  const {
    camera,
    controls,
    scene,
    resetAvatar,
    setAwaitDisplay,
    setTemplateInfo,
    templateInfo,
    moveCamera,
    setManifest,
    manifest,
  } = useContext(SceneContext)
  const { viewMode } = useContext(ViewContext)

  effectManager.camera = camera
  effectManager.scene = scene

  const updateCameraPosition = () => {
    if (!effectManager.camera) return

    if ([ViewMode.BIO, ViewMode.MINT, ViewMode.CHAT].includes(viewMode)) {
      // auto move camera
      if (viewMode === ViewMode.CHAT) {
        cameraDistance = cameraDistanceChat
        centerCameraTarget.copy(centerCameraTargetChat)
        centerCameraPosition.copy(centerCameraPositionChat)
        centerCameraPositionLength = centerCameraPositionLengthChat
        ndcBias = ndcBiasChat
      } else {
        cameraDistance = cameraDistanceOther
        centerCameraTarget.copy(centerCameraTargetOther)
        centerCameraPosition.copy(centerCameraPositionOther)
        centerCameraPositionLength = centerCameraPositionLengthOther
        ndcBias = ndcBiasOther
      }

      localVector4
        .set(0, 0, centerCameraPositionLength, 1)
        .applyMatrix4(effectManager.camera.projectionMatrix)
      localVector4.x /= localVector4.w
      localVector4.y /= localVector4.w
      localVector4.z /= localVector4.w
      const moveX = localVector4_2
        .set(
          ndcBias * localVector4.w,
          localVector4.y * localVector4.w,
          localVector4.z * localVector4.w,
          localVector4.w,
        )
        .applyMatrix4(effectManager.camera.projectionMatrixInverse).x

      const angle = localVector3
        .set(centerCameraPosition.x, 0, centerCameraPosition.z)
        .angleTo(xAxis)
      localVector3.set(moveX, 0, 0).applyAxisAngle(yAxis, angle)
      localVector3.add(centerCameraTarget)

      moveCamera({
        // left half center
        targetX: localVector3.x,
        targetY: localVector3.y,
        targetZ: localVector3.z,
        distance: cameraDistance,
      })
    } else {
      moveCamera({
        // center
        targetX: 0,
        targetY: centerCameraTargetOther.y,
        targetZ: 0,
        distance: cameraDistanceOther,
      })
    }

    if (controls) {
      if (
        [ViewMode.APPEARANCE, ViewMode.SAVE, ViewMode.MINT].includes(viewMode)
      ) {
        controls.enabled = true
      } else {
        controls.enabled = false
      }
    }
  }

  const fetchNewModel = (index) => {
    //setManifest(manifest)
    setAwaitDisplay(true)
    resetAvatar()
    return new Promise((resolve) => {
      asyncResolve()
      async function asyncResolve() {
        const animManager = await fetchAnimation(manifest[index])
        setAnimationManager(animManager)
        setTemplateInfo(manifest[index])
        resolve(manifest[index])
      }
    })
  }

  // map current app mode to a page
  const pages = {
    [ViewMode.LANDING]: <Landing />,
    [ViewMode.APPEARANCE]: (
      <Appearance
        animationManager={animationManager}
        blinkManager={blinkManager}
        lookatManager={lookatManager}
        effectManager={effectManager}
        fetchNewModel={fetchNewModel}
      />
    ),
    [ViewMode.BIO]: (
      <BioPage templateInfo={templateInfo} personality={personality} />
    ),
    [ViewMode.CREATE]: <Create fetchNewModel={fetchNewModel} />,
    [ViewMode.LOAD]: <Load />,
    // [ViewMode.MINT]: <Mint />,
    [ViewMode.SAVE]: <Save />,
    [ViewMode.CHAT]: <View templateInfo={templateInfo} />,
  }

  let lastTap = 0
  useEffect(() => {
    const handleTap = (e) => {
      const now = new Date().getTime()
      const timesince = now - lastTap
      if (timesince < 300 && timesince > 10) {
        const tgt = e.target
        if (tgt.id == "editor-scene") setHideUi(!hideUi)
      }
      lastTap = now
    }
    window.addEventListener("touchend", handleTap)
    window.addEventListener("click", handleTap)
    return () => {
      window.removeEventListener("touchend", handleTap)
      window.removeEventListener("click", handleTap)
    }
  }, [hideUi])

  useEffect(() => {
    updateCameraPosition()
    if ([ViewMode.BIO, ViewMode.MINT, ViewMode.CHAT].includes(viewMode)) {
      lookatManager.enabled = false
    } else {
      lookatManager.enabled = true
    }
    window.addEventListener("resize", updateCameraPosition)
    return () => {
      window.removeEventListener("resize", updateCameraPosition)
    }
  }, [viewMode])

  useEffect(() => {
    setManifest(initialManifest)
  }, [initialManifest])

  // Translate hook
  const {t} = useContext(LanguageContext);

  return (
    <Fragment>
      <div className="generalTitle">Character Studio</div>
      <LanguageSwitch />
      <Background />
      <Scene
        manifest={manifest}
        sceneModel={sceneModel}
        lookatManager={lookatManager}
      />
      {pages[viewMode]}
    </Fragment>
  )
}
