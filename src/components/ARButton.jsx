import React, { useContext } from "react"
import { ViewStates, ViewContext, CameraMode } from "../context/ViewContext"
import styles from './ARButton.module.css'

export default function ARButton() {
  const {currentView, currentCameraMode, setCurrentCameraMode} = useContext(ViewContext)

  return currentView === ViewStates.CREATOR && (
      <div className={`${styles['SquareButton']} ${currentCameraMode === CameraMode.AR ? styles['AROff'] : styles['AROn']}`}
        onClick={() => {
          if (currentCameraMode === CameraMode.AR) setCurrentCameraMode(CameraMode.NORMAL);
          else setCurrentCameraMode(CameraMode.AR);
        }}
      />
  )
}
