import React, { useContext, useEffect, useState } from "react"
import styles from "./Optimizer.module.css"
import { ViewMode, ViewContext } from "../context/ViewContext"
import { SceneContext } from "../context/SceneContext"
import CustomButton from "../components/custom-button"
import { LanguageContext } from "../context/LanguageContext"
import { SoundContext } from "../context/SoundContext"
import { AudioContext } from "../context/AudioContext"
import FileDropComponent from "../components/FileDropComponent"
import { getFileNameWithoutExtension, disposeVRM, getAtlasSize } from "../library/utils"
import ModelInformation from "../components/ModelInformation"
import MergeOptions from "../components/MergeOptions"
import { local } from "../library/store"
import { ZipManager } from "../library/zipManager"
import BottomDisplayMenu from "../components/BottomDisplayMenu"

function Optimizer() {
  const { 
    isLoading, 
    setViewMode 
  } = React.useContext(ViewContext)
  const {
    manifest,
    characterManager,
    animationManager,
    sceneElements,
    loraDataGenerator,
    spriteAtlasGenerator
  } = React.useContext(SceneContext)
  const { playSound } = React.useContext(SoundContext)
  const { isMute } = React.useContext(AudioContext)
  
  const [model, setModel] = useState(null);
  const [nameVRM, setNameVRM] = useState("");

  const [vrmFiles, setVRMFiles] = useState([]);
  const [vrmIndex, setVRMIndex] = useState(0);

  const [loadedAnimationName, setLoadedAnimationName] = React.useState("T-Pose");

  const back = () => {
    !isMute && playSound('backNextButton');
    characterManager.removeCurrentCharacter();
    characterManager.removeCurrentManifest();
    setViewMode(ViewMode.LANDING)
  }

  const getOptions = () =>{
    const currentOption = local["mergeOptions_sel_option"] || 0;
    return {
      isVrm0 : true,
      createTextureAtlas : true,
      mToonAtlasSize:getAtlasSize(local["mergeOptions_atlas_mtoon_size"] || 6),
      mToonAtlasSizeTransp:getAtlasSize(local["mergeOptions_atlas_mtoon_transp_size"] || 6),
      stdAtlasSize:getAtlasSize(local["mergeOptions_atlas_std_size"] || 6),
      stdAtlasSizeTransp:getAtlasSize(local["mergeOptions_atlas_std_transp_size"] || 6),
      exportStdAtlas:(currentOption === 0 || currentOption == 2),
      exportMtoonAtlas:(currentOption === 1 || currentOption == 2),
      ktxCompression: (local["merge_options_ktx_compression"] || false),
      twoSidedMaterial: (local["mergeOptions_two_sided_mat"] || false)
    }
  }

  const downloadAll = async () =>{
   
    for( let i =0; i < vrmFiles.length ; i++){
      try {
        await loadVRMModel(vrmFiles[i]);
        const name = getFileNameWithoutExtension(vrmFiles[i].name);
        await download(name);
      } catch (error) {
        console.error(`Error processing ${vrmFiles[i].name}:`, error);
        // Continue to the next file
      }
    }
  }

  const download = async (saveName) => {
    if (typeof saveName != "string" )
      saveName = nameVRM;
    const saveData = async () => {
      const downloadVRMImage = local["mergeOptions_download_vrm_preview"] == null ? true : local["mergeOptions_download_vrm_preview"];
      if (downloadVRMImage) {
        characterManager.savePortraitScreenshot(saveName + "_portrait", 512, 1024, 1.5, -0.1);
      }
      const downloadVRM = local["mergeOptions_download_vrm"] == null ? true : local["mergeOptions_download_vrm"];
      if (downloadVRM) {
        await characterManager.downloadVRM(saveName + "_merged", getOptions());
      }
      const downloadZip = new ZipManager();
      const parentScene = sceneElements.parent;
      
      parentScene.remove(sceneElements);
      const isVRM0 = characterManager.getCurrentOptimizerCharacterModel().data?.isVRM0;
      
      const downloadLora = local["mergeOptions_download_lora"] == null ? true : local["mergeOptions_download_lora"];
      if (downloadLora === true) {
        const promises = manifest.loras.map(async (lora) => {
          return loraDataGenerator.createLoraData(lora, downloadZip);
        });
  
        await Promise.all(promises);
      }
      const downloadSprites = local["mergeOptions_download_sprites"] == null ? true : local["mergeOptions_download_sprites"];
      if (downloadSprites === true) {
        const promises = manifest.sprites.map(async (sprite) => {
          return spriteAtlasGenerator.createSpriteAtlas(sprite, downloadZip);
        });
  
        await Promise.all(promises);
      }
  
      if (downloadLora === true || downloadSprites === true) {
        downloadZip.saveZip(saveName);
      }
      parentScene.add(sceneElements);
    };
  
    await saveData();
  };

  // Translate hook
  const { t } = useContext(LanguageContext)

  const handleAnimationDrop = async (file) => {
    const curVRM = characterManager.getCurrentOptimizerCharacterModel();
    if (curVRM){
      const animName = getFileNameWithoutExtension(file.name);
      const url = URL.createObjectURL(file);

      await animationManager.loadAnimation(url, false, 0, true, "", animName);
      setLoadedAnimationName(animationManager.getCurrentAnimationName());
      URL.revokeObjectURL(url);
    }
    else{
      console.warn("Please load a vrm model to test animations.")
    }
  }
  const loadPreviousVRM = ()=>{
    if (vrmIndex === 0){
      loadVRMModel(vrmFiles[vrmFiles.length -1]);
      setVRMIndex(vrmFiles.length -1);
    }
    else{
      const newIndex = vrmIndex - 1;
      loadVRMModel(vrmFiles[newIndex]);
      setVRMIndex(newIndex);
    }
  }
  
  const loadNextVRM = ()=>{
    if (vrmIndex >= vrmFiles.length -1){
      loadVRMModel(vrmFiles[0]);
      setVRMIndex(0);
    }
    else{
      const newIndex = vrmIndex + 1;
      loadVRMModel(vrmFiles[newIndex]);
      setVRMIndex(newIndex);
    }
  }

  const loadVRMModel = async (file)=>{
    const url = URL.createObjectURL(file);
    await characterManager.loadOptimizerCharacter(url);
    URL.revokeObjectURL(url);

    const name = getFileNameWithoutExtension(file.name);
    setNameVRM (name);

    setModel({...characterManager.getCurrentCharacterModel()});
  }

  const handleVRMDrop = async (files) =>{
    
    loadVRMModel(files[0]);
    const newVRMFiles = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (file && file.name.toLowerCase().endsWith('.vrm')) {
        newVRMFiles.push(files[i]);
      }
    }
    setVRMFiles(newVRMFiles)
    setVRMIndex(0);
  }

  const handleFilesDrop = async(files) => {
    const file = files[0];
    // Check if the file has the .fbx extension
    if (file && file.name.toLowerCase().endsWith('.fbx')) {
      handleAnimationDrop(file);
    } 
    if (file && file.name.toLowerCase().endsWith('.vrm')) {
      handleVRMDrop(files);
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
      <MergeOptions
        showDropToDownload={true}
        showCreateAtlas = {false}
        mergeMenuTitle = {"Optimizer Options"}
      />
      <ModelInformation
        model={model}
        name = {nameVRM}
        files={vrmFiles}
        index={vrmIndex}
        nextVrm={loadNextVRM}
        previousVrm={loadPreviousVRM}
      />
      <BottomDisplayMenu loadedAnimationName={loadedAnimationName}/>
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
        {(vrmFiles?.length > 1 != "")&&(
          <CustomButton
          theme="light"
          text="Download All"
          size={14}
          className={styles.buttonRight}
          onClick={downloadAll}
        />)}   
        {(model != "")&&(
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
