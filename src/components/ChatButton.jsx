import React, { useContext } from "react"
import { ViewMode, ViewContext } from "../context/ViewContext"
import styles from './ChatButton.module.css'

export default function ChatButton() {
  const {viewMode, setViewMode} = useContext(ViewContext)
  return (
      <div className={`${styles['SquareButton']} ${viewMode === ViewMode.APPEARANCE ? styles['Chat'] : styles['Dress']}`}
        onClick={() => {
          if (viewMode !== ViewMode.CHAT) {
            console.log('ChatButton: viewMode is APPEARANCE, setting to CHAT')
            setViewMode(ViewMode.CHAT);    
          }
          else {
            console.log('ChatButton: viewMode is CHAT, setting to APPEARANCE')
            setViewMode(ViewMode.APPEARANCE);
          }
        }}
      />
  )
}
