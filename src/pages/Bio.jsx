import React, { useEffect } from "react"
import { voices } from "../constants/voices"
import CustomButton from "../components/custom-button"
import { ViewContext, ViewMode } from "../context/ViewContext"
import styles from "./Bio.module.css"

export const getBio = (templateInfo, personality) => {
  const classType = templateInfo.name.toUpperCase();

  const name = personality.names[Math.floor(Math.random() * personality.names.length)]
  const city = personality.cities[Math.floor(Math.random() * personality.cities.length)]
  const weapon = personality.weapons[Math.floor(Math.random() * personality.weapons.length)]
  const hobby = personality.hobbies[Math.floor(Math.random() * personality.hobbies.length)]
  const profession = personality.professions[Math.floor(Math.random() * personality.professions.length)]
  const heshe = personality.heShe[classType]

  const bio = `${name} is a ${personality.classes[classType]} from ${city}. ${heshe} is ${hobby}. ${heshe} also enjoys ${profession}. ${heshe} is armed with a ${weapon}.`
  return { name, bio }
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


function BioPage({ templateInfo, personality }) {
  const { setViewMode } = React.useContext(ViewContext)

  const back = () => {
    setViewMode(ViewMode.APPEARANCE)
  }

  const next = () => {
    setViewMode(ViewMode.SAVE)
  }

  const _bio = getBio(templateInfo, personality)

  const [name, setName] = React.useState(
    localStorage.getItem("name")
    || _bio.name
  )
  const [bio, setBio] = React.useState(
    localStorage.getItem("bio")
    || _bio.bio
  )
  const [voice, setVoice] = React.useState(
    localStorage.getItem("voice")
    || voiceKeys[0]
  )

  const [greeting, setGreeting] = React.useState(
    localStorage.getItem("greeting") || "Hey there!",
  )

    const q1 = getPersonalityQuestionsAndAnswers(personality);
    const q2 = getRelationshipQuestionsAndAnswers(personality);
    const q3 = getHobbyQuestionsAndAnswers(personality);

  const [question1, setQuestion1] = React.useState(
    localStorage.getItem("question1") || q1.question,
  )
  const [question2, setQuestion2] = React.useState(
    localStorage.getItem("question2") || q2.question,
  )
  const [question3, setQuestion3] = React.useState(
    localStorage.getItem("question3") || q3.question,
  )
  const [response1, setResponse1] = React.useState(
    localStorage.getItem("response1") || q1.answer,
  )
  const [response2, setResponse2] = React.useState(
    localStorage.getItem("response2") || q2.answer,
  )
  const [response3, setResponse3] = React.useState(
    localStorage.getItem("response3") || q3.answer,
  )

  // after each state is updated, save to local storage
  React.useEffect(() => {
    localStorage.setItem("name", name)
    localStorage.setItem("bio", bio)
    localStorage.setItem("voice", voice)
    localStorage.setItem("greeting", greeting)
    localStorage.setItem("question1", question1)
    localStorage.setItem("question2", question2)
    localStorage.setItem("question3", question3)
    localStorage.setItem("response1", response1)
    localStorage.setItem("response2", response2)
    localStorage.setItem("response3", response3)
  }, [
    name,
    bio,
    voice,
    greeting,
    question1,
    question2,
    question3,
    response1,
    response2,
    response3,
  ])

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

  return (
    <div className={styles.container}>
      <div className={"sectionTitle"}>Create Bio</div>
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
              defaultValue={name}
              onChange={(e) => setName(e.target.value)}
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
              defaultValue={voice}
              onChange={(e) => setVoice(e.target.value)}
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
              defaultValue={greeting}
              onChange={(e) => setGreeting(e.target.value)}
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
              defaultValue={bio}
              onChange={(e) => setBio(e.target.value)}
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
              defaultValue={question1}
              onChange={(e) => setQuestion1(e.target.value)}
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
              onChange={(e) => setResponse1(e.target.value)}
              defaultValue={response1}
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
              defaultValue={question2}
              onChange={(e) => setQuestion2(e.target.value)}
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
              defaultValue={response2}
              onChange={(e) => setResponse2(e.target.value)}
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
              defaultValue={question3}
              onChange={(e) => setQuestion3(e.target.value)}
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
              defaultValue={response3}
              onChange={(e) => setResponse3(e.target.value)}
            />
          </div>
        </div>
        </div>
      </div>
      <div className={styles.buttonContainer}>
        <CustomButton
          theme="light"
          text="Back"
          size={14}
          className={styles.buttonLeft}
          onClick={back}
        />
        <CustomButton
          theme="light"
          text="Next"
          size={14}
          className={styles.buttonRight}
          onClick={next}
        />
      </div>
    </div>
  )
}

export default BioPage