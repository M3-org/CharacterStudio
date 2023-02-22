import React, { useContext } from "react"
import styles from "./View.module.css"
import { ViewMode, ViewContext } from "../context/ViewContext"
import Chat from "../components/Chat"
import CustomButton from "../components/custom-button"
import { LanguageContext } from "../context/LanguageContext"

function View({templateInfo}) {
  const { setViewMode } = React.useContext(ViewContext)

  const [micEnabled, setMicEnabled] = React.useState(false)
  const [speechRecognition, setSpeechRecognition] = React.useState(false)

  const back = () => {
    setViewMode(ViewMode.SAVE)
    if (speechRecognition)
      speechRecognition.stop()
    setMicEnabled(false)
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
      </div>
    </div>
  )
}

export default View
