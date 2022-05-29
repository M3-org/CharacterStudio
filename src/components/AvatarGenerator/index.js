import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React, { useEffect } from "react";
import "./style.scss";
import { Avatar, Button, Grid, Typography } from "@mui/material";
import { useGlobalState } from "../GlobalProvider";
import CharacterEditor from "../CharacterEditor";
import { ethers } from "ethers";
import { contractAddress, contractABI } from "../../library/contract";
import templates from "../../data/base_models.json";
const steps = ["Category", "Gender", "Start"];
function AvatarGenerator() {
    const [step, setStep] = React.useState(0);
    const { avatarCategory, setAvatarCategory, setTotalMinted, mintPrice, mintPricePublic, gender, setGender, template, setTemplate, } = useGlobalState();
    const [editAvatar, setEditAvatar] = React.useState(0);
    const { ethereum } = window;
    useEffect(() => {
        //getMintedToken();
    });
    const getMintedToken = async () => {
        // const signer = new ethers.providers.Web3Provider(ethereum).getSigner("0xB565D3A7Bcf568f231726585e0b84f9E2a3722dB");
        // const contract = new ethers.Contract(contractAddress, contractABI, signer);
        const provider = new ethers.providers.Web3Provider(ethereum);
        await provider.send("eth_requestAccounts", []); // <- this promps user to connect metamask
        const signer = provider.getSigner();
        const contract = new ethers.Contract(contractAddress, contractABI, signer);
        const MintedToken = await contract.totalSupply();
        setTotalMinted(parseInt(MintedToken));
    };
    if (editAvatar) {
        return _jsx(CharacterEditor, {});
    }
    else {
        return (_jsx("header", { className: "avatar-generator-wrap", children: _jsxs("div", { className: "vh-centered wizard-wrap", children: [_jsx(Typography, { variant: "h5", align: "center", mb: 1, children: "MINT YOUR METAVERSE AVATAR" }), _jsx(Typography, { align: "center", children: "Customise your own avatar." }), _jsxs(Typography, { align: "center", mb: 2, children: ["Public Mint Price: ", mintPricePublic, " ETH | WL Mint Price:", " ", mintPrice, " ETH"] }), _jsx(Typography, { align: "center", variant: "h6", mb: 2, children: "Select a Template To Start" }), _jsxs("div", { className: "step-content", children: [_jsx(Grid, { container: true, spacing: 2, style: { textAlign: "center" }, children: templates &&
                                    templates.length > 0 &&
                                    templates.map((temp, index) => {
                                        return (_jsxs(Grid, { xs: 3, children: [_jsx(Typography, { mb: 1, children: temp?.name }), _jsx(Avatar, { className: template && template === temp?.id
                                                        ? "selection-avatar active"
                                                        : "selection-avatar", src: temp?.thumbnail, onClick: () => setTemplate(temp?.id) })] }, index));
                                    }) }), _jsx(Button, { className: "button", variant: "contained", onClick: () => setEditAvatar(1), disabled: !template && true, children: "Start" })] })] }) }));
    }
}
export default AvatarGenerator;
