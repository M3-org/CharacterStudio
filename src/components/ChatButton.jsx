import React, { useContext } from "react"
import { AppMode, ViewContext } from "../context/ViewContext"
import styles from './ChatButton.module.css'

export default function ChatButton() {
  const {currentAppMode, setCurrentAppMode} = useContext(ViewContext)
  return (
      <div className={`${styles['SquareButton']} ${currentAppMode === AppMode.APPEARANCE ? styles['Chat'] : styles['Dress']}`}
        onClick={() => {
          if (currentAppMode !== AppMode.CHAT) {
            console.log('ChatButton: currentAppMode is APPEARANCE, setting to CHAT')
            setCurrentAppMode(AppMode.CHAT);    
          }
          else {
            console.log('ChatButton: currentAppMode is CHAT, setting to APPEARANCE')
            setCurrentAppMode(AppMode.APPEARANCE);
          }
        }}
      />
  )
}
