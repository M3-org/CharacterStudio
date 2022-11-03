import { PerspectiveCamera } from "@react-three/drei/core/PerspectiveCamera";
import { OrbitControls } from "@react-three/drei/core/OrbitControls";
import { Html, Stats } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import React, { useState, useEffect } from "react";
import Editor from "./Editor";
import { TemplateModel } from "./Models";
import Selector from "./Selector";
import '../styles/scene.scss'
import { position } from "html2canvas/dist/types/css/property-descriptors/position";
import { apiService, sceneService, Contract } from "../services";
import { MeshReflectorMaterial } from '@react-three/drei/core/MeshReflectorMaterial'
import { MeshBasicMaterial } from "three";
import mainBackground from "../ui/mainBackground.png"
import Lottie from "lottie-react";
import lottie from '../data/Rotation.json'
import { useMuteStore } from '../store'
import { useWeb3React } from "@web3-react/core";
import { InjectedConnector } from "@web3-react/injected-connector";
import { disconnect } from "process";
import {
    ethers, BigNumber
} from "ethers";

const ACCOUNT_DATA = {
  EMAIL: 'email',
  AVATAR: 'avatar',
};

export default function Scene(props: any) {
  //const isMute = useMuteStore((state) => state.isMute)
  //const setMute = useMuteStore((state) => state.setMute)
  const [showType, setShowType] = useState(false);
  const [randomFlag, setRandomFlag] = useState(-1);
  const [camera, setCamera] = useState<object>(Object);
  const [controls, setControls] = useState<object>(Object);
  const [connected, setConnected] = useState(false);
  const [ensName, setEnsName] = useState('');
  const [mintLoading, setMintLoading] = useState(false);



  // const [walletAdress, setWalletAdress] = useState("")

  const { activate, deactivate, library, account } = useWeb3React();
  const injected = new InjectedConnector({
    supportedChainIds: [137, 1, 3, 4, 5, 42, 97],
  });

  const connectWallet = async () => {
    try {
      await activate(injected);
    } catch (ex) {
      console.log(ex);
    }
  };

  useEffect(() => {
    if(account) {
      _setAddress(account);
      setConnected(true)
    } else {
      setConnected(false);
    }

  }, [account]);

  const _setAddress = async (address:any) => {
      const {name, avatar}: any = await getAccountDetails(address);
      console.log("ens", name)
      setEnsName(name ? name.slice(0, 15) + "..." : '');
  };

  const getAccountDetails = async (address: any) => {
    const provider = ethers.getDefaultProvider('mainnet', {
      alchemy: 'OOWUrxHDTRyPmbYOSGyq7izHNQB1QYOv'
    });
    const check = ethers.utils.getAddress(address);

    try {
      const name = await provider.lookupAddress(check);
      if (!name) return {};

      // const resolver = await provider.getResolver(name);

      // const accountDetails = {};

      // await Promise.all(
      //   Object.keys(ACCOUNT_DATA).map(async key => {
      //     const data = await resolver.getText(ACCOUNT_DATA[key]);
      //     accountDetails[ACCOUNT_DATA[key]] = data;
      //   }),
      // );

      // return {...accountDetails, name};
      return {name};
    } catch (err) {
      console.warn(err.stack);
      return {};
    }
  };

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

  const mintAsset = async () => {
    setMintLoading(true);
    
    sceneService.getScreenShot().then(async (screenshot) => {
      if(screenshot) {
        const imageHash: any = await apiService.saveFileToPinata(screenshot, "AvatarImage_" + Date.now() + ".png");
        sceneService.getModelFromScene().then(async (glb) => {
          const glbHash :any = await apiService.saveFileToPinata(glb, "AvatarGlb_" + Date.now() + ".glb");
          const metadata = {
            name : "Avatars",
            description: "Creator Studio Avatars.",
            image : `ipfs://${imageHash.IpfsHash}`,
            animation_url: `ipfs://${glbHash.IpfsHash}`
          }
          console.log("metadata", metadata)
           const str = JSON.stringify(metadata);
          const metaDataHash :any = await apiService.saveFileToPinata(new Blob([str]), "AvatarMetadata_" + Date.now() + ".json");
          console.log("metadatahash", metaDataHash)
          await mintNFT("ipfs://" + metaDataHash.IpfsHash);
        })
      }
    })
  }

  const mintNFT = async (metadataIpfs : any) => {
    if(account == undefined) {
        // notifymessage("Please connect the wallet", "error");
        alert("Please connect the wallet")
        return;
    }
    const chainId = 5; // 1: ethereum mainnet, 4: rinkeby 137: polygon mainnet 5: // Goerli testnet
    if (window.ethereum.networkVersion !== chainId) {
        try {
            await window.ethereum.request({
                method: 'wallet_switchEthereumChain',
                params: [{ chainId: '0x5' }] // 0x4 is rinkeby. Ox1 is ethereum mainnet. 0x89 polygon mainnet  0x5: // Goerli testnet
            });
        } catch (err) {
            // notifymessage("Please check the Ethereum mainnet", "error");
            alert("Please check the Polygon mainnet")
            return false;
        }
    }
    const signer = new ethers.providers.Web3Provider(
        window.ethereum
    ).getSigner();
    const contract = new ethers.Contract(
        Contract.address,
        Contract.abi,
        signer
    );
    const isActive = await contract.saleIsActive();
    if(!isActive) {
        alert("Mint isn't Active now!")
    } else {
      const tokenPrice = await contract.tokenPrice();                
      try {
          const options = {
              value: BigNumber.from(tokenPrice).mul(1),
              from: account,
          };
          const tx = await contract.mintToken(1, metadataIpfs, options);
          let res = await tx.wait();
          if (res.transactionHash) {
            alert("Mint success!");
            setMintLoading(false);
          }
      } catch (err) {
          alert("Public Mint failed! Please check your wallet.")
      }
    }
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
          gl={{ preserveDrawingBuffer: true }}
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
            <circleGeometry args={[0.3, 64]} />
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
        <div className="mint but" onClick={mintAsset}></div>
        

        {!connected ?
        (<div className="wallet but" 
          onClick={connectWallet}>
        </div>)
        :
        (<div className="largeBut but" 
          onClick={disConnectWallet}>
            {
              ensName ? <div className="walletENS">{ensName}</div>
                : <div className="walletAdress">{account ? account.slice(0, 15) + "..." : ""}</div>
            }
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
