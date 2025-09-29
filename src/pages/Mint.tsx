import React from "react"
import { Group } from "three"
import CustomButton from "../components/custom-button"
import { AudioContext } from "../context/AudioContext"
import { SceneContext } from "../context/SceneContext"
import { useSoundContext } from "../context/SoundContext"
import { ViewMode, useViewContext } from "../context/ViewContext"
import { mintAsset } from "../library/mint-utils"
import styles from "./Mint.module.scss"

function MintComponent() {
  const { characterManager } = React.useContext(SceneContext)
  const { setViewMode } = useViewContext()
  const { playSound } = useSoundContext()
  const { isMute } = React.useContext(AudioContext)

  const [status, setStatus] = React.useState<string>("")
  const [minting, setMinting]= React.useState<boolean>(false)

  const back = () => {
    setViewMode(ViewMode.SAVE)
    !isMute && playSound('backNextButton');
  }

 
  async function Mint(){
    !isMute && playSound('backNextButton');
    setMinting(true)
    setStatus("Please check your wallet")
    //const fullBioStr = localStorage.getItem(`${templateInfo.id}_fulBio`)
    const fullBio = {name:"XXXRestore"};//JSON.parse(fullBioStr)
    const screenshot = undefined;// getFaceScreenshot(256,256,true);
    const result = await mintAsset(avatar,screenshot, characterManager.characterModel as Group, fullBio.name)
    setStatus(result || '')
    setMinting(false)
    console.log(result);
  }

  if(!characterManager){
    return <div></div>
  }

  const {characterModel:model, avatar} = characterManager

  return (
    <div className={styles.container}>
      <div className={"sectionTitle"}>Mint Your Character</div>
      <div className={styles.mintContainer}>
        <MenuTitle />
        <div className={styles.mintButtonContainer}>
          <CustomButton
            size={16}
            theme="light"
            icon="polygon"
            text={minting ? "Minting...":"Open Edition"}
            className={styles.mintButton}
            disabled = {minting}
            onClick= {Mint}
            minWidth = {220}
          />

          <div className={styles.divider}></div>

          <CustomButton
            size={16}
            theme="light"
            icon="tokens"
            text="Genesis Edition"
            className={styles.mintButton}
            disabled = {true}
            minWidth = {220}
            // onClick= {Mint}
          />
          {/* Genesis pass holders only */}
          <span className={styles.genesisText}>(<span className={styles.required}>Coming Soon!</span>)</span>
          
        </div>
        <span className={styles.mintInfo}>{status} </span>
        
      </div>

      <div className={styles.bottomContainer}>
        <CustomButton
          theme="light"
          text="Back"
          size={14}
          className={styles.buttonLeft}
          onClick={back}
        />
      </div>
    </div>
  )
}

export default MintComponent

 function MenuTitle() {
    return (
      <div className={styles["mainTitleWrap"]}>
        <div className={styles["topLine"]} />
        <div className={styles["mainTitle"]}>Mint</div>
      </div>
    )
  }