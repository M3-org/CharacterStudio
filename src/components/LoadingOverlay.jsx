import React from "react"
import webaMark from "../../public/ui/loading/webaMark.svg"

import styles from './LoadingOverlay.module.css'

export default function LoadingOverlayCircularStatic({
  title = "Loading"
}) {
  return(
    <div className={styles['LoadingStyleBox']}>
      <span className = "loading-text" >
        {title}
      </span>
        <div className={styles["vh-centered"]}>
          <div className={styles["cover-loadingbar"]}>
            <div className={styles["loading-bar"]}>
            </div>
          </div>
        </div>
      <div className={styles["logo-container"]}>
          <img className={styles["webamark"]} src={webaMark} />
        <div className={styles["logo-gradient"]}></div>
      </div>
    </div>
  )
}
