import React from "react"
import styles from "./Mint.module.scss"
import { ViewMode, ViewContext } from "../context/ViewContext"

// import Mint from "../components/Mint"
// import ResizableDiv from "../components/Resizable"
import CustomButton from "../components/custom-button"

function MintComponent() {
  const { setViewMode } = React.useContext(ViewContext)
  // const [screenshotPosition,  setScreenshotPosition] = React.useState({x:250,y:25,width:256,height:256});

  const back = () => {
    setViewMode(ViewMode.SAVE)
  }

  const next = () => {
    setViewMode(ViewMode.CHAT)
  }

  function MenuTitle() {
    return (
      <div className={styles["mainTitleWrap"]}>
        <div className={styles["topLine"]} />
        <div className={styles["mainTitle"]}>Mint</div>
      </div>
    )
  }

  return (
    <div className={styles.container}>
      <div className={"sectionTitle"}>Mint Your Character</div>
      
      {/* <ResizableDiv setScreenshotPosition = {setScreenshotPosition} screenshotPosition = {screenshotPosition}/> */}

      <div className={styles.mintContainer}>
        <MenuTitle />

        <div className={styles.mintButtonContainer}>
          <CustomButton
            size={16}
            theme="light"
            icon="polygon"
            text="Open Edition"
            className={styles.mintButton}
          />

          <div className={styles.divider}></div>

          <CustomButton
            size={16}
            theme="light"
            icon="tokens"
            text="Genesis Edition"
            className={styles.mintButton}
          />

          <span className={styles.genesisText}>(<span className={styles.required}>Genesis pass holders only</span>)</span>
        </div>
      </div>

      <div className={styles.bottomContainer}>
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
