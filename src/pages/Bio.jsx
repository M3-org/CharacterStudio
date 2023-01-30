import React from "react"
import styles from "./Bio.module.css"
import { ViewMode, ViewContext } from "../context/ViewContext"
import Bio from "../components/Bio"
import CustomButton from "../components/custom-button"

function BioPage() {
  const { setViewMode } = React.useContext(ViewContext)

  const back = () => {
    console.log("back")
    setViewMode(ViewMode.APPEARANCE)
  }

  const next = () => {
    console.log("next")
    setViewMode(ViewMode.SAVE)
  }

  return (
    <div className={styles.container}>
      <div className={"sectionTitle"}>Create Bio</div>
      <div className={styles.bioContainer}>
        <div className={styles.topLine} />
        <div className={styles.bottomLine} />
        <div className={styles.scrollContainer}>
          <Bio />
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
          text="Next"
          size={14}
          className={styles.buttonRight}
          onClick={next}
        />
      </div>
    </div>
  )
}

export default BioPage