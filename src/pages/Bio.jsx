import React, { useContext, useEffect } from "react"
import { voices } from "../constants/voices"
import CustomButton from "../components/custom-button"
import { ViewContext, ViewMode } from "../context/ViewContext"
import styles from "./Bio.module.css"
import { LanguageContext } from "../context/LanguageContext"

export const getBio = (templateInfo, personality) => {
  const classType = templateInfo.name.toUpperCase();

  const name = personality.names[Math.floor(Math.random() * personality.names.length)]
  const city = personality.cities[Math.floor(Math.random() * personality.cities.length)]
  const weapon = personality.weapons[Math.floor(Math.random() * personality.weapons.length)]
  const hobby = personality.hobbies[Math.floor(Math.random() * personality.hobbies.length)]
  const profession = personality.professions[Math.floor(Math.random() * personality.professions.length)]
  const heshe = personality.heShe[classType]

  const voiceKey = Object.keys(voices).find((v) => {
    if (heshe.toUpperCase() === "SHE"){
      
      if (v.includes("Female")){
        return v
      }
    }
    if (heshe.toUpperCase() === "HE")
      if (v.includes("Male")){
        return v
      }
  } )
  const description = `${name} is a ${personality.classes[classType]} from ${city}. ${heshe} is ${hobby}. ${heshe} also enjoys ${profession}. ${heshe} is armed with a ${weapon}.`
  
  const q1 = getPersonalityQuestionsAndAnswers(personality);
  const q2 = getRelationshipQuestionsAndAnswers(personality);
  const q3 = getHobbyQuestionsAndAnswers(personality);

  const fullBio = {
    name,
    classType,
    city,
    weapon,
    hobby,
    profession,
    heshe,
    voiceKey,
    personality: q1, //{question, answer}
    relationship: q2,
    hobbies: q3,
    description,
    greeting:"Hello"
  }

  return fullBio
}

export const getPersonalityQuestionsAndAnswers = (personality) => {
  const question =
  personality.generalPersonalityQuestions[Math.floor(Math.random() * personality.generalPersonalityQuestions.length)]
  const answer =
    personality.generalPersonalityAnswers[
      Math.floor(Math.random() * personality.generalPersonalityAnswers.length)
    ]
  return { question, answer }
}

export const getHobbyQuestionsAndAnswers = (personality) => {
  const question = personality.hobbyQuestions[Math.floor(Math.random() * personality.hobbyQuestions.length)]
  const answer = personality.hobbyAnswers[Math.floor(Math.random() * personality.hobbyAnswers.length)]
  return { question, answer }
}

export const getRelationshipQuestionsAndAnswers = (personality) => {
  const question = personality.relationshipQuestions[Math.floor(Math.random() * personality.relationshipQuestions.length)]
  const answer = personality.relationshipAnswers[Math.floor(Math.random() * personality.relationshipAnswers.length)]
  return { question, answer }
}


// Cache voice keys for performance.
const voiceKeys = Object.keys(voices)

function loadBioFromStorage(itemName){
  const fullBioStr = localStorage.getItem(itemName)
  if (fullBioStr)
    return JSON.parse(fullBioStr)
  return null
}

function BioPage({ templateInfo, personality }) {
  const { setViewMode } = React.useContext(ViewContext)

  const back = () => {
    setViewMode(ViewMode.APPEARANCE)
  }

  const next = () => {
    setViewMode(ViewMode.SAVE)
  }

  const [fullBio, setFullBio] = React.useState(
    loadBioFromStorage(`${templateInfo.id}_fulBio`)
    ||
    getBio(templateInfo, personality)
  )

  React.useEffect(() => {
    localStorage.setItem(`${templateInfo.id}_fulBio`, JSON.stringify(fullBio))
  }, [fullBio])


  // if user presses ctrl c, clear the messages
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.ctrlKey && event.key === "c") {
        // spacebar
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => {
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [])

  // Translate hook
  const { t } = useContext(LanguageContext);

  return (
    <div className={styles.container}>
      <div className={"sectionTitle"}>{t("pageTitles.createBio")}</div>
      <div className={styles.bioContainer}>
        <div className={styles.topLine} />
        <div className={styles.bottomLine} />
        <div className={styles.scrollContainer}>

          <div className={styles["inner-container"]}>
            {/* Name */}
            <div className={styles.section}>
              <label
                className={styles.label}
                htmlFor="name">
                Name
              </label>

              <input
                type="text"
                name="name"
                className={styles.input}
                defaultValue={fullBio.name}
                onChange={(e) => setFullBio({...fullBio, ...{name:e.target.value}})}
              />
            </div>

            {/* Voice */}
            <div className={styles.section}>
              <label
                className={styles.label}
                htmlFor="voice">
                Voice
              </label>

              <select
                name="voice"
                className={styles.select}
                defaultValue={fullBio.voiceKey}
                onChange={(e) => setFullBio({...fullBio, ...{voiceKey:e.target.value}})}
              >
                {voiceKeys.map((option, i) => {
                  return (
                    <option key={i} value={option}>
                      {option}
                    </option>
                  )
                })}
              </select>
            </div>

            {/* Preferred Greeting */}
            <div className={styles.section}>
              <label
                className={styles.label}
                htmlFor="greeting">
                Preferred Greeting
              </label>

              <input
                type="text"
                name="greeting"
                className={styles.input}
                defaultValue={fullBio.greeting}
                onChange={(e) => setFullBio({...fullBio, ...{greeting:e.target.value}})}
              />
            </div>

            {/* Bio */}
            <div className={styles.section}>
              <label className={styles.label} htmlFor="bio">Bio</label>

              <textarea
                name="bio"
                className={styles.input}
                rows="4"
                cols="50"
                defaultValue={fullBio.description}
                onChange={(e) => setFullBio({...fullBio, ...{description:e.target.value}})}
              />
            </div>

            {/* Question 1 */}
            <div className={styles.section}>
              <label
                className={styles.label}
                htmlFor="question1">
                Question 1
              </label>

              <select
                name="question1"
                className={styles.select}
                defaultValue={fullBio.personality.question}
                onChange={(e) => setFullBio({...fullBio, ...{
                    personality:{
                      question:e.target.value,
                      answer:fullBio.personality.answer
                    }
                  }})}
              >
                {personality.generalPersonalityQuestions.map((question, i) => {
                  return (
                    <option key={i} value={question}>
                      {question}
                    </option>
                  )
                })}
              </select>
              <textarea
                name="response1"
                className={styles.input}
                defaultValue={fullBio.personality.answer}
                onChange={(e) => setFullBio({...fullBio, ...{
                    personality:{
                      question:fullBio.personality.question,
                      answer:e.target.value
                    }
                  }})}


              />
            </div>

            {/* Question 2 */}
            <div className={styles.section}>
              <label
                className={styles.label}
                htmlFor="question2">
                Question 2
              </label>

              <select
                name="question2"
                className={styles.select}
                defaultValue={fullBio.relationship.question}
                onChange={(e) => setFullBio({...fullBio, ...{
                    relationship:{
                      question:e.target.value,
                      answer:fullBio.relationship.answer
                    }
                  }})}
              >
                {personality.relationshipQuestions.map((question, i) => {
                  return (
                    <option key={i} value={question}>
                      {question}
                    </option>
                  )
                })}
              </select>

              <textarea
                name="response1"
                className={styles.input}
                defaultValue={fullBio.relationship.answer}
                onChange={(e) => setFullBio({...fullBio, ...{
                    relationship:{
                      question:fullBio.relationship.question,
                      answer:e.target.value
                    }
                  }})}
              />
            </div>

            {/* Question 3 */}
            <div className={styles.section}>
              <label
                className={styles.label}
                htmlFor="question3">
                Question 3
              </label>
              <select
                name="question3"
                className={styles.select}
                defaultValue={fullBio.hobbies.question}
                onChange={(e) => setFullBio({...fullBio, ...{
                    hobbies:{
                      question:e.target.value,
                      answer: fullBio.hobbies.answer
                    }
                  }})}
              >
                {personality.hobbyQuestions.map((question, i) => {
                  return (
                    <option key={i} value={question}>
                      {question}
                    </option>
                  )
                })}
              </select>

              <textarea
                name="response3"
                className={styles.input}
                defaultValue={fullBio.hobbies.answer}
                onChange={(e) => setFullBio({...fullBio, ...{
                    hobbies:{
                      question:fullBio.hobbies.question,
                      answer:e.target.value
                    }
                  }})}
              />
            </div>
          </div>
        </div>
      </div>
      <div className={styles.buttonContainer}>
        <CustomButton
          theme="light"
          text={t('callToAction.back')}
          size={14}
          className={styles.buttonLeft}
          onClick={back}
        />
        <CustomButton
          theme="light"
          text={t('callToAction.next')}
          size={14}
          className={styles.buttonRight}
          onClick={next}
        />
      </div>
    </div>
  )
}

export default BioPage