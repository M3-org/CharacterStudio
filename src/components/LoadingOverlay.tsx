import React from "react"
import CircularProgress, {
  CircularProgressProps,
} from "@mui/material/CircularProgress"
import Typography from "@mui/material/Typography"
import Box from "@mui/material/Box"
import { useSpring, animated } from "react-spring"
import Lottie from "lottie-react"
import lottie from "../data/lottie.json"
import webaMark from "../ui/loading/webaMark.svg"
import { LoadingStyleBox } from "../styles/LoadingOverlaystyle"

function CircularProgressWithLabel(
  props: CircularProgressProps & {
    value: number
    background: boolean
    title: string
  },
) {
  const [loadingAnimation, setLoadingAnimation] = useSpring(() => ({
    from: { y: 100, opacity: 0 },
    to: { y: 0, opacity: 1 },
  }))

  return (
    <LoadingStyleBox
      className="loading-container"
      backgroundActive={props.background}
      loadedValue = {props.value}
    >
      <span className = "loading-text" >
        {props.title}
      </span>
      <animated.div style={{ ...loadingAnimation }}>
        <div className="vh-centered">
          {/*<CircularProgress/>*/}
          <div className="cover-loadingbar">
            <div className="loading-bar" >
            </div>
          </div>
        </div>
      </animated.div>
      <Lottie
        style={{
          zIndex: "-999",
          position: "absolute",
          height: "80vh",
        }}
        animationData={lottie}
        loop={true}
      />
      <div className = "logo-container">
        <animated.div style={{ ...loadingAnimation }}>
          <img className="webamark"
            src={webaMark}
          />
        </animated.div>
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
