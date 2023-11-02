import React from "react"
import styles from "./Landing.module.css"
import { ViewMode, ViewContext } from "../context/ViewContext"

import { SoundContext } from "../context/SoundContext"
import { AudioContext } from "../context/AudioContext"

function Landing() {
  const { setViewMode } = React.useContext(ViewContext)
  const { playSound } = React.useContext(SoundContext)
  const { isMute } = React.useContext(AudioContext)

  const createCharacter = () => {
    setViewMode(ViewMode.CREATE)
    !isMute && playSound('backNextButton');
  }

  const optimizeCharacter = () => {
    setViewMode(ViewMode.OPTIMIZER)
    !isMute && playSound('backNextButton');
  }


  const loadCharacter = () => {
    setViewMode(ViewMode.LOAD)
    !isMute && playSound('backNextButton');
  }

  return (
    <div className={styles.container}>
      <div className={styles.buttonContainer}>
        <button className={styles.button} onClick={createCharacter}>
          <img src="/assets/media/btn_create_character.png" />
        </button>
        <button className={styles.button} onClick={optimizeCharacter}>
          <img src="/assets/media/btn_optimize_character.png" />
        </button>
        {/*
        <button className={styles.button}
            onClick={
                loadCharacter
            }><img src='/assets/media/btn_load_character.png' /></button>
            */}
      </div>
    </div>
  )
}

export default Landing
