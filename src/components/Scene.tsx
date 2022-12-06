import { PerspectiveCamera } from "@react-three/drei/core/PerspectiveCamera";
import { OrbitControls } from "@react-three/drei/core/OrbitControls";
import { Canvas } from "@react-three/fiber";
import React, { useState, useEffect, Suspense } from "react";
import Editor from "./Editor";
import { TemplateModel } from "./Models";
import Selector from "./Selector";
import MintPopup from "./MintPopup";
import { apiService, sceneService, Contract } from "../services";
import { MeshReflectorMaterial } from '@react-three/drei/core/MeshReflectorMaterial'
import { useWeb3React } from "@web3-react/core";
import { InjectedConnector } from "@web3-react/injected-connector";
import { disconnect } from "process";
import { NoToneMapping } from 'three';
import {
    ethers, BigNumber
} from "ethers";
import { BackButton } from "./BackButton";
import { DownloadButton, MintButton, WalletButton, TextButton, WalletImg, WalletInfo, Background }from '../styles/Scene.styled'
import { FitParentContainer, TopRightMenu, ResizeableCanvas } from '../styles/Globals.styled'
import AutoRotate from "./AutoRotate";
import { useHideStore, useRotateStore, useAvatar, useEnd, useScene, useTemplateInfo, useModel } from "../store";

import { EffectComposer, Bloom } from '@react-three/postprocessing'

const ACCOUNT_DATA = {
  EMAIL: 'email',
  AVATAR: 'avatar',
};

export default function Scene(props: any) {
  const [showType, setShowType] = useState(false);

  const [camera, setCamera] = useState<object>(Object);
  const [controls, setControls] = useState<object>(Object);
  const [connected, setConnected] = useState(false);
  const [ensName, setEnsName] = useState('');
  const [mintLoading, setMintLoading] = useState(false);
  const [confirmWindow, setConfirmWindow] = useState(false);
  const [mintStatus, setMintStatus] = useState("Mint Status");
  const [autoRotate, setAutoRotate] = useState(true);

  const isRotate = useRotateStore((state) => state.isRotate)
  const ishidden =  useHideStore((state) => state.ishidden)
  const avatar = useAvatar((state) => state.avatar)
  const scene = useScene((state) => state.scene)
  const setTemplateInfo = useTemplateInfo((state) => state.setTemplateInfo)
  const model = useModel((state) => state.model)
  const { activate, deactivate, library, account } = useWeb3React();
  const injected = new InjectedConnector({
    supportedChainIds: [137, 1, 3, 4, 5, 42, 97],
  });

  const canvasStyle = {width: '100vw', display:'flex', position:'absolute'}

  const connectWallet = async () => {
    try {
      await activate(injected);
    } catch (ex) {
      
      console.log(ex);
    }
  };
  useEffect(()=>{
    console.log(ishidden);
  },[ishidden])

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

  const { 
    downloadPopup,
    setModelClass,
    modelClass}: any = props;
  const handleDownload = () =>{
    showType ? setShowType(false) : setShowType(true);
  }

  const downLoad = (format : any) => {
    sceneService.download(model, `CC_Model`, format, false);
  }

  const mintAsset = async () => {
    if(account == undefined) {
        setMintStatus("Please connect the wallet")
        setConfirmWindow(true)
        return;
    }
    setConfirmWindow(true)
    setMintStatus("Uploading...")
    setMintLoading(true);
    
    sceneService.getScreenShot().then(async (screenshot) => {
      if(screenshot) {
        const imageHash: any = await apiService.saveFileToPinata(screenshot, "AvatarImage_" + Date.now() + ".png")
          .catch((reason)=>{
            console.error(reason);
            setMintStatus("Couldn't save to pinata")
            setMintLoading(false);
          });
        sceneService.getModelFromScene().then(async (glb) => {
          const glbHash : any = await apiService.saveFileToPinata(glb, "AvatarGlb_" + Date.now() + ".glb");
          const attributes : any = getAvatarTraits();
          const metadata = {
            name : "Avatars",
            description: "Creator Studio Avatars.",
            image : `ipfs://${imageHash.IpfsHash}`,
            animation_url: `ipfs://${glbHash.IpfsHash}`,
            attributes
          }
          const str = JSON.stringify(metadata);
          const metaDataHash :any = await apiService.saveFileToPinata(new Blob([str]), "AvatarMetadata_" + Date.now() + ".json");
          await mintNFT("ipfs://" + metaDataHash.IpfsHash);
        })
      }
    })
  }

  const getAvatarTraits = () => {
    let metadataTraits =[];
    Object.keys(avatar).map((trait) => {
      if (Object.keys(avatar[trait]).length !== 0) {
        metadataTraits.push({
          "trait_type": trait,
          "value" : avatar[trait].traitInfo.name
        })
      } 
    })
    return metadataTraits;
  }

  const mintNFT = async (metadataIpfs : any) => {
    setMintStatus("Minting...")
    const chainId = 5; // 1: ethereum mainnet, 4: rinkeby 137: polygon mainnet 5: // Goerli testnet
    if (window.ethereum.networkVersion !== chainId) {
        try {
            await window.ethereum.request({
                method: 'wallet_switchEthereumChain',
                params: [{ chainId: '0x5' }] // 0x4 is rinkeby. Ox1 is ethereum mainnet. 0x89 polygon mainnet  0x5: // Goerli testnet
            });
        } catch (err) {
            // notifymessage("Please check the Ethereum mainnet", "error");
            setMintStatus("Please check the Polygon mainnet")
            setMintLoading(false);
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
        setMintStatus("Mint isn't Active now!")
        setMintLoading(false);
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
            setMintStatus("Mint success!")
            setMintLoading(false);
          }
      } catch (err) {
          setMintStatus("Public Mint failed! Please check your wallet.")
          setMintLoading(false);
      }
    }
  }
  const leftPadding = ishidden ? 200 : 700
  
  return (
    <FitParentContainer >
      <Background >
        <ResizeableCanvas left = {leftPadding} right = {0}>
          <Canvas
            style = {canvasStyle}
            gl={{ antialias: true, toneMapping: NoToneMapping }}
            linear = {true}
            id="editor-scene"
          >
            <gridHelper
              args={[50, 25, "#101010", "#101010"]}
              position={[0, 0, 0]}
              visible={false}
            /> 
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
              <orthographicCamera 
                attach="shadow-camera" 
                left={-20} 
                right={20} 
                top={20} 
                bottom={-20}/>
            </directionalLight>
            <OrbitControls
              ref = {setControls}
              minDistance={0.5}
              maxDistance={1.5}
              // maxPolarAngle={Math.PI / 2 - 0.1}
              enablePan = { false }
              autoRotate = {isRotate}
              autoRotateSpeed = { 1 }
              enableDamping = { true }
              dampingFactor = { 0.1 }
              target={[0, 0.9, 0]}
            />
            {/* <Suspense fallback={null}>
              <EffectComposer>
                <Bloom />
              </EffectComposer>
            </Suspense> */}
            <PerspectiveCamera 
              ref ={setCamera}
              aspect={1200 / 600}
              fov={100}
              onUpdate={self => self.updateProjectionMatrix()}
            >
              {!downloadPopup && (
                <TemplateModel scene={scene} />
              )}
            <mesh rotation = {[-Math.PI / 2, 0, 0]} position = {[0,-0.02,0]}>
              <circleGeometry 
                args={[0.6, 64]} />
              <MeshReflectorMaterial
                blur={[100, 100]}
                opacity={1}
                resolution={1024}
                mixBlur={0}
                mixStrength={10}
                depthScale={0.5}
                minDepthThreshold={1}
                color="#ffffff"
                metalness={0.9}
                roughness={1}
              />
            </mesh>
            </PerspectiveCamera>
          </Canvas>
        </ResizeableCanvas>
      </Background>
      <TopRightMenu>
        {showType && <>
            <TextButton onClick={() => downLoad('vrm')} ><span>VRM</span></TextButton>
            <TextButton onClick={() => downLoad('glb')} ><span>GLB</span></TextButton>
          </>
        }
        <AutoRotate/>
        <DownloadButton onClick={handleDownload}/>
        <MintButton onClick={() => {
          //setConfirmWindow(true)
          mintAsset()
        }}/>
        <WalletButton connected = {connected} 
          onClick = {connected ? disConnectWallet : connectWallet}>
          {connected ? (
            <WalletInfo ens={ensName}>
              {ensName ? ensName: 
              (account ? account.slice(0, 15) + "..." : 
              "")}
            </WalletInfo>):
            ("")}
          <WalletImg/>
        </WalletButton>

      </TopRightMenu>
      <BackButton onClick={() => {
        setModelClass(0);
      }}/>
      <div>
        <Selector
          controls = {controls}
          modelClass = {modelClass}
        />
        <Editor 
          controls = {controls}
          />
      </div>
      <MintPopup
          setConfirmWindow= {setConfirmWindow}
          confirmWindow = {confirmWindow}
          mintStatus = {mintStatus}
          mintLoading = {mintLoading}>
      </MintPopup>
    </FitParentContainer>
  );
}
