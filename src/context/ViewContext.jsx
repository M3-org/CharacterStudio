import React from "react"

export const CameraMode = {
  NORMAL: "NORMAL",
  AR: "AR",
  AR_FRONT: "AR_FRONT",
  VR: "VR",
}

export const ViewMode = {
  LANDING: "LANDING",
  CREATE: "CREATE",
  CLAIM: "CLAIM",
  LOAD: "LOAD",
  APPEARANCE: "APPEARANCE",
  BATCHDOWNLOAD: "BATCHDOWNLOAD",
  SAVE: "SAVE",
  MINT: "MINT",
  OPTIMIZER: "OPTIMIZER",
  BATCHMANIFEST: "BATCHMANIFEST",
  WALLET: "WALLET"
}

export const ViewContext = React.createContext()

export const ViewProvider = (props) => {
  const [currentCameraMode, setCurrentCameraMode] = React.useState(CameraMode.NORMAL)
  const [viewMode, setViewMode] = React.useState(ViewMode.LANDING)
  const [isLoading, setIsLoading] = React.useState(false)
  const [mouseIsOverUI, setMouseIsOverUI] = React.useState(false)
  
  return (
    <ViewContext.Provider value={{
      viewMode, setViewMode,
      isLoading, setIsLoading,
      mouseIsOverUI, setMouseIsOverUI,
      currentCameraMode, setCurrentCameraMode,
    }}>
      {props.children}
    </ViewContext.Provider>
  )
}