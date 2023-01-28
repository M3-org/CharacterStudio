import React, { useEffect, useContext } from "react"
import { SceneContext } from './SceneContext'

export const CameraMode = {
  NORMAL: "NORMAL",
  AR: "AR",
  AR_FRONT: "AR_FRONT",
  VR: "VR",
}

export const ViewMode = {
  LANDING: "LANDING", // null
  CREATE: "CREATE", // null
  LOAD: "LOAD", // null
  APPEARANCE: "APPEARANCE", // center
  BIO: "BIO",  // left
  SAVE: "SAVE", // center
  MINT: "MINT", // left
  CHAT: "CHAT", // left
}

export const ViewContext = React.createContext()

export const ViewProvider = (props) => {
  const test = useContext(SceneContext)
  // debugger
  // const {moveCamera} = useContext(SceneContext);
  const [currentCameraMode, setCurrentCameraMode] = React.useState(CameraMode.NORMAL)
  const [viewMode, setViewMode] = React.useState(ViewMode.LANDING)
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
