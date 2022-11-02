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
import { MeshBasicMaterial } from "three";
import {MusicButton} from "./MusicButton.tsx"
import mainBackground from "../ui/mainBackground.png"
import {useMuteStore} from '../store'
import { useWeb3React } from "@web3-react/core";
import { InjectedConnector } from "@web3-react/injected-connector";
import { disconnect } from "process";

export default function Scene(props: any) {
  const isMute = useMuteStore((state) => state.isMute)
  const setMute = useMuteStore((state) => state.setMute)
  const [showType, setShowType] = useState(false);
  const [randomFlag, setRandomFlag] = useState(-1);
  const [camera, setCamera] = useState<object>(Object);
  const [controls, setControls] = useState<object>(Object);
  const [connected, setConnected] = useState(false);
  // const [walletAdress, setWalletAdress] = useState("")

  const { activate, deactivate, library, account } = useWeb3React();
  const injected = new InjectedConnector({
    supportedChainIds: [1, 3, 4, 5, 42, 97],
  });

  const connectWallet = async () => {
    try {
      await activate(injected);
    } catch (ex) {
      console.log(ex);
    }
  };

  useEffect(() => {
    account ? setConnected(true) : setConnected(false);
  }, [account]);

  const disConnectWallet = async () => {
    try {
      deactivate();
      setConnected(false);
    } catch (ex) {
      console.log(ex);
    }
  };
 
  const random = () => {
    if(randomFlag == -1){
      setRandomFlag(0);
    }else{
      setRandomFlag(1-randomFlag)
    }
  }
  // const connect = async (value) =>{
  //   setConnected(value);
  //   setWalletAdress("A0x72361872368asafa98adg9adf8h9hwe43");
  //   console.log(connected)
  // }
  const h =0.65;
  const d = 1.1;
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
    model }: any = props;

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
            background : `url(${mainBackground})`,
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            backgroundSize: 'cover'
          }}
      >
        <Canvas
          style = {{
            width: "calc(100% - 700px)",
            position: "absolute",
            right: "100px"
          }}
          className="canvas"
          id="editor-scene"
        >
           {/* <gridHelper
            args={[50, 25, "#101010", "#101010"]}
            position={[0, 0, 0]}
          />  */}
          <ambientLight
            color={"blue"}
            intensity={1}
          />
          <directionalLight castShadow intensity={2} position={[10, 6, 6]} shadow-mapSize={[1024, 1024]}>
            <orthographicCamera attach="shadow-camera" left={-20} right={20} top={20} bottom={-20} />
          </directionalLight>
          <OrbitControls
            ref = {setControls}
            minDistance={1.5}
            maxDistance={1.5}
            minPolarAngle={Math.PI / 2 - 0.11}
            maxPolarAngle={Math.PI / 2 - 0.1}
            enablePan={false}
            enableDamping={true}
            target={[0, 0.9, 0]}
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
            {!downloadPopup && !mintPopup && (
              <TemplateModel scene={scene} />
            )}
          <mesh position={[0, 0, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <circleGeometry args={[0.3,64]} />
            <MeshReflectorMaterial
              blur={[400, 400]}
              resolution={1024}
              mixBlur={0.8}
              mixStrength={10}
              depthScale={1}
              minDepthThreshold={0.85}
              color="#303030"
              //color="#49343e"
              metalness={0}
              
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

        {!connected ?
        (<div className="wallet but" 
          onClick={connectWallet}>
        </div>)
        :
        (<div className="largeBut but" 
          onClick={disConnectWallet}>
          <div className="walletAdress">{account ? account.slice(0, 15) + "..." : ""}</div>
          <div className="wallet walletActive" ></div>
        </div>
        )}
        
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
        />
        <Editor 
          camera = {camera}
          controls = {controls}
          templateInfo={templateInfo}
          random = {random} 
          category={category} 
          setCategory={setCategory} 
          />
      </div>
    </div>
  );
}
