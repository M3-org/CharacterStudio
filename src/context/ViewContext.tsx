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

export type ViewContextType = {
  viewMode:string,
  setViewMode:(viewMode:string)=>void,
  isLoading:boolean,
  setIsLoading:(isLoading:boolean)=>void,
  mouseIsOverUI:boolean,
  setMouseIsOverUI:(mouseIsOverUI:boolean)=>void,
  currentCameraMode:string,
  setCurrentCameraMode:(currentCameraMode:string)=>void
}

export const ViewContext = React.createContext({
  viewMode: ViewMode.LANDING,
  setViewMode: (viewMode:string) => {},
  isLoading: false,
  setIsLoading: (isLoading:boolean) => {},
  mouseIsOverUI: false,
  setMouseIsOverUI: (mouseIsOverUI:boolean) => {},
  currentCameraMode: 'NORMAL',
  setCurrentCameraMode: (currentCameraMode:string) => {}
} as ViewContextType)

export const ViewProvider = ({children}:{children?:React.ReactNode}) => {
  const [currentCameraMode, setCurrentCameraMode] = React.useState(CameraMode.NORMAL)
  const [viewMode, setViewMode] = React.useState(ViewMode.LANDING)
  const [isLoading, setIsLoading] = React.useState(false)
  const [mouseIsOverUI, setMouseIsOverUI] = React.useState(false)
  
  return (
    <ViewContext.Provider value={{
      viewMode, 
      setViewMode,
      isLoading, 
      setIsLoading,
      mouseIsOverUI, 
      setMouseIsOverUI,
      currentCameraMode, 
      setCurrentCameraMode,
    }}>
      {children}
    </ViewContext.Provider>
  )
}