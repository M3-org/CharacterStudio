import React, { Fragment, useContext, useEffect, useState } from "react"
import * as THREE from "three"

import { SceneContext } from "./context/SceneContext"
import { LanguageContext } from "./context/LanguageContext"
import { ViewMode, ViewContext } from "./context/ViewContext"
import { LookAtManager } from "./library/lookatManager"
import { EffectManager } from "./library/effectManager"
//import { AnimationManager } from "./library/animationManager"
import MessageWindow from "./components/MessageWindow"

import Background from "./components/Background"

import View from "./pages/View"
import Save from "./pages/Save"
import Load from "./pages/Load"
import Mint from "./pages/Mint"
import BioPage from "./pages/Bio"
import Create from "./pages/Create"
import Claim from "./pages/Claim"
import Landing from "./pages/Landing"
import Appearance from "./pages/Appearance"
import BatchDownload from "./pages/BatchDownload"
import Optimizer from "./pages/Optimizer"
import LanguageSwitch from "./components/LanguageSwitch"
import BatchManifest from "./pages/BatchManifest"

// dynamically import the manifest
const assetImportPath = import.meta.env.VITE_ASSET_PATH + "/manifest.json"
const peresonalityImportPath = import.meta.env.VITE_ASSET_PATH + "/personality.json"

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

async function fetchAll() {
  const initialManifest = await fetchManifest(assetImportPath)
  const personality = await fetchPersonality()

  const effectManager = new EffectManager()

  return {
    initialManifest,
    personality,
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
    effectManager,
  } = resource.read()

  const [hideUi, setHideUi] = useState(false)
  const {
    camera,
    controls,
    scene,
    moveCamera,
    setManifest,
    lookAtManager,
    showEnvironmentModels
  } = useContext(SceneContext)
  const { viewMode } = useContext(ViewContext)

  effectManager.camera = camera
  effectManager.scene = scene

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
        [ViewMode.APPEARANCE, ViewMode.SAVE, ViewMode.OPTIMIZER, ViewMode.BATCHDOWNLOAD, ViewMode.BATCHMANIFEST].includes(viewMode)
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

  // map current app mode to a page
  const pages = {
    [ViewMode.LANDING]: <Landing />,
    [ViewMode.APPEARANCE]: (
      <Appearance
        confirmDialog={confirmDialog}
      />
    ),
    [ViewMode.OPTIMIZER]:<Optimizer/>,
    [ViewMode.BIO]: (
      <BioPage personality={personality} />
    ),
    [ViewMode.CREATE]: <Create />,
    [ViewMode.CLAIM]: <Claim />,
    [ViewMode.BATCHMANIFEST]: <BatchManifest />,
    [ViewMode.BATCHDOWNLOAD]: <BatchDownload />,
    [ViewMode.LOAD]: <Load />,
    [ViewMode.MINT]: <Mint />,
    [ViewMode.SAVE]: <Save />,
    [ViewMode.CHAT]: <View />,
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
      lookAtManager.enabled = false
    } else {
      lookAtManager.enabled = true
    }

    if ([ViewMode.LANDING, ViewMode.CREATE, ViewMode.CLAIM, ViewMode.LOAD, ViewMode.CLAIM, ViewMode.CLAIM].includes(viewMode))
      showEnvironmentModels(false)
    else
      showEnvironmentModels(true)
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
      
      {pages[viewMode]}
      
    </Fragment>
  )
}
