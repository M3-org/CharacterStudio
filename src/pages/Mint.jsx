import React from "react"
import styles from "./Mint.module.css"
import { ViewMode, ViewContext } from "../context/ViewContext"

import Mint from "../components/Mint"
import CustomButton from "../components/custom-button"
import { SoundContext } from "../context/SoundContext"
import { AudioContext } from "../context/AudioContext"


function MintComponent({screenshotManager, blinkManager, animationManager}) {
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

  return (
    <div className={styles.container}>
      <div className={"sectionTitle"}>Mint Your Character</div>
      <div className={styles.mintContainer}>
        <div className={styles.topLine} />
        <div className={styles.bottomLine} />
        <div className={styles.scrollContainer}>
          
          <Mint screenshotManager = {screenshotManager} blinkManager = {blinkManager} animationManager = {animationManager}/>
        </div>
      </div>
      <div className={styles.buttonContainer}>
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
