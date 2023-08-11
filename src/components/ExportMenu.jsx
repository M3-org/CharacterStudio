import React, { useContext } from "react"
import { SceneContext } from "../context/SceneContext"
import CustomButton from "./custom-button"

import { downloadGLB, downloadVRM } from "../library/download-utils"

import styles from "./ExportMenu.module.css"
import { local } from "../library/store"
import { LanguageContext } from "../context/LanguageContext"

const defaultName = "Anon"

export const ExportMenu = ({getFaceScreenshot}) => {
  // Translate hook
  const { t } = useContext(LanguageContext);
  const [name] = React.useState(localStorage.getItem("name") || defaultName)
  const { model, avatar } = useContext(SceneContext)

  return (
    <React.Fragment>
      <CustomButton
        theme="light"
        text="GLB"
        icon="download"
        size={14}
        className={styles.button}
        onClick={() => {
          downloadGLB(model, true, name)
        }}
      />
      <CustomButton
        theme="light"
        text={`GLB (${t('text.unoptimized')})`}
        icon="download"
        size={14}
        className={styles.button}
        onClick={() => {
          downloadGLB(model, false, name)
        }}
      />
      <CustomButton
        theme="light"
        text="VRM"
        icon="download"
        size={14}
        className={styles.button}
        onClick={() => {
          const screenshot = getFaceScreenshot();
          downloadVRM(model, avatar, name, screenshot, 4096, true)
        }}
      />
    </React.Fragment>
  )
}
