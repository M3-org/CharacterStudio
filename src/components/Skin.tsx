import { display } from "html2canvas/dist/types/css/property-descriptors/display"
import React from "react"
import { sceneService } from "../services"

function Skin({ scene, templateInfo }) {
  const container = {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
    margin: "0.5rem 0"
  }

  const btn = {
    width: "4rem",
    height: "4rem",
    borderRadius: "50%",
    marginRight: "1rem",
    cursor: "pointer",
    border: "1px solid rgb(90, 93, 121)",
  }
  const handleChangeSkin = (value: string) => {
    for (const bodyTarget of templateInfo.bodyTargets) {
      sceneService.setMaterialColor(scene, value, bodyTarget)
    }
  }
  return (
    <div style={{ ...container }}>
      <button
        style={{
          ...btn,
          backgroundColor: "rgb(255, 207, 161)",
        }}
        onClick={() => handleChangeSkin("rgb(255, 207, 161)")}
      ></button>
      <button
        style={{
          ...btn,
          backgroundColor: "rgb(255, 199, 153)",
        }}
        onClick={() => handleChangeSkin("rgb(255, 199, 153)")}
      ></button>
      <button
        style={{
          ...btn,
          backgroundColor: "rgb(255, 191, 145)",
        }}
        onClick={() => handleChangeSkin("rgb(255, 191, 145)")}
      ></button>
      <button
        style={{
          ...btn,
          backgroundColor: "rgb(255, 183, 137)",
        }}
        onClick={() => handleChangeSkin("rgb(255, 183, 137)")}
      ></button>
      <button
        style={{
          ...btn,
          backgroundColor: "rgb(247, 175, 129)",
        }}
        onClick={() => handleChangeSkin("rgb(247, 175, 129)")}
      ></button>
      <button
        style={{
          ...btn,
          backgroundColor: "rgb(231, 159, 113)",
        }}
        onClick={() => handleChangeSkin("rgb(231, 159, 113)")}
      ></button>
      <button
        style={{
          ...btn,
          backgroundColor: "rgb(187, 129, 91)",
        }}
        onClick={() => handleChangeSkin("rgb(187, 129, 91)")}
      ></button>
      <button
        style={{
          ...btn,
          backgroundColor: "rgb(165, 114, 81)",
        }}
        onClick={() => handleChangeSkin("rgb(165, 114, 81)")}
      ></button>
      <button
        style={{
          ...btn,
          backgroundColor: "rgb(144, 99, 70)",
        }}
        onClick={() => handleChangeSkin("rgb(144, 99, 70)")}
      ></button>
      <button
        style={{
          ...btn,
          backgroundColor: "rgb(122, 84, 59)",
        }}
        onClick={() => handleChangeSkin("rgb(122, 84, 59)")}
      ></button>
      <button
        style={{
          ...btn,
          backgroundColor: "rgb(100, 69, 49)",
        }}
        onClick={() => handleChangeSkin("rgb(100, 69, 49)")}
      ></button>
    </div>
  )
}

export default Skin
