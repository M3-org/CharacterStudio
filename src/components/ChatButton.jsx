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
          console.log("ChatButton: viewMode is APPEARANCE, setting to CHAT")
          setViewMode(ViewMode.CHAT)
        } else {
          console.log("ChatButton: viewMode is CHAT, setting to APPEARANCE")
          setViewMode(ViewMode.APPEARANCE)
        }
      }}
    />
  )
}
