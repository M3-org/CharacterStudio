import React, { Fragment, useContext, useEffect, useState } from "react"

import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader"
import { AppMode, ViewContext } from "./context/ViewContext"

import { AnimationManager } from "./library/animationManager"
import { BlinkManager } from "./library/blinkManager"
import { getAsArray } from "./library/utils"
import Background from "./components/Background"

import Landing from "./pages/Landing"
import Mint from "./pages/Mint"
import View from "./pages/View"
import Bio from "./pages/Bio"
import Save from "./pages/Save"
import Appearance from "./pages/Appearance"
import Create from "./pages/Create"
import Load from "./pages/Load"
import { SceneContext } from "./context/SceneContext"

// dynamically import the manifest
const assetImportPath = import.meta.env.VITE_ASSET_PATH + "/manifest.json"

async function fetchManifest () {
  const manifest = localStorage.getItem("manifest")
  if (manifest) {
    return JSON.parse(manifest)
  }
  const response = await fetch(assetImportPath)
  const data = await response.json()
  localStorage.setItem("manifest", JSON.stringify(data))
  return data
}

async function fetchScene () {
      // load environment
      const modelPath = "/3d/Platform.glb";

      const loader = new GLTFLoader();
      // load the modelPath
      const gltf = await loader.loadAsync(modelPath);
      return gltf.scene
}

async function fetchAnimation(templateInfo){
    // create an animation manager for all the traits that will be loaded
    const newAnimationManager = new AnimationManager(templateInfo.offset)
    await newAnimationManager.loadAnimations(templateInfo.animationPath)
    return newAnimationManager
}

async function fetchAll() {
  const manifest = await fetchManifest()
  const sceneModel = await fetchScene()

  // check if templateIndex is set in localStorage
  // if not, set it to a random index
  let templateIndex = localStorage.getItem("templateIndex")

  if (!templateIndex) {
    templateIndex = Math.floor(Math.random() * manifest.length)
    localStorage.setItem("templateIndex", templateIndex)
  } else {
    templateIndex = parseInt(templateIndex)
  }
  const tempInfo = manifest[templateIndex]

  const animManager = await fetchAnimation(tempInfo)

  // check if initialTraits is set in localStorage
  // if not, set it to a random index
  let initialTraits = localStorage.getItem("initialTraits")
  if (!initialTraits) {
    initialTraits = initialTraits = [...new Set([...getAsArray(tempInfo.requiredTraits), ...getAsArray(tempInfo.randomTraits)])]
    localStorage.setItem("initialTraits", JSON.stringify(initialTraits))
  } else {
    initialTraits = JSON.parse(initialTraits)
  }

  const blinkManager = new BlinkManager(0.1,0.1,0.5,5);

  return {
    manifest,
    sceneModel,
    tempInfo,
    animManager,
    initialTraits,
    blinkManager
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
    }
  )

  return {
    read() {
      if (status === "error") {
        throw result
      } else if (status === "success") {
        return result
      }
      throw suspender
    }
  }
}

const resource = fetchData()

export default function App() {
  const { manifest, sceneModel, setManifest, setSceneModel, tempInfo, initialTraits, animManager, blinkManager } = resource.read()
  
  const { currentAppMode, mouseIsOverUI } = useContext(ViewContext)
  const { setTemplateInfo, setAnimationManager, setInitialTraits, setBlinkManager } = useContext(SceneContext)

  const [hideUi, setHideUi] = useState(false)

  const [isLoaded, setIsLoaded] = useState(false)
  let loaded = false // prevent init doublebang from 'use strict'
  useEffect (() => {
    if (!loaded && !isLoaded) {
      loaded = true
      setAnimationManager(animManager)
      setInitialTraits(initialTraits)
      setTemplateInfo(tempInfo)
      setBlinkManager(blinkManager)
      setManifest(manifest)
      setSceneModel(sceneModel)
      setIsLoaded(true)
    }
  }, [])

let lastTap = 0
useEffect(() => {
  const handleTap = () => {
    const now = new Date().getTime()
    const timesince = now - lastTap
    if (timesince < 300 && !mouseIsOverUI) {
      setHideUi(!hideUi)
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

  // map current app mode to a page
  const pages = {
    [AppMode.LANDING]: <Landing />,
    [AppMode.APPEARANCE]: <Appearance />,
    [AppMode.BIO]: <Bio />,
    [AppMode.CREATE]: <Create />,
    [AppMode.LOAD]: <Load />,
    [AppMode.MINT]: <Mint />,
    [AppMode.SAVE]: <Save />,
    [AppMode.VIEW]: <View />,
  }
  return (
    <Fragment>
        <Background />
          {pages[currentAppMode]}
      </Fragment>
  )
}