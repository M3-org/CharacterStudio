import React, { useEffect, useState } from "react"
import styles from "./Create.module.css"
import { ViewMode, ViewContext } from "../context/ViewContext"
import CustomButton from "../components/custom-button"
import { LanguageContext } from "../context/LanguageContext"
import { useContext } from "react"

import { SceneContext } from "../context/SceneContext"
import { SoundContext } from "../context/SoundContext"
import { AudioContext } from "../context/AudioContext"

function Create({fetchCharacterManifest}) {
  
  // Translate hook
  const {t} = useContext(LanguageContext);

  const { setViewMode } = React.useContext(ViewContext)
  const { playSound } = React.useContext(SoundContext)
  const { isMute } = React.useContext(AudioContext)
  const { manifest, characterManager } = React.useContext(SceneContext)
  const [ classes, setClasses ] = useState([]) 
  
  useEffect(() => {
    if (manifest != null){
      const manifestClasses = manifest.map((c) => {
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

    await characterManager.loadManifest(manifest[index].manifest, {createAnimationManager:true});
    //console.log(characterManager.manifestData);
    


    fetchCharacterManifest(index).then(()=>{
      // XXX charaacterManager take it out from here when ready
      // missing setAwaitDisplay
      // missing reset avatar
      // check fetchCharacterManifest222
      setViewMode(ViewMode.APPEARANCE)
    })
    !isMute && playSound('classSelect');

  }
  const hoverClass = () => {
    !isMute && playSound('classMouseOver');
  }


  // const fetchCharacterManifest222 = (index) => {
  //   setAwaitDisplay(true)
  //   resetAvatar()
  //   return new Promise((resolve) => {
  //     asyncResolve()
  //     async function asyncResolve() {
  //       const characterManifest = await fetchManifest(manifest[index].manifest);
  //       const animManager = await fetchAnimation(characterManifest)
  //       setAnimationManager(animManager)
  //       setTemplateInfo(characterManifest)
  //       setManifestSelectionIndex(index)
  //       resolve(characterManifest)
  //     }
  //   })
  // }

  

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
                    src={"/assets/backgrounds/class-frame.svg"}
                    className={styles.frame}
                  />
                </div>

                <div className={styles.lockedContainer}>
                  {characterClass["disabled"] && (
                    <img
                      src={"/assets/icons/locked.svg"}
                      className={styles.locked}
                    />
                  )}
                </div>
              </div>
              <div className={styles.icon}>
                <img
                  src={characterClass["icon"]}
                  alt={characterClass["name"]}
                />
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
