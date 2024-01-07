import React from "react"

import logo from "../../public/ui/anata.png"
import styles from "./Background.module.css"
import { SceneContext } from "../context/SceneContext"
export default function Background() {
  const {
    debugMode,
  } = React.useContext(SceneContext)
  return (
    <div className={debugMode ? styles["darkBackground"] : styles["backgroundImg"]}>
      <div className={styles["backgroundBlur"]}></div>
      <div className={styles["Background"]}>
        <div className={styles["webamark"]}>
          <img src={logo} className={styles["logo"]} />
        </div>
      </div>
    </div>
  )
}
