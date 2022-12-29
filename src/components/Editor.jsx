import React, { useEffect, useContext } from "react";

import * as THREE from "three"
import gsap from 'gsap';
import useSound from 'use-sound';
import optionClick from "../../public/sound/option_click.wav";
import shuffle from "../../public/ui/traits/shuffle.png";
import { AudioContext } from "../context/AudioContext";
import { SceneContext } from "../context/SceneContext";

import styles from './Editor.module.css';

export default function Editor({templateInfo, controls}) {
  const {currentTraitName, setCurrentTraitName, setCurrentOptions, setSelectedOptions, setSelectedRandomTraits, selectedRandomTraits} = useContext(SceneContext);

  const {isMute} = useContext(AudioContext);

  const [cameraFocused, setCameraFocused] = React.useState(false)

  const [play] = useSound(
    optionClick,
    { volume: 1.0 }
  );

    // options are selected by random or start
  useEffect(() => {
    if (selectedRandomTraits.length > 0){
      console.log("SELECTED RANDOM TRAITS ARE: ", selectedRandomTraits)
      setSelectedOptions (getMultipleRandomTraits(selectedRandomTraits))
    }
  },[selectedRandomTraits])

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
    console.log(option)
    moveCamera(option.cameraTarget);
    setCurrentOptions(getTraitOptions(option));
    setCurrentTraitName(option.name)
    
  }

  const getMultipleRandomTraits = (traitNames) =>{
    
    const resultTraitOptions = [];
    traitNames.map((traitName)=>{
       const traitFound = templateInfo.traits.find(trait => trait.trait === traitName);
       if (traitFound)
       {
        const options = getTraitOptions(traitFound);
        if (options?.length > 0)
          resultTraitOptions.push(options[Math.floor(Math.random()*options.length)])
       }
    })
    return resultTraitOptions
  }

  const getTraitOptions = (trait) => {

    const traitOptions = [];
    trait.collection.map((item,index)=>{

      const textureTraits = templateInfo.textureCollections.find(texture => 
        texture.trait === item.textureCollection
      )
      const colorTraits = templateInfo.colorCollections.find(color => 
        color.trait === item.colorCollection  
      )

      // if no there is no collection defined for textures and colors, just grab the base option
      if (textureTraits == null && colorTraits == null){
        const key = trait.name + "_" + index;
        traitOptions.push(getOption(key,trait,item,item.thumbnail))
      }

      // in case we find collections of subtraits, add them as menu items
      if (textureTraits?.collection.length > 0){
        textureTraits.collection.map((textureTrait,txtrIndex)=>{
          const key = trait.name + "_" + index + "_txt" + txtrIndex;
          const thumbnail = getThumbnail (item, textureTrait,txtrIndex)
          traitOptions.push(getOption(key,trait,item,thumbnail,null,textureTrait))
        })
      }
      if (colorTraits?.collection.length > 0){
        colorTraits.collection.map((colorTrait,colIndex)=>{
          const key = trait.name + "_" + index + "_col" + colIndex;
          const thumbnail = getThumbnail (item, colorTrait,colIndex)
          // icons in color should be colored to avoid creating an icon per model
          traitOptions.push(getOption(key,trait,item,thumbnail,getHSL(colorTrait.value[0]), null, colorTrait))
        })
      }
      
    })
    return traitOptions;
  }

  // gets where to get the thumbnail
  const getThumbnail = (item, subtrait, index) => {
    // thumbnail override is the most important, check if its defined
    if (item.thumbnailOverrides)
      if (item.thumbnailOverrides[index])
        return item.thumbnailOverrides[index];

    // if not, check if its defined in the subtrait (texture collection or color collection) or just grab the base thumbnail from the item
    return subtrait.thumbnail || item.thumbnail;
  }

  const getHSL = (hex) => {
    const color = new THREE.Color(hex);
    const hsl = { h: 0, s: 0, l: 0 };
    color.getHSL(hsl)
    return hsl;
  }

  const getOption = (key,trait,item, icon, iconHSL=null, textureTrait=null, colorTrait=null) => {
    return {
      key,
      trait,
      item,
      icon,
      iconHSL,
      textureTrait,
      colorTrait
    }
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
        <img className={styles['ShuffleOption']} onClick={() => {
            !isMute && play();
            setSelectedOptions (getMultipleRandomTraits(templateInfo.randomTraits))
          }} src={shuffle} />
  </div>);
}
