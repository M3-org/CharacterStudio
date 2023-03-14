import classnames from "classnames"
import React from "react"
import styles from "./MessageWindow.module.css"
import CustomButton from "../components/custom-button"
import { AudioContext } from "../context/AudioContext"
import { SoundContext } from "../context/SoundContext"

export default function MessageWindow(props) {
    const {
      cancelOption = true,
      confirmDialogText,
      confirmDialogWindow,
      setConfirmDialogWindow,
      confirmDialogCallback

    } = props
    
    return (
      confirmDialogWindow?(
        <div className={styles.container}>
          <div className={styles.messageWindow}>
                
              {/* <Mint screenshotManager = {screenshotManager} blinkManager = {blinkManager} animationManager = {animationManager}/> */}
            
              {/* <ResizableDiv setScreenshotPosition = {setScreenshotPosition} screenshotPosition = {screenshotPosition}/> */}
      
              <div className={styles.messageTitle}>{confirmDialogText}</div>
              <div className={styles.buttonContainer}>
                
              {cancelOption &&
                <CustomButton
                    size={16}
                    theme="light"
                    text="Cancel"
                    onClick= {()=>{
                      confirmDialogCallback[0](false)
                      setConfirmDialogWindow(false)
                    }}
                  />
                }  
                    <CustomButton
                      size={16}
                      theme="light"
                      text="Continue"
                      onClick= {()=>{
                        confirmDialogCallback[0](true)
                        setConfirmDialogWindow(false)
                      }}
                    /> 
                        
              </div>
            </div>
        </div>)
        :
        <div></div>
    )
  }
  