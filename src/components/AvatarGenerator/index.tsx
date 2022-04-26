import * as React from "react";
import logo from "../../assets/img/logo-dark.png";
import "./style.scss";
import Box from "@mui/material/Box";
import Stepper from "@mui/material/Stepper";
import Step from "@mui/material/Step";
import StepLabel from "@mui/material/StepLabel";
import { Avatar, Button, Grid, Stack, Typography } from "@mui/material";

const steps = ["Category", "Gender", "Start"];

function AvatarGenerator() {
  const [step, setStep] = React.useState<number>(0);
  const [category, setCategory] = React.useState<number>(0);
  const [gender, setGender] = React.useState<number>(0);
  return (
    <header className="avatar-generator-wrap">
      <img src={logo} alt="" className="logo" />
      <Box
        sx={{ maxWidth: 600, width: "100%" }}
        className="vh-centered wizard-wrap"
      >
        <Typography variant="h5" align="center" mb={1}>
          MINT YOUR METAVERSE AVATAR
        </Typography>
        <Typography align="center">Customise your own avatar.</Typography>
        <Typography align="center" mb={2}>
          Mint Price: .069 ETH
        </Typography>
        <Stepper activeStep={step} alternativeLabel>
          {steps.map((label) => (
            <Step key={label} color="secondary">
              <StepLabel></StepLabel>
            </Step>
          ))}
        </Stepper>
        {step === 0 && (
          <Box sx={{ maxWidth: 400, margin: "auto", marginTop: "36px" }}>
            <Grid container spacing={2} style={{ textAlign: "center" }}>
              <Grid xs={6}>
                <Typography mb={1}>I AM A DOM</Typography>
                <Avatar
                  className={
                    category && category === 1
                      ? "selection-avatar active"
                      : "selection-avatar"
                  }
                  src="/whip.png"
                  onClick={() => setCategory(1)}
                  sx={{ width: 120, height: 120 }}
                />
                <Typography mt={1}>1/5000 REMAINING</Typography>
              </Grid>
              <Grid xs={6}>
                <Typography mb={1}>I AM A SUB</Typography>
                <Avatar
                  className={
                    category && category === 2
                      ? "selection-avatar active"
                      : "selection-avatar"
                  }
                  src="/handcufs.png"
                  onClick={() => setCategory(2)}
                  sx={{ width: 120, height: 120 }}
                />
                <Typography mt={1}>99/5000 REMAINING</Typography>
              </Grid>
            </Grid>
            <Box mt={2}>
              <Button
                className="button"
                disabled={category ? false : true}
                variant="contained"
                onClick={() => setStep(step + 1)}
              >
                Continue
              </Button>
            </Box>
          </Box>
        )}
        {step === 1 && (
          <Box sx={{ maxWidth: 400, margin: "auto", marginTop: "36px" }}>
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
            <Box mt={2}>
              <Button
                className="button"
                disabled={gender ? false : true}
                variant="contained"
                onClick={() => setStep(step + 1)}
              >
                Continue
              </Button>
            </Box>
          </Box>
        )}
        {step === 2 && (
          <Box sx={{ maxWidth: 400, margin: "auto", marginTop: "36px" }}>
              <Typography variant="h5" align="center" mb={1}>
                That's it, start customizing your avatar!
              </Typography>
              <Typography align="center">Press "Start" to begin.</Typography>
            <Box mt={2}>
              <Button
                className="button"
                variant="contained"
                onClick={() => setStep(step + 1)}
              >
                Start
              </Button>
            </Box>
          </Box>
        )}
      </Box>
    </header>
  );
}

export default AvatarGenerator;
