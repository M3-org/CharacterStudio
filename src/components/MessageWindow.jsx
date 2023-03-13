import classnames from "classnames"
import React from "react"
import styles from "./MessageWindow.module.css"
import CustomButton from "../components/custom-button"
import { AudioContext } from "../context/AudioContext"
import { SoundContext } from "../context/SoundContext"

export default function MessageWindow(props) {
    const {
      message
    } = props

    return (
      <div className={styles.container}>
        <div className={styles.messageWindow}>
              
            {/* <Mint screenshotManager = {screenshotManager} blinkManager = {blinkManager} animationManager = {animationManager}/> */}
          
            {/* <ResizableDiv setScreenshotPosition = {setScreenshotPosition} screenshotPosition = {screenshotPosition}/> */}
    
            <div className={styles.messageTitle}>Window Title</div>
            <div className={styles.buttonContainer}>
              <CustomButton
                  size={16}
                  theme="light"
                  text="Cancel"
                  onClick= {()=>{console.log("cancel")}}
                />

                <CustomButton
                  size={16}
                  theme="light"
                  text="Ok"
                  onClick= {()=>{console.log("ok")}}
                />          
            </div>
          </div>
      </div>
    )
  }
  