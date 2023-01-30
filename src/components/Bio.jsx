import React, { useEffect } from "react"
import styles from "./Bio.module.css"

const generalPersonality = [
  "Can you tell me about a time when you had to overcome a difficult obstacle?",
  "How do you handle stress or pressure?",
  "Can you tell me about a time when you had to adapt to a new situation?",
  "How do you handle conflicts or disagreements with others?",
  "Can you tell me about a time when you had to work on a team?",
  "Can you tell me about a time when you had to make an important decision?",
  "How do you handle criticism or feedback?",
  "Can you tell me about a personal accomplishment you are proud of?",
  "Can you tell me about a time when you had to take the lead on a project or task?",
  "How do you define success?",
]

const relationships = [
  "How do you define a healthy relationship?",
  "Can you tell me about a past relationship and what you learned from it?",
  "What are some qualities that are important to you in a romantic partner?",
  "How do you handle disagreements or conflicts in a relationship?",
  "What are your thoughts on communication and trust in a relationship?",
  "How do you approach the topic of discussing future goals and plans with a romantic partner?",
  "How do you prioritize and maintain friendships?",
  "Can you tell me about a time when you had to apologize or make amends with a friend?",
  "How do you handle jealousy or envy in a friendship?",
  "How do you show love and support to friends?",
]

const hobbies = [
  "What are your favorite hobbies or activities?",
  "How do you like to spend your free time?",
  "Can you tell me about a project or accomplishment you're particularly proud of in your professional life?",
  "How do you like to relax and unwind after a long day?",
  "What kind of work or career do you find most fulfilling?",
  "How do you balance work and personal life?",
  "Can you tell me about a time when you learned a new skill or took on a new hobby?",
  "What are your favorite books, movies, TV shows or music?",
  "How do you like to travel?",
  "What are your thoughts on work-life balance and how do you maintain it?",
]

export default function Bio() {
  const [name, setName] = React.useState(localStorage.getItem("name") || "")
  const [bio, setBio] = React.useState(localStorage.getItem("bio") || "")
  const [greeting, setGreeting] = React.useState(
    localStorage.getItem("greeting") || "heya",
  )
  const [question1, setQuestion1] = React.useState(
    localStorage.getItem("question1") || generalPersonality[0],
  )
  const [question2, setQuestion2] = React.useState(
    localStorage.getItem("question2") || relationships[0],
  )
  const [question3, setQuestion3] = React.useState(
    localStorage.getItem("question3") || hobbies[0],
  )
  const [response1, setResponse1] = React.useState(
    localStorage.getItem("response1") || "",
  )
  const [response2, setResponse2] = React.useState(
    localStorage.getItem("response2") || "",
  )
  const [response3, setResponse3] = React.useState(
    localStorage.getItem("response3") || "",
  )

  // after each state is updated, save to local storage
  React.useEffect(() => {
    console.log(question1)
    localStorage.setItem("name", name)
    localStorage.setItem("bio", bio)
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
    <div className={styles["container"]}>
      {/* input fields for name, bio, preferred greeting, question1 (dropdown and text input), question2 (dropdown and text input) and question3 (dropdown and text input) */}
      <span>
        <label htmlFor="name">Name</label>
        <input
          type="text"
          name="name"
          defaultValue={name}
          onChange={(e) => setName(e.target.value)}
        />
      </span>
      <span>
        <label htmlFor="greeting">Preferred Greeting</label>
        <input
          type="text"
          name="greeting"
          defaultValue={greeting}
          onChange={(e) => setGreeting(e.target.value)}
        />
      </span>

      <label htmlFor="bio">Bio</label>
      <textarea
        name="bio"
        rows="4"
        cols="50"
        defaultValue={bio}
        onChange={(e) => setBio(e.target.value)}
      />

      <label htmlFor="question1">Question 1</label>
      <select
        name="question1"
        defaultValue={question1}
        onChange={(e) => setQuestion1(e.target.value)}
      >
        {generalPersonality.map((question, i) => {
          return (
            <option key={i} value={question}>
              {question}
            </option>
          )
        })}
      </select>
      <textarea
        name="response1"
        onChange={(e) => setResponse1(e.target.value)}
        defaultValue={response1}
      />

      <label htmlFor="question2">Question 2</label>
      <select
        name="question3"
        defaultValue={question2}
        onChange={(e) => setQuestion2(e.target.value)}
      >
        {relationships.map((question, i) => {
          return (
            <option key={i} value={question}>
              {question}
            </option>
          )
        })}
      </select>

      <textarea
        name="response1"
        defaultValue={response2}
        onChange={(e) => setResponse2(e.target.value)}
      />

      <label htmlFor="question3">Question 3</label>
      <select
        name="question3"
        defaultValue={question3}
        onChange={(e) => setQuestion3(e.target.value)}
      >
        {hobbies.map((question, i) => {
          return (
            <option key={i} value={question}>
              {question}
            </option>
          )
        })}
      </select>

      <textarea
        name="response3"
        defaultValue={response3}
        onChange={(e) => setResponse3(e.target.value)}
      />
    </div>
  )
}