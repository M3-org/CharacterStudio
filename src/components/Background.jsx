import React from "react"
import backgroundImg from "../../public/ui/background.png"

export default function () {
  return (
    <div
      className="backgroundImg"
      style={{
        backgroundImage: `url(${backgroundImg})`,
        backgroundAttachment: "fixed",
        backgroundRepeat: "no-repeat",
        backgroundPosition: "center center",
        height: "100vh",
        width: "100vw",
        backgroundSize: "cover",
        display: "fixed",
        flexDirection: "column",
        alignItems: "center",
        overflow: "hidden",
        position: "absolute",
        zIndex: -1,
      }}
    >
      <div className="backgroundBlur"></div>
    </div>
  )
}
