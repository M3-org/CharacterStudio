import React from "react"
import styles from "./MenuTitle.module.css"


export default   function MenuTitle(props) {
    return (
      props.title && (
        <div className={styles["mainTitleWrap"]}>
          <div className={styles["topLine"]} />
          <div className={styles["mainTitle"]}>{props.title}</div>
        </div>
      )
    )
}