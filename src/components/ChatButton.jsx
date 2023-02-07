import React, { useContext } from "react"
import { ViewMode, ViewContext } from "../context/ViewContext"
import styles from "./ChatButton.module.css"
import { CustomButton } from "./custom-button"

export default function ChatButton() {
  const { viewMode, setViewMode } = useContext(ViewContext)
  return (
    <CustomButton
      type="icon"
      theme="light"
      icon="settings"
      size={32}
      onClick={() => {
        if (viewMode !== ViewMode.CHAT) {
          setViewMode(ViewMode.CHAT)
        } else {
          setViewMode(ViewMode.APPEARANCE)
        }
      }}
    />
  )
}
