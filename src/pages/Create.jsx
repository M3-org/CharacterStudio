import React from "react"
import styles from "./Create.module.css"
import { ViewMode, ViewContext } from "../context/ViewContext"
import CustomButton from "../components/custom-button"

function Create({ fetchNewModel }) {
  const { setViewMode } = React.useContext(ViewContext)

  const back = () => {
    setViewMode(ViewMode.LANDING)
  }

  const selectClass = (characterClass) => {
    fetchNewModel(characterClass.templateIndex).then(() => {
      setViewMode(ViewMode.APPEARANCE)
    })
  }

  const classes = [
    {
      name: "Beast Painter",
      image: "/assets/media/disabled.png",
      description: "Paints beasts",
      icon: "/assets/icons/class-beast-painter.svg",
      disabled: true,
      templateIndex: 2,
    },
    {
      name: "Engineer",
      image: "/assets/media/disabled.png",
      description: "Builds things",
      icon: "/assets/icons/class-engineer.svg",
      disabled: true,
      templateIndex: 3,
    },
    {
      name: "Drop Hunter",
      image: "/assets/media/DropHunter.png",
      description: "Hunts drops",
      icon: "/assets/icons/class-drop-hunter.svg",
      disabled: false,
      templateIndex: 0,
    },
    {
      name: "The Degen",
      image: "/assets/media/degens.gif",
      description: "Degens",
      icon: "/assets/icons/class-the-degen.svg",
      disabled: true,
      templateIndex: 6,
    },
    {
      name: "Neural Hacker",
      image: "/assets/media/NeuralHacker.png",
      description: "Hacks neural networks",
      icon: "/assets/icons/class-neural-hacker.svg",
      disabled: false,
      templateIndex: 1,
    },
    {
      name: "Lisk Witch",
      image: "/assets/media/disabled.png",
      description: "Witches lisk",
      icon: "/assets/icons/class-lisk-witch.svg",
      disabled: true,
      templateIndex: 4,
    },
    {
      name: "Bruiser",
      image: "/assets/media/disabled.png",
      description: "Bruises things",
      icon: "/assets/icons/class-bruiser.svg",
      disabled: true,
      templateIndex: 5,
    },
  ]

  return (
    <div className={`${styles.container} horizontalScroll`}>
      <div className={"sectionTitle"}>Choose Character Class</div>
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
          text="Back"
          size={14}
          className={styles.buttonLeft}
          onClick={back}
      /> */}
      </div>
    </div>
  )
}

export default Create
