import React from "react"
import styles from "./MenuTitle.module.css"


export default   function MenuTitle({title, width, left, right}) {
    const titleStyle = {
        width: width ? `${width}px` : null, // Use the provided width if available
        left:  left ?  `${left}px` : null,
        right: right ? `${right}px` : null
    };
    return (
      title && (
        <div className={styles["mainTitleWrap"]} style ={titleStyle}>
          <div className={styles["topLine"]} />
          <div className={styles["mainTitle"]}>{title}</div>
        </div>
      )
    )
}