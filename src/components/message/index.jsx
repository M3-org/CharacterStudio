import React, { useEffect, useState } from "react"
import styles from "./Message.module.css"

export const Message = (props) => {
  const { timestamp, name, message, type, color } = props
  let date = new Date(timestamp)
  const hours = date.getHours() < 10 ? "0" + date.getHours() : date.getHours();
  const minutes = date.getMinutes() < 10 ? "0" + date.getMinutes() : date.getMinutes();
  const time = `${hours}:${minutes}`
  return (
    <div className={`${styles["message"]} ${type && styles["speaker"]}`}>
      <div className={styles["name"]} style={!type ? { color: color } : {}}>
        {name}, <span>{time}</span>
      </div>
      <div className={styles["chat-bubble"]}>
        <div
          className={styles["colorBg"]}
          style={!type ? { backgroundColor: color } : {}}
        />
        {message}
      </div>
    </div>
  )
}
