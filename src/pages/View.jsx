import React, { useContext } from "react"
import styles from "./View.module.css"
import { ViewMode, ViewContext } from "../context/ViewContext"
import Chat from "../components/Chat"
import CustomButton from "../components/custom-button"
import { LanguageContext } from "../context/LanguageContext"

import { SoundContext } from "../context/SoundContext"
import { AudioContext } from "../context/AudioContext"

function View({templateInfo}) {
  const { setViewMode } = React.useContext(ViewContext)

  const [micEnabled, setMicEnabled] = React.useState(false)
  const [speechRecognition, setSpeechRecognition] = React.useState(false)

  const { playSound } = React.useContext(SoundContext)
  const { isMute } = React.useContext(AudioContext)

  const back = () => {
    setViewMode(ViewMode.SAVE)
    !isMute && playSound('backNextButton');
    if (speechRecognition)
      speechRecognition.stop()
    setMicEnabled(false)
  }
  const next = () =>{
    setViewMode(ViewMode.MINT)
  }

  // Translate hook
  const { t } = useContext(LanguageContext);

  return (
    <div className={styles.container}>
      <div className={"sectionTitle"}>{t("pageTitles.chat")}</div>
      <div className={styles.chatContainer}>
        <div className={styles.topLine} />
        <div className={styles.bottomLine} />
        <div className={styles.scrollContainer}>
          <Chat
            templateInfo = {templateInfo}
            micEnabled = {micEnabled}
            setMicEnabled = {setMicEnabled}
            speechRecognition = {speechRecognition}
            setSpeechRecognition = {setSpeechRecognition}
          />
        </div>
      </div>
      <div className={styles.buttonContainer}>
        <CustomButton
          theme="light"
          text={t('callToAction.back')}
          size={14}
          className={styles.buttonLeft}
          onClick={back}
        />
        <CustomButton
          theme="light"
          text="Next"
          size={14}
          className={styles.buttonRight}
          onClick={next}
        />
      </div>
    </div>
  )
}

export default View
