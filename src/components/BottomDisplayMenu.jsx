import React, {useEffect,useState,useContext} from "react"
import styles from "./BottomDisplayMenu.module.css"
import { SceneContext } from "../context/SceneContext"
import { ViewContext } from "../context/ViewContext"
import randomizeIcon from "../images/randomize-green.png"
import wireframeIcon from "../images/wireframe.png"
import solidIcon from "../images/solid.png"
import mouseFollowIcon from "../images/eye.png"
import mouseNoFollowIcon from "../images/no-eye.png"
import playIcon from "../images/play.png"
import reverseIcon from "../images/reverse.png"
import pauseIcon from "../images/pause.png"
import fastForwardIcon from "../images/fast-forward.png"
import fastBackwardIcon from "../images/fast-backward.png"

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
    if (loadedAnimationName == null){
      loadedAnimationName = "T-Pose";
    }
    if (loadedAnimationName != ""){
      setAnimationName(loadedAnimationName);
    }
  },[loadedAnimationName])

  const clickDebugMode = () =>{
    toggleDebugMode()
  } 
  
  const handlePlayPauseMode = (play) =>{
    play ? animationManager.play() : animationManager.pause();
    animationManager.setSpeed(1);
  }

  const handlePlaySpeed = (speed) =>{
    animationManager.play()
    animationManager.setSpeed(speed);
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
          <div className={styles["ContainerPositionTop"]}>
            <div className={styles["flexButtonsTop"]}>
              <div 
                  className={`${styles["optionButtonsSmall"]}`}
                  onClick={()=>{handlePlaySpeed(-2)}}
              >
                <img 
                    src={fastBackwardIcon}
                /> 
              </div>
              <div 
                  className={`${styles["optionButtonsSmall"]}`}
                  onClick={()=>{handlePlaySpeed(-1)}}
              >
                <img 
                    src={reverseIcon}
                /> 
              </div>

              <div 
                  className={`${styles["optionButtonsSmall"]}`}
                  onClick={()=>{handlePlayPauseMode(false)}}
              >
                <img 
                    src={pauseIcon}
                /> 
              </div>

              <div 
                  className={`${styles["optionButtonsSmall"]}`}
                  onClick={()=>{handlePlayPauseMode(true)}}
              >
                <img 
                    src={playIcon}
                /> 
              </div>
              <div 
                  className={`${styles["optionButtonsSmall"]}`}
                  onClick={()=>{handlePlaySpeed(2)}}
              >
                <img 
                    src={fastForwardIcon}
                /> 
              </div>


            </div>
          </div>
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
            {randomize &&
              <div 
                className={`${styles["optionButtons"]}`}
                onClick={randomize}
              >
                <img 
                    src={randomizeIcon}
                /> 
              </div>
            }
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