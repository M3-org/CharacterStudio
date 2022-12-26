/* eslint-disable react/no-unknown-property */
import React from "react";
import { OrbitControls } from "@react-three/drei/core/OrbitControls";
import { PerspectiveCamera } from "@react-three/drei/core/PerspectiveCamera";
import { Canvas } from "@react-three/fiber";

import styles from './MintModal.module.css'

export default function MintModal({model}) {
  if(!model) return null
  console.log('model', model)
    return (
        <Canvas className={styles['canvasStyle']}
          id="mint-scene"
            gl={{ antialias: true, preserveDrawingBuffer:true }}
            linear={false}
        >

        <ambientLight
              color={[1,1,1]}
              intensity={0.5}
            />
            
            <directionalLight 
              //castShadow = {true}
              intensity = {0.5} 
              //color = {[0.5,0.5,0.5]}
              position = {[3, 1, 5]} 
              shadow-mapSize = {[1024, 1024]}>
            </directionalLight>
          <OrbitControls
            minDistance={1.5}
            maxDistance={1.5}
            minPolarAngle={0}
            maxPolarAngle={Math.PI / 2 - 0.1}
            enablePan={true}
            target={[0, 0.9, 0]}
          />
          <PerspectiveCamera args={[20, null, 1, 100000]}>
          <fog attach="fog" color="hotpink" near={1} far={10} />
          <mesh>
            <primitive object={model.scene.clone()} />
          </mesh>
          </PerspectiveCamera>
        </Canvas>
  );
}
