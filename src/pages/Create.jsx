import React, { useEffect, useState } from "react"
import styles from "./Create.module.css"
import { ViewMode, ViewContext } from "../context/ViewContext"
import CustomButton from "../components/custom-button"
import { LanguageContext } from "../context/LanguageContext"
import { useContext } from "react"

import { SceneContext } from "../context/SceneContext"
import { SoundContext } from "../context/SoundContext"
import { AudioContext } from "../context/AudioContext"

import { getAsArray } from "../library/utils"

function Create() {
  
  // Translate hook
  const {t} = useContext(LanguageContext);

  const { setViewMode, setIsLoading, isLoading } = React.useContext(ViewContext)
  const { playSound } = React.useContext(SoundContext)
  const { isMute } = React.useContext(AudioContext)
  const { manifest, characterManager } = React.useContext(SceneContext)
  const [ classes, setClasses ] = useState([]) 


  useEffect(() => {

    if (manifest?.characters != null){
      const manifestClasses = getCharacterManifests(getAsArray(manifest.characters));
      setClasses(manifestClasses);
    }
  }, [manifest])

  const back = () => {
    setViewMode(ViewMode.LANDING)
    !isMute && playSound('backNextButton');
  }

  const getCharacterManifests = (charactersArray) =>{
      return charactersArray.map((c) => {
        return {
          name:c.name, 
          portrait:c.portrait, 
          description: c.description,
          manifest: c.manifest,
          icon:c.icon,
          format:c.format,
          manifestAppend: getCharacterManifests(getAsArray(c.manifestAppend)),
        }
      })
  }

  const selectClass = async (index) => {
    setIsLoading(true)
    const selectedClass = classes[index];

    await characterManager.loadManifest(selectedClass.manifest,selectedClass.name);

    setViewMode(ViewMode.APPEARANCE)
    const promises = selectedClass.manifestAppend.map(manifestAppend => {
      return new Promise((resolve)=>{
        
        characterManager.loadManifest(manifestAppend.manifest, manifestAppend.name).then(()=>{
          resolve();
        })
      })
    });

    await Promise.all(promises);
    // When Manifest is Loaded, load initial traits from given manifest

    characterManager.loadInitialTraits().then(()=>{
      setIsLoading(false)
    })
    !isMute && playSound('classSelect');

  }

  const hoverSound = () => {
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
                  () => selectClass(i)
              }
              onMouseOver={
                  () => hoverSound()
              }
            >
            <div
                className={styles.classFrame}
                style={{
                  "backgroundImage": `url(${characterClass["portrait"]})`,
                }}
              >
                <div className={styles.frameContainer}>
                  <img
                    src={"./assets/backgrounds/class-frame.svg"}
                    className={styles.frame}
                  />
                </div>

              </div>
              
              <div className={styles.name}>{characterClass["name"]}</div>
              <div className={styles.description}>
                {characterClass["description"]}
              </div>
            </div>
          )
        })}
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

export default Create
