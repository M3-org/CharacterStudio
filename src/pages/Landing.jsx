import React from "react"
import styles from "./Landing.module.css"
import { ViewMode, ViewContext } from "../context/ViewContext"

import { SoundContext } from "../context/SoundContext"
import { AudioContext } from "../context/AudioContext"
import { SceneContext } from "../context/SceneContext"

import { connectWallet } from "../library/mint-utils"

const opensea_Key = import.meta.env.VITE_OPENSEA_KEY;

function Landing() {
  const { setViewMode } = React.useContext(ViewContext)
  const { playSound } = React.useContext(SoundContext)
  const { isMute } = React.useContext(AudioContext)
  const { characterManager } = React.useContext(SceneContext)

  const createCharacter = () => {
    setViewMode(ViewMode.CREATE)
    !isMute && playSound('backNextButton');
  }

  const createVRMCharacter = () => {
    setViewMode(ViewMode.CLAIM)
    !isMute && playSound('backNextButton');
  }

  const optimizeCharacter = () => {
    setViewMode(ViewMode.OPTIMIZER)
    characterManager.loadOptimizerManifest();
    !isMute && playSound('backNextButton');
  }
  const getWallet = async() => {
    const address = await connectWallet()
    if (address != "")setViewMode(ViewMode.WALLET)
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
          <img src="./assets/media/btn_create_character.png" />
        </button>
        <button className={styles.button} onClick={createVRMCharacter}>
          <img src="./assets/media/btn_batch_download_character.png" />
        </button>
        <button className={styles.button} onClick={optimizeCharacter}>
          <img src="./assets/media/btn_optimize_character.png" />
        </button>
        {opensea_Key && opensea_Key != "" && <button className={styles.button} onClick={getWallet}>
          <img src="./assets/media/btn_optimize_character.png" />
        </button>
        }
        {/* <button className={styles.button} onClick={createCharacter}>
          <img src="./assets/media/btn_tools.png" />
        </button> */}
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
