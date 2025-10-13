import React, { useContext } from "react"
import CustomButton from "../components/custom-button"
import { LanguageContext } from "../context/LanguageContext"
import { ViewMode, useViewContext } from "../context/ViewContext"
import styles from "./View.module.css"

import { AudioContext } from "../context/AudioContext"
import { useSoundContext } from "../context/SoundContext"

function View() {
  const { setViewMode } = useViewContext()
  const { playSound } = useSoundContext()
  const { isMute } = React.useContext(AudioContext)

  const back = () => {
    setViewMode(ViewMode.SAVE)
    !isMute && playSound('backNextButton');
  }

  // Translate hook
  const { t } = useContext(LanguageContext);

  return (
    <div className={styles.container}>
      <div className={styles.buttonContainer}>
        <CustomButton
          theme="light"
          text={t('callToAction.back')}
          size={14}
          className={styles.buttonLeft}
          onClick={back}
        />
      </div>
    </div>
  )
}

export default View
