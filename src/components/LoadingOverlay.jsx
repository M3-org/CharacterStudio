import React, {useContext} from "react"
// import webaMark from "../../public/ui/loading/webaMark.svg"

import styles from './LoadingOverlay.module.css'

import {ViewContext} from "../context/ViewContext"
export default function LoadingOverlayCircularStatic({
  title = "LOADING"
}) {
  const {isLoading} = useContext(ViewContext)
  // return isLoading ? (
  //   <div className={styles['LoadingStyleBox']}>
  //   <span className={styles["loading-spinner"]} />
  //     <span className = {styles["loading-text"]} >{title}</span>
  //     <div className={styles["logo-container"]}>
  //         <img className={styles["webamark"]} src={webaMark} />
  //     </div>
  //   </div>
  // ) : null
  return isLoading ? (
    <div className={styles['LoadingStyleBox']}>
      <span className={styles["loading-spinner"]} />
      <span className = {styles["loading-text"]} >{title}</span>
    </div>
  ) : null
}