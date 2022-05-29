import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
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
import { ethers } from "ethers";
import { contractAddress, contractABI } from "../../library/contract";
import Alert from "@mui/material/Alert";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import { useGlobalState } from "../GlobalProvider";
import { apiService } from "../../services/api";
import { Modal, Typography } from "@mui/material";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, PerspectiveCamera } from "@react-three/drei";
import { TemplateModel } from "../Scene/models";
import { Box } from "@mui/system";
import "./style.scss";
import { threeService } from "../../services";
const style = {
    position: "absolute",
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
    const { ethereum } = window;
    const { activate, deactivate, library, account } = useWeb3React();
    const { avatarCategory, modelNodes, mintPopup, setMintPopup, scene, mintPrice, mintPricePublic, totalMinted, setTotalMinted, gender, totalToBeMinted, hair, face, tops, arms, neck, bottoms, shoes, legs, accessories } = useGlobalState();
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
        }
        catch (ex) {
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
        }
        catch (ex) {
            console.log(ex);
            alertModal(ex.message);
        }
    };
    const alertModal = async (msg) => {
        setAlertTitle(msg);
        setShowAlert(true);
        setTimeout(() => {
            setShowAlert(false);
        }, 4000);
    };
    const sendWhitelist = async () => {
        try {
            const message = ethers.utils.solidityKeccak256(["address", "address"], [contractAddress, account]);
            const arrayifyMessage = ethers.utils.arrayify(message);
            const flatSignature = await library
                .getSigner()
                .signMessage(arrayifyMessage);
            const response = await axios.post(`${API_URL}/new-request`, {
                signature: flatSignature,
                address: account,
            });
            alertModal(response.data.msg);
        }
        catch (ex) {
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
        const glburl = await apiService.saveFileToPinata(formData);
        /// ---------- .jpg (screenshot) -------------- ////////////////
        const jpgformData = new FormData();
        jpgformData.append("profile", screenshot);
        const jpgurl = await apiService.saveFileToPinata(jpgformData);
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
                },
                {
                    trait_type: "Hair",
                    value: hair?.traitInfo ? hair?.traitInfo?.name : "None"
                },
                {
                    trait_type: "Face",
                    value: face?.traitInfo ? face?.traitInfo?.name : "None"
                },
                {
                    trait_type: "Neck",
                    value: neck?.traitInfo ? neck?.traitInfo?.name : "None"
                },
                {
                    trait_type: "Tops",
                    value: tops?.traitInfo ? tops?.traitInfo?.name : "None"
                },
                {
                    trait_type: "Arms",
                    value: arms?.traitInfo ? arms?.traitInfo?.name : "None"
                },
                {
                    trait_type: "Legs",
                    value: legs?.traitInfo ? legs?.traitInfo?.name : "None"
                },
                {
                    trait_type: "Bottoms",
                    value: bottoms?.traitInfo ? bottoms?.traitInfo?.name : "None"
                },
                {
                    trait_type: "Shoes",
                    value: shoes?.traitInfo ? shoes?.traitInfo?.name : "None"
                },
                {
                    trait_type: "Accessories",
                    value: accessories?.traitInfo ? accessories?.traitInfo?.name : "None"
                }
            ]
        };
        const MetaDataUrl = await apiService.saveMetaDataToPinata(metadata);
        console.log(MetaDataUrl);
        //////////////////////////////////////////////////////
        const signer = new ethers.providers.Web3Provider(ethereum).getSigner();
        const contract = new ethers.Contract(contractAddress, contractABI, signer);
        const responseUser = await axios.get(`${API_URL}/get-signature?address=${account}`);
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
                const res = await contract.mintWhiteList("ipfs://" + MetaDataUrl.data.IpfsHash, responseUser.data.signature, options); // tokenuri, signature
                setMintLoading(false);
                handleCloseMintPopup();
                alertModal("Whitelist Mint Success");
            }
            catch (error) {
                console.log(error);
                handleCloseMintPopup();
                // alertModal(error.message);
                alertModal("Whitelist Mint Failed");
            }
        }
        else {
            let amountInEther = mintPricePublic;
            setIsPricePublic(0);
            try {
                console.log("public");
                const options = {
                    value: ethers.utils.parseEther(amountInEther),
                    from: account,
                };
                await contract.mintNormal("ipfs://" + MetaDataUrl.data.IpfsHash, options); // tokenuri
                setMintLoading(false);
                handleCloseMintPopup();
                alertModal("Public Mint Success");
            }
            catch (error) {
                console.log(error);
                handleCloseMintPopup();
                // alertModal(error.message);
                alertModal("Public Mint Failed");
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
    return (_jsxs(_Fragment, { children: [_jsxs("div", { className: "connect-mint-wrap", children: [!connected ? (_jsx(Button, { variant: "contained", startIcon: _jsx(AccountBalanceWalletIcon, {}), onClick: connectWallet, children: "Connect" })) : (_jsxs(_Fragment, { children: [_jsx(Button, { variant: "contained", startIcon: _jsx(ClearIcon, {}), onClick: disConnectWallet, children: "Disconnect" }), _jsx(Button, { variant: "contained", startIcon: _jsx(AddTaskIcon, {}), onClick: sendWhitelist, children: "Whitelist" }), _jsx(Button, { variant: "contained", startIcon: _jsx(GavelIcon, {}), onClick: handleOpenMintPopup, children: "Mint" }), _jsx("p", { children: account ? account.slice(0, 13) + "..." : "" })] })), _jsx(Modal, { open: mintPopup, onClose: handleCloseMintPopup, "aria-labelledby": "child-modal-title", "aria-describedby": "child-modal-description", children: _jsxs(Box, { sx: { ...style, border: 0 }, children: [mintLoading && (_jsx(Box, { className: "mint-loading", children: _jsx(Typography, { className: "vh-centered", children: "Minting Model" }) })), _jsx(Button, { onClick: handleCloseMintPopup, className: "close-popup", children: _jsx(CloseIcon, {}) }), _jsxs(Typography, { variant: "h6", style: { marginTop: "-4px" }, children: [_jsx(GavelIcon, { className: "title-icon" }), " Mint Model"] }), _jsx("div", { id: "mint-screenshot-canvas-wrap", className: `canvas-wrap`, style: {
                                        height: 2080,
                                        width: 2080,
                                        zoom: 0.2,
                                        background: "#111111",
                                    }, children: _jsxs(Canvas, { className: "canvas", id: "screenshot-scene", gl: { preserveDrawingBuffer: true }, children: [_jsx("spotLight", { 
                                                // ref={ref}
                                                intensity: 1, position: [0, 3.5, 2], "shadow-mapSize-width": 2048, "shadow-mapSize-height": 2048, castShadow: true }), _jsx("spotLight", { 
                                                // ref={ref}
                                                intensity: 0.2, position: [-5, 2.5, 4], "shadow-mapSize-width": 2048, "shadow-mapSize-height": 2048 }), _jsx("spotLight", { 
                                                // ref={ref}
                                                intensity: 0.2, position: [5, 2.5, 4], "shadow-mapSize-width": 2048, "shadow-mapSize-height": 2048 }), _jsx("spotLight", { 
                                                // ref={ref}
                                                intensity: 0.3, position: [0, -2, -8], "shadow-mapSize-width": 2048, "shadow-mapSize-height": 2048, castShadow: true }), _jsx(OrbitControls, { minDistance: 1.6, maxDistance: 1.6, minPolarAngle: 0, maxPolarAngle: Math.PI / 2 - 0.1, enablePan: false, target: [0, 1, 0] }), _jsx(PerspectiveCamera, { children: mintPopup && (_jsx(TemplateModel, { nodes: modelNodes, scene: scene })) })] }) }), _jsx(Button, { variant: "contained", className: "mint-model-button", onClick: generateMintFiles, children: isPricePublic ? (_jsxs(React.Fragment, { children: ["MINT Model ", _jsx("br", {}), " Whitelist Price: ", mintPrice, " ETH | ", totalMinted, "/", totalToBeMinted, " Remaining"] })) : (_jsxs(React.Fragment, { children: ["MINT Model ", _jsx("br", {}), " Public Price: ", mintPricePublic, " ETH | ", totalMinted, "/", totalToBeMinted, " Remaining"] })) })] }) })] }), showAlert && (_jsx(Alert, { id: "alertTitle", variant: "filled", severity: "success", action: _jsx(IconButton, { "aria-label": "close", color: "inherit", size: "small", onClick: () => {
                        setShowAlert(false);
                    }, children: _jsx(CloseIcon, { fontSize: "inherit" }) }), sx: { mb: 2 }, children: alertTitle }))] }));
}
