import React from "react"
import styles from "./Mint.module.scss"
import { ViewMode, ViewContext } from "../context/ViewContext"
import { SceneContext } from "../context/SceneContext"
import CustomButton from "../components/custom-button"
import { SoundContext } from "../context/SoundContext"
import { AudioContext } from "../context/AudioContext"
import { mintAsset } from "../library/mint-utils"

function MintComponent({getFaceScreenshot}) {
  const { templateInfo, model, avatar } = React.useContext(SceneContext)
  const { setViewMode } = React.useContext(ViewContext)
  const { playSound } = React.useContext(SoundContext)
  const { isMute } = React.useContext(AudioContext)

  const back = () => {
    setViewMode(ViewMode.SAVE)
    !isMute && playSound('backNextButton');
  }

  const next = () => {
    setViewMode(ViewMode.CHAT)
    !isMute && playSound('backNextButton');
  }

  function MenuTitle() {
    return (
      <div className={styles["mainTitleWrap"]}>
        <div className={styles["topLine"]} />
        <div className={styles["mainTitle"]}>Mint</div>
      </div>
    )
  }
  async function Mint(){
    const fullBioStr = localStorage.getItem(`${templateInfo.id}_fulBio`)
    const fullBio = JSON.parse(fullBioStr)
    const screenshot = getFaceScreenshot(256,256,true);
    const result = await mintAsset(avatar,screenshot,model, fullBio.name)
    console.log(result);
  }

  return (
    <div className={styles.container}>
      <div className={"sectionTitle"}>Mint Your Character</div>
          
        {/* <Mint screenshotManager = {screenshotManager} blinkManager = {blinkManager} animationManager = {animationManager}/> */}
      
        {/* <ResizableDiv setScreenshotPosition = {setScreenshotPosition} screenshotPosition = {screenshotPosition}/> */}

      <div className={styles.mintContainer}>
        <MenuTitle />
        <div className={styles.mintButtonContainer}>
          <CustomButton
            size={16}
            theme="light"
            icon="polygon"
            text="Open Edition"
            className={styles.mintButton}
            onClick= {Mint}
          />

          <div className={styles.divider}></div>

          <CustomButton
            size={16}
            theme="light"
            icon="tokens"
            text="Genesis Edition"
            className={styles.mintButton}
            disabled = {true}
            // onClick= {Mint}
          />
          {/* Genesis pass holders only */}
          <span className={styles.genesisText}>(<span className={styles.required}>Coming Soon!</span>)</span>
        </div>
      </div>

      <div className={styles.bottomContainer}>
        <CustomButton
          theme="light"
          text="Back"
          size={14}
          className={styles.buttonLeft}
          onClick={back}
        />
        <CustomButton
          theme="light"
          text="Chat"
          size={14}
          className={styles.buttonRight}
          onClick={next}
        />
      </div>
    </div>
  )
}

export default MintComponent
