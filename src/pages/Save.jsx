import React, { useContext } from "react"
import styles from "./Save.module.css"
import { ExportMenu } from "../components/ExportMenu"

import { ViewMode, ViewContext } from "../context/ViewContext"
import CustomButton from "../components/custom-button"
import { LanguageContext } from "../context/LanguageContext"

function Save() {
  const { setViewMode } = React.useContext(ViewContext)

  const back = () => {
    setViewMode(ViewMode.BIO)
  }

  const mint = () => {
    setViewMode(ViewMode.CHAT)
  }

  const next = () => {
    setViewMode(ViewMode.CHAT)
  }

  // Translate hook
  const { t } = useContext(LanguageContext);

  return (
    <div className={styles.container}>
      <div className={"sectionTitle"}>{t("pageTitles.saveCharacter")}</div>
      <div className={styles.buttonContainer}>
        <CustomButton
          theme="light"
          text={t('callToAction.back')}
          size={14}
          className={styles.buttonLeft}
          onClick={back}
        />
        <ExportMenu />
        {/*
                <CustomButton
                    theme="light"
                    text="Chat"
                    size={14}
                    className={styles.buttonRight}
                    onClick={mint}
                />
                */}
        <CustomButton
          theme="light"
          text={t('callToAction.chat')}
          size={14}
          className={styles.buttonRight}
          onClick={next}
        />
      </div>
    </div>
  )
}

export default Save
