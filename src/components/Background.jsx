import React from "react"

import styles from "./Background.module.css"
import logo from "../../public/ui/weba.png"

export default function () {
  console.log('********************** styles["webamark"]}', styles["webamark"])
  return (
    <div className={styles["backgroundImg"]}>
      <div className={styles["backgroundBlur"]}></div>
      <div className={styles["Background"]}>
        <div className={styles["webamark"]} >
          <img src={logo} className={styles["logo"]} />
        </div>
    </div>
    </div>
  )
}
