import React from "react"

export const CameraMode = {
  NORMAL: "NORMAL",
  AR: "AR",
  AR_FRONT: "AR_FRONT",
  VR: "VR",
}

export const ViewMode = {
  LANDING: "LANDING",
  LOAD: "LOAD",
  APPEARANCE: "APPEARANCE",
  BIO: "BIO",
  SAVE: "SAVE",
  MINT: "MINT",
  CHAT: "CHAT",
}

export const ViewContext = React.createContext()

export const ViewProvider = (props) => {
  const [currentCameraMode, setCurrentCameraMode] = React.useState(CameraMode.NORMAL)
  const [viewMode, setViewMode] = React.useState(ViewMode.APPEARANCE)
  const [loading, setLoading] = React.useState(true)
  const [mouseIsOverUI, setMouseIsOverUI] = React.useState(false)
  return (
    <ViewContext.Provider value={{
      currentCameraMode, setCurrentCameraMode,
      viewMode, setViewMode,
      loading, setLoading,
      mouseIsOverUI, setMouseIsOverUI
    }}>
      {props.children}
    </ViewContext.Provider>
  )
}
