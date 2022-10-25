import { Avatar } from "@mui/material"
import Divider from "@mui/material/Divider"
import Stack from "@mui/material/Stack"
import React, { useEffect, useState, useRef } from "react"
import gsap from "gsap";

import bodyIcon from "/src/ui/traits/body.png";
import skinIcon from "/src/ui/traits/skin-color.png";
import markIcon from "/src/ui/traits/webaMark 1.png";
import hairIcon from "/src/ui/traits/hairStyle.png";
import torsoIcon from "/src/ui/traits/torso.png";
import accessoriesIcon from "/src/ui/traits/accessories.png";
import legsIcon from "/src/ui/traits/legs.png";
import shoesIcon from "/src/ui/traits/shoes.png";
import shuffleIcon from "/src/ui/traits/shuffle.png";



export default function Editor(props: any) {
  const { camera, templateInfo, category, setCategory  }: any = props
  const [isModal, setModal] = useState(false)
  const selectorButton = {
    color: "#999999",
    fontSize: "12px",
    minWidth: "60px",
    cursor: "pointer",
    opacity : "1",
    borderRight : "4px solid #61E5F9",
    textAlign : "center",
    width : "100%"
  }

  const selectorButtonActive = {
    color: "#666666",
    fontSize: "12px",
    minWidth: "60px",
    cursor: "pointer",
    opacity : "0.2",
    width : "100%",
    textAlign : "center"
  }

  const selectorButtonIcon = {
    display: "inline-block",
    width: "40px",
    height: "56px",
    padding: "2px"
  }

  const setShowModal = () => {
    setModal(!isModal)
  }

  const handleRandom = () => {
    props.random();
  }


  const moveCamera = (value:string) => {
    if (templateInfo.cameraPosition){
      if (templateInfo.cameraPosition[value]){
        gsap.to(camera.position,{
          x:templateInfo.cameraPosition[value][0],
          y:templateInfo.cameraPosition[value][1],
          z:templateInfo.cameraPosition[value][2],
          duration: 1,
        })
        gsap.to(camera.rotation,{
          y:0.4,
          duration: 1,
        })
      }
    }
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
        transform: 'perspective(400px) rotateY(5deg)',
        userSelect : 'none'
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
          <Avatar style={selectorButtonIcon} src={markIcon} />
        </div>
        <div style = {{
          border : "1px solid #3A7484",
          width  : "98%",
          opacity : "0.5"
        }}></div>
        <div
          onClick={() => {
            setCategory("gender")
            moveCamera("full")
          }
          }
          style={
            category && category === "gender"
              ? selectorButton
              : selectorButtonActive
          }
        >
          
          <Avatar style={selectorButtonIcon} src={bodyIcon} />
        </div>
        <div
          onClick={() => {
            setCategory("color")
            moveCamera("full")
          }}
          style={
            category && category === "color"
              ? selectorButton
              : selectorButtonActive
          }
        >
          <Avatar style={selectorButtonIcon} src={skinIcon} />
        </div>
        <div
          onClick={() => {
            setCategory("head")
            moveCamera("head")
          }}
          style={
            category && category === "head"
              ? selectorButton
              : selectorButtonActive
          }
        >
          <Avatar style={selectorButtonIcon} src={hairIcon} />
        </div>

        <div
          onClick={() => {
            setCategory("chest")
            moveCamera("full")
          }}
          style={
            category && category === "chest"
              ? selectorButton
              : selectorButtonActive
          }
        >
          <Avatar style={selectorButtonIcon} src={torsoIcon} />
        </div>
        <div
          onClick={() => {
            setCategory("accessories")
            moveCamera("full")
          }}
          style={
            category && category === "accessories"
              ? selectorButton
              : selectorButtonActive
          }
        >
          <Avatar style={selectorButtonIcon} src={accessoriesIcon} />
        </div>
        <div
          onClick={() => {
            setCategory("legs")
            moveCamera("legs")
          }}
          style={
            category && category === "legs"
              ? selectorButton
              : selectorButtonActive
          }
        >
          <Avatar style={selectorButtonIcon} src={legsIcon} />
        </div>
        <div
          onClick={() => {
            setCategory("foot")
            moveCamera("foot")
          }}
          style={
            category && category === "foot"
              ? selectorButton
              : selectorButtonActive
          }
        >
          <Avatar style={selectorButtonIcon} src={shoesIcon} />
        </div>
        <div
          onClick={() => {
            handleRandom()
            moveCamera("full")
          }}
          style={
            category && category === "random"
              ? selectorButton
              : selectorButtonActive
          }
        >
          <Avatar style={selectorButtonIcon} src={shuffleIcon} />
        </div>
      </Stack>
    </div>
  )
}
