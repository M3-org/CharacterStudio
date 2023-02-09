import React from "react"
import styles from "./View.module.css"
import { ViewMode, ViewContext } from "../context/ViewContext"
import Chat from "../components/Chat"
import CustomButton from "../components/custom-button"

function View({templateInfo}) {
  const { setViewMode } = React.useContext(ViewContext)

  const [micEnabled, setMicEnabled] = React.useState(false)
  const [speechRecognition, setSpeechRecognition] = React.useState(false)

  const back = () => {
    setViewMode(ViewMode.BIO)
    if (speechRecognition)
      speechRecognition.stop()
    setMicEnabled(false)
  }

  return (
    <div className={styles.container}>
      <div className={"sectionTitle"}>Chat With Your Character</div>
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
          text="Back"
          size={14}
          className={styles.buttonLeft}
          onClick={back}
        />
      </div>
    </div>
  )
}

export default View
