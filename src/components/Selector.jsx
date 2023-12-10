import React, { useContext, useEffect, useState } from "react"
import * as THREE from "three"
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader"
import { MToonMaterial, VRMLoaderPlugin, VRMUtils } from "@pixiv/three-vrm"
import cancel from "../../public/ui/selector/cancel.png"
import { addModelData, disposeVRM } from "../library/utils"
import {ViewContext} from "../context/ViewContext"
import tick from "../../public/ui/selector/tick.svg"
import { AudioContext } from "../context/AudioContext"
import { SceneContext } from "../context/SceneContext"
import { SoundContext } from "../context/SoundContext"
import {
  renameVRMBones,
  createBoneDirection,
} from "../library/utils"
import { LipSync } from '../library/lipsync'
import { getAsArray } from "../library/utils"
import { cullHiddenMeshes } from "../library/utils"

import styles from "./Selector.module.css"
import { TokenBox } from "./token-box/TokenBox"
import { LanguageContext } from "../context/LanguageContext"
import MenuTitle from "./MenuTitle"
import { saveVRMCollidersToUserData } from "../library/load-utils"




export default function Selector({traits, traitGroupName, selectedTraitID, setSelectedTraitID,confirmDialog, uploadVRMURL, templateInfo, animationManager, blinkManager, lookatManager, effectManager}) {
  const {
    avatar,
    setAvatar,
    currentTraitName,
    currentOptions,
    selectedOptions,
    setSelectedOptions,
    model,
    setLipSync,
    mousePosition,
    removeOption,
    saveUserSelection,
    setIsChangingWholeAvatar,
    debugMode,
    setDisplayTraitOption,
    vrmHelperRoot, 
    characterManager
  } = useContext(SceneContext)
  const {
    playSound
  } = useContext(SoundContext)
  const { isMute } = useContext(AudioContext)
  const {isLoading, setIsLoading} = useContext(ViewContext)

  // Translate hook
  const { t } = useContext(LanguageContext)

  const [selectValue, setSelectValue] = useState("0")
  const [, setLoadPercentage] = useState(1)
  const [restrictions, setRestrictions] = useState(null)
  const [currentTrait, setCurrentTrait] = useState(new Map());

  const uploadTrait = async() =>{
      var input = document.createElement('input');
      input.type = 'file';
      input.accept=".vrm"

      input.onchange = e => { 
        var file = e.target.files[0]; 
        if (file.name.endsWith(".vrm")){
          const url = URL.createObjectURL(file);
          characterManager.loadCustomTrait(traitGroupName,url)
          // XXX change selected option
        }
      }
      input.click();
  }

  


  function ClearTraitButton() {
    return !characterManager.isTraitGroupRequired(traitGroupName) ? (
      <div
        key={"no-trait"}
        className={`${styles["selectorButton"]}`}
        icon={cancel}
        onClick={() => {
          characterManager.removeTrait(traitGroupName);
          setSelectedTraitID(null);
        }}
      >
        <TokenBox
          size={56}
          resolution={2048}
          numFrames={128}
          id="head"
          icon={cancel}
          rarity={selectedTraitID == null ? "mythic" : "none"}
        />
      </div>
    ) : (
      <></>
    )
  }
  
  return (
    !!traits && (
      
      <div className={styles["SelectorContainerPos"]}>
       
        <MenuTitle title={traitGroupName} width={130} left={20}/>
        <div className={styles["bottomLine"]} />
        <div className={styles["scrollContainer"]}>
          <div className={styles["selector-container"]}>
            <ClearTraitButton />
            {
            traits.map((trait) => {
              let active = trait.id === selectedTraitID
              return (
                <div
                  key={trait.id}
                  className={`${styles["selectorButton"]}`}
                  onClick={() => {
                    characterManager.loadTrait(trait.traitGroup.trait, trait.id)
                    setSelectedTraitID(trait.id);
                    // if (effectManager.getTransitionEffect('normal')){
                    //   selectTraitOption(option)
                    //   setLoadPercentage(1)
                    // }
                  }}
                >
                  <TokenBox
                    size={56}
                    resolution={2048}
                    numFrames={128}
                    icon={trait.fullThumbnail}
                    rarity={active ? "mythic" : "none"}
                    style={
                      trait.iconHSL
                        ? {
                            filter:
                              "brightness(" +
                              (trait.iconHSL.l + 0.5) +
                              ") hue-rotate(" +
                              trait.iconHSL.h * 360 +
                              "deg) saturate(" +
                              trait.iconHSL.s * 100 +
                              "%)",
                          }
                        : {}
                    }
                  />
                  <img
                    src={tick}
                    className={
                      avatar[currentTraitName] &&
                      avatar[currentTraitName].id === trait.id // todo (pending fix): this only considers the item id and not the subtraits id
                        ? styles["tickStyle"]
                        : styles["tickStyleInActive"]
                    }
                  />
                  {/*{active && loadPercentage > 0 && loadPercentage < 100 && (
                    // TODO: Fill up background from bottom as loadPercentage increases
                  )}*/}
                </div>
              )
            })}
          </div>
        </div>
        <div className={styles["uploadContainer"]}>
          
          <div 
            className={styles["uploadButton"]}
            onClick={uploadTrait}>
            <div> 
              Upload </div>
          </div>
          
        </div>
      </div>
    )
  )
}