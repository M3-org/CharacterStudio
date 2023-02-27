import React, { useContext, useEffect } from "react"
import axios from "axios"
import { voices } from "../constants/voices"
import { favouriteColors } from "../constants/favouriteColors"
import { errorResponses } from "../constants/defaultReplies"
import { SceneContext } from "../context/SceneContext"
import styles from "./Chat.module.css"
import CustomButton from "./custom-button"
import { local } from '../library/store'
import { getRandomObjectKey, getRandomArrayValue } from '../library/utils'

import {
  sepiaSpeechRecognitionInit,
  SepiaSpeechRecognitionConfig,
} from "sepia-speechrecognition-polyfill"
import { pruneMessages } from "../lib/chat"
import { LanguageContext } from "../context/LanguageContext"
import { Message } from "./message"

const sessionId =
  local.sessionId ??
  Math.random().toString(36).substring(2, 15) +
    Math.random().toString(36).substring(2, 15)

local.sessionId = sessionId

const config = new SepiaSpeechRecognitionConfig()

const defaultSpeaker = "Speaker"

const SpeechRecognition =
  window.webkitSpeechRecognition || sepiaSpeechRecognitionInit(config)

export default function ChatBox({
  templateInfo,
  micEnabled,
  setMicEnabled,
  speechRecognition,
  setSpeechRecognition,
}) {
  const [waitingForResponse, setWaitingForResponse] = React.useState(false)

  // Translate hook
  const { t } = useContext(LanguageContext)

  const [fullBio] = React.useState(
    local[`${templateInfo.id}_fulBio`]
  )

  const [speaker, setSpeaker] = React.useState(
    local.speaker || defaultSpeaker,
  )

  // on speaker changer, set local storage
  useEffect(() => {
    local.speaker = speaker
  }, [speaker])

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
    speechRecognition.start()
    setMicEnabled(true)
  }

  const stopSpeech = () => {
    speechRecognition.stop()
    setMicEnabled(false)
  }

  useEffect(() => {
    // Focus back on input when the response is given
    if (!waitingForResponse) {
      document.getElementById("messageInput").focus()
    }
  }, [waitingForResponse])

  const handleSubmit = async (event) => {
    if (event.preventDefault) event.preventDefault()
    // Stop speech to text when a message is sent through the input
    stopSpeech()
    if (!waitingForResponse) {
      // Get the value of the input element
      const input = event.target.elements.message
      const value = input.value !== "" ? input.value : "..."
      handleUserChatInput(value)
    }
  }

  const handleUserChatInput = async (value) => {
    if (value && value !== "" && !waitingForResponse) {
      setWaitingForResponse(true)
      // Send the message to the localhost endpoint
      const agent = fullBio.name

      setInput("")

      const userMessageOutputObject = {
        name: speaker,
        message: value,
        timestamp: Date.now(),
        type: 1,
      }

      setMessages((messages) => [...messages, userMessageOutputObject])

      const promptMessages = await pruneMessages(messages)
      promptMessages.push(`${speaker}: ${value}`)

      if (value.replaceAll(' ', '') === "" || value === "..."){
        const output = getRandomArrayValue(getRandomObjectKey(errorResponses))

        ////////////////////////////////////////////////////////
        // COMMENTED OUT THE VOICE GENERATION UNTIL THE SCALE UP
        /*
        if (output.replaceAll(' ', '') !== "" && output !== "..."){
          const ttsEndpoint =
          "https://voice.webaverse.com/tts?" +
          "s=" +
          output +
          "&voice=" +
          voices[fullBio.voiceKey]

          fetch(ttsEndpoint).then(async (response) => {
            const blob = await response.blob()
            // convert the blob to an array buffer
            const arrayBuffer = await blob.arrayBuffer()

            lipSync.startFromAudioFile(arrayBuffer);
          })
        }
        */
        const agentMessageOutputObject = {
          name: agent,
          message: output,
          timestamp: Date.now(),
          type: 0,
        }

        setMessages((messages) => [...messages, agentMessageOutputObject])
        setWaitingForResponse(false)
      }
      else{
        
        try {
          // const url = encodeURI(`http://216.153.52.197:8001/spells/${spell_handler}`)

          const endpoint = "https://upstreet.webaverse.com/api/ai"
          
          let prompt = 
        
`The following is part of a conversation between ${speaker} and ${agent}. ${agent} is descriptive and helpful, and is honest when it doesn't know an answer. Included is a context which acts a short-term memory, used to guide the conversation and track topics.

CONTEXT:

Info about ${agent}
---

Bio: "${fullBio.bio}"

Question 1: "${fullBio.question1}"
Response 1: "${fullBio.response1}"

Question 2: "${fullBio.question2}"
Response 2: "${fullBio.response2}"

Question 3: "${fullBio.question3}"
Response 3: "${fullBio.response3}"

MOST RECENT MESSAGES:

${promptMessages.join("\n")}
${agent}:`

          const query = {
            prompt,
            max_tokens: 250,
            temperature: 0.9,
            top_p: 1,
            frequency_penalty: 0,
            presence_penalty: 0.6,
            stop: [speaker + ":", agent + ":", "\\n"],
          }

          axios.post(endpoint, query).then((response) => {
            console.log(response)
            const output = response.data.choices[0].text
            ////////////////////////////////////////////////////////
            // COMMENTED OUT THE VOICE GENERATION UNTIL THE SCALE UP
            /*
            if (output.replaceAll(' ', '') !== "" && output !== "..."){
              const ttsEndpoint =
              "https://voice.webaverse.com/tts?" +
              "s=" +
              output +
              "&voice=" +
              voices[fullBio.voiceKey]
              fetch(ttsEndpoint).then(async (response) => {

                const blob = await response.blob()

                // convert the blob to an array buffer
                const arrayBuffer = await blob.arrayBuffer()

                lipSync.startFromAudioFile(arrayBuffer);
              })
            }
            */
            ////////////////////////////////////////////////////////

            const agentMessageOutputObject = {
              name: agent,
              message: output,
              timestamp: Date.now(),
              type: 0,
            }
            setMessages((messages) => [...messages, agentMessageOutputObject])
            setWaitingForResponse(false)
            
          }).catch((err)=>{
            // maybe set a message, "unable to send message"
            //const output = errorResponses.silent[0]
            //setMessages((messages) => [...messages, agent + ": " + output])
            setWaitingForResponse(false);
            console.error(err)
          })
        } catch (error) {
          // maybe set a message, "unable to send message"
          //const output = errorResponses.silent[0]
          //setMessages((messages) => [...messages, agent + ": " + output])
          setWaitingForResponse(false);
          console.error(error)
        }
      }
    }
  }

  let hasSet = false
  useEffect(() => {
    console.log("e")
    if (!waitingForResponse) {
      console.log("e1")
      if (speechRecognition || hasSet) return
      console.log("e2")
      hasSet = true
      const speechTest = new SpeechRecognition({})
      setSpeechRecognition(speechTest)
      console.log("tetet")
      speechTest.onerror = (e) => console.error(e.error, e.message)
      speechTest.onresult = (e) => {
        const i = e.resultIndex
        console.log("test")
        if (e.results[i].isFinal) {
          handleUserChatInput(`${e.results[i][0].transcript}`)
          setWaitingForResponse(true)
        }
      }

      speechTest.interimResults = true
      speechTest.continuous = true
    }
  }, [])

  return (
    <div className={styles["chatBox"]}>
      <div className={styles["speaker"]}>
        <p className={styles["warning"]}>
          {t("text.apiUnderMaintnance")}
        </p>
        <label htmlFor="speaker">{t("labels.yourName")}</label>
        <input
          type="text"
          name="speaker"
          defaultValue={speaker}
          onChange={(e) => setSpeaker(e.target.value)}
        />
      </div>

      <label>{t("labels.conversation")}</label>
      <div className={styles["messages"]}>
        <div className={styles["scrollBox"]} id={"msgscroll"}>
          {messages.map((msg, index) => {
            if (msg.timestamp)
              return (
                <Message
                  key={index}
                  name={msg.name}
                  timestamp={msg.timestamp}
                  message={msg.message}
                  type={msg.type}
                  color={favouriteColors[fullBio.colorKey].fontColor}
                />
              )
          })}
        </div>
      </div>

      <form
        className={styles["send"]}
        style={{ opacity: waitingForResponse ? "0.4" : "1" }}
        onSubmit={handleSubmit}
      >
        {/* Disabled until state error is fixed */}
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
          id="messageInput"
          value={input}
          onInput={handleChange}
          onChange={handleChange}
          disabled={waitingForResponse}
        />
        <CustomButton
          theme="light"
          text={t("callToAction.send")}
          size={14}
          onSubmit={handleSubmit}
          className={styles.sendButton}
          type="submit"
        />
        {/* add a microphone button that will allow the user to speak into the mic and have the text appear in the input field */}
        {/* on click, indicate with style that the mic is active */}
      </form>
      <p className={`${styles["isTyping"]} ${waitingForResponse && styles["show"]}`}>
        <span style={{ color: favouriteColors[fullBio.colorKey].fontColor }}>{fullBio.name}</span> is typing...
      </p>
    </div>
  )
}
