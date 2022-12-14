import React from "react";
import CloseIcon from '@mui/icons-material/Close';
import DownloadIcon from "@mui/icons-material/Download";
import { Modal } from "@mui/material";
import Avatar from "@mui/material/Avatar";
import Button from "@mui/material/Button";
import { Box } from "@mui/system";
import { OrbitControls } from "@react-three/drei/core/OrbitControls";
import { PerspectiveCamera } from "@react-three/drei/core/PerspectiveCamera";
import { Canvas } from "@react-three/fiber";
import { sceneService } from "../services";
import { TemplateModel } from "./Models";
import { useScene, useTemplateInfo, useModel } from "../store";
import { NoToneMapping } from 'three';

const style = {
  position: 'absolute' as 'absolute',
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
  width: '528px',
  color: "#999999",
  height: "295px",
  background: "#40455A",
  border: "1px solid #303949",
  backdropFilter: "blur(22.5px)",
  borderRadius: '5px',
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
            enablePan={false}
            target={[0, 0.9, 0]}
          />
          <PerspectiveCamera>c
            <TemplateModel scene={model.scene.clone()} />
          </PerspectiveCamera>c
        </Canvas>
  );
}
