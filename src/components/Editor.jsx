import React, { Fragment, useEffect, useContext } from "react"

import shuffle from "../../public/ui/traits/shuffle.svg"
import { AudioContext } from "../context/AudioContext"
import { SceneContext } from "../context/SceneContext"
import { SoundContext } from "../context/SoundContext"
import { getAsArray } from "../library/utils"
import {
  getClassOptions,
  getRandomizedTemplateOptions,
  getTraitOptions
} from "../library/option-utils"

import styles from "./Editor.module.css"
import Selector from "./Selector"
import TraitInformation from "./TraitInformation"
import JsonAttributes from "./JsonAttributes"
import { TokenBox } from "./token-box/TokenBox"
import { LanguageContext } from "../context/LanguageContext"
import MenuTitle from "./MenuTitle"
import { setTextureToChildMeshes } from "../library/utils"


export default function Editor({uploadTextureURL, uploadVRMURL,confirmDialog,animationManager, blinkManager, lookatManager, effectManager, jsonSelectionArray}) {
  const {
    currentTraitName, 
    setCurrentTraitName, 
    awaitDisplay, 
    setCurrentOptions, 
    setSelectedOptions, 
    setAwaitDisplay, 
    setRemoveOption, 
    loadUserSelection, 
    templateInfo, 
    manifestSelectionIndex, 
    moveCamera,
    avatar,
    setDisplayTraitOption,
    currentVRM,
    setCurrentVRM,
    characterManager
  } = useContext(SceneContext);
  
  const { isMute } = useContext(AudioContext)

  // Translate hook
  const { t } = useContext(LanguageContext)

  const {
    playSound
  } = useContext(SoundContext)


  //const [groupTraits, setGroupTraits] = React.useState([])
  const [traits, setTraits] = React.useState(null)
  const [traitGroupName, setTraitGroupName] = React.useState("")
  const [selectedTraitID, setSelectedTraitID] = React.useState(null)

  useEffect(()=>{
    if (uploadTextureURL != null && currentVRM != null){
      setTextureToChildMeshes(currentVRM.scene,uploadTextureURL)
    }
  },[uploadTextureURL])


  const selectTraitGroup = (traitGroup) => {
    !isMute && playSound('optionClick');

    if (traitGroupName !== traitGroup.trait){
      setTraits(characterManager.getTraits(traitGroup.trait));
      setTraitGroupName(traitGroup.trait);
      setSelectedTraitID(characterManager.getCurrentTraitID(traitGroup.trait));
      moveCamera({ targetY: traitGroup.cameraTarget.height, distance: traitGroup.cameraTarget.distance})
    }
    else{
      setTraits(null);
      setTraitGroupName("");
      setSelectedTraitID(null);
      moveCamera({ targetY: 0.8, distance: 3.2 })
    }
  }

  return (
    <Fragment>
      
    </Fragment>
  )
}
