/* eslint-disable react/no-unknown-property */
import React, { useContext, useEffect, useRef, useState } from "react"
import * as THREE from "three"
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader"
import { SceneContext } from "../context/SceneContext"
import { ViewContext, ViewStates } from "../context/ViewContext"
import { AnimationManager } from "../library/animationManager"
import { addModelData, getSkinColor } from "../library/utils"
import { BackButton } from "./BackButton"
import Editor from "./Editor"
import styles from "./Scene.module.css"
import Selector from "./Selector"
import ChatComponent from "./ChatComponent"
import Blinker from "./Blinker"

import AudioButton from "./AudioButton"
import { LipSync } from '../library/lipsync'

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
    traitsSpines,
    traitsNecks,
    setCurrentTemplate,
    setLipSync,
  } = useContext(SceneContext)
  const {setCurrentView} = useContext(ViewContext)
  const maxLookPercent = {
    neck : 30,
    spine : 5,
    left : 70,
    right : 70,
  }

  const [loading, setLoading] = useState(false)
  const controls = useRef()
  const templateInfo = template && currentTemplate && template[currentTemplate.index]
  const [neck, setNeck] = useState({});
  const [spine, setSpine] = useState({});
  const [left, setLeft] = useState({});
  const [right, setRight] = useState({});
  const [platform, setPlatform] = useState(null);
  const [blinker, setBlinker] = useState(null);
  const [animationMixer, setAnimationMixer] = useState(null);

  const updateBlinker = () => {
    if(blinker){
      blinker.update(Date.now());
    } else {
     // console.log('no blinker')
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
    if (neck && spine && left && right) {
      moveJoint(event, neck, maxLookPercent.neck);
      moveJoint(event, spine, maxLookPercent.spine);
      moveJoint(event, left, maxLookPercent.left);
      moveJoint(event, right, maxLookPercent.right);
    }
    if(traitsNecks.length !== 0 && traitsSpines.length !== 0){
      traitsNecks.map((neck) => {
        moveJoint(event, neck, maxLookPercent.neck);
      })
      traitsSpines.map((spine) => {
        moveJoint(event, spine, maxLookPercent.spine);
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
    setScene(new THREE.Scene());
    const frameRate = 1000/30;
    // start an update loop
    const update = () => {
      updateBlinker();
      animationMixer?.update(frameRate);
    };

    // set a 30 fps interval
    const interval = setInterval(update, frameRate);

    // add an equirectangular environment map to the scene using THREE (public/city.hdr)
    const envMap = new THREE.TextureLoader().load("/city.hdr");

    // add an ambient light to the scene with an intensity of 0.5
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);

    // add a directional light to the scene with an intensity of 0.5
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);

    // add the directional light to the scene
    scene.add(directionalLight);

    // add the ambient light to the scene
    scene.add(ambientLight);

    // add a camera to the scene
    const camera = new THREE.PerspectiveCamera(
      30,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );

    // set the camera position
    camera.position.set(0, 1.3, 2);
    
    // TODO make sure to kill the interval

      // find editor-scene canvas
      const canvasRef = document.getElementById("editor-scene");

    // create a new renderer
    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef,
      antialias: true,
      alpha: true,
    });

    // set the renderer size
    renderer.setSize(window.innerWidth, window.innerHeight);

    // set the renderer pixel ratio
    renderer.setPixelRatio(window.devicePixelRatio);

    // set the renderer output encoding
    renderer.outputEncoding = THREE.sRGBEncoding;

    // start animation frame loop to render
    const animate = () => {
      requestAnimationFrame(animate);
      renderer.render(scene, camera);
    };

    // start the animation loop
    animate();


    const modelPath = "/3d/Platform.glb";

    const loader = new GLTFLoader();
    // load the modelPath
    loader.load(modelPath, (gltf) => {
      // setPlatform on the gltf, and play the first animation
      setPlatform(gltf.scene);
      const am = new THREE.AnimationMixer(gltf.scene);
      setAnimationMixer(am);

      // for each animation in the gltf, add it to the animation mixer
      gltf.animations.forEach((clip) => {
        am.clipAction(clip).play();
      }
      );

    });

    loadModel(templateInfo.file).then(async (vrm) => { 
      const animationManager = new AnimationManager(templateInfo.offset)
      addModelData(vrm, { animationManager: animationManager })

      if (templateInfo.animationPath) {
        await animationManager.loadAnimations(templateInfo.animationPath)
        animationManager.startAnimation(vrm)
      }
      addModelData(vrm, { cullingLayer: 0 })

      console.log('vrm', vrm)

      setLipSync(new LipSync(vrm));
      
      setBlinker(new Blinker(vrm));

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
    }

  }, [templateInfo])

  return <></>
}