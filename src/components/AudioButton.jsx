import React, { useContext } from "react"
import { AudioContext } from "../context/AudioContext"
import { ViewStates, ViewContext } from "../context/ViewContext"
import styles from './AudioButton.module.css'

export default function AudioButton() {
  const {isMute, enableAudio, disableAudio} = useContext(AudioContext)
  const {currentView} = useContext(ViewContext)

  return currentView === ViewStates.CREATOR && (
      <div className={[styles['SquareButton'], (isMute ? styles['AudioOff'] : styles['AudioOn'])]}
        onClick={() => {
          if (isMute) enableAudio()
          else
          disableAudio()
        }}
      />
  )
}
