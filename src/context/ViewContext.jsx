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
  const [loading, setLoading] = React.useState(true)
  return (
    <ViewContext.Provider value={{
      currentCameraMode, setCurrentCameraMode,
      currentAppMode, setCurrentAppMode,
      loading, setLoading
    }}>
      {props.children}
    </ViewContext.Provider>
  )
}
