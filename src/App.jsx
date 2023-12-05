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
import MessageWindow from "./components/MessageWindow"
import { local } from "./library/store"
import { ScreenshotManager } from "./library/screenshotManager"

import Scene from "./components/Scene"
import Background from "./components/Background"

import View from "./pages/View"
import Save from "./pages/Save"
import Load from "./pages/Load"
import Mint from "./pages/Mint"
import BioPage from "./pages/Bio"
import Create from "./pages/Create"
import Landing from "./pages/Landing"
import Appearance from "./pages/Appearance"
import Optimizer from "./pages/Optimizer"
import LanguageSwitch from "./components/LanguageSwitch"

import { CharacterManager } from "./library/characterManager"


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

const cameraDistanceOther = 6
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

async function fetchManifest(location) {
  const response = await fetch(location)
  const data = await response.json()
  return data
}

async function fetchPersonality() {
  const response = await fetch(peresonalityImportPath)
  const data = await response.json()
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
  const animationPaths = getAsArray(templateInfo.animationPath);
  newAnimationManager.storeAnimationPaths(animationPaths, templateInfo.assetsLocation || "");
  await newAnimationManager.loadAnimation(animationPaths, animationPaths[0].endsWith('.fbx'), templateInfo.assetsLocation || "")
  return newAnimationManager
}

async function fetchAll() {
  const initialManifest = await fetchManifest(assetImportPath)
  const personality = await fetchPersonality()
  const sceneModel = await fetchScene()

  // const characterManager = new CharacterManager({createAnimationManager : true});
  // characterManager.loadManifest(initialManifest[0].manifest,{createAnimationManager:true});

  const blinkManager = new BlinkManager(0.1, 0.1, 0.5, 5)
  const lookatManager = new LookAtManager(80, "editor-scene")
  const effectManager = new EffectManager()
  const screenshotManager = new ScreenshotManager()

  return {
    initialManifest,
    personality,
    sceneModel,
    blinkManager,
    lookatManager,
    effectManager,
    screenshotManager,
    //characterManager
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
    screenshotManager,
    //characterManager
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
    setManifestSelectionIndex,
    templateInfo,
    moveCamera,
    setManifest,
    manifest,
    model,
  } = useContext(SceneContext)
  const { viewMode } = useContext(ViewContext)

  effectManager.camera = camera
  effectManager.scene = scene

  screenshotManager.scene = scene

  const updateCameraPosition = () => {
    if (!effectManager.camera) return

    if ([ViewMode.BIO, ViewMode.CHAT].includes(viewMode)) {
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
        [ViewMode.APPEARANCE, ViewMode.SAVE, ViewMode.OPTIMIZER].includes(viewMode)
      ) {
        controls.enabled = true
      } else {
        controls.enabled = false
      }
    }
  }

  const [confirmDialogWindow, setConfirmDialogWindow] = useState(false)
  const [confirmDialogText, setConfirmDialogText] = useState("")
  const [confirmDialogCallback, setConfirmDialogCallback] = useState([])

  const confirmDialog = (msg, callback) => {
    setConfirmDialogText(msg)
    setConfirmDialogWindow(true)
    setConfirmDialogCallback([callback])
  }

  const fetchCharacterManifest = (index) => {
    setAwaitDisplay(true)
    resetAvatar()
    return new Promise((resolve) => {
      asyncResolve()
      async function asyncResolve() {
        const characterManifest = await fetchManifest(manifest[index].manifest);
        const animManager = await fetchAnimation(characterManifest)
        setAnimationManager(animManager)
        setTemplateInfo(characterManifest)
        setManifestSelectionIndex(index)
        resolve(characterManifest)
      }
    })
  }

  const getFaceScreenshot = (width = 256, height = 256, getBlob = false) => {
    blinkManager.enableScreenshot();
    model.traverse(o => {
      if (o.isSkinnedMesh) {
        const headBone = o.skeleton.bones.filter(bone => bone.name === 'head')[0];
        headBone.getWorldPosition(localVector3);
      }
    });
    const headPosition = localVector3;
    const female = templateInfo.name === "Drophunter";
    const cameraFov = female ? 0.78 : 0.85;
    screenshotManager.setCamera(headPosition, cameraFov);
    //let imageName = "AvatarImage_" + Date.now() + ".png";
    
    //const screenshot = screenshotManager.saveAsImage(imageName);
    const screenshot = getBlob ? 
      screenshotManager.getScreenshotBlob(width, height):
      screenshotManager.getScreenshotTexture(width, height);
    blinkManager.disableScreenshot();
    animationManager.disableScreenshot();

    return screenshot;
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
        confirmDialog={confirmDialog}
        //characterManager = {characterManager}
      />
    ),
    [ViewMode.OPTIMIZER]: (
      <Optimizer
        animationManager={animationManager}
      />
    ),
    [ViewMode.BIO]: (
      <BioPage personality={personality} />
    ),
    [ViewMode.CREATE]: <Create fetchCharacterManifest={fetchCharacterManifest}/>,
    [ViewMode.LOAD]: <Load />,
    [ViewMode.MINT]: <Mint getFaceScreenshot = {getFaceScreenshot}/>,
    [ViewMode.SAVE]: <Save getFaceScreenshot = {getFaceScreenshot}/>,
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
      <MessageWindow
        confirmDialogText = {confirmDialogText}
        confirmDialogCallback = {confirmDialogCallback}
        confirmDialogWindow = {confirmDialogWindow}
        setConfirmDialogWindow = {setConfirmDialogWindow}
      />
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
