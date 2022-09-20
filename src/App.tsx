import React, { useEffect, useState } from "react"
import ReactDOM from "react-dom"

import CharacterEditor from "./components"
import { createTheme, Alert, IconButton } from "@mui/material"
import CloseIcon from "@mui/icons-material/Close";
import defaultTemplates from "./data/base_models"
import { PlugWallet } from './ic/PlugWallet';
import { Mint } from "./ic/Mint";

import "./ic/style.scss";

const defaultTheme = createTheme({
  palette: {
    mode: "dark",
    primary: {
      main: "#de2a5e",
    },
  },
})

function App() {
  const [alertTitle, setAlertTitle] = useState("");
  const [showAlert, setShowAlert] = useState(false);

  const handleConnect = (principalId) => {
    console.log("Logged in with principalId", principalId);
    // setPrincipalId(principalId);
    // setConnected(true);
  }

  const handleFail = (error) => {
    console.log("Failed to login with Plug", error);
  }

  return (
    <>
      <CharacterEditor templates={defaultTemplates} theme={defaultTheme} />
      <div className="connect-mint-wrap">
        <PlugWallet onConnect={handleConnect} onFail={handleFail}>
          <Mint
            onSuccess={(callback) => {
              setShowAlert(true)
              setAlertTitle("Mint Successful. View here: " + callback)
            }}
          />
        </PlugWallet>
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
                setShowAlert(false)
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
  )
}

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById("root"),
)
