import React, { useEffect } from "react";
import "./style.scss";
import Box from "@mui/material/Box";
import Stepper from "@mui/material/Stepper";
import Step from "@mui/material/Step";
import StepLabel from "@mui/material/StepLabel";
import { Avatar, Button, Grid, Stack, Typography } from "@mui/material";
import { NavLink } from "react-router-dom";
import { useGlobalState } from "../GlobalProvider";
import CharacterEditor from "../CharacterEditor";
import { ethers, BigNumber } from "ethers";
import { contractAddress, contractABI } from "../../library/contract";


function AvatarGenerator() {
  const [step, setStep] = React.useState<number>(0);
  const {
    setTotalMinted,
    mintPrice,
    mintPricePublic,
    template,
    setTemplate,
  }: any = useGlobalState();
  const [editAvatar, setEditAvatar] = React.useState<number>(0);
  const { ethereum }: any = window;

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
    return <CharacterEditor />;
  } else {
    return (
      <header className="avatar-generator-wrap">
        <div className="vh-centered wizard-wrap">
          <Typography variant="h5" align="center" mb={1}>
            MINT YOUR METAVERSE AVATAR
          </Typography>
          <Typography align="center">Customise your own avatar.</Typography>
          <Typography align="center" mb={2}>
            Public Mint Price: {mintPricePublic} ETH | WL Mint Price:{" "}
            {mintPrice} ETH
          </Typography>
          <Typography align="center" variant="h6" mb={2}>
            Select a Template To Start
          </Typography>
          <div className="step-content">

            <Button
              className="button"
              variant="contained"
              onClick={() => setEditAvatar(1)}
              disabled={!template && true}
            >
              Start
            </Button>
          </div>
        </div>
      </header>
    );
  }
}

export default AvatarGenerator;
