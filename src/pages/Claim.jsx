import React, { useEffect, useState } from "react"
import styles from "./Create.module.css"
import { ViewMode, ViewContext } from "../context/ViewContext"
import CustomButton from "../components/custom-button"
import { LanguageContext } from "../context/LanguageContext"
import { useContext } from "react"

import { SceneContext } from "../context/SceneContext"
import { SoundContext } from "../context/SoundContext"
import { AudioContext } from "../context/AudioContext"

function Claim() {
  
  // Translate hook
  const {t} = useContext(LanguageContext);

  const { setViewMode, setIsLoading, isLoading } = React.useContext(ViewContext)
  const { playSound } = React.useContext(SoundContext)
  const { isMute } = React.useContext(AudioContext)
  const { manifest, characterManager } = React.useContext(SceneContext)
  const [ classes, setClasses ] = useState([]) 
  
  useEffect(() => {
    if (manifest?.characters != null){
      const manifestClasses = manifest.characters.map((c) => {
        return {
          name:c.name, 
          image:c.portrait, 
          description: c.description,
          manifest: c.manifest,
          icon:c.icon,
          format:c.format,
          disabled:false
        }
      })
      setClasses(manifestClasses);
    }
  }, [manifest])

  const back = () => {
    setViewMode(ViewMode.LANDING)
    !isMute && playSound('backNextButton');
  }

  const selectClass = async (index) => {
    setIsLoading(true)
    // Load manifest first
    characterManager.loadManifest(manifest.characters[index].manifest).then(()=>{
      setViewMode(ViewMode.BATCHDOWNLOAD)
      // When Manifest is Loaded, load initial traits from given manifest
      characterManager.loadInitialTraits().then(()=>{
        setIsLoading(false)
      })
    })
    !isMute && playSound('classSelect');

  }
  const selectByManifest = () => {
    setViewMode(ViewMode.BATCHMANIFEST)
  }
  const hoverClass = () => {
    !isMute && playSound('classMouseOver');
  }
  
  return (
    <div className={`${styles.container} horizontalScroll`}>
      <div className={"sectionTitle"}>{t('pageTitles.chooseClass')}</div>
      <div className={styles.vrmOptimizerButton}>
      </div>
      <div className={styles.topLine} />
      
      <div className={styles.classContainer}>
        {classes.map((characterClass, i) => {
          return (
            <div
              key={i}
              className={
                !characterClass["disabled"]
                  ? styles.class
                  : styles.classdisabled
              }
              onClick={
                characterClass["disabled"]
                  ? null
                  : () => selectClass(i)
              }
              onMouseOver={
                characterClass["disabled"]
                  ? null
                  : () => hoverClass()
              }
            >
            <div
                className={styles.classFrame}
                style={{
                  "backgroundImage": `url(${characterClass["image"]})`,
                }}
              >
                <div className={styles.frameContainer}>
                  <img
                    src={"./assets/backgrounds/class-frame.svg"}
                    className={styles.frame}
                  />
                </div>

                <div className={styles.lockedContainer}>
                  {characterClass["disabled"] && (
                    <img
                      src={"./assets/icons/locked.svg"}
                      className={styles.locked}
                    />
                  )}
                </div>
              </div>
              
              <div className={styles.name}>{characterClass["name"]}</div>
              <div className={styles.description}>
                {characterClass["description"]}
              </div>
            </div>
          )
        })}
        <div
              key={"manifest-load"}
              className={styles.class}
              onClick={() => selectByManifest()}
              onMouseOver={() => hoverClass()}
            >
            <div
                className={styles.classFrame}
                style={{"backgroundImage": `url(./assets/media/disabled.png)`}}
              >
                <div className={styles.frameContainer}>
                  <img
                    src={"./assets/backgrounds/class-frame.svg"}
                    className={styles.frame}
                  />
                </div>
              </div>

              <div className={styles.name}>{"Manifest"}</div>
              <div className={styles.description}>
                {"Load by manifest"}
              </div>
            </div>
      </div>

      <div className={styles.bottomLine} />
      <div className={styles.buttonContainer}>
        { <CustomButton
          theme="light"
          text={t('callToAction.back')}
          size={14}
          className={styles.buttonLeft}
          onClick={back}
      />}
      </div>
    </div>
  )
}

export default Claim
