import { ModelTrait } from "@/library/CharacterManifestData"
import React, { useContext, useState } from "react"
import CustomButton from "../components/custom-button"
import { ExportMenu } from "../components/ExportMenu"
import FileDropComponent from "../components/FileDropComponent"
import MergeOptions from "../components/MergeOptions"
import MessageWindow from "../components/MessageWindow"
import PurchaseMenu from "../components/PurchaseMenu"
import { AudioContext } from "../context/AudioContext"
import { LanguageContext } from "../context/LanguageContext"
import { SceneContext } from "../context/SceneContext"
import { useSoundContext } from "../context/SoundContext"
import { ViewMode, useViewContext } from "../context/ViewContext"
import styles from "./Save.module.css"


function Save() {

  // Translate hook
  const { t } = useContext(LanguageContext);
  const { playSound } = useSoundContext()
  const { isMute } = React.useContext(AudioContext)
  const { setViewMode } = useViewContext()
  const { characterManager } = React.useContext(SceneContext)


  const [confirmDialogWindow, setConfirmDialogWindow] = useState<boolean>(false)
  const [dialogMessage, setDialogMessage] = useState<string>("")

  const [currentPrice, setCurrentPrice] = React.useState<number>(0)
  const [purchaseTraits, setPurchaseTraits] = React.useState<ModelTrait[]>([])
  const [currency, setCurrency] = React.useState<string>("")

  React.useEffect(() => {
    setCurrentPrice(characterManager.getCurrentTotalPrice());
    setCurrency(characterManager.getMainPriceCurrency()||'');
  }, [])

  const back = () => {
    setViewMode(ViewMode.APPEARANCE)
    !isMute && playSound('backNextButton');
  }
  const mint = () => {
    setViewMode(ViewMode.MINT)
    !isMute && playSound('backNextButton');
  }
  const onPurchaseClick = async() =>{
    //console.log(characterManager.getPurchaseTraitsArray());
    console.log("click purch")
    setPurchaseTraits(characterManager.getPurchaseTraitsArray())
  }
  const handleFilesDrop = async(files:FileList) => {
    const file = files[0];
    if (file && file.name.toLowerCase().endsWith('.json')) {
    } 
  };
  const onConfirmPurchase = () =>{
    console.log("confirm purchase!!")
    characterManager.purchaseAssetsFromAvatar()
      .then(()=>{
        setCurrentPrice(characterManager.getCurrentTotalPrice());
        setPurchaseTraits([]);
        setConfirmDialogWindow(true);
        setDialogMessage("Purchase successful");
      })
      .catch((e)=>{
        setConfirmDialogWindow(true);
        setDialogMessage("An error occurred when trying to purchase assets. Please try again.");
      })
  }
  const cancelPurchase = () =>{
    setPurchaseTraits([]);
  }

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
        {purchaseTraits.length > 0 && (
          <PurchaseMenu
            currentPrice = {currentPrice}
            purchaseTraits = {purchaseTraits}
            onConfirmPurchase = {onConfirmPurchase}
            cancelPurchase = {cancelPurchase}
            currency = {currency}
            
        />)}
        
        <MergeOptions
          showCreateAtlas = {true}
          mergeMenuTitle = {"Download Options"}
        />
        <ExportMenu 
          currentPrice = {currentPrice}
          onPurchaseClick = {onPurchaseClick}
        />
        
        <CustomButton
            theme="light"
            text="mint"//{t('callToAction.mint')}
            size={14}
            className={styles.buttonRight}
            onClick={mint}
        />
      </div>
      <MessageWindow
        cancelOption = {false}
        confirmDialogText = {dialogMessage}
        confirmDialogCallback = {[]}
        confirmDialogWindow = {confirmDialogWindow}
        setConfirmDialogWindow = {setConfirmDialogWindow}
      />
    </div>
  )
}

export default Save
