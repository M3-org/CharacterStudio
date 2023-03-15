import React, { useContext } from "react"
import { ViewMode, ViewContext } from "../context/ViewContext"
import styles from "./ChatButton.module.css"
import { CustomButton } from "./custom-button"

import { SoundContext } from "../context/SoundContext"
import { AudioContext } from "../context/AudioContext"

export default function ChatButton() {
  const { viewMode, setViewMode } = useContext(ViewContext)
  const { playSound } = useContext(SoundContext)
  const { isMute } = useContext(AudioContext)
  return (
    <CustomButton
      type="icon"
      theme="light"
      icon="settings"
      size={32}
      onClick={() => {
        if (viewMode !== ViewMode.CHAT) {
          setViewMode(ViewMode.CHAT)
          !isMute && playSound('backNextButton');
        } else {
          setViewMode(ViewMode.APPEARANCE)
          !isMute && playSound('backNextButton');
        }
      }}
    />
  )
}
