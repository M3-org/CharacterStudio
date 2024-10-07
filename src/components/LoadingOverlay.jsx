import React, {useContext} from "react"

import styles from './LoadingOverlay.module.css'

import {ViewContext} from "../context/ViewContext"
export default function LoadingOverlayCircularStatic({
  title = "LOADING"
}) {
  const {isLoading} = useContext(ViewContext)
  return isLoading ? (
    <div className={styles['LoadingStyleBox']}>
      <span className={styles["loading-spinner"]} />
      <span className = {styles["loading-text"]} >{title}</span>
    </div>
  ) : null
}