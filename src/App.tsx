import React, { useEffect, useState } from "react"
import ReactDOM from "react-dom"

import CharacterEditor from "./components"
import { createTheme, Alert, IconButton } from "@mui/material"
import CloseIcon from "@mui/icons-material/Close";
import defaultTemplates from "./data/base_models"
import Landing from "./components/Landing";
import LoadingOverlayCircularStatic from "./components/LoadingOverlay"
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
  const [alerCharacterEditortTitle, setAlertTitle] = useState("");
  const [showAlert, setShowAlert] = useState(false);
  const [modelClass, setModelClass] = useState<number>(0)
  const [preModelClass, setPreModelClass] = useState<number>(0)
  const [loading, setLoading] = useState(false);
  const [end, setEnd] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);

  const handleConnect = (principalId) => {
    console.log("Logged in with principalId", principalId);
    // setPrincipalId(principalId);
    // setConnected(true);
  }

  const handleFail = (error) => {
    console.log("Failed to login with Plug", error);
  }

  useEffect(() => {
    if(modelClass) 
      setLoading(true)
  }, [modelClass])

  useEffect(() => {
    if(preModelClass) {
      setLoading(true)
      setModelClass(preModelClass)
    }
  }, [preModelClass])  

  return (
    <React.Fragment>
      {
        !end &&
        <div 
          className='backgroundImg'
          style = {{
              background : `url("/background.png") no-repeat center center fixed`,
              height: '100vh',
              width: '100vw',
              backgroundSize : 'cover',
              display : 'flex',
              flexDirection : 'column',
              alignItems : 'center',
              overflow : 'hidden',
              position: 'absolute',
              zIndex: 0,
          }}
        >
          <div className="backgroundBlur">

          </div>
        </div>
      }
      {
        loading && <div
          style={{
            
          }}
        >
          <LoadingOverlayCircularStatic
            loadingModelProgress={loadingProgress}
          />
        </div>
      }
      {
        !modelClass ? 
        <Landing 
          onSetModel = {
            (value) => {
              setPreModelClass(value)
              //setLoading(true)
            }
          }
        /> : 
        (
          <div
            style={{
              visibility: end ? '' : 'hidden'
            }}
          >
            <CharacterEditor 
                templates={defaultTemplates} 
                theme={defaultTheme} 
                setLoading={(value) => {
                  setLoading(false)
                  setEnd(true)
                }} 
                setLoadingProgress = {setLoadingProgress}
              />
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
            )
          }</div>
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
