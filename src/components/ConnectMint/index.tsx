import Button from "@mui/material/Button";
import React, { useEffect, useState } from "react";
import "./style.scss";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import ClearIcon from "@mui/icons-material/Clear";
import AddTaskIcon from "@mui/icons-material/AddTask";
import GavelIcon from "@mui/icons-material/Gavel";
import { useWeb3React } from "@web3-react/core";
import { InjectedConnector } from "@web3-react/injected-connector";
import axios from "axios";
import { ethers, BigNumber } from "ethers";
import { contractAddress, contractABI } from "../../library/contract";
import Alert from "@mui/material/Alert";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import { useGlobalState } from "../GlobalProvider";
import { GLTFExporter } from "three/examples/jsm/exporters/GLTFExporter";
import { apiService } from "../../services/api";

import DownloadIcon from "@mui/icons-material/Download";
import { Modal, Typography } from "@mui/material";
import Avatar from "@mui/material/Avatar";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, PerspectiveCamera } from "@react-three/drei";
import { TemplateModel } from "../Scene/models";
import { Box } from "@mui/system";
import "./style.scss";
import { threeService } from "../../services";

const style = {
  position: "absolute" as "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 400,
  bgcolor: "background.paper",
  border: "2px solid #000",
  boxShadow: 24,
  pt: 2,
  px: 4,
  pb: 3,
};
// const API_URL = "http://localhost:8081";
const API_URL = "http://34.214.42.55:8081";

export default function ConnectMint() {
  const { ethereum }: any = window;
  const { activate, deactivate, library, account } = useWeb3React();
  const {
    avatarCategory,
    modelNodes,
    mintPopup,
    setMintPopup,
    scene,
    mintPrice,
    mintPricePublic,
    totalMinted,
    setTotalMinted,
    gender,
    totalToBeMinted
  }: any = useGlobalState();
  const injected = new InjectedConnector({
    supportedChainIds: [1, 3, 4, 5, 42, 97],
  });

  const [connected, setConnected] = useState(false);
  const [alertTitle, setAlertTitle] = useState("");
  const [showAlert, setShowAlert] = useState(false);

  const [isPricePublic, setIsPricePublic] = useState(0);
  const [mintLoading, setMintLoading] = useState(false);

  // NEW FILE STATE HOOKS

  const [glb, setGLB] = useState(null);
  const [screenshot, setScreenshot] = useState(null);

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

  useEffect(() => {
    if (glb && screenshot) {
      mintAvatar();
    }
  }, [glb, screenshot]);
  const disConnectWallet = async () => {
    try {
      deactivate();
      setConnected(false);
    } catch (ex) {
      console.log(ex);
      alertModal(ex.message);
    }
  };

  const alertModal = async (msg: string) => {
    setAlertTitle(msg);
    setShowAlert(true);
    setTimeout(() => {
      setShowAlert(false);
    }, 4000);
  };

  const sendWhitelist = async () => {
    try {
      const message = ethers.utils.solidityKeccak256(
        ["address", "address"],
        [contractAddress, account]
      );
      const arrayifyMessage = ethers.utils.arrayify(message);
      const flatSignature = await library
        .getSigner()
        .signMessage(arrayifyMessage);
      const response = await axios.post(`${API_URL}/new-request`, {
        signature: flatSignature,
        address: account,
      });
      alertModal(response.data.msg);
    } catch (ex) {
      console.log(ex);
    }
  };

  const generateMintFiles = async () => {
    setMintLoading(true);
    threeService
      .getScreenShotByElementId("mint-screenshot-canvas-wrap")
      .then((screenshot) => {
        if (screenshot) {
          setScreenshot(screenshot);
          threeService.getModelFromScene(scene, "gltf/glb").then((glb) => {
            setGLB(glb);
            console.log(glb);
            console.log(screenshot);
          });
        }
      });
  };

  const mintAvatar = async () => {
    //////////////////////////// upload part //////////////////////
    /// ---------- glb -------------- ////////////////
    const formData = new FormData();
    formData.append("profile", glb);
    const glburl: any = await apiService.saveFileToPinata(formData);
    /// ---------- .jpg (screenshot) -------------- ////////////////
    const jpgformData = new FormData();
    jpgformData.append("profile", screenshot);
    const jpgurl: any = await apiService.saveFileToPinata(jpgformData);
    console.log("UPLOADED TO PINATA, Upload Result", jpgurl);
    /// ---------- metadata ------------- /////////////////
    const metadata = {
      name: "Dark Nexus Avatar",
      description: "Custom avatars created by the community for the Dark Nexus, an adult metaverse which will let you explore your deepest desires in a way you never could before. The only limit is your imagination.",
      image: "https://gateway.pinata.cloud/ipfs/" + jpgurl.IpfsHash,
      animation_url: "https://gateway.pinata.cloud/ipfs/" + glburl.IpfsHash,
      attributes: [
        {
          trait_type: "Gender",
          value: gender === 1 ? "Male" : "Female"
        },
        {
          trait_type: "Body Type",
          value: avatarCategory === 1 ? "Muscular" : "Thin"
        }
      ]
    };
    

    const MetaDataUrl: any = await apiService.saveMetaDataToPinata(metadata);
    console.log(MetaDataUrl);
    //////////////////////////////////////////////////////
    const signer = new ethers.providers.Web3Provider(ethereum).getSigner();
    const contract = new ethers.Contract(contractAddress, contractABI, signer);
    const responseUser = await axios.get(
      `${API_URL}/get-signature?address=${account}`
    );
    console.log("response", responseUser);
    if (responseUser.data.signature) {
      let amountInEther = mintPrice;
      setIsPricePublic(1);
      try {
        console.log("whitelist");
        const options = {
          value: ethers.utils.parseEther(amountInEther),
          from: account,
        };
        const res = await contract.mintWhiteList(
          "ipfs://" + MetaDataUrl.data.IpfsHash,
          responseUser.data.signature,
          options
        ); // tokenuri, signature
        setMintLoading(false);
        handleCloseMintPopup();
        alertModal("Whitelist Mint Success");
      } catch (error) {
        console.log(error);
        handleCloseMintPopup();
        alertModal(error.message);
      }
    } else {
      let amountInEther = mintPricePublic;
      setIsPricePublic(0);
      try {
        console.log("public");
        const options = {
          value: ethers.utils.parseEther(amountInEther),
          from: account,
        };
        await contract.mintNormal(
          "ipfs://" + MetaDataUrl.data.IpfsHash,
          options
        ); // tokenuri
        setMintLoading(false);
        handleCloseMintPopup();
        alertModal("Public Mint Success");
      } catch (error) {
        console.log(error);
        handleCloseMintPopup();
        alertModal(error.message);
      }
    }
    return false;
  };

  const handleOpenMintPopup = async () => {
    setMintPopup(true);

    const signer = new ethers.providers.Web3Provider(ethereum).getSigner();
    const contract = new ethers.Contract(contractAddress, contractABI, signer);
    const MintedToken = await contract.totalSupply();
    setTotalMinted(parseInt(MintedToken));

  };
  const handleCloseMintPopup = () => {
    setMintPopup(false);
  };

  return (
    <>
      <div className="connect-mint-wrap">
        {!connected ? (
          <Button
            variant="contained"
            startIcon={<AccountBalanceWalletIcon />}
            onClick={connectWallet}
          >
            Connect
          </Button>
        ) : (
          <>
            <Button
              variant="contained"
              startIcon={<ClearIcon />}
              onClick={disConnectWallet}
            >
              Disconnect
            </Button>
            <Button
              variant="contained"
              startIcon={<AddTaskIcon />}
              onClick={sendWhitelist}
            >
              Whitelist
            </Button>
            <Button
              variant="contained"
              startIcon={<GavelIcon />}
              onClick={handleOpenMintPopup}
            >
              Mint
            </Button>
            <p>{account ? account.slice(0, 13) + "..." : ""}</p>
          </>
        )}
        <Modal
          open={mintPopup}
          onClose={handleCloseMintPopup}
          aria-labelledby="child-modal-title"
          aria-describedby="child-modal-description"
        >
          <Box sx={{ ...style, border: 0 }}>
            {mintLoading && (
              <Box className="mint-loading">
                <Typography className="vh-centered">Minting Model</Typography>
              </Box>
            )}
            <Button onClick={handleCloseMintPopup} className="close-popup">
              <CloseIcon />
            </Button>
            <Typography variant="h6" style={{ marginTop: "-4px" }}>
              <GavelIcon className="title-icon" /> Mint Model
            </Typography>
            <div
              id="mint-screenshot-canvas-wrap"
              className={`canvas-wrap`}
              style={{
                height: 2080,
                width: 2080,
                zoom: 0.2,
                background: "#111111",
              }}
            >
              <Canvas
                className="canvas"
                id="screenshot-scene"
                gl={{ preserveDrawingBuffer: true }}
              >
                <spotLight
                  // ref={ref}
                  intensity={1}
                  position={[0, 3.5, 2]}
                  shadow-mapSize-width={2048}
                  shadow-mapSize-height={2048}
                  castShadow
                />
                <spotLight
                  // ref={ref}
                  intensity={0.2}
                  position={[-5, 2.5, 4]}
                  shadow-mapSize-width={2048}
                  shadow-mapSize-height={2048}
                  // castShadow
                />
                <spotLight
                  // ref={ref}
                  intensity={0.2}
                  position={[5, 2.5, 4]}
                  shadow-mapSize-width={2048}
                  shadow-mapSize-height={2048}
                  // castShadow
                />
                <spotLight
                  // ref={ref}
                  intensity={0.3}
                  position={[0, -2, -8]}
                  shadow-mapSize-width={2048}
                  shadow-mapSize-height={2048}
                  castShadow
                />
                <OrbitControls
                  minDistance={1.6}
                  maxDistance={1.6}
                  minPolarAngle={0}
                  maxPolarAngle={Math.PI / 2 - 0.1}
                  enablePan={false}
                  target={[0, 1, 0]}
                />
                <PerspectiveCamera>
                  {mintPopup && (
                    <TemplateModel nodes={modelNodes} scene={scene} />
                  )}
                </PerspectiveCamera>
              </Canvas>
            </div>
            <Button
              variant="contained"
              className="mint-model-button"
              onClick={generateMintFiles}
            >
              {isPricePublic ? (
                <React.Fragment>
                  MINT Model <br /> Whitelist
                  Price: {mintPrice} ETH | {totalMinted}/{totalToBeMinted} Remaining
                </React.Fragment>
              ) : (
                <React.Fragment>
                  MINT Model <br /> Public
                  Price: {mintPricePublic} ETH | {totalMinted}/{totalToBeMinted} Remaining
                </React.Fragment>
              )}
            </Button>
          </Box>
        </Modal>
      </div>
      {showAlert && (
        <Alert
          id="alertTitle"
          variant="filled"
          severity="success"
          action={
            <IconButton
              aria-label="close"
              color="inherit"
              size="small"
              onClick={() => {
                setShowAlert(false);
              }}
            >
              <CloseIcon fontSize="inherit" />
            </IconButton>
          }
          sx={{ mb: 2 }}
        >
          {alertTitle}
        </Alert>
      )}
    </>
  );
}
