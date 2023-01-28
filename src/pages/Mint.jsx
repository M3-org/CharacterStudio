import React from "react"
import styles from "./Mint.module.css"
import { ViewMode, ViewContext } from "../context/ViewContext"

import Mint from "../components/Mint"
import ResizableDiv from "../components/Resizable"
import CustomButton from "../components/custom-button"

function MintComponent() {
  const { setViewMode } = React.useContext(ViewContext)

  const back = () => {
    console.log("back")
    setViewMode(ViewMode.SAVE)
  }

  const next = () => {
    console.log("next")
    setViewMode(ViewMode.VIEW)
  }

  return (
    <div className={styles.container}>
      <ResizableDiv/>
      <div className={styles.mintContainer}>
        <div className={styles.topLine} />
        <div className={styles.bottomLine} />
        <div className={styles.scrollContainer}>
          
          <Mint />
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
