/* eslint-disable react/no-unknown-property */
import { Environment } from "@react-three/drei/core/Environment"
import { OrbitControls } from "@react-three/drei/core/OrbitControls"
import { PerspectiveCamera } from "@react-three/drei/core/PerspectiveCamera"
import { Canvas } from "@react-three/fiber"
import {
  Bloom,
  EffectComposer
} from "@react-three/postprocessing"
import React, { useContext, useEffect, useRef, useState } from "react"
import * as THREE from "three"
import { NoToneMapping } from "three"
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader"
import { SceneContext } from "../context/SceneContext"
import { ViewContext, ViewStates } from "../context/ViewContext"
import { AnimationManager } from "../library/animationManager"
import { addModelData, getSkinColor } from "../library/utils"
import { BackButton } from "./BackButton"
import Editor from "./Editor"
import styles from "./Scene.module.css"
import Selector from "./Selector"
import { VRM, VRMExpressionPresetName, VRMHumanBoneName } from "@pixiv/three-vrm";
import ChatComponent from "./ChatComponent"

import AudioButton from "./AudioButton"
import { LipSync } from '../library/lipsync'
import MintPopup from "./MintPopup"

export default function Scene() {
  const {
    scene,
    setScene,
    setCamera,
    loadModel,
    currentTemplate,
    setSelectedRandomTraits,
    model,
    setAnimationManager,
    template,
    setModel,
    traitsSpines,
    traitsNecks,
    traitsLeftEye,
    traitsRightEye,
    setCurrentTemplate,
    setLipSync,
  } = useContext(SceneContext)
  const {currentView, setCurrentView} = useContext(ViewContext)
  const maxLookPercent = {
    neck : 30,
    spine : 5,
    left : 60,
    right : 60,
  }

  const [loading, setLoading] = useState(false)
  const controls = useRef()
  const templateInfo = template && currentTemplate && template[currentTemplate.index]
  const [platform, setPlatform] = useState(null);
  const [showChat, setShowChat] = useState(false);

  useEffect(() => {
    // if user presses ctrl h, show chat
    const handleKeyDown = (e) => {
      if (e.ctrlKey && e.key === 'h') {
        console.log("pressed h")
        e.preventDefault();
        setShowChat(!showChat);
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    }

  }, [])

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
    if(traitsNecks.length !== 0 && traitsSpines.length !== 0 && traitsLeftEye.length !==0 && traitsLeftEye !== 0){
      traitsNecks.map((neck) => {
        moveJoint(event, neck, maxLookPercent.neck);
      })
      traitsSpines.map((spine) => {
        moveJoint(event, spine, maxLookPercent.spine);
      })
      traitsLeftEye.map((leftEye) => {
        moveJoint(event, leftEye, maxLookPercent.left);
      })
      traitsRightEye.map((rightEye) => {
        moveJoint(event, rightEye, maxLookPercent.right);
      })
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

    // create animation manager
    async function fetchAssets() {
      if(model != null && scene != null) {
        scene.remove(model)
      }
      // model holds only the elements that will be exported
      const avatarModel = new THREE.Scene()
      setModel(avatarModel)
      // scene hold all the elements cinluding model
      const newScene = new THREE.Scene();
      setScene(newScene)

      newScene.add(avatarModel)  

      // create an animation manager for all the traits that will be loaded
      const newAnimationManager = new AnimationManager(templateInfo.offset)
      setAnimationManager(newAnimationManager);
      if (templateInfo.animationPath)
        await newAnimationManager.loadAnimations(templateInfo.animationPath)

      // load assets
      const initialTraits = [...new Set([...templateInfo.requiredTraits, ...templateInfo.randomTraits])]
      setSelectedRandomTraits(initialTraits);

      setCurrentView(ViewStates.CREATOR)
    }
    fetchAssets();
    
    

    // load environment

    const modelPath = "/3d/Platform.glb";

    const loader = new GLTFLoader();
    // load the modelPath
    loader.load(modelPath, (gltf) => {
      // setPlatform on the gltf, and play the first animation
      setPlatform(gltf.scene);

      const animationMixer = new THREE.AnimationMixer(gltf.scene);

      // for each animation in the gltf, add it to the animation mixer
      gltf.animations.forEach((clip) => {
        animationMixer.clipAction(clip).play();
      }
      );

      setInterval(() => {
        animationMixer.update(0.0005);
      });

    });

  }, [templateInfo])

  return templateInfo && platform && (
      <div className={styles["FitParentContainer"]}>
        <BackButton onClick={() => {
          setCurrentTemplate(null)
          setCurrentView(ViewStates.LANDER_LOADING)
        }}/>
        <AudioButton />

          <Canvas
            id="editor-scene"
            className={styles["canvasStyle"]}
            gl={{ antialias: true, toneMapping: NoToneMapping }}
            camera={{ fov: 30, position: [0, 1.3, 2] }}
          >

          <EffectComposer>
          <Bloom luminanceThreshold={0.99} luminanceSmoothing={0.9} radius={1} />
          </EffectComposer>

          <Environment files="/city.hdr" />
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

            <mesh>
              <primitive object={platform} />
            </mesh>

            </PerspectiveCamera>
          </Canvas>
          { currentView.includes("MINT") && <MintPopup />}
          {showChat && <ChatComponent />}
          {!showChat && <Editor templateInfo={templateInfo} controls={controls.current} />}
          {!showChat && currentTemplate && templateInfo && <Selector templateInfo={templateInfo} />}
      </div>
  )
}