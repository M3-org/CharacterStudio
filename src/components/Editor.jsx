import React, { useContext } from "react";

import gsap from 'gsap';
import useSound from 'use-sound';
import optionClick from "../../public/sound/option_click.wav";
import shuffle from "../../public/ui/traits/shuffle.png";
import { AudioContext } from "../context/AudioContext";
import { SceneContext } from "../context/SceneContext";

import styles from './Editor.module.css';

export default function Editor({templateInfo, controls}) {
  const {currentTraitName, setCurrentTraitName} = useContext(SceneContext);

  const {isMute} = useContext(AudioContext);

  const [cameraFocused, setCameraFocused] = React.useState(false);

  const [play] = useSound(
    optionClick,
    { volume: 1.0 }
  );

  const selectOption = (option) => {
    !isMute && play();
    if (option.name === currentTraitName){ 
      console.log('option.name === currentTraitName')
      if (cameraFocused) {
        moveCamera(option.cameraTarget);
        setCameraFocused(false);
      }
      else{ 
        moveCamera({height:0.8, distance:3.2});
        setCameraFocused(true);
      }
      setCurrentTraitName(null)
      return;
    } else {
      console.log('optoin.name !== currentTraitName', option.name, currentTraitName)
    }

    moveCamera(option.cameraTarget);
    setCurrentTraitName(option.name)
    
  }

  const moveCamera = (value) => {
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

  return(
  <div className={styles['SideMenu']}>
        {templateInfo.traits && templateInfo.traits.map((item, index) => (
          <div className={styles['MenuOption']}
            onClick = {()=>{
              selectOption(item)
            }} 
            key = {index}>
            <img className={currentTraitName !== item.name ? styles['MenuImg'] : styles['MenuImgActive']} src={templateInfo.traitIconsDirectory + item.icon} />
          </div>
        ))}

        <div className={styles['LineDivision']}/>
        <img className={styles['ShuffleOption']} onClick={() => {!isMute && play(); }} src={shuffle} />
  </div>);
}
