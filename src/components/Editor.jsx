import Stack from "@mui/material/Stack"
import React, { useContext, useEffect } from "react"

import useSound from 'use-sound';
import gsap from 'gsap';
import shuffle from "../../public/ui/traits/shuffle.png";
import { BackButton } from "./BackButton";
import optionClick from "../../public/sound/option_click.wav"
import { AudioContext } from "../context/AudioContext";
import styled from 'styled-components'

const SideMenu = styled.div`
    position: absolute;
    left: 50px;
    top: 10%;
    width: 100px;
    background-color: rgba(23, 22, 31, 0.35);
    border: 1px solid #38404E;
    border-radius : 5px;
    backdrop-filter: blur(22.5px); 
    box-sizing : border-box;
    transform: perspective(400px) rotateY(5deg);
    user-select : none;
`
const LineDivision = styled.div`
    border: 1px solid #3A7484;
    width: 98%;
    opacity: 0.5;
    margin-bottom: ${props => props.bottom || '0'};
    margin-top: ${props => props.top || '0'};
`
const MenuOption = styled.div`
    display: inline-block;
    margin: 5px auto 5px auto;
    padding: 5px;
    height: 3em;
    width: 3em;
    opacity: ${props => props.selected ? 1 : 0.3};
    user-select: none;
    text-align: center;
    cursor:pointer;
    border-right: ${props => props.selected ? '4px solid #61E5F9' : ''};
`
const MenuImg = styled.img`
    margin:auto;
    height: ${props => props.height || '100%'};
    src: ${props => props.src || ''};
   
`
const ShuffleOption = styled(MenuOption)`
    border-right: '';
    opacity: 1;
    height: 30px;

`
const MenuTitle = styled.div`
    display: inline-block;
    text-align: center;
    height: 70px;
    width: 85%;
    text-align: center;
    margin: .25em auto .25em auto;
    user-select: none;
    
`

export default function Editor({templateInfo}) {
  const {isMute, ishide, selectorCategory, setSelectorCategory, setRandomFlag, controls} = useContext(AudioContext);

  const [play] = useSound(
    optionClick,
    { volume: 1.0 }
  );

  const selectOption = (option) =>{
    if (option.name == selectorCategory){ 
      if (ishide) {
        moveCamera(option.cameraTarget);
      }
      else{ 
        moveCamera({height:0.8, distance:3.2});
      }
    }

    if (option.name != selectorCategory)
      moveCamera(option.cameraTarget);
    setSelectorCategory(option.name)
    
    !isMute && play();
  }

  const moveCamera = (value) => {
    if (value){

      gsap.to(controls.target,{
        y:value.height,
        duration: 1,
      })

      gsap.fromTo(controls,
        {
          maxDistance:controls.getDistance(),
          minDistance:controls.getDistance(),
          minPolarAngle:controls.getPolarAngle(),
          maxPolarAngle:controls.getPolarAngle(),
          minAzimuthAngle:controls.getAzimuthalAngle(),
          maxAzimuthAngle:controls.getAzimuthalAngle(),
        },
        {
          maxDistance:value.distance,
          minDistance:value.distance,
          minPolarAngle:(Math.PI / 2 - 0.11),
          maxPolarAngle:(Math.PI / 2 - 0.11),
          minAzimuthAngle: - 0.78,
          maxAzimuthAngle: - 0.78,
          duration: 1,
        }
      ).then(()=>{
        controls.minPolarAngle = 0;
        controls.maxPolarAngle = 3.1415;
        controls.minDistance = 0.5;
        controls.maxDistance = 5;
        controls.minAzimuthAngle = Infinity;
        controls.maxAzimuthAngle = Infinity;
      })
    }
  }

  const {
    setCurrentTemplateId,
    setEnd,
  } = useContext(AudioContext)

  return(
  <SideMenu>
    <Stack alignItems="center"> 
        
        <MenuTitle>
        <BackButton onClick={() => {
          setCurrentTemplateId(null)
          setEnd(false)
        }}/>
        </MenuTitle>

        <LineDivision bottom = {'20px'}/>

        { templateInfo.selectionTraits && templateInfo.selectionTraits.map((item, index) => (
          // improve id
          <MenuOption
            onClick = {()=>{
              selectOption(item)
            }} 
            selected = {selectorCategory === item.name}
            key = {index}>  
            <MenuImg src = {templateInfo.traitIconsDirectory + item.icon} />
          </MenuOption>
        ))}

        <LineDivision top = {'20px'}/>

        <ShuffleOption 
          onClick={() => {
            setRandomFlag(0);
            !isMute && play();
          }}>
          <MenuImg src = {shuffle} />
        </ShuffleOption>
    </Stack>
  </SideMenu>);
}
