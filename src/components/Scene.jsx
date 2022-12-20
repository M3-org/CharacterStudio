import { MeshReflectorMaterial } from "@react-three/drei/core/MeshReflectorMaterial"
import { OrbitControls } from "@react-three/drei/core/OrbitControls"
import { PerspectiveCamera } from "@react-three/drei/core/PerspectiveCamera"
import { Canvas } from "@react-three/fiber"
import React, { useRef, useState, useContext, useEffect } from "react"
import { NoToneMapping } from "three"
import Editor from "./Editor"
import Selector from "./Selector"
import { addModelData, getSkinColor } from "../library/utils"
import * as THREE from "three"
import { SceneContext } from "../context/SceneContext"

import { AnimationManager } from "../library/animationManager"
import { ViewContext, ViewStates } from "../context/ViewContext"

import styles from "./Scene.module.css"

export default function Scene() {
  const {
    scene,
    setScene,
    setCamera,
    loadModel,
    currentTemplate,
    model,
    template,
    setModel,
    camera
  } = useContext(SceneContext)
  const {currentView, setCurrentView} = useContext(ViewContext)
  const neckMovement = 30;
  const spineMovement = 5;
  const leftEyeMovement = 80;
  const rightEyeMovement = 80;

  const [loading, setLoading] = useState(false)
  const controls = useRef()
  const templateInfo = template && currentTemplate && template[currentTemplate.index]
  const [neck, setNeck] = useState({});
  const [spine, setSpine] = useState({});
  const [left, setLeft] = useState({});
  const [right, setRight] = useState({});

  // if currentView is CREATOR_LOADING, show loading screen
  // load the assets
  // once templateInfo, currentTemplate, and models are loaded, move to CREATOR view

  const  getMouseDegrees = (x, y, degreeLimit) =>  {
      let dx = 0,
          dy = 0,
          xdiff,
          xPercentage,
          ydiff,
          yPercentage;
    
      let w = { x: window.innerWidth, y: window.innerHeight };
    
   
      if (x <= w.x / 2) {
        // 2. Get the difference between middle of screen and cursor position
        xdiff = w.x / 2 - x;  
        // 3. Find the percentage of that difference (percentage toward edge of screen)
        xPercentage = (xdiff / (w.x / 2)) * 100;
        // 4. Convert that to a percentage of the maximum rotation we allow for the neck
        dx = ((degreeLimit * xPercentage) / 100) * -1; }
      if (x >= w.x / 2) {
        xdiff = x - w.x / 2;
        xPercentage = (xdiff / (w.x / 2)) * 100;
        dx = (degreeLimit * xPercentage) / 100;
      }
      if (y <= w.y / 2) {
        ydiff = w.y / 2 - y;
        yPercentage = (ydiff / (w.y / 2)) * 100;
        // Note that I cut degreeLimit in half when she looks up
        dy = (((degreeLimit * 0.5) * yPercentage) / 100) * -1;
        }
      if (y >= w.y / 2) {
        ydiff = y - w.y / 2;
        yPercentage = (ydiff / (w.y / 2)) * 100;
        dy = (degreeLimit * yPercentage) / 100;
      }
      return { x: dx, y: dy };
  }

  const handleMouseMove = (event) => {
    if (neck && spine) {
      moveJoint(event, neck, neckMovement);
      moveJoint(event, spine, spineMovement);
      moveJoint(event, left, leftEyeMovement);
      moveJoint(event, right, rightEyeMovement);
    }
  };
  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [handleMouseMove]);

  const moveJoint = (mouse, joint, degreeLimit) => {
    if(Object.keys(joint).length !== 0 ){
      let degrees = getMouseDegrees(mouse.x, mouse.y, degreeLimit);
        joint.rotation.y = THREE.MathUtils.degToRad(degrees.x);
        joint.rotation.x = THREE.MathUtils.degToRad(degrees.y);
    }
  }

  useEffect(() => {
    if(!templateInfo) {
      if(!loading) setLoading(true)
      return
    }

    loadModel(templateInfo.file).then(async (vrm) => { 
      const animationManager = new AnimationManager(templateInfo.offset)
      addModelData(vrm, { animationManager: animationManager })

      if (templateInfo.animationPath) {
        await animationManager.loadAnimations(templateInfo.animationPath)
        animationManager.startAnimation(vrm)
      }
      addModelData(vrm, { cullingLayer: 0 })

      vrm.scene.traverse(o => {
          if (o.isMesh) {
            o.castShadow = true;
            o.receiveShadow = true;
          }
          // Reference the neck and spine bones
          if (o.isBone && o.name === 'neck') { 
            setNeck(o);
          }
          if (o.isBone && o.name === 'spine') { 
             setSpine(o);
          }
          if (o.isBone && o.name === 'leftEye') { 
            setLeft(o);
         }
         if (o.isBone && o.name === 'rightEye') { 
          setRight(o);
        }
        });

      getSkinColor(vrm.scene, templateInfo.bodyTargets)
      setModel(vrm)
      setTimeout(() => {
      scene.add(vrm.scene)
      }, 1)
      setCurrentView(ViewStates.CREATOR)
    })
    
    return () => {
      if(model !== null) {
        scene.remove(model.scene)
      }
      setModel(null)
      setScene(new THREE.Scene())
    }

  }, [templateInfo])

  return templateInfo && (
      <div className={styles["FitParentContainer"]}>
          <Canvas
            id="editor-scene"
            className={styles["canvasStyle"]}
            gl={{ antialias: true, toneMapping: NoToneMapping }}
            camera={{ fov: 30, position: [0, 1.3, 2] }}
          >
            <ambientLight color={[1, 1, 1]} intensity={0.5} />

            <directionalLight
              intensity={0.5}
              position={[3, 1, 5]}
              shadow-mapSize={[1024, 1024]}
            >
              <orthographicCamera
                attach="shadow-camera"
                left={-20}
                right={20}
                top={20}
                bottom={-20}
              />
            </directionalLight>

            <OrbitControls
              ref={controls}
              minDistance={1}
              maxDistance={4}
              maxPolarAngle={Math.PI / 2 - 0.1}
              enablePan={true}
              autoRotateSpeed={5}
              enableDamping={true}
              dampingFactor={0.1}
              target={[0, 1.1, 0]}
            />

            <PerspectiveCamera
              ref={setCamera}
              aspect={1200 / 600}
              fov={30}
              onUpdate={(self) => self.updateProjectionMatrix()}
            >

            <mesh>
              <primitive object={scene} />
            </mesh>

              <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 0]}>
                <circleGeometry args={[0.6, 64]} />
                <MeshReflectorMaterial
                  blur={[100, 100]}
                  opacity={1}
                  resolution={1024}
                  mixBlur={0}
                  mixStrength={10}
                  depthScale={0.5}
                  minDepthThreshold={1}
                  color="#ffffff"
                  metalness={0.9}
                  roughness={1}
                />
              </mesh>
            </PerspectiveCamera>
          </Canvas>
          {currentTemplate && templateInfo && <Selector templateInfo={templateInfo} />}
        <Editor templateInfo={templateInfo} controls={controls.current} />
      </div>
  )
}