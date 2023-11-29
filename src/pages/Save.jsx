import React, { useContext } from "react"
import styles from "./Save.module.css"
import { ExportMenu } from "../components/ExportMenu"

import { ViewMode, ViewContext } from "../context/ViewContext"
import CustomButton from "../components/custom-button"
import { LanguageContext } from "../context/LanguageContext"
import { SoundContext } from "../context/SoundContext"
import { AudioContext } from "../context/AudioContext"
import MergeOptions from "../components/MergeOptions"
import { getDataArrayFromNFTMetadata } from "../library/file-utils"
import FileDropComponent from "../components/FileDropComponent"
import { SceneContext } from "../context/SceneContext"


function Save({getFaceScreenshot}) {

  // Translate hook
  const { t } = useContext(LanguageContext);
  const { playSound } = React.useContext(SoundContext)
  const { isMute } = React.useContext(AudioContext)
  const { setViewMode } = React.useContext(ViewContext);
  const {
    templateInfo,
    setSelectedOptions,
  } = React.useContext(SceneContext)


  const back = () => {
    setViewMode(ViewMode.BIO)
    !isMute && playSound('backNextButton');
  }
  const mint = () => {
    setViewMode(ViewMode.MINT)
    !isMute && playSound('backNextButton');
  }
  const handleFilesDrop = async(files) => {
    const file = files[0];
    if (file && file.name.toLowerCase().endsWith('.json')) {
      getDataArrayFromNFTMetadata(files, templateInfo).then((jsonDataArray)=>{
        if (jsonDataArray.length > 0){
          // This code will run after all files are processed
          console.log(jsonDataArray);
          //setSelectedOptions(jsonDataArray[0].options);
        }
      })
    } 
  };

  // const next = () => {
  //   setViewMode(ViewMode.CHAT)
  //   !isMute && playSound('backNextButton');
  // }

  return (
    <div className={styles.container}>
      <div className={"sectionTitle"}>{t("pageTitles.saveCharacter")}</div>
      <div className={styles.buttonContainer}>
        <FileDropComponent 
          onFilesDrop={handleFilesDrop}
        />
        <CustomButton
          theme="light"
          text={t('callToAction.back')}
          size={14}
          className={styles.buttonLeft}
          onClick={back}
        />
        <MergeOptions
          showCreateAtlas = {true}
        />
        <ExportMenu 
          getFaceScreenshot = {getFaceScreenshot}
        />
        
        <CustomButton
            theme="light"
            text="mint"//{t('callToAction.mint')}
            size={14}
            className={styles.buttonRight}
            onClick={mint}
        />
        {/* <CustomButton
          theme="light"
          text={t('callToAction.chat')}
          size={14}
          className={styles.buttonRight}
          onClick={next}
        /> */}
      </div>
    </div>
  )
}

export default Save
