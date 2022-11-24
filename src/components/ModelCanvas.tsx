import React, { useState, useEffect } from 'react';
import { Canvas } from "@react-three/fiber";
import { PerspectiveCamera } from "@react-three/drei/core/PerspectiveCamera";
import { OrbitControls } from "@react-three/drei/core/OrbitControls";
import { NoToneMapping, TextureLoader } from 'three';
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader"
import { VRM  } from "@pixiv/three-vrm"
import { sceneService } from '../services/scene'
//import { loadAnimation, startAnimation } from "../library/animations/animation"
import { AnimationManager } from '../library/animations/animationManager';
import {useModelingStore} from '../store'

export default function ModelCanvas (props){
    const [camera, setCamera] = useState<object>(Object);
    const [controls, setControls] = useState<object>(Object);
    const [scene, setScene] = useState<object>(Object);
    const isModeling = useModelingStore((state) => state.isModeling)
    const setModeling = useModelingStore((state) => state.setModeling)
    const setComplete = useModelingStore((state) => state.setComplete)
    // const landingModelPath = '../3D/models/landing_model.vrm'
    
    useEffect(() => {
        if (props.modelPath) {
          sceneService.loadModel(props.modelPath, (e) => {
              setModeling(props.order, 100);
            })
            .then((vrm) => {
              const animManager = new AnimationManager();
              if (props.animation){
                animManager.loadAnimations(props.animation);
              }
              // yield before placing avatar to avoid lag
              setTimeout(()=>{
                animManager.startAnimation(vrm)
                setTimeout(()=>{
                  setScene(vrm.scene)
                  setComplete(props.order, true);
                },50);
              },1000);
            })
        }
      }, [])

return (
    <Canvas
        style = {{
            // width: "calc(100%)",
            // position: "absolute",
            width : '250px',
            height : '500px',
        }}
        gl={{ antialias: true, toneMapping: NoToneMapping }}
        linear
        //className="canvas"
        >
        <directionalLight 
              //castShadow = {true}
              intensity = {1} 
              color = {[0.6,.8,1]}
              position = {[0, 6, 2]} 
              shadow-mapSize = {[1024, 1024]}>
        </directionalLight>
        <PerspectiveCamera 
            ref ={setCamera}
            //aspect={250 / 500}
            //radius={(250 + 500) / 4}
            //fov={10}
            position = {[0, -1.8 , 3.5]}
            rotation = {[-0.1,0,0]}
            onUpdate = {self => self.updateProjectionMatrix()}
        >
        <mesh position={[0, 1.0, 0]}>
            <primitive object={scene} />
        </mesh>
        </PerspectiveCamera>
    </Canvas>
)}
