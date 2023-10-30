import React, { useContext, useEffect, useState } from "react"
import * as THREE from "three"
import { SceneContext } from "../context/SceneContext"
import { CameraMode } from "../context/ViewContext"
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls"
import { SAH, MeshBVH } from 'three-mesh-bvh';

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

  const raycaster = new THREE.Raycaster();
  const mouse = new THREE.Vector2();

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

    const minPan = new THREE.Vector3(-0.5,0,-0.5);
    const maxPan = new THREE.Vector3(0.5,1.5,0.5);

    // start animation frame loop to render
    const animate = () => {
      requestAnimationFrame(animate)
      if (currentCameraMode !== CameraMode.AR) {
        controls.target.clamp(minPan,maxPan)
        controls?.update()
        lookatManager.update();
        renderer.render(scene, camera)
      }
    }

    // start the animation loop
    animate()
    const avatarModel = new THREE.Object3D()
    // // create animation manager
    async function fetchAssets() {
      if (model != null && scene != null) {
        scene.remove(model)
      }
      // model holds only the elements that will be exported
      
      setModel(avatarModel)

      scene.add(avatarModel)
    }
    
    fetchAssets()

    const setOriginalInidicesAndColliders = () => {
      avatarModel.traverse((child)=>{
        if (child.isMesh) {
          if (child.userData.lastBoundsTree){
            child.userData.lastBoundsTree = child.geometry.boundsTree;
            child.geometry.disposeBoundsTree();
          }
          if (child.userData.origIndexBuffer){
            child.userData.clippedIndexGeometry = child.geometry.index.clone();
            child.geometry.setIndex(child.userData.origIndexBuffer);
          }
        }
      })
    }

    const restoreCullIndicesAndColliders = () => {
      avatarModel.traverse((child)=>{
        if (child.isMesh) {
          if (child.userData.origIndexBuffer){
            child.geometry.setIndex(child.userData.clippedIndexGeometry);
            child.geometry.boundsTree = child.userData.lastBoundsTree;
            child.userData.clippedIndexGeometry.dispose();
          }
        }
      })
    }

    const checkIndicesIndex = (array, indices) =>{
      for (let i =0; i < array.length; i+=3){
        if (indices[0] != array[i]){
          continue
        }
        if (indices[1] != array[i+1]){
          continue
        }
        if (indices[2] != array[i+2]){
          continue
        }
        return i;
      }
      return -1;
    }

    const updateCullIndices = (intersection, removeFace) => {
      const intersectedObject = intersection.object;
      const face = intersection.face;
      const newIndices = [face.a,face.b,face.c];
      const clipIndices = intersectedObject.userData?.clippedIndexGeometry?.array

      

      if (clipIndices != null){
        const hitIndex = checkIndicesIndex(clipIndices,newIndices)
        const uint32ArrayAsArray = Array.from(clipIndices);
        if (hitIndex == -1 && !removeFace){
          const mergedIndices = [...uint32ArrayAsArray, ...newIndices];
          intersectedObject.userData.clippedIndexGeometry =  new THREE.BufferAttribute(new Uint32Array(mergedIndices),1,false);
        }
        if (hitIndex != 1 && removeFace){
          uint32ArrayAsArray.splice(hitIndex, 3);
          intersectedObject.userData.clippedIndexGeometry = new THREE.BufferAttribute(new Uint32Array(uint32ArrayAsArray), 1, false);
        }
      }
    }

    const handleMouseClick = (event) => {

      const isCtrlPressed = event.ctrlKey;

      setOriginalInidicesAndColliders();

      // Calculate mouse position in normalized device coordinates
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      // Update the raycaster
      raycaster.setFromCamera(mouse, camera);

      // Perform the raycasting
      const intersects = raycaster.intersectObjects(avatarModel.children);

      if (intersects.length > 0) {
        const intersection = intersects[0];
    
        updateCullIndices(intersection, isCtrlPressed)
      }

      restoreCullIndicesAndColliders();
     
    };

    canvasRef.addEventListener("click", handleMouseClick)
    return () => {
      removeEventListener("mousemove", handleMouseMove)
      removeEventListener("resize", handleMouseMove)
      window.removeEventListener('click', handleMouseClick);
      // scene.remove(sceneModel)
      scene.remove(model)
    }
  }, [])

  return <></>
}