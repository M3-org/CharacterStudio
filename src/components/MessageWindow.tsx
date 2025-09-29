import React from "react"
import styles from "./MessageWindow.module.css"
import CustomButton from "./custom-button"

export default function MessageWindow({
  cancelOption = true,
  confirmDialogText,
  confirmDialogWindow,
  setConfirmDialogWindow,
  confirmDialogCallback
}:{
    cancelOption?:boolean,
    confirmDialogText:string,
    confirmDialogWindow:boolean,
    setConfirmDialogWindow:React.Dispatch<React.SetStateAction<boolean>>,
    confirmDialogCallback:((result:boolean)=>void)[]
}) {

    
    return (
      confirmDialogWindow?(
        <div className={styles.container}>
          <div className={styles.messageWindow}>
              <div className={styles.messageTitle}>{confirmDialogText}</div>
              <div className={styles.buttonContainer}>
                
              {cancelOption &&
                <CustomButton
                    size={16}
                    theme="light"
                    text="Cancel"
                    onClick= {()=>{
                      if (confirmDialogCallback.length > 0){
                        confirmDialogCallback[0](false)
                      }
                      setConfirmDialogWindow(false)
                    }}
                  />
                }  
                    <CustomButton
                      size={16}
                      theme="light"
                      text="Continue"
                      onClick= {()=>{
                        if (confirmDialogCallback.length > 0){
                          confirmDialogCallback[0](true)
                        }
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
  