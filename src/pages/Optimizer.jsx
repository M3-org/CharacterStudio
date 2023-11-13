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
  const [atlasStd, setAtlasStd] = useState(6);
  const [atlasStdTransp, setAtlasStdTransp] = useState(6);
  const [atlasMtoon, setAtlasMtoon] = useState(6);
  const [atlasMtoonTransp, setAtlasMtoonTransp] = useState(6);
  const [downloadOnDrop, setDownloadOnDrop] = useState(false)
  const [currentOption, setCurrentOption] = useState(0);
  const [options] = useState(["Merge to Standard", "Merge to MToon", "Keep Both"])

  const { playSound } = React.useContext(SoundContext)
  const { isMute } = React.useContext(AudioContext)

  const back = () => {
    !isMute && playSound('backNextButton');
    setViewMode(ViewMode.LANDING)
  }

  const download = () => {
    const vrmData = currentVRM.userData.vrm
    const options = {
      atlasSize : 4096,
      isVrm0 : true,
      createTextureAtlas : true,
      mToonAtlasSize:getAtlasSize(atlasMtoon),
      mToonAtlasSizeTransp:getAtlasSize(atlasMtoonTransp),
      stdAtlasSize:getAtlasSize(atlasStd),
      stdAtlasSizeTransp:getAtlasSize(atlasStdTransp),
      exportStdAtlas:(currentOption === 0 || currentOption == 2),
      exportMtoonAtlas:(currentOption === 1 || currentOption == 2)
    }
    downloadVRM(model, vrmData,nameVRM + "_merged", options)
  }

  useEffect(() => {
    const fetchData = async () => {
      if (lastVRM != null){
        disposeVRM(lastVRM);
      }
      if (currentVRM != null){
        addVRMToScene(currentVRM, model)
        
        if (downloadOnDrop){
          const vrmData = currentVRM.userData.vrm
          await downloadVRM(model, vrmData,nameVRM + "_merged",null,atlasSize,1,true, null, true)
          disposeVRM(currentVRM);
          setCurrentVRM(null);
        }
        else{
          setLastVRM(currentVRM);
        }
      }
    }

    fetchData();
  }, [currentVRM])

  // Translate hook
  const { t } = useContext(LanguageContext)

  const handleAnimationDrop = async (file) => {
    const animName = getFileNameWithoutExtension(file.name);
    const path = URL.createObjectURL(file);

    await animationManager.loadAnimation(path, true, "", animName);
  }

  const handleDropDownloadEnable = (event) => {
    setDownloadOnDrop(event.target.checked);
  }

  const prevOption = () => {
    if (currentOption <= 0)
      setCurrentOption(options.length-1);
    else
      setCurrentOption(currentOption - 1)
  }

  const nextOption = () => {

    if (currentOption >= options.length-1)
      setCurrentOption(0);
    else
      setCurrentOption(currentOption + 1);
    
  }

  const getAtlasSize = (value) =>{
    switch (value){
      case 1:
        return 128;
      case 2:
        return 256;
      case 3:
        return 512;
      case 4:
        return 1024;
      case 5:
        return 2048;
      case 6:
        return 4096;
      case 7:
        return 8192;
      case 8:
        return 16384;
      default:
        return 4096;
    }
  }

  const handleChangeAtlasSize = async (event, type) => {
    let val = parseInt(event.target.value);
    if (val > 8)
      val = 8;
    else if (val < 0)
      val = 0;

    const setAtlasSize = (size) => {
      switch (type){
        case 'standard opaque':
          // save to user prefs
          setAtlasStd(size);
          break;
        case 'standard transparent':
          setAtlasStdTransp(size);
          break;
        case 'mtoon opaque':
          setAtlasMtoon(size);
          break;
        case 'mtoon transparent':
          setAtlasMtoonTransp(size);
          break;
      }
    }
    setAtlasSize(val) 
  }

  const handleVRMDrop = async (file) =>{
    const path = URL.createObjectURL(file);
    const vrm = await loadVRM(path);
    const name = getFileNameWithoutExtension(file.name);

    setNameVRM(name);
    setCurrentVRM(vrm);
    console.log(vrm)
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
              Merge Atlas Type
          </div>
          <br />
          <div className={styles["flexSelect"]}>
              <div 
                  className={`${styles["arrow-button"]} ${styles["left-button"]}`}
                  onClick={prevOption}
              ></div>
              <div className={styles["traitInfoText"]} style={{ marginBottom: '0' }}>{options[currentOption]}</div>
              <div 
              //`${styles.class1} ${styles.class2}`
                  className={`${styles["arrow-button"]} ${styles["right-button"]}`}
                  onClick={nextOption}
              ></div>
          </div>
          <br /><br /><br />

          {(currentOption === 0 || currentOption == 2)&&(
            <>
            <div className={styles["traitInfoTitle"]}>
                Standard Atlas Size
            </div>
            <br />
            <div className={styles["traitInfoText"]}>
                Opaque: {getAtlasSize(atlasStd) + " x " + getAtlasSize(atlasStd)}
            </div>

              <Slider value = {atlasStd} onChange={(value) => handleChangeAtlasSize(value, 'standard opaque')} min={1} max={8} step={1}/>
              <br/>
              <div className={styles["traitInfoText"]}>
                Transparent: {getAtlasSize(atlasStdTransp) + " x " + getAtlasSize(atlasStdTransp)}
            </div>
              <Slider value = {atlasStdTransp} onChange={(value) => handleChangeAtlasSize(value, 'standard transparent')} min={1} max={8} step={1}/>
              <br/> <br/> <br/>
            </>
          )}

          {(currentOption === 1 || currentOption == 2)&&(
            <>
            <div className={styles["traitInfoTitle"]}>
                MToon Atlas Size
            </div>
            <br />
          <div className={styles["traitInfoText"]}>
              Opaque: {getAtlasSize(atlasMtoon) + " x " + getAtlasSize(atlasMtoon)}
          </div>

            <Slider value = {atlasMtoon} onChange={(value) => handleChangeAtlasSize(value, 'mtoon opaque')} min={1} max={8} step={1}/>
            <br/>
            <div className={styles["traitInfoText"]}>
              Transparent: {getAtlasSize(atlasMtoonTransp) + " x " + getAtlasSize(atlasMtoonTransp)}
          </div>
            <Slider value = {atlasMtoonTransp} onChange={(value) => handleChangeAtlasSize(value, 'mtoon transparent')} min={1} max={8} step={1}/>
            <br/> <br/> <br/>
            </>
          )}
          <div className={styles["traitInfoTitle"]}>
              Drag Drop - Download
          </div>
          

          <div className={styles["traitInfoText"]}>
            <div className={styles["checkboxHolder"]}>
              <div>
                </div>
                
                <label className={styles["custom-checkbox"]}>
                    <input 
                        type="checkbox" 
                        checked={downloadOnDrop}
                        onChange={handleDropDownloadEnable}
                    />
                    <div className={styles["checkbox-container"]}></div>
                </label>
                <div/><div/>
                {downloadOnDrop ? "True": "False"}
              
            </div>
          </div>

        </div>
        
      </div>
      <ModelInformation
        currentVRM={currentVRM}
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
        {(currentVRM)&&(
          <CustomButton
          theme="light"
          text="Download"
          size={14}
          className={styles.buttonRight}
          onClick={download}
        />)}
      </div>
    </div>
  )
}

export default Optimizer
