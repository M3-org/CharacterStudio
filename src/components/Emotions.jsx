import React, { useEffect } from "react"
import styles from "./Emotions.module.css"
import MenuTitle from "./MenuTitle"
import { SceneContext } from "../context/SceneContext";
import Slider from "./Slider";


export default function Emotions(){

    const {  characterManager,moveCamera } = React.useContext(SceneContext)

    const [isConstant, setConstant] = React.useState(false)
    const [intensity, setIntensity] = React.useState(1)

    const availableEmotions = characterManager.emotionManager.availableEmotions

    useEffect(() => {
        moveCamera({ targetY:1.8, distance:2})
    }, [])

    const playEmotion = (emotion)=>{
        characterManager.emotionManager.playEmotion(emotion,undefined,isConstant,intensity)
    }

    return (

        <div>
            <div className={styles["InformationContainerPos"]}>
                <MenuTitle title="Emotions" width={180} right={20}/>
                <div className={styles["scrollContainer"]}>
                    <div className={styles["traitInfoText"]}>
                        View different emotions
                    </div>

                    <div className={styles["checkboxHolder"]}>
                        <div>
                            </div>

                            <label className={styles["custom-checkbox"]}>
                                <input 
                                    type="checkbox" 
                                    checked={isConstant} 
                                    onChange={() => setConstant(!isConstant)} 
                                />
                                <div className={styles["checkbox-container"]}></div>
                            </label>
                            <div/><div/>
                            <div style={{color:"white"}}>Constant Emotion</div>


                        </div>
                        <br />
                    <div className={styles["traitInfoText"]}>
                        Intensity: {parseFloat(intensity.toFixed(2))}
                    </div>

                        <Slider title='' value = {parseFloat(intensity.toFixed(2))} onChange={(e) => setIntensity(parseFloat(e.currentTarget.value.toString()))} min={0} max={1} step={0.01}/>
                        <br/>

                    {availableEmotions.map((emotion, index) => {
                        return (
                            <div 
                                key={index}
                                className={styles["actionButton"]}
                                onClick={() => {
                                    playEmotion(emotion)
                                }}>
                                <div>  {emotion} </div>
                            </div>
                        )
                    })}
                </div>
            </div>
        </div>
    )
}