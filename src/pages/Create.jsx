import React, { useEffect, useState } from "react"
import styles from "./Create.module.css"
import { ViewMode, ViewContext } from "../context/ViewContext"
import CustomButton from "../components/custom-button"
import { LanguageContext } from "../context/LanguageContext"
import { useContext } from "react"

import { SceneContext } from "../context/SceneContext"
import { SoundContext } from "../context/SoundContext"
import { AudioContext } from "../context/AudioContext"

function Create({fetchNewModel}) {
  
  // Translate hook
  const {t} = useContext(LanguageContext);

  const { setViewMode } = React.useContext(ViewContext)
  const { playSound } = React.useContext(SoundContext)
  const { isMute } = React.useContext(AudioContext)
  const { manifest } = React.useContext(SceneContext)
  const [ classes, setClasses ] = useState([]) 
  
  useEffect(() => {
    if (manifest != null){
      console.log("manifest", manifest)
      const manifestClasses = manifest.map((c) => {
        console.log(c);
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
      console.log(manifestClasses);
      setClasses(manifestClasses);
    }
  }, [manifest])

  const back = () => {
    setViewMode(ViewMode.LANDING)
    !isMute && playSound('backNextButton');
  }

  const selectClass = (characterClass) => {
    fetchNewModel(characterClass.templateIndex).then(()=>{
        setViewMode(ViewMode.APPEARANCE)
    })
    !isMute && playSound('classSelect');

  }
  const hoverClass = () => {
    !isMute && playSound('classMouseOver');
  }


  const classes3 = [
    // {
    //     name: t('classes.beastPainter.name'),
    //     image: "/assets/media/disabled.png",
    //     description: t('classes.beastPainter.description'),
    //     icon: "/assets/icons/class-beast-painter.svg",
    //     disabled: true,
    //     templateIndex:2
    //   },
    //   {
    //     name: t('classes.engineer.name'),
    //     image: "/assets/media/disabled.png",
    //     description: t('classes.engineer.description'),
    //     icon: "/assets/icons/class-engineer.svg",
    //     disabled: true,
    //     templateIndex:3
    //   },
      {
        name: t('classes.dropHunter.name'),
        image: "/assets/media/DropHunter.png",
        description: t('classes.dropHunter.description'),
        icon: "/assets/icons/class-drop-hunter.svg",
        disabled: false,
        templateIndex:0
      },
      {
        name: t('classes.neuralHacker.name'),
        image: "/assets/media/NeuralHacker.png",
        description: t('classes.neuralHacker.description'),
        icon: "/assets/icons/class-neural-hacker.svg",
        disabled: false,
        templateIndex:1
      },
      // {
      //   name: t('classes.liskWitch.name'),
      //   image: "/assets/media/disabled.png",
      //   description: t('classes.liskWitch.description'),
      //   icon: "/assets/icons/class-lisk-witch.svg",
      //   disabled: true,
      //   templateIndex:4
      // },
      // {
      //   name: t('classes.bruiser.name'),
      //   image: "/assets/media/disabled.png",
      //   description: t('classes.bruiser.description'),
      //   icon: "/assets/icons/class-bruiser.svg",
      //   disabled: true,
      //   templateIndex:5
      // },
  ]

  return (
    <div className={`${styles.container} horizontalScroll`}>
      <div className={"sectionTitle"}>{t('pageTitles.chooseClass')}</div>
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
                  : () => selectClass(characterClass)
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
        { /* <CustomButton
          theme="light"
          text={t('callToAction.back')}
          size={14}
          className={styles.buttonLeft}
          onClick={back}
      /> */}
      </div>
    </div>
  )
}

export default Create
