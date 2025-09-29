import React, { useContext, useState } from "react"
import { Object3D } from "three"
import BottomDisplayMenu from "../components/BottomDisplayMenu"
import CustomButton from "../components/custom-button"
import FileDropComponent from "../components/FileDropComponent"
import { AudioContext } from "../context/AudioContext"
import { LanguageContext } from "../context/LanguageContext"
import { SceneContext } from "../context/SceneContext"
import { SoundContext } from "../context/SoundContext"
import { ViewContext, ViewMode } from "../context/ViewContext"
import { getAtlasSize, getFileNameWithoutExtension } from "../library/utils"
import styles from "./Optimizer.module.css"

import { manifestJson } from "@/library/CharacterManifestData"
import JsonAttributes from "../components/JsonAttributes"
import MergeOptions from "../components/MergeOptions"
import ModelInformation from "../components/ModelInformation"
import { local } from "../library/store"
import { ZipManager } from "../library/zipManager"

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

  const [model, setModel] = useState<Object3D | null>(null);
  const [nameVRM, setNameVRM] = useState<string>("");

  const { playSound } = React.useContext(SoundContext)
  const { isMute } = React.useContext(AudioContext)

  const [jsonSelectionArray, setJsonSelectionArray] = React.useState(null)
  const [manifestSelectionArray, setManifestSelectionArray] = React.useState<any[]>(null!)
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

  const downloadLoaded = (index:number) =>{
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
      parentScene?.remove(sceneElements);
      const downloadLora = local["mergeOptions_download_lora"] == null ? true :  local["mergeOptions_download_lora"];
      if (downloadLora === true) {
        const promises = manifest.loras.map(async lora => {
            return loraDataGenerator.createLoraData(lora, downloadZip);
        });
    
        await Promise.all(promises);
      }

      const downloadSprites = local["mergeOptions_download_sprites"] == null ? true : local["mergeOptions_download_sprites"];
      if (downloadSprites === true){
        const promises = manifest.sprites?.map(async sprite => {
          return spriteAtlasGenerator.createSpriteAtlas(sprite.manifest, downloadZip);
        })||[];
    
        await Promise.all(promises);
      }

      if(downloadLora === true || downloadSprites === true){
        downloadZip.saveZip(manifestSelectionArray[index].manifestName);
      }
      
      parentScene?.add(sceneElements);
      if (index < manifestSelectionArray.length-1 ){
        console.log("downloaded " + downloadName)
        downloadVRMWithIndex(index + 1)
      }
      else
        setIsLoading(false);
    }
    saveData(); 
  }

  const downloadVRMWithIndex= async(index:number)=>{
    if (index == 0){
      console.log(manifest.loras[0]);
      
      downloadLoaded(index)
    }
    else{
      characterManager.removeCurrentManifest();
      await characterManager.setManifest(manifestSelectionArray[index]);
      setIsLoading(true);
      characterManager.loadInitialTraits().then(async()=>{
        
        const delay = (ms:number) => new Promise(res => setTimeout(res, ms));        
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

  const handleAnimationDrop = async (file:File) => {
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

  const handleVRMDrop = async (file:File) =>{
    const url = URL.createObjectURL(file);
    await characterManager.loadOptimizerCharacter(url);
    URL.revokeObjectURL(url);

    const name = getFileNameWithoutExtension(file.name);
    setNameVRM (name);

    setModel(characterManager.getCurrentCharacterModel());
  }

  const handleJsonDrop = (files:FileList) => {
    const filesArray = Array.from(files);
    const manifestDataArray:manifestJson[] = [];
    const processFile = (file:File) => {
      return new Promise((resolve, reject) => {
        if (file && file.name.toLowerCase().endsWith('.json')) {
          const reader = new FileReader();
         
          // XXX Anata hack to display nft thumbs
          // const thumbLocation = `${characterManager.manifestData?.getAssetsDirectory()}/anata/_thumbnails/t_${file.name.split('_')[0]}.jpg`;
          
          const manifestName =  file.name.replace(/\.[^/.]+$/, "")
          reader.onload = function (e) {
            try {
              const jsonContent = JSON.parse((e.target?.result||'{}') as string) as manifestJson;

              // const thumbLocation = jsonContent.thumbnail;
              //@ts-ignore ????
              jsonContent.manifestName = manifestName;
              // XXX Anata hack to display nft thumbs
              // jsonContent.thumb = thumbLocation;

              manifestDataArray.push(jsonContent);

              resolve(true); // Resolve the promise when processing is complete
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


  const handleFilesDrop = async(files:FileList) => {
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
