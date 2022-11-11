import React, { useState, useEffect } from 'react';
import { Canvas } from "@react-three/fiber";
import { PerspectiveCamera } from "@react-three/drei/core/PerspectiveCamera";
import { OrbitControls } from "@react-three/drei/core/OrbitControls";
import { NoToneMapping, TextureLoader } from 'three';
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader"
import { VRM  } from "@pixiv/three-vrm"
import { sceneService } from '../services/scene'
import { startAnimation } from "../library/animations/animation"
import {useModelingStore} from '../store'

export default function ModelCanvas (props){
    const [camera, setCamera] = useState<object>(Object);
    const [controls, setControls] = useState<object>(Object);
    const [scene, setScene] = useState<object>(Object);
    const isModeling = useModelingStore((state) => state.isModeling)
    const setModeling = useModelingStore((state) => state.setModeling)
    const setComplete = useModelingStore((state) => state.setComplete)
    // const landingModelPath = '../3D/models/landing_model.vrm'
    const renameVRMBones = (vrm) =>{
        for (let bone in VRMSchema.HumanoidBoneName) {
            let bn = vrm.humanoid.getBoneNode(VRMSchema.HumanoidBoneName[bone]);
            if (bn != null)
                bn.name = VRMSchema.HumanoidBoneName[bone];
        }
    }
    useEffect(() => {
        if (props.modelPath) {
          
          sceneService.loadModel(props.modelPath, (e) => {
              console.log('aaaaaaaaaaaaaaa', (e.loaded * 100) / e.total)
              setModeling(props.order, 100);
            //   props.setLoadingProgress((e.loaded * 100) / e.total)
            })
            .then((vrm) => {
              // yield before placing avatar to avoid lag
              setTimeout(()=>{
                startAnimation(vrm)
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
            width : '500px',
            height : '500px',
        }}
        gl={{ antialias: true, toneMapping: NoToneMapping }}
        linear
        className="canvas"
        id="editor-scene"
        >
        {/* <gridHelper
            args={[50, 25, "#101010", "#101010"]}
            position={[0, 0, 0]}
        />  */}
        <directionalLight castShadow intensity={1} position={[10, 6, 6]} shadow-mapSize={[1024, 1024]}>
            <orthographicCamera attach="shadow-camera" left={-20} right={20} top={20} bottom={-20} />
        </directionalLight>
        <OrbitControls
            ref = {setControls}
            minDistance={1.8}
            maxDistance={1.8}
            minPolarAngle={Math.PI / 2 - 0.2}
            maxPolarAngle={Math.PI / 2 - 0.1 }
            enablePan={false}
            enableDamping={true}
            // enableRotate={false}
            target={[0, 1.7, 0]}
        />
        <PerspectiveCamera 
            ref ={setCamera}
            aspect={1200 / 600}
            radius={(1200 + 600) / 4}
            fov={100}
            //position={[0, 0, 0]}
            // rotation = {[0,0.5,0]}
            onUpdate={self => self.updateProjectionMatrix()}
        >
        <mesh position={[0, 1.0, 0]}>
            <primitive object={scene} />
        </mesh>
        </PerspectiveCamera>
    </Canvas>
)}
