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

  const [cameraFocused, setCameraFocused] = React.useState(false)

  //const [groupTraits, setGroupTraits] = React.useState([])
  const [traits, setTraits] = React.useState(null)

  // options are selected by random or start
  useEffect(() => {
    if (awaitDisplay){
      setSelectedOptions(
        //loadUserSelection(manifestSelectionIndex)
        getRandomizedTemplateOptions(templateInfo)
      )
        setAwaitDisplay(false)
    }
    setCurrentTraitName(null)
  }, [templateInfo])

  useEffect(()=>{
    if (uploadTextureURL != null && currentVRM != null){
      setTextureToChildMeshes(currentVRM.scene,uploadTextureURL)
    }
  },[uploadTextureURL])


  const selectOption = (option) => {
    !isMute && playSound('optionClick');
    if (option.name === currentTraitName) {
      setDisplayTraitOption(null);
      if (cameraFocused) {
        moveCamera({ targetY: option.cameraTarget.height, distance: option.cameraTarget.distance})
        setCameraFocused(false)
      } else {
        moveCamera({ targetY: 0.8, distance: 3.2 })
        setCameraFocused(true)
      }
      setCurrentTraitName(null)
      setCurrentVRM(null)
      return
    }

    setRemoveOption(
      getAsArray(templateInfo.requiredTraits).indexOf(option.name) === -1,
    )
    moveCamera({ targetY: option.cameraTarget.height, distance: option.cameraTarget.distance})
    setCurrentOptions(getTraitOptions(option, templateInfo))







    // XXX character manager -- setTraits
    console.log("Selected option: ",option.name);
    console.log(characterManager.getTraits(option.name));
    







    setCurrentTraitName(option.name)
    // for item display
    setDisplayTraitOption(avatar[option.name]?.traitInfo)
    setCurrentVRM(avatar[option.name]?.vrm);
  }

  return (
    <Fragment>
      <div className={styles["SideMenu"]}>
        <MenuTitle title="Appearance" left={20}/>
        <div className={styles["bottomLine"]} />
        <div className={styles["scrollContainer"]}>
          <div className={styles["selector-container"]}>
            {
              characterManager.getGroupTraits().map((item, index) => (
                <div key={"options_" + index} className={styles["selectorButton"]}>
                  <TokenBox
                    size={56}
                    resolution={2048}
                    numFrames={128}
                    icon={ item.fullIconSvg }
                    rarity={currentTraitName !== item.name ? "none" : "mythic"}
                    onClick={() => {
                      //console.log(characterManager.getTraits(item.trait))
                     // console.log(item.fullIconSvg);
                      setTraits(characterManager.getTraits(item.trait));
                      console.log(traits);
                      //selectOption(item)
                    }}
                  />
                </div>
              ))
            }
            {/* {templateInfo.traits &&
              templateInfo.traits.map((item, index) => (
                <div key={index} className={styles["selectorButton"]}>
                  <TokenBox
                    size={56}
                    resolution={2048}
                    numFrames={128}
                    icon={ (templateInfo.assetsLocation || "") + templateInfo.traitIconsDirectorySvg + item.iconSvg}
                    rarity={currentTraitName !== item.name ? "none" : "mythic"}
                    onClick={() => {
                      selectOption(item)
                      console.log((templateInfo.assetsLocation || "") + templateInfo.traitIconsDirectorySvg + item.iconSvg)
                    }}
                  />
                </div>
              ))} */}
          </div>
        </div>
      </div>
      <Selector 
        confirmDialog = {confirmDialog} 
        animationManager={animationManager} 
        templateInfo={templateInfo} 
        blinkManager = {blinkManager} 
        lookatManager = {lookatManager} 
        effectManager = {effectManager}
        uploadVRMURL = {uploadVRMURL}/>
      <JsonAttributes jsonSelectionArray={jsonSelectionArray}/>
      <TraitInformation currentVRM={currentVRM} animationManager={animationManager} lookatManager={lookatManager}/>
    </Fragment>
  )
}
