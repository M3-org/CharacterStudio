import React from "react"

export const CameraMode = {
  NORMAL: "NORMAL",
  AR: "AR",
  AR_FRONT: "AR_FRONT",
  VR: "VR",
}

export const AppMode = {
  APPEARANCE: "APPEARANCE",
  CHAT: "CHAT",
  MINT: "MINT",
}

export const ViewContext = React.createContext()

export const ViewProvider = (props) => {
  const [currentCameraMode, setCurrentCameraMode] = React.useState(CameraMode.NORMAL)
  const [currentAppMode, setCurrentAppMode] = React.useState(AppMode.APPEARANCE)
  return (
    <ViewContext.Provider value={{
      currentCameraMode, setCurrentCameraMode,
      currentAppMode, setCurrentAppMode,
    }}>
      {props.children}
    </ViewContext.Provider>
  )
}
