import React from "react"
import styles from "./Create.module.css"
import { ViewMode, ViewContext } from "../context/ViewContext"
import CustomButton from "../components/custom-button"
import { LanguageContext } from "../context/LanguageContext"
import { useContext } from "react"

function Create({fetchNewModel}) {

  // Translate hook
  const {t} = useContext(LanguageContext);

  const { setViewMode } = React.useContext(ViewContext)

  const back = () => {
    setViewMode(ViewMode.LANDING)
  }

  const selectClass = (characterClass) => {
    fetchNewModel(characterClass.templateIndex).then(()=>{
        setViewMode(ViewMode.APPEARANCE)
    })

  }

  const classes = [
    {
        name: t('classes.beastPainter.name'),
        image: "/assets/media/disabled.png",
        description: t('classes.beastPainter.description'),
        icon: "/assets/icons/class-beast-painter.svg",
        disabled: true,
        templateIndex:2
      },
      {
        name: t('classes.engineer.name'),
        image: "/assets/media/disabled.png",
        description: t('classes.engineer.description'),
        icon: "/assets/icons/class-engineer.svg",
        disabled: true,
        templateIndex:3
      },
      {
        name: t('classes.dropHunter.name'),
        image: "/assets/media/DropHunter.png",
        description: t('classes.dropHunter.description'),
        icon: "/assets/icons/class-drop-hunter.svg",
        disabled: false,
        templateIndex:0
      },
      {
        name: t('classes.theDegen.name'),
        image: "/assets/media/degens.gif",
        description: t('classes.theDegen.description'),
        icon: "/assets/icons/class-the-degen.svg",
        disabled: true,
        templateIndex:6
      },
      {
        name: t('classes.neuralHacker.name'),
        image: "/assets/media/NeuralHacker.png",
        description: t('classes.neuralHacker.description'),
        icon: "/assets/icons/class-neural-hacker.svg",
        disabled: false,
        templateIndex:1
      },
      {
        name: t('classes.liskWitch.name'),
        image: "/assets/media/disabled.png",
        description: t('classes.liskWitch.description'),
        icon: "/assets/icons/class-lisk-witch.svg",
        disabled: true,
        templateIndex:4
      },
      {
        name: t('classes.bruiser.name'),
        image: "/assets/media/disabled.png",
        description: t('classes.bruiser.description'),
        icon: "/assets/icons/class-bruiser.svg",
        disabled: true,
        templateIndex:5
      },
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
