import React, { useEffect, useState } from "react"
import classnames from "classnames"
import styles from "./Message.module.css"
import { timeSince } from "../../lib/helpers/time"

export const Message = (props) => {
  const { timestamp, name, message, type, color } = props
  let date = new Date(timestamp)
  const time = `${date.getHours()}:${date.getMinutes()}`
  return (
    <div className={`${styles["message"]} ${type ? styles["speaker"] : styles["agent"]}`}>
      <div className={styles["name"]} style={!type ? { color: color } : {}}>
        {name}
      </div>
      <div className={styles["chat-bubble"]}>
        <div
          className={styles["colorBg"]}
          style={!type ? { backgroundColor: color } : {}}
        />
        {message}
        <span>{time}</span>
      </div>
    </div>
  )
}
