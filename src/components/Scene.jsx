import React, { useContext, useEffect, useState } from "react"
import * as THREE from "three"
import { SceneContext } from "../context/SceneContext"
import { CameraMode } from "../context/ViewContext"
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls"

export default function Scene({sceneModel}) {
  const {
    scene,
    model, setModel,
    currentCameraMode,
    traitsSpines,
    traitsNecks,
    traitsLeftEye,
    traitsRightEye,
    setControls,
  } = useContext(SceneContext)
  const maxLookPercent = {
    neck: 20,
    spine: 5,
    left: 20,
    right: 20,
  }

  const getMouseDegrees = (x, y, degreeLimit) => {
    let dx = 0,
      dy = 0,
      xdiff,
      xPercentage,
      ydiff,
      yPercentage

    let w = { x: window.innerWidth, y: window.innerHeight }

    if (x <= w.x / 2) {
      // 2. Get the difference between middle of screen and cursor position
      xdiff = w.x / 2 - x
      // 3. Find the percentage of that difference (percentage toward edge of screen)
      xPercentage = (xdiff / (w.x / 2)) * 100
      // 4. Convert that to a percentage of the maximum rotation we allow for the neck
      dx = ((degreeLimit * xPercentage) / 100) * -1
    }
    if (x >= w.x / 2) {
      xdiff = x - w.x / 2
      xPercentage = (xdiff / (w.x / 2)) * 100
      dx = (degreeLimit * xPercentage) / 100
    }
    if (y <= w.y / 2) {
      ydiff = w.y / 2 - y
      yPercentage = (ydiff / (w.y / 2)) * 100
      // Note that I cut degreeLimit in half when she looks up
      dy = ((degreeLimit * 0.5 * yPercentage) / 100) * -1
    }
    if (y >= w.y / 2) {
      ydiff = y - w.y / 2
      yPercentage = (ydiff / (w.y / 2)) * 100
      dy = (degreeLimit * yPercentage) / 100
    }
    return { x: dx, y: dy }
  }

  const handleMouseMove = (event) => {
    const moveJoint = (mouse, joint, degreeLimit) => {
      if (Object.keys(joint).length !== 0) {
        let degrees = getMouseDegrees(mouse.x, mouse.y, degreeLimit)
        joint.rotation.y = THREE.MathUtils.degToRad(degrees.x)
        joint.rotation.x = THREE.MathUtils.degToRad(degrees.y)
      }
    }

    if (
      traitsNecks.length !== 0 &&
      traitsSpines.length !== 0 &&
      traitsLeftEye.length !== 0 &&
      traitsLeftEye !== 0
    ) {
      traitsNecks.map((neck) => {
        moveJoint(event, neck, maxLookPercent.neck)
      })
      traitsSpines.map((spine) => {
        moveJoint(event, spine, maxLookPercent.spine)
      })
      traitsLeftEye.map((leftEye) => {
        moveJoint(event, leftEye, maxLookPercent.left)
      })
      traitsRightEye.map((rightEye) => {
        moveJoint(event, rightEye, maxLookPercent.right)
      })
    }
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
    })

    // set the renderer size
    renderer.setSize(window.innerWidth, window.innerHeight)

    // set the renderer pixel ratio
    renderer.setPixelRatio(window.devicePixelRatio)

    // set the renderer output encoding
    renderer.outputEncoding = THREE.sRGBEncoding

    const controls = new OrbitControls(camera, renderer.domElement)
    controls.minDistance = 1
    controls.maxDistance = 4
    controls.minPolarAngle = 0
    controls.maxPolarAngle = Math.PI / 2 - 0.1
    controls.enablePan = true
    controls.target = new THREE.Vector3(0, 1.1, 0)
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
  }, [])

  return <></>
}
