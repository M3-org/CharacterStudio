import React from "react";
import { OrbitControls } from "@react-three/drei/core/OrbitControls";
import { PerspectiveCamera } from "@react-three/drei/core/PerspectiveCamera";
import { Canvas } from "@react-three/fiber";
import { TemplateModel } from "./Models";
import { useScene, useModel } from "../store";
import { NoToneMapping } from 'three';

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  pt: 2,
  px: 4,
  pb: 3,
};

const canvasStyle = {
  right: '0',
  width: '390px',
  color: "#999999",
  height: "220px",
  background: "#40455A",
  border: "1px solid #303949",
  backdropFilter: "blur(22.5px)",
  borderRadius: '5px',
  marginTop:'10px'
}

export default function MintModal() {
  const scene = useScene((state) => state.scene);
  const model = useModel((state) => state.model);
  
  return (
        <Canvas
          style={canvasStyle}
          id="mint-scene"
            gl={{ antialias: true, toneMapping: NoToneMapping,preserveDrawingBuffer:true }}
            linear = {true}
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
          <PerspectiveCamera>
            <TemplateModel scene={model.scene.clone()} />
          </PerspectiveCamera>
        </Canvas>
  );
}
