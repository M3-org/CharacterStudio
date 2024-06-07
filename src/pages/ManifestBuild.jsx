import React, { useContext, useEffect, useState } from "react"
import styles from "./ManifestBuild.module.css"
import { ViewMode, ViewContext } from "../context/ViewContext"
import { SceneContext } from "../context/SceneContext"
import CustomButton from "../components/custom-button"
import { LanguageContext } from "../context/LanguageContext"
import { SoundContext } from "../context/SoundContext"
import { AudioContext } from "../context/AudioContext"
import FileDropComponent from "../components/FileDropComponent"
import BottomDisplayMenu from "../components/BottomDisplayMenu"
import { getFileNameWithoutExtension, disposeVRM, getAtlasSize } from "../library/utils"
import { loadVRM, addVRMToScene } from "../library/load-utils"
import { downloadVRM } from "../library/download-utils"
import JsonAttributes from "../components/JsonAttributes"
import ModelInformation from "../components/ModelInformation"
import MenuTitle from "../components/MenuTitle"
import { TokenBox } from "../components/token-box/TokenBox"
import MergeOptions from "../components/MergeOptions"
import { local } from "../library/store"
import { ZipManager } from "../library/zipManager"
import { defaultGroupTraits, defaultGroupTrait } from "../constants/defaultGroupTraits"

function BatchManifest() {
  const { isLoading, setViewMode, setIsLoading } = React.useContext(ViewContext)
  const {
    manifest,
    characterManager,
    animationManager,
    toggleDebugMode,
    loraDataGenerator,
    spriteAtlasGenerator,
    sceneElements
  } = React.useContext(SceneContext)

  const { t } = useContext(LanguageContext)
  
  const [model, setModel] = useState(null);
  const [nameVRM, setNameVRM] = useState("");

  const { playSound } = React.useContext(SoundContext)
  const { isMute } = React.useContext(AudioContext)

  const [jsonSelectionArray, setJsonSelectionArray] = React.useState(null)
  const [manifestSelectionArray, setManifestSelectionArray] = React.useState(null)
  const [loadedAnimationName, setLoadedAnimationName] = React.useState("");

  const [traitOptions,setTraitOptions] = React.useState([]);
  const [selectedOption, setSelectedOption] = React.useState(null)
  const [selectedIndex, setSelectedIndex] = React.useState(-1)

  const back = () => {
    !isMute && playSound('backNextButton');
    characterManager.removeCurrentCharacter();
    characterManager.removeCurrentManifest();
    toggleDebugMode(false);
    setViewMode(ViewMode.LANDING)
  }

  const selectTraitOption = (index) =>{
    console.log(index);
    setSelectedOption(traitOptions[index]);
    setSelectedIndex(index);
    console.log(traitOptions[index])
  }

  const handleVRMDrop = async (file) =>{

    console.log("VRM DROPPED");
    const url = URL.createObjectURL(file);
    await characterManager.loadOptimizerCharacter(url);
    URL.revokeObjectURL(url);

    const name = getFileNameWithoutExtension(file.name);
    setNameVRM (name);

    setModel(characterManager.getCurrentCharacterModel());
  }

  const handleFilesDrop = async(files) => {
    const file = files[0];
    // Check if the file has the .fbx extension
    if (file && file.name.toLowerCase().endsWith('.fbx')) {
      handleAnimationDrop(file);
    } 
    if (file && file.name.toLowerCase().endsWith('.vrm')) {
      handleVRMDrop(file);
    } 
    if (file && file.name.toLowerCase().endsWith('.json')) {
      handleJsonDrop(files);
    } 
  };

  const addTraitOption = () => {
    
    const newOption = traitOptions.length < defaultGroupTraits.length ? defaultGroupTraits[traitOptions.length] : defaultGroupTrait;
    setTraitOptions([...traitOptions, newOption]);
    setSelectedOption(newOption);
    setSelectedIndex(traitOptions.length);
  };
  

  return (
    <div className={styles.container}>
      <div className={`loadingIndicator ${isLoading ? "active" : ""}`}>
        <img className={"rotate"} src="ui/loading.svg" />
      </div>
      <div className={"sectionTitle"}>Manifest Builder</div>
      <FileDropComponent 
         onFilesDrop={handleFilesDrop}
      />
      <div className={styles["sideMenu"]}>
        <MenuTitle title="Appearance" left={20}/>
        <div className={styles["bottomLine"]} />
        <div className={styles["scrollContainer"]}>
          <div className={styles["editor-container"]}>

              <div 
                className={styles["editorButton"]}
                onClick={() => {
                  addTraitOption();
                }}>
              
                <TokenBox
                  size={56}
                  //icon={ traitGroup.fullIconSvg }
                  rarity={"none"}
                />
                <div className={styles["editorText"]}>+ Trait Group</div>
              </div>

            {
              
              
              traitOptions.map((traitGroup, index) => (
                <div key={"options_" + index} 
                className={styles["editorButton"]}
                onClick={() => {
                  selectTraitOption(index);
                  console.log("test");
                }}>
                  <TokenBox
                    size={56}
                    //icon={ traitGroup.fullIconSvg }
                    rarity={selectedIndex === index ?  "mythic" : "none"}
                    
                  />
                  <div className={styles["editorText"]}>{traitGroup.trait}</div>
                  
                </div>
              ))
            }
          </div>
        </div>
      </div>
      {
        selectedOption != null &&(
        <div className={styles["secondarySideMenu"]}>
          <div className={styles["traitInfoText"]}>
            <div>Trait ID</div>
             <input value={selectedOption.trait} className={styles["input-box"]} step ={1}
                              onChange={(e)=>{
                                console.log("t")
                                selectedOption.trait = e.target.value
                                console.log(selectedOption.trait)
                              }}
                              width={"35px"}
                              //onBlur={blurWidth}
                          />
            <div className={styles["traitText"]}>{`Trait ID: ${selectedOption.trait}`}</div>
            <div className={styles["traitText"]}>{`Trait Name: ${selectedOption.name}`}</div>
            <div className={styles["traitText"]}>{`Culling Layer: ${selectedOption.cullingLayer}`}</div>
          </div>
        </div>)
      }
      <ModelInformation
        model={model}
      />
      <JsonAttributes jsonSelectionArray={manifestSelectionArray} byManifest={true}/>
      {(manifestSelectionArray?.length > 0) && (<BottomDisplayMenu loadedAnimationName={loadedAnimationName}/>)}
      <div className={styles.buttonContainer}>
        <CustomButton
          theme="light"
          text={t('callToAction.back')}
          size={14}
          className={styles.buttonLeft}
          onClick={back}
        />
        
        {(manifestSelectionArray?.length == 1)&&(
          <CustomButton
          theme="light"
          text="Download"
          size={14}
          className={styles.buttonRight}
          onClick={download}
        />)}
        {(manifestSelectionArray?.length > 1)&&(
          <CustomButton
          theme="light"
          text="Download All"
          size={14}
          className={styles.buttonRight}
          onClick={download}
        />)}
      </div>
    </div>
  )
}

export default BatchManifest
