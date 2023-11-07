import React, { useContext, useEffect, useState } from "react"
import styles from "./Optimizer.module.css"
import { ViewMode, ViewContext } from "../context/ViewContext"
import { SceneContext } from "../context/SceneContext"
import CustomButton from "../components/custom-button"
import { LanguageContext } from "../context/LanguageContext"
import { SoundContext } from "../context/SoundContext"
import { AudioContext } from "../context/AudioContext"
import FileDropComponent from "../components/FileDropComponent"
import { getFileNameWithoutExtension, disposeVRM } from "../library/utils"
import { loadVRM, addVRMToScene } from "../library/load-utils"
import { downloadVRM } from "../library/download-utils"
import ModelInformation from "../components/ModelInformation"
import MenuTitle from "../components/MenuTitle"
import Slider from "../components/Slider"
import { css } from "styled-components"

function Optimizer({
  animationManager,
}) {
  const { isLoading, setViewMode } = React.useContext(ViewContext)
  const {
    model,
  } = React.useContext(SceneContext)
  
  const [currentVRM, setCurrentVRM] = useState(null);
  const [lastVRM, setLastVRM] = useState(null);
  const [nameVRM, setNameVRM] = useState("");
  const [atlasSize, setAtlasSize] = useState(4096);
  const [atlasValue, setAtlasValue] = useState(6);

  const { playSound } = React.useContext(SoundContext)
  const { isMute } = React.useContext(AudioContext)

  const back = () => {
    !isMute && playSound('backNextButton');
    setViewMode(ViewMode.LANDING)
  }

  const download = () => {
    const vrmData = currentVRM.userData.vrm
    downloadVRM(model, vrmData,nameVRM + "_merged",null,atlasSize,1,true, null, true)
  }

  useEffect(() => {
    if (lastVRM != null)
      disposeVRM(lastVRM);
    setLastVRM(currentVRM);
  }, [currentVRM])

  // Translate hook
  const { t } = useContext(LanguageContext)

  const handleAnimationDrop = async (file) => {
    const animName = getFileNameWithoutExtension(file.name);
    const path = URL.createObjectURL(file);

    await animationManager.loadAnimation(path, true, "", animName);
  }

  const handleChangeAtlasSize = async (event) => {
    const val = parseInt(event.target.value);
    if (val > 8)
      setAtlasValue(8)
    else if (val < 0)
      setAtlasValue(0)
    else 
      setAtlasValue(val)

    switch (val){
      case 1:
        setAtlasSize(128);
        break;
      case 2:
        setAtlasSize(256);
        break;
      case 3:
        setAtlasSize(512);
        break;
      case 4:
        setAtlasSize(1024);
        break;
      case 5:
        setAtlasSize(2048);
        break;
      case 6:
        setAtlasSize(4096);
        break;
      case 7:
        setAtlasSize(8192);
        break;
      case 8:
        setAtlasSize(16384);
        break;
      default:
        break;
    }
    
  }

  const handleVRMDrop = async (file) =>{
    const path = URL.createObjectURL(file);
    const vrm = await loadVRM(path);
    const name = getFileNameWithoutExtension(file.name);

    if (currentVRM != null){
      disposeVRM(currentVRM);
    }
    setNameVRM(name);
    setCurrentVRM(vrm);

    addVRMToScene(vrm, model)
    //setUploadVRMURL(path);
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
  };

  return (
    <div className={styles.container}>
      <div className={`loadingIndicator ${isLoading ? "active" : ""}`}>
        <img className={"rotate"} src="ui/loading.svg" />
      </div>
      <div className={"sectionTitle"}>Optimize your character</div>
      <FileDropComponent 
         onFilesDrop={handleFilesDrop}
      />
      <div className={styles["InformationContainerPos"]}>
        <MenuTitle title="Optimizer Options" width={180} left={20}/>
        <div className={styles["scrollContainer"]}>
          <div className={styles["traitInfoTitle"]}>
              Atlas size: {atlasSize}
          </div>

            <Slider  value={atlasValue} onChange={handleChangeAtlasSize} min={1} max={8} step={1}stepBox={1}/>
            <br/>
          <div className={styles["traitInfoTitle"]}>
              Drag Drop - Download
          </div>
          <div className={styles["traitInfoText"]}>
              false
          </div>

        </div>
        
      </div>
      <ModelInformation
        currentVRM={ currentVRM}
      />
      <div className={styles.buttonContainer}>
        <CustomButton
          theme="light"
          text={t('callToAction.back')}
          size={14}
          className={styles.buttonLeft}
          onClick={back}
        />
        {/* <CustomButton
          theme="light"
          text={"debug"}
          size={14}
          className={styles.buttonCenter}
          onClick={debugMode}
        /> */}
          <CustomButton
          theme="light"
          text="Download"
          size={14}
          className={styles.buttonRight}
          onClick={download}
        />
      </div>
    </div>
  )
}

export default Optimizer
