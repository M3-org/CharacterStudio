import React, { useContext, useEffect, useState } from "react"
import styles from "./Optimizer.module.css"
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
import MergeOptions from "../components/MergeOptions"
import { local } from "../library/store"
import { ZipManager } from "../library/zipManager"
import { connectWallet } from "../library/mint-utils"

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
  
  const [model, setModel] = useState(null);
  const [nameVRM, setNameVRM] = useState("");

  const { playSound } = React.useContext(SoundContext)
  const { isMute } = React.useContext(AudioContext)

  const [jsonSelectionArray, setJsonSelectionArray] = React.useState(null)
  const [manifestSelectionArray, setManifestSelectionArray] = React.useState(null)
  const [loadedAnimationName, setLoadedAnimationName] = React.useState("");

  const back = () => {
    !isMute && playSound('backNextButton');
    characterManager.removeCurrentCharacter();
    characterManager.removeCurrentManifest();
    toggleDebugMode(false);
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

  const downloadLoaded = (index) =>{
    const downloadName = manifestSelectionArray[index].manifestName;

    const saveData = async()=>{
      const downloadVRMImage = local["mergeOptions_download_vrm_preview"] == null ? true : local["mergeOptions_download_vrm_preview"];
      if (downloadVRMImage){
        characterManager.savePortraitScreenshot(downloadName, 512,1024,1.5,-0.1);
      }
      const downloadVRM = local["mergeOptions_download_vrm"] == null ? true :  local["mergeOptions_download_vrm"];
      if (downloadVRM){
        await  characterManager.downloadVRM(downloadName, getOptions());
      }
      const downloadZip = new ZipManager();
      const parentScene = sceneElements.parent;
      parentScene.remove(sceneElements);
      const downloadLora = local["mergeOptions_download_lora"] == null ? true :  local["mergeOptions_download_lora"];
      if (downloadLora === true) {
        const promises = manifest.loras.map(async lora => {
            return loraDataGenerator.createLoraData(lora, downloadZip);
        });
    
        await Promise.all(promises);
      }

      const downloadSprites = local["mergeOptions_download_sprites"] == null ? true : local["mergeOptions_download_sprites"];
      if (downloadSprites === true){
        const promises = manifest.sprites.map(async sprite => {
          return spriteAtlasGenerator.createSpriteAtlas(sprite, downloadZip);
        });
    
        await Promise.all(promises);
      }

      if(downloadLora === true || downloadSprites === true){
        downloadZip.saveZip(manifestSelectionArray[index].manifestName);
      }
      
      parentScene.add(sceneElements);
      if (index < manifestSelectionArray.length-1 ){
        console.log("downloaded " + downloadName)
        downloadVRMWithIndex(index + 1)
      }
      else
        setIsLoading(false);
    }
    saveData(); 
  }

  const downloadVRMWithIndex= async(index)=>{
    if (index == 0){
      console.log(manifest.loras[0]);
      
      downloadLoaded(index)
    }
    else{
      await characterManager.setManifest(manifestSelectionArray[index]);
      setIsLoading(true);
      characterManager.loadInitialTraits().then(async()=>{
        
        const delay = ms => new Promise(res => setTimeout(res, ms));        
        await delay(1);
        downloadLoaded(index);
      })
    }
  }

  const download = () => {
    setIsLoading(true);
    downloadVRMWithIndex(0);
  }

  // Translate hook
  const { t } = useContext(LanguageContext)

  const handleAnimationDrop = async (file) => {
    const curCharacter = characterManager.getCurrentCharacterModel();
    if (curCharacter){
      const animName = getFileNameWithoutExtension(file.name);
      const url = URL.createObjectURL(file);

      await animationManager.loadAnimation(url,false,0, true, "", animName);
      setLoadedAnimationName(animationManager.getCurrentAnimationName());

      URL.revokeObjectURL(url);
    }
    else{
      console.warn("Please load a vrm model to test animations.")
    }
  }

  const handleVRMDrop = async (file) =>{
    const url = URL.createObjectURL(file);
    await characterManager.loadOptimizerCharacter(url);
    URL.revokeObjectURL(url);

    const name = getFileNameWithoutExtension(file.name);
    setNameVRM (name);

    setModel(characterManager.getCurrentCharacterModel());
  }

  const handleJsonDrop = (files) => {
    const filesArray = Array.from(files);
    const manifestDataArray = [];
    const processFile = (file) => {
      return new Promise((resolve, reject) => {
        if (file && file.name.toLowerCase().endsWith('.json')) {
          const reader = new FileReader();
         
          // XXX Anata hack to display nft thumbs
          // const thumbLocation = `${characterManager.manifestData?.getAssetsDirectory()}/anata/_thumbnails/t_${file.name.split('_')[0]}.jpg`;
          
          const manifestName =  file.name.replace(/\.[^/.]+$/, "")
          reader.onload = function (e) {
            try {
              const jsonContent = JSON.parse(e.target.result);

              const thumbLocation = jsonContent.thumbnail;
              jsonContent.manifestName = manifestName;
              // XXX Anata hack to display nft thumbs
              // jsonContent.thumb = thumbLocation;

              manifestDataArray.push(jsonContent);

              

              resolve(); // Resolve the promise when processing is complete
            } catch (error) {
              console.error("Error parsing the JSON file:", error);
              reject(error);
            }
          };
          reader.readAsText(file);
        }
      });
    };

    // Use Promise.all to wait for all promises to resolve
    Promise.all(filesArray.map(processFile))
    .then(() => {
      if (manifestDataArray.length > 0){
        /// XXX create new function assign manifest
        //characterManager.animationManager = null;
        setManifestSelectionArray(manifestDataArray);
        characterManager.setManifest(manifestDataArray[0]);
        
        setIsLoading(true);
        characterManager.loadInitialTraits().then(()=>{
          setIsLoading(false);
        })
      }
    })
    .catch((error) => {
      console.error("Error processing files:", error);
    });
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
  

  return (
    <div className={styles.container}>
      <div className={`loadingIndicator ${isLoading ? "active" : ""}`}>
        <img className={"rotate"} src="ui/loading.svg" />
      </div>
      <div className={"sectionTitle"}>NFT Characters</div>
      <FileDropComponent 
         onFilesDrop={handleFilesDrop}
      />
      <MergeOptions
        showDropToDownload={true}
        showCreateAtlas = {false}
        mergeMenuTitle = {"Download Options"}
      />
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
