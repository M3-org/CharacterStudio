import React from "react"

export const ViewStates = {
  INTRO: "INTRO",
  LANDER_LOADING: "LANDER_LOADING",
  LANDER: "LANDER",
  CREATOR_LOADING: "CREATOR_LOADING",
  CREATOR: "CREATOR",
  MINT_LOADING: "MINT_LOADING",
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
  BIO: "BIO",
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
