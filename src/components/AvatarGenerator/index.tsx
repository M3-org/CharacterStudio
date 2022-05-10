import React, { useEffect } from "react";
import logo from "../../assets/media/logo-dark.png";
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

const steps = ["Category", "Gender", "Start"];

function AvatarGenerator() {
  const [step, setStep] = React.useState<number>(0);
  const {
    avatarCategory,
    setAvatarCategory,
    totalMintedDom,
    setTotalMintedDom,
    totalMintedSub,
    setTotalMintedSub,
    totalToBeMintedDom,
    totalToBeMintedSub,
    mintPrice,
    mintPricePublic,
    gender,
    setGender
  }: any = useGlobalState();
  const [editAvatar, setEditAvatar] = React.useState<number>(0);
  const { ethereum }: any = window;

  useEffect(() => {
    getMintedToken();
  });

  const getMintedToken = async () => {
    const signer = new ethers.providers.Web3Provider(ethereum).getSigner();
    const contract = new ethers.Contract(contractAddress, contractABI, signer);
    const domMintedToken = await contract._currentIndex(BigNumber.from(0).toNumber())
    const subMintedToken = await contract._currentIndex(BigNumber.from(1).toNumber())
    setTotalMintedDom(5001 - parseInt(domMintedToken))
    setTotalMintedSub(10001 - parseInt(subMintedToken))
  }

  if (editAvatar) {
    return <CharacterEditor />;
  } else {
    return (
      <header className="avatar-generator-wrap">
        <img src={logo} alt="" className="logo" />
        <div className="vh-centered wizard-wrap">
          <Typography variant="h5" align="center" mb={1}>
            MINT YOUR METAVERSE AVATAR
          </Typography>
          <Typography align="center">Customise your own avatar.</Typography>
          <Typography align="center" mb={2}>
            Public Mint Price: {mintPricePublic} ETH | WL Mint Price:{" "}
            {mintPrice} ETH
          </Typography>
          <Stepper activeStep={step} alternativeLabel>
            {steps.map((label) => (
              <Step key={label} color="secondary">
                <StepLabel></StepLabel>
              </Step>
            ))}
          </Stepper>
          {step === 0 && (
           
           <div className="step-content">
           <Grid container spacing={2} style={{ textAlign: "center" }}>
             <Grid xs={6}>
               <Typography mb={1}>MALE AVATAR</Typography>
               <Avatar
                 className={
                   gender && gender === 1
                     ? "selection-avatar active"
                     : "selection-avatar"
                 }
                 src="/male.png"
                 onClick={() => setGender(1)}
                 sx={{ width: 120, height: 120 }}
               />
             </Grid>
             <Grid xs={6}>
               <Typography mb={1}>FEMALE AVATAR</Typography>
               <Avatar
                 className={
                   gender && gender === 2
                     ? "selection-avatar active"
                     : "selection-avatar"
                 }
                 src="/female.png"
                 onClick={() => setGender(2)}
                 sx={{ width: 120, height: 120 }}
               />
             </Grid>
           </Grid>
           <Button
             className="button"
             disabled={gender ? false : true}
             variant="contained"
             onClick={() => setStep(step + 1)}
           >
             Continue
           </Button>
         </div>
          )}
          {step === 1 && (
             <div className="step-content">
             <Grid container spacing={2} style={{ textAlign: "center" }}>
               <Grid xs={6}>
                 <Typography mb={1}>MUSCULAR</Typography>
                 <Avatar
                   className={
                     avatarCategory && avatarCategory === 1
                       ? "selection-avatar active"
                       : "selection-avatar"
                   }
                   src="/whip.png"
                   onClick={() => setAvatarCategory(1)}
                   sx={{ width: 120, height: 120 }}
                 />
               </Grid>
               <Grid xs={6}>
                 <Typography mb={1}>THIN</Typography>
                 <Avatar
                   className={
                     avatarCategory && avatarCategory === 2
                       ? "selection-avatar active"
                       : "selection-avatar"
                   }
                   src="/handcufs.png"
                   onClick={() => setAvatarCategory(2)}
                   sx={{ width: 120, height: 120 }}
                 />
               </Grid>
             </Grid>
             <Button
               className="button"
               disabled={avatarCategory ? false : true}
               variant="contained"
               onClick={() => setStep(step + 1)}
             >
               Continue
             </Button>
           </div>
          )}
          {step === 2 && (
            <div className="step-content">
              <Typography variant="h5" align="center" mb={1}>
                That's it, start customizing your avatar!
              </Typography>
              <Typography align="center">Press "Start" to begin.</Typography>
                <Button className="button" variant="contained" onClick={() => setEditAvatar(1)}>
                  Start
                </Button>
            </div>
          )}
        </div>
      </header>
    );
  }
}

export default AvatarGenerator;
