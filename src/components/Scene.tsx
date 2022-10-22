import { PerspectiveCamera } from "@react-three/drei/core/PerspectiveCamera";
import { OrbitControls } from "@react-three/drei/core/OrbitControls";
import { Canvas } from "@react-three/fiber";
import React, { useState, useEffect } from "react";
import Editor from "./Editor";
import { TemplateModel } from "./Models";
import Selector from "./Selector";
import '../styles/scene.scss'
import { position } from "html2canvas/dist/types/css/property-descriptors/position";
import { sceneService } from "../services";
import { MeshReflectorMaterial } from '@react-three/drei/core/MeshReflectorMaterial'



export default function Scene(props: any) {

  const [showType, setShowType] = useState(false);
  const [randomFlag, setRandomFlag] = useState(-1);
 
  const random = () => {
    if(randomFlag == -1){
      setRandomFlag(0);
    }else{
      setRandomFlag(1-randomFlag)
    }
  }

  const { 
    wrapClass,
    templates,
    scene,
    downloadPopup,
    mintPopup,
    category,
    setCategory,
    avatar,
    setAvatar,
    setTemplate,
    template,
    setTemplateInfo,
    templateInfo,
    model,
    camera }: any = props;

    const canvasWrap = {
      height: "100vh",
      width: "100vw",
      position: "absolute" as "absolute",
      zIndex: "0",
      top: "0",
      backgroundColor: "#111111"
    }
    const handleDownload = () =>{
     showType ? setShowType(false) : setShowType(true);
    }

    const downLoad = (format : any) => {
      sceneService.download(model, `CC_Model`, format, false);
    }
    const moveCamera = () => {

    }

  return (
    <div style={{
      width: "100vw",
      height: "100vh",
      position: "relative" as "relative"
    }}>
      <div
        id="canvas-wrap"
        className={`canvas-wrap ${wrapClass && wrapClass}`}
        style={{ ...canvasWrap,
            // background : 'url(./mainBackground.png)',
            // backgroundPosition: 'center',
            // backgroundRepeat: 'no-repeat',
            // backgroundSize: 'cover'
          }}
      >
        <Canvas
          className="canvas"
          id="editor-scene"
        >
           <gridHelper
            args={[50, 25, "#101010", "#101010"]}
            position={[0, 0, 0]}
          /> 
          <spotLight
            intensity={1}
            position={[0, 3.5, 2]}
            shadow-mapSize-width={2048}
            shadow-mapSize-height={2048}
            castShadow
          />
          <spotLight
            intensity={0.2}
            position={[-5, 2.5, 4]}
            shadow-mapSize-width={2048}
            shadow-mapSize-height={2048}
          />
          <spotLight
            intensity={0.2}
            position={[5, 2.5, 4]}
            shadow-mapSize-width={2048}
            shadow-mapSize-height={2048}
          />
          <spotLight
            intensity={0.3}
            position={[0, -2, -8]}
            shadow-mapSize-width={2048}
            shadow-mapSize-height={2048}
            castShadow
          />
          <directionalLight castShadow intensity={2} position={[10, 6, 6]} shadow-mapSize={[1024, 1024]}>
            <orthographicCamera attach="shadow-camera" left={-20} right={20} top={20} bottom={-20} />
          </directionalLight>
           {/* <OrbitControls
            minDistance={1}
            maxDistance={3}
            minPolarAngle={0.0}
            maxPolarAngle={Math.PI / 2 - 0.1}
            enablePan={false}
            target={[0, 0.5, 0]}
          />  */}
          <PerspectiveCamera
            aspect={1200 / 600}
            //radius={(1200 + 600) / 4}
            //fov={100}
            position={[0.3, -0.9, 1.6]}
            onUpdate={self => self.updateProjectionMatrix()}
          >
            {camera && <cameraHelper args={camera} />}
            {!downloadPopup && !mintPopup && (
              <TemplateModel scene={scene} />
            )}
          <mesh position={[0, 0, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[3, 3]} />
            <MeshReflectorMaterial
              blur={[400, 400]}
              resolution={2048}
              mixBlur={0.8}
              mixStrength={20}
              depthScale={1}
              minDepthThreshold={0.85}
              color="#151515"
              metalness={0.6}
              roughness={1}
            />
          </mesh>
          </PerspectiveCamera>

        </Canvas>
      </div>
      <div style={{
        display:"flex",
        top : "37px",
        right : "44px",
        position : "absolute",
        gap :'20px'
      }}>
        {showType && <>
            <div className="modeltype but" onClick={() => downLoad('vrm')} ><span>VRM</span></div>
            <div className="modeltype but" onClick={() => downLoad('glb')} ><span>GLB</span></div>
          </>
        }
        <div className="download but" onClick={handleDownload}></div>
        <div className="wallet but" ></div>
      </div>
      <div>
        <Selector
          templates={templates}
          category={category}
          scene={scene}
          avatar = {avatar}
          setAvatar={setAvatar}
          setTemplate={setTemplate}
          template={template}
          setTemplateInfo={setTemplateInfo}
          templateInfo={templateInfo}
          randomFlag={randomFlag}
          camera={camera}
        />
        <Editor random = {random} category={category} setCategory={setCategory} />
      </div>
    </div>
  );
}
