import React, { useEffect, useState } from "react"
import ReactDOM from "react-dom"

import CharacterEditor from "./components"
import { createTheme, Alert, IconButton } from "@mui/material"
import CloseIcon from "@mui/icons-material/Close";
import defaultTemplates from "./data/base_models"
import Landing from "./components/Landing";
import '.././src/styles/landing.scss'
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
  const [modelClass, setModelClass] = useState<number>(0)

  const handleConnect = (principalId) => {
    console.log("Logged in with principalId", principalId);
    // setPrincipalId(principalId);
    // setConnected(true);
  }

  const handleFail = (error) => {
    console.log("Failed to login with Plug", error);
  }

  return (
    <React.Fragment>
      {
        !modelClass ? 
        <Landing 
          onSetModel = {
            (value) => setModelClass(value)
          }
        /> : 
        (<><CharacterEditor templates={defaultTemplates} theme={defaultTheme} />
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
          )}</>
        )
      }
    </React.Fragment>
  )
}

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById("root"),
)
