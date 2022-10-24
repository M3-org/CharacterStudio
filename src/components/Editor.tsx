import { Avatar } from "@mui/material"
import Divider from "@mui/material/Divider"
import Stack from "@mui/material/Stack"
import React, { useEffect, useState, useRef } from "react"
import gsap from 'gsap';

export default function Editor(props: any) {
  const { category, setCategory, camera }: any = props
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

  // calus should be based on characters, add in json
  const camBodyView = () => {
    gsap.to(camera.position,{
      y:-0.9,
      z:3.6,
      duration: 1,
      //onUpdate: () => {camera.lookAt(0,0,0)}
    })
  }
  const camHeadView = ()=>{
    gsap.to(camera.position,{
      y:-1.5,
      z:4.4,
      duration: 1,
      //onUpdate: () => {camera.lookAt(0,0,0)}
    })
  }
  const camChestView = () => {
    gsap.to(camera.position,{
      y:-1.2,
      z:4.4,
      duration: 1,
      //onUpdate: () => {camera.lookAt(0,0,0)}
    })
  }
  const camBottomView = ()=>{
    gsap.to(camera.position,{
      y:-0.6,
      z:4,
      duration: 1,
      //onUpdate: () => {camera.lookAt(0,0,0)}
    })
  }
  const camFootView = ()=>{
    gsap.to(camera.position,{
      y:-0.4,
      z:4.3,
      duration: 1,
      //onUpdate: () => {camera.lookAt(0,0,0)}
    })
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
          <Avatar style={selectorButtonIcon} src={"/traits/webaMark 1.png"} />
        </div>
        <div style = {{
          border : "1px solid #3A7484",
          width  : "98%",
          opacity : "0.5"
        }}></div>
        <div
          onClick={() => {
            setCategory("gender")
            camBodyView()
          }
          }
          style={
            category && category === "gender"
              ? selectorButton
              : selectorButtonActive
          }
        >
          <Avatar style={selectorButtonIcon} src={"/traits/body.png"} />
        </div>
        <div
          onClick={() => {
            setCategory("color")
            camBodyView();
          }}
          style={
            category && category === "color"
              ? selectorButton
              : selectorButtonActive
          }
        >
          <Avatar style={selectorButtonIcon} src={"/traits/skin-color.png"} />
        </div>
        <div
          onClick={() => {
            setCategory("head")
            camHeadView();
          }}
          style={
            category && category === "head"
              ? selectorButton
              : selectorButtonActive
          }
        >
          <Avatar style={selectorButtonIcon} src={"/traits/hairStyle.png"} />
        </div>

        <div
          onClick={() => {
            setCategory("chest")
            camBodyView();
          }}
          style={
            category && category === "chest"
              ? selectorButton
              : selectorButtonActive
          }
        >
          <Avatar style={selectorButtonIcon} src={"/traits/torso.png"} />
        </div>
        <div
          onClick={() => {
            setCategory("accessories")
            camBodyView()
          }}
          style={
            category && category === "accessories"
              ? selectorButton
              : selectorButtonActive
          }
        >
          <Avatar style={selectorButtonIcon} src={"/traits/accessories.png"} />
        </div>
        <div
          onClick={() => {
            setCategory("legs")
            camBottomView();
          }}
          style={
            category && category === "legs"
              ? selectorButton
              : selectorButtonActive
          }
        >
          <Avatar style={selectorButtonIcon} src={"/traits/legs.png"} />
        </div>
        <div
          onClick={() => {
            setCategory("foot")
            camFootView();
          }}
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
