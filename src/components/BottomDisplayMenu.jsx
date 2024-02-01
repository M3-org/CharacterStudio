import React, {useEffect,useState,useContext} from "react"
import styles from "./BottomDisplayMenu.module.css"
import { SceneContext } from "../context/SceneContext"
import { ViewContext } from "../context/ViewContext"
import randomizeIcon from "../images/randomize-green.png"
import wireframeIcon from "../images/wireframe.png"
import solidIcon from "../images/solid.png"
import mouseFollowIcon from "../images/eye.png"
import mouseNoFollowIcon from "../images/no-eye.png"

export default function BottomDisplayMenu({loadedAnimationName, randomize}){
  const {
    characterManager,
    toggleDebugMode,
    debugMode,
    lookAtManager,
    animationManager
  } = useContext(SceneContext);
  const [hasMouseLook, setHasMouseLook] = useState(lookAtManager.userActivated);
  const [animationName, setAnimationName] = React.useState(animationManager?.getCurrentAnimationName() || "");

  useEffect(()=>{
    if (loadedAnimationName != ""){
      setAnimationName(loadedAnimationName);
    }
  },[loadedAnimationName])

  const clickDebugMode = () =>{
    toggleDebugMode()
  } 
  
  const handleMouseLookEnable = () => {
    lookAtManager.setActive(!hasMouseLook);
    // should be called within lookatManager
    animationManager.enableMouseLook(!hasMouseLook);
    setHasMouseLook(!hasMouseLook);
  };

  const nextAnimation = async () => {
    console.log("play next")
    await animationManager.loadNextAnimation();
    setAnimationName(animationManager.getCurrentAnimationName());
  }
  const prevAnimation = async () => {
      console.log("play prev")
      await animationManager.loadPreviousAnimation();
      setAnimationName(animationManager.getCurrentAnimationName());
  }
  return (
        <div className={styles["Container"]}>
          <div className={styles["ContainerPosition"]}>
          <div className={styles["topLine"]} />
          <div className={styles["flexSelect"]}>
            <div 
                className={`${styles["arrow-button"]} ${styles["left-button"]}`}
                onClick={prevAnimation}
            ></div>
            <div className={styles["traitInfoTitle"]} style={{ marginBottom: '10px' }}>{animationName}</div>
            <div 
                className={`${styles["arrow-button"]} ${styles["right-button"]}`}
                onClick={nextAnimation}
            ></div>
          </div>

          <div className={styles["flexButtons"]}>
            <div 
                className={`${styles["optionButtons"]}`}
                onClick={randomize}
            >
              <img 
                  src={randomizeIcon}
              /> 
            </div>
            <div 
                className={`${styles["optionButtons"]}`}
                onClick={handleMouseLookEnable}
            >
              <img 
                  src={hasMouseLook ? mouseNoFollowIcon : mouseFollowIcon}
              /> 
            </div>
            <div 
                className={`${styles["optionButtons"]}`}
                onClick={clickDebugMode}
            >
              <img 
                  src={debugMode ? solidIcon : wireframeIcon}
              /> 
            </div>


          </div>
          </div>
        </div>
    );
}