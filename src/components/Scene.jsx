import React, { useContext, useEffect, useState } from "react"
import * as THREE from "three"
import { SceneContext } from "../context/SceneContext"
import { CameraMode } from "../context/ViewContext"
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls"

export default function Scene({sceneModel, lookatManager}) {
  const {
    scene,
    model, setModel,
    currentCameraMode,
    setControls,
    setMousePosition,
    setCamera,
  } = useContext(SceneContext)
  
  const handleMouseMove = (event) => {
    setMousePosition({x: event.x, y: event.y});
  }

  useEffect(() => {
    window.addEventListener("mousemove", handleMouseMove)
    return () => window.removeEventListener("mousemove", handleMouseMove)
  }, [handleMouseMove])

  let loaded = false
  let [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    // hacky prevention of double render
    if (loaded || isLoaded) return
    setIsLoaded(true)
    loaded = true

    scene.add(sceneModel);
    
    // add a camera to the scene
    const camera = new THREE.PerspectiveCamera(
      30,
      window.innerWidth / window.innerHeight,
      0.1,
      1000,
    )

    setCamera(camera)
    lookatManager.setCamera(camera)
    // set the camera position
    camera.position.set(0, 1.3, 2)

    // TODO make sure to kill the interval

    // find editor-scene canvas
    const canvasRef = document.getElementById("editor-scene")

    // create a new renderer
    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef,
      antialias: true,
      alpha: true,
      preserveDrawingBuffer: true,
    })

    const handleResize = () => {
      renderer.setSize(window.innerWidth, window.innerHeight)
      camera.aspect = window.innerWidth / window.innerHeight
      camera.updateProjectionMatrix()
    }

    // add an eventlistener to resize the canvas when window changes
    window.addEventListener("resize", handleResize)

    // set the renderer size
    renderer.setSize(window.innerWidth, window.innerHeight)

    // set the renderer pixel ratio
    renderer.setPixelRatio(window.devicePixelRatio)

    // set the renderer output encoding
    renderer.outputEncoding = THREE.sRGBEncoding

    const controls = new OrbitControls(camera, renderer.domElement)
    controls.minDistance = 1
    controls.maxDistance = 4
    controls.maxPolarAngle = Math.PI / 2
    controls.enablePan = true
    controls.target = new THREE.Vector3(0, 1, 0)
    controls.enableDamping = true
    controls.dampingFactor = 0.1

    setControls(controls)

    // start animation frame loop to render
    const animate = () => {
      requestAnimationFrame(animate)
      if (currentCameraMode !== CameraMode.AR) {
        controls?.update()
        renderer.render(scene, camera)
      }
    }

    // start the animation loop
    animate()

    // // create animation manager
    async function fetchAssets() {
      if (model != null && scene != null) {
        scene.remove(model)
      }
      // model holds only the elements that will be exported
      const avatarModel = new THREE.Object3D()
      setModel(avatarModel)

      scene.add(avatarModel)
    }
    fetchAssets()
    return () => {
      removeEventListener("mousemove", handleMouseMove)
      removeEventListener("resize", handleMouseMove)
      // scene.remove(sceneModel)
      scene.remove(model)
    }
  }, [])

  return <></>
}