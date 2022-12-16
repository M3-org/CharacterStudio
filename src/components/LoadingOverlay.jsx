import React from "react"
import webaMark from "../ui/loading/webaMark.svg"
import { LoadingStyleBox } from "../styles/LoadingOverlaystyle"

function CircularProgressWithLabel({background, value, title}) {
  return (
    <LoadingStyleBox
      className="loading-container"
      backgroundActive={background}
      loadedValue = {value}
    >
      <span className = "loading-text" >
        {title}
      </span>
        <div className="vh-centered">
          <div className="cover-loadingbar">
            <div className="loading-bar" >
            </div>
          </div>
        </div>
      <div className = "logo-container">
          <img className="webamark"
            src={webaMark}
          />
        <div className="logo-gradient"></div>
      </div>
    </LoadingStyleBox>
  )
}

export default function LoadingOverlayCircularStatic({
  loadingModelProgress,
  background = null,
  title = "Loading"
}) {
  return (
    <CircularProgressWithLabel
      value={loadingModelProgress}
      background={background}
      title = {title}
    />
  )
}
