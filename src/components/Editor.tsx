import Stack from "@mui/material/Stack"
import React, { useState } from "react"

import useSound from 'use-sound';
import gsap from 'gsap';
import shuffle from "../ui/traits/shuffle.png"
import webaMark from "../ui/traits/webaMark.png"
import optionClick from "../sound/option_click.wav"
import {useMuteStore} from '../store'

import {SideMenu, LineDivision, MenuOption, MenuImg, MenuTitle, ShuffleOption} from '../styles/Editor.styled'

export default function Editor(props: any) {
  const isMute = useMuteStore((state) => state.isMute)
  const { controls, templateInfo, category, setCategory  }: any = props
  const [ inverse, setInverse ] = useState(false)

  const handleRandom = () => {
    props.random();
  }


  const [play] = useSound(
    optionClick,
    { volume: 1.0 }
  );

  const selectOption = (option:any) =>{
    setCategory(option.name)
    moveCamera(option.cameraTarget)
    !isMute && play();
  }

  const moveCamera = (value:any) => {
    if (value){
      setInverse(!inverse);

      gsap.to(controls.target,{
        y:value.height,
        duration: 1,
      })

      gsap.fromTo(controls,
        {
          maxDistance:controls.getDistance(),
          minDistance:controls.getDistance(),
          minPolarAngle:controls.getPolarAngle(),
          minAzimuthAngle:controls.getAzimuthalAngle(),
          maxAzimuthAngle:controls.getAzimuthalAngle(),
        },
        {
          maxDistance:value.distance,
          minDistance:value.distance,
          minPolarAngle:(Math.PI / 2 - 0.11),
          minAzimuthAngle: inverse ? -0.78 : 0.78,
          maxAzimuthAngle: inverse ? -0.78 : 0.78,
          duration: 1,
        }
      ).then(()=>{
        controls.minPolarAngle = 0;
        controls.minDistance = 0.5;
        controls.maxDistance = 2.0;
        controls.minAzimuthAngle = Infinity;
        controls.maxAzimuthAngle = Infinity;
      })
    }
  }

  return(
  <SideMenu>
    <Stack
        alignItems="center"
      > 
        
        <MenuTitle>
          <MenuImg src={webaMark} />
        </MenuTitle>

        <LineDivision bottom = {'20px'}/>

        { templateInfo.selectionTraits && templateInfo.selectionTraits.map(item => (
          // improve id
          <MenuOption 
            onClick = {()=>{selectOption(item)}} 
            selected = {category === item.name}
            key = {"i" + templateInfo.id + item.id}>  
            <MenuImg src = {templateInfo.traitIconsDirectory + item.icon} />
          </MenuOption>
        ))}

        <LineDivision top = {'20px'}/>

        <ShuffleOption 
          onClick={() => {
            handleRandom()
            !isMute && play();
          }}>
          <MenuImg src = {shuffle} />
        </ShuffleOption>
    </Stack>
  </SideMenu>);
}
