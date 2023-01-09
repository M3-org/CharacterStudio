import React from "react"

export const ViewStates = {
  INTRO: "INTRO",
  LANDER: "LANDER",
  CREATOR: "CREATOR",
  MINT: "MINT",
  MINT_CONFIRM: "MINT_CONFIRM",
  MINT_COMPLETE: "MINT_COMPLETE"
}

export const CameraMode = {
  NORMAL: "NORMAL",
  AR: "AR",
  AR_FRONT: "AR_FRONT",
  VR: "VR",
}

export const AppMode = {
  APPEARANCE: "APPEARANCE",
  CHAT: "CHAT",
}

export const ViewContext = React.createContext()

export const ViewProvider = (props) => {
  const [currentView, setCurrentView] = React.useState(ViewStates.INTRO)
  const [currentCameraMode, setCurrentCameraMode] = React.useState(CameraMode.NORMAL)
  const [currentAppMode, setCurrentAppMode] = React.useState(AppMode.APPEARANCE)
  return (
    <ViewContext.Provider value={{
      currentView, setCurrentView,
      currentCameraMode, setCurrentCameraMode,
      currentAppMode, setCurrentAppMode,
    }}>
      {props.children}
    </ViewContext.Provider>
  )
}
