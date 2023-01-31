import React, { useEffect } from "react"
import axios from "axios"
import { SceneContext } from "../context/SceneContext"
import styles from "./Chat.module.css"
import CustomButton from "./custom-button"

import {
  sepiaSpeechRecognitionInit,
  SepiaSpeechRecognitionConfig,
} from "sepia-speechrecognition-polyfill"

const sessionId =
  localStorage.getItem("sessionId") ??
  Math.random().toString(36).substring(2, 15) +
    Math.random().toString(36).substring(2, 15)
localStorage.setItem("sessionId", sessionId)

const config = new SepiaSpeechRecognitionConfig()

const defaultSpeaker = "Speaker"

const SpeechRecognition =
  window.webkitSpeechRecognition || sepiaSpeechRecognitionInit(config)

export default function ChatBox({
  name,
  bio,
  greeting,
  question1,
  question2,
  question3,
  response1,
  response2,
  response3,
}) {
  const [micEnabled, setMicEnabled] = React.useState(false)

  const [speechrecognition, setSpeechrecognition] = React.useState(false)

  const name = localStorage.getItem("name")
  const bio = localStorage.getItem("bio")
  const greeting = localStorage.getItem("greeting")
  const question1 = localStorage.getItem("question1")
  const question2 = localStorage.getItem("question2")
  const question3 = localStorage.getItem("question3")
  const response1 = localStorage.getItem("response1")
  const response2 = localStorage.getItem("response2")
  const response3 = localStorage.getItem("response3")

  const [speaker, setSpeaker] = React.useState(
    localStorage.getItem("speaker") || defaultSpeaker,
  )

  // on speaker changer, set local storage
  useEffect(() => {
    localStorage.setItem("speaker", speaker)
  }, [speaker])

  
  function composePrompt() {

    const prompt =
`Name: ${name}
Bio: ${bio}
${speaker}: Hey ${name}
${name}: ${greeting}
${speaker}: ${question1}
${name}: ${response1}
${speaker}: ${question2}
${name}: ${response2}
${speaker}: ${question3}
${name}: ${response3}`

    return prompt
  }

  const { lipSync } = React.useContext(SceneContext)
  const [input, setInput] = React.useState("")

  const [messages, setMessages] = React.useState([])
  const handleChange = async (event) => {
    event.preventDefault()
    setInput(event.target.value)
  }

  React.useEffect(() => {
    const msgBox = document.querySelector("#msgscroll")
    msgBox.scrollTo(0, msgBox.scrollHeight)
  }, [messages])

  // if user presses ctrl c, clear the messages
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.ctrlKey && event.key === "c") {
        setMessages([])
        // spacebar
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => {
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [])

  const startSpeech = () => {
    console.log("starting speech")
    speechrecognition.start()
    setMicEnabled(true)
  }

  const stopSpeech = () => {
    console.log("stopping speech")
    speechrecognition.stop()
    setMicEnabled(false)
  }

  const handleSubmit = async (event) => {
    if (event.preventDefault) event.preventDefault()
    // Get the value of the input element
    const input = event.target.elements.message
    const value = input.value
    handleUserChatInput(value)
  }

  const handleUserChatInput = async (value) => {
    console.log("handleUserChatInput", handleUserChatInput)
    // Send the message to the localhost endpoint
    const agent = name
    // const spell_handler = "charactercreator";

    const newMessages = [...messages]
    newMessages.push(speaker + ": " + value)
    setInput("")
    setMessages(newMessages)

    try {
      // const url = encodeURI(`http://216.153.52.197:8001/spells/${spell_handler}`)

      const driveId = "1QnOliOAmerMUNuo2wXoH-YoainoSjZen"

      const endpoint = "https://upstreet.webaverse.com/api/ai"

      let prompt = `
${composePrompt()}
###
The following is a friendly conversation between #speaker and ${agent}.
${messages.join("\n")}
${speaker}: ${input}
${agent}:`

      const query = {
        prompt,
        max_tokens: 100,
        temperature: 0.7,
        top_p: 1,
        frequency_penalty: 0.5,
        presence_penalty: 0.5,
        stop: [speaker + ":", agent + ":", "\\n"],
      }

      axios.post(endpoint, query).then((response) => {
        console.log("response is", response.data.choices[0].text)
        const output = response.data.choices[0].text
        const ttsEndpoint = `https://voice.webaverse.com/tts?s=${output}&voice=${driveId}`

        // fetch the audio file from ttsEndpoint

        fetch(ttsEndpoint).then(async (response) => {
          const blob = await response.blob()

          // convert the blob to an array buffer
          const arrayBuffer = await blob.arrayBuffer()

          lipSync.startFromAudioFile(arrayBuffer)
        })

        setMessages([...newMessages, agent + ": " + output])
      })
    } catch (error) {
      console.error(error)
    }
  }

  let hasSet = false
  useEffect(() => {
    if (speechrecognition || hasSet) return
    hasSet = true
    const speechTest = new SpeechRecognition({})
    setSpeechrecognition(speechTest)

    console.log("speech recognition", speechTest)

    speechTest.onerror = (e) => console.error(e.error, e.message)
    speechTest.onresult = (e) => {
      const i = e.resultIndex
      console.log(`${e.results[i].isFinal}`)
      if (e.results[i].isFinal)
        handleUserChatInput(`${e.results[i][0].transcript}`)
      else console.log(`${e.results[i][0].transcript}`)
    }

    speechTest.interimResults = true
    speechTest.continuous = true
  }, [])

  return (
    <div className={styles["chatBox"]}>
      <div className={styles["speaker"]}>
        <label htmlFor="speaker">Your Name</label>
        <input
          type="text"
          name="speaker"
          defaultValue={speaker}
          onChange={(e) => setSpeaker(e.target.value)}
        />
      </div>

      <label>Conversation</label>
      <div id={"msgscroll"} className={styles["messages"]}>
        {messages.map((message, index) => (
          <div key={index}>{message}</div>
        ))}
      </div>

      <form className={styles["send"]} onSubmit={handleSubmit}>
        <CustomButton
          type="icon"
          theme="light"
          icon="microphone"
          className={styles.mic}
          size={32}
          active={!micEnabled ? false : true}
          onClick={() => (!micEnabled ? startSpeech() : stopSpeech())}
        />
        <input
          autoComplete="off"
          type="text"
          name="message"
          value={input}
          onInput={handleChange}
          onChange={handleChange}
        />
        <CustomButton
          theme="light"
          text="Send"
          size={14}
          onSubmit={handleSubmit}
          className={styles.sendButton}
          type="submit"
        />
        {/* add a microphone button that will allow the user to speak into the mic and have the text appear in the input field */}
        {/* on click, indicate with style that the mic is active */}
      </form>
    </div>
  )
}
