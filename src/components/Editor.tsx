import { Avatar } from "@mui/material"
import Divider from "@mui/material/Divider"
import Stack from "@mui/material/Stack"
import React, { useEffect, useState, useRef } from "react"

export default function Editor(props: any) {
  const { category, setCategory }: any = props
  const [isModal, setModal] = useState(false)

  const selectorButton = {
    color: "#999999",
    fontSize: "12px",
    minWidth: "60px",
    cursor: "pointer",
    opacity : "1"
  }

  const selectorButtonActive = {
    color: "#666666",
    fontSize: "12px",
    minWidth: "60px",
    cursor: "pointer",
    opacity : "0.2"

  }

  const selectorButtonIcon = {
    display: "inline-block",
    width: "40px",
    height: "56px",
    padding: "2px",
  }

  const setShowModal = () => {
    setModal(!isModal)
  }

  const handleRandom = () => {
    props.random();
  }

  return (
    <div
      style={{
        position: "absolute",
        left: "50px",
        top: "10%",
        width: "100px",
        backgroundColor: "rgba(23, 22, 31, 0.35)",
        border: "1px solid #38404E",
        borderRadius : '5px',
        padding: "14px 0",
        backdropFilter: 'blur(22.5px)',
        boxSizing : 'border-box',
        transform: 'perspective(400px) rotateY(5deg)'
      }}
    >
      <Stack
        direction="column"
        divider={<Divider orientation="vertical" flexItem />}
        spacing={1}
        justifyContent="center"
        alignItems="center"
      >
        <div
        >
          <Avatar style={selectorButtonIcon} src={"/traits/webaMark 1.png"} />
        </div>

        <div
          onClick={() => setCategory("gender")}
          style={
            category && category === "gender"
              ? selectorButton
              : selectorButtonActive
          }
        >
          <Avatar style={selectorButtonIcon} src={"/traits/body.png"} />
        </div>
        <div
          onClick={() => setCategory("color")}
          style={
            category && category === "color"
              ? selectorButton
              : selectorButtonActive
          }
        >
          <Avatar style={selectorButtonIcon} src={"/traits/skin-color.png"} />
        </div>
        <div
          onClick={() => setCategory("head")}
          style={
            category && category === "head"
              ? selectorButton
              : selectorButtonActive
          }
        >
          <Avatar style={selectorButtonIcon} src={"/traits/hairStyle.png"} />
        </div>

        <div
          onClick={() => setCategory("chest")}
          style={
            category && category === "chest"
              ? selectorButton
              : selectorButtonActive
          }
        >
          <Avatar style={selectorButtonIcon} src={"/traits/torso.png"} />
        </div>
        <div
          onClick={() => setCategory("neck")}
          style={
            category && category === "neck"
              ? selectorButton
              : selectorButtonActive
          }
        >
          <Avatar style={selectorButtonIcon} src={"/traits/neck.png"} />
        </div>
        <div
          onClick={() => setCategory("legs")}
          style={
            category && category === "legs"
              ? selectorButton
              : selectorButtonActive
          }
        >
          <Avatar style={selectorButtonIcon} src={"/traits/legs.png"} />
        </div>
        <div
          onClick={() => setCategory("foot")}
          style={
            category && category === "foot"
              ? selectorButton
              : selectorButtonActive
          }
        >
          <Avatar style={selectorButtonIcon} src={"/traits/shoes.png"} />
        </div>
        <div
          onClick={() => handleRandom()}
          style={
            category && category === "random"
              ? selectorButton
              : selectorButtonActive
          }
        >
          <Avatar style={selectorButtonIcon} src={"/traits/shuffle.png"} />
        </div>
      </Stack>
    </div>
  )
}
