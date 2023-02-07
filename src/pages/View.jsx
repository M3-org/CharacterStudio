import React from "react"
import styles from "./View.module.css"
import { ViewMode, ViewContext } from "../context/ViewContext"
import Chat from "../components/Chat"
import CustomButton from "../components/custom-button"

function View({
  name,
  bio,
  greeting,
  question1,
  question2,
  question3,
  response1,
  response2,
  response3,
}) {
  const { setViewMode } = React.useContext(ViewContext)

  const back = () => {
    setViewMode(ViewMode.BIO)
  }

  return (
    <div className={styles.container}>
      <div className={"sectionTitle"}>Chat With Your Character</div>
      <div className={styles.chatContainer}>
        <div className={styles.topLine} />
        <div className={styles.bottomLine} />
        <div className={styles.scrollContainer}>
          <Chat
            name={name}
            bio={bio}
            greeting={greeting}
            question1={question1}
            question2={question2}
            question3={question3}
            response1={response1}
            response2={response2}
            response3={response3}
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
