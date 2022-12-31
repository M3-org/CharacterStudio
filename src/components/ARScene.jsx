/* eslint-disable react/no-unknown-property */
import React, { useContext, useEffect, useState } from "react"
import * as THREE from "three"
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader"
import { SceneContext } from "../context/SceneContext"
import { ViewContext, ViewStates } from "../context/ViewContext"
import { AnimationManager } from "../library/animationManager"
import { addModelData } from "../library/utils"
import Blinker from "./Blinker"

import { LipSync } from '../library/lipsync'

window.THREE = THREE

export default function Scene() {
  const {
    scene,
    loadModel,
    currentTemplate,
    model,
    template,
    setModel,
    traitsSpines,
    traitsNecks,
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
  const templateInfo = template && currentTemplate && template[currentTemplate.index]
  const [neck, setNeck] = useState({});
  const [spine, setSpine] = useState({});
  const [left, setLeft] = useState({});
  const [right, setRight] = useState({});
  const [platform, setPlatform] = useState(null);
  const [blinker, setBlinker] = useState(null);
  const [animationMixer, setAnimationMixer] = useState(null);


  // useEffect(() => {
  //   // if user presses ctrl h, show chat
  //   const handleKeyDown = (e) => {
  //     if (e.ctrlKey && e.key === 'h') {
  //       e.preventDefault();
  //       setShowChat(!showChat);
  //     }
  //   }
  //   window.addEventListener('keydown', handleKeyDown);
  //   return () => {
  //     window.removeEventListener('keydown', handleKeyDown);
  //   }

  // }, [])

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
    const frameRate = 1000/30;
    // start an update loop
    const update = () => {
      blinker?.update(Date.now());
      animationMixer?.update(frameRate);
    };

    // set a 30 fps interval
    const interval = setInterval(update, frameRate);

    // // add an equirectangular environment map to the scene using THREE (public/city.hdr)
    // const envMap = new THREE.TextureLoader().load("/city.hdr");

    // add an ambient light to the scene with an intensity of 0.5
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);

    // add a directional light to the scene with an intensity of 0.5
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);

    // add the directional light to the scene
    scene.add(directionalLight);

    // add the ambient light to the scene
    scene.add(ambientLight);


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
      scene.add(gltf.scene);
    });

    loadModel(currentTemplate.model).then(async (vrm) => { 
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

      // getSkinColor(vrm.scene, templateInfo.bodyTargets)
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
      if(interval) {
        clearInterval(interval);
      }
    }




  }, [templateInfo])
  useEffect (() => {
    onxrloaded();

  }, [])


// Copyright (c) 2018 8th Wall, Inc.
// Returns a pipeline module that initializes the threejs scene when the camera feed starts, and
// handles subsequent spawning of a glb model whenever the scene is tapped.
const placegroundScenePipelineModule = () => {
  const raycaster = new THREE.Raycaster()
  const tapPosition = new THREE.Vector2()

  let surface  // Transparent surface for raycasting for object placement.

  // Populates some object into an XR scene and sets the initial camera position. The scene and
  // camera come from xr3js, and are only available in the camera loop lifecycle onStart() or later.
  const initXrScene = ({ scene, camera }) => {
    surface = new THREE.Mesh(
      new THREE.PlaneGeometry( 100, 100, 1, 1 ),
      new THREE.MeshBasicMaterial({
        color: 0xffff00,
        transparent: true,
        opacity: 0.0,
        side: THREE.DoubleSide
      })
    )

    surface.rotateX(-Math.PI / 2)
    surface.position.set(0, 0, 0)
    scene.add(surface)

    // Set the initial camera position relative to the scene we just laid out. This must be at a
    // height greater than y=0.
    camera.position.set(0, 3, 0)
  }

  // Load the glb model at the requested point on the surface.
  const placeObject = (pointX, pointZ) => {
    console.log(`placing at ${pointX}, ${pointZ}`);
    scene.position.set(pointX, 0, pointZ);
  }

  const placeObjectTouchHandler = (e) => {
    const XR8 = window.XR8
    console.log('placeObjectTouchHandler')
    // Call XrController.recenter() when the canvas is tapped with two fingers. This resets the
    // AR camera to the position specified by XrController.updateCameraProjectionMatrix() above.
    if (e.touches.length == 2) {
      XR8.XrController.recenter()
    }

    if (e.touches.length > 2) {
      return
    }

    // If the canvas is tapped with one finger and hits the "surface", spawn an object.
    const {camera} = XR8.Threejs.xrScene()

    // calculate tap position in normalized device coordinates (-1 to +1) for both components.
    tapPosition.x = (e.touches[0].clientX / window.innerWidth) * 2 - 1
    tapPosition.y = - (e.touches[0].clientY / window.innerHeight) * 2 + 1

    // Update the picking ray with the camera and tap position.
    raycaster.setFromCamera(tapPosition, camera)

    // Raycast against the "surface" object.
    const intersects = raycaster.intersectObject(surface)

    if (intersects.length == 1 && intersects[0].object == surface) {
      placeObject(intersects[0].point.x, intersects[0].point.z)
      console.log('placing object', intersects[0].point.x, intersects[0].point.z)
    } else {
      console.log('no intersection')
    }
  }

  return {
    // Pipeline modules need a name. It can be whatever you want but must be unique within your app.
    name: 'placeground',

    // onStart is called once when the camera feed begins. In this case, we need to wait for the
    // XR8.Threejs scene to be ready before we can access it to add content. It was created in
    // XR8.Threejs.pipelineModule()'s onStart method.
    onStart: ({canvas}) => {
      const XR8 = window.XR8
      const {scene: stage, camera} = XR8.Threejs.xrScene()  // Get the 3js sceen from xr3js.
      stage.add(scene);
      initXrScene({ scene: stage, camera }) // Add objects to the scene and set starting camera position.

      canvas.addEventListener('touchstart', placeObjectTouchHandler, true)  // Add touch listener.

      // Sync the xr controller's 6DoF position and camera paremeters with our scene.
      XR8.XrController.updateCameraProjectionMatrix({
        origin: camera.position,
        facing: camera.quaternion,
      })
    },
  }
}

const onxrloaded = () => {
  window.XR8?.addCameraPipelineModules([  // Add camera pipeline modules.
    // Existing pipeline modules.
    window.XR8.GlTextureRenderer.pipelineModule(),      // Draws the camera feed.
    window.XR8.Threejs.pipelineModule(),                // Creates a ThreeJS AR Scene.
    window.XR8.XrController.pipelineModule(),           // Enables SLAM tracking.
    window.XRExtras.AlmostThere.pipelineModule(),       // Detects unsupported browsers and gives hints.
    window.XRExtras.FullWindowCanvas.pipelineModule(),  // Modifies the canvas to fill the window.
    // Custom pipeline modules.
    placegroundScenePipelineModule(),
  ])

  // Open the camera and start running the camera run loop.
  window.XR8?.run({canvas: document.getElementById('editor-scene')})
  if(!window.XR8) {
    console.log('xr8 not loaded')
  }
}

  return <></>
}