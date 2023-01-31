import React from "react"
import styles from "./View.module.css"
import { ViewMode, ViewContext } from "../context/ViewContext"
import Chat from "../components/Chat"
import CustomButton from "../components/custom-button"
import { SceneContext } from "../context/SceneContext"

function ViewComponent() {
  const { setViewMode } = React.useContext(ViewContext)
  const { templateInfo } = React.useContext(SceneContext);

  const back = () => {
    console.log("back")
    setViewMode(ViewMode.SAVE)
  }
 
  return (
    <div className={styles.container}>
      <div className={"sectionTitle"}>Chat With Your Character</div>
      <div className={styles.chatContainer}>
        <div className={styles.topLine} />
        <div className={styles.bottomLine} />
        <div className={styles.scrollContainer}>
          <Chat name={ templateInfo?.name == "Drophunter" ? "Scillia" : "Drake"} />
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

export default ViewComponent
