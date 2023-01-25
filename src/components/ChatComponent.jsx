import React, { useEffect } from "react";
import axios from "axios";
import { SceneContext } from "../context/SceneContext";
import styles from "./ChatBox.module.css";

import { sepiaSpeechRecognitionInit, SepiaSpeechRecognitionConfig } from 'sepia-speechrecognition-polyfill';

const sessionId = localStorage.getItem("sessionId") ?? Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
localStorage.setItem("sessionId", sessionId);

const config = new SepiaSpeechRecognitionConfig();
// Set configuration options specific to your SEPIA STT server

const SpeechRecognition = window.webkitSpeechRecognition || sepiaSpeechRecognitionInit(config);

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
    "How do you define success?"
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
    "How do you show love and support to friends?"
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
    "What are your thoughts on work-life balance and how do you maintain it?"
]

export default function ChatBox() {

    
    const [name, setName] = React.useState(localStorage.getItem("name") || "");
    const [bio, setBio] = React.useState(localStorage.getItem("bio") || "");
    const [greeting, setGreeting] = React.useState(localStorage.getItem("greeting") || "heya");
    const [question1, setQuestion1] = React.useState(localStorage.getItem("question1") || generalPersonality[0]);
    const [question2, setQuestion2] = React.useState(localStorage.getItem("question2") || relationships[0]);
    const [question3, setQuestion3] = React.useState(localStorage.getItem("question3") || hobbies[0]);
    const [response1, setResponse1] = React.useState(localStorage.getItem("response1") || "");
    const [response2, setResponse2] = React.useState(localStorage.getItem("response2") || "");
    const [response3, setResponse3] = React.useState(localStorage.getItem("response3") || "");

    const [micEnabled, setMicEnabled] = React.useState(false);

    const [speechrecognition, setSpeechrecognition] = React.useState(false);

    const [speaker, setSpeaker] = React.useState(localStorage.getItem('speaker') || "Speaker");

    // after each state is updated, save to local storage
    React.useEffect(() => {
        console.log(question1)
        localStorage.setItem("name", name);
        localStorage.setItem("bio", bio);
        localStorage.setItem("greeting", greeting);
        localStorage.setItem("question1", question1);
        localStorage.setItem("question2", question2);
        localStorage.setItem("question3", question3);
        localStorage.setItem("response1", response1);
        localStorage.setItem("response2", response2);
        localStorage.setItem("response3", response3);
        localStorage.setItem("speaker", speaker);
    }, [name, bio, greeting, question1, question2, question3, response1, response2, response3, speaker]);

    function composePrompt() {
        console.log('composing prompt',
        name, bio, greeting, question1, question2, question3, response1, response2, response3, speaker);

        const prompt =
            `Name: ${name}
Bio: ${bio}
Speaker: Hey ${name}
${name}: ${greeting}
Speaker: ${question1}
${name}: ${response1}
Speaker: ${question2}
${name}: ${response2}
Speaker: ${question3}
${name}: ${response3}
`

console.log('prompt is ******************************')
console.log(prompt)

        return prompt;
    }

    const { lipSync } = React.useContext(SceneContext);
    const [input, setInput] = React.useState("");

    const [messages, setMessages] = React.useState([]);
    const handleChange = async (event) => {
        event.preventDefault();
        setInput(event.target.value);
    };

    React.useEffect(() => {            
        const msgBox = document.querySelector("#msgscroll")
        msgBox.scrollTo(0, msgBox.scrollHeight)
    }, [messages])


    // if user presses ctrl c, clear the messages
    useEffect(() => {
        const handleKeyDown = (event) => {
            if (event.ctrlKey && event.key === 'c') {
                setMessages([]);
                // spacebar
            }
        }
        window.addEventListener('keydown', handleKeyDown);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        }
    }, [])

    const startSpeech = () => {
        console.log('starting speech')
        speechrecognition.start()
        setMicEnabled(true)
    }

    const stopSpeech = () => {
        console.log('stopping speech')
        speechrecognition.stop()
        setMicEnabled(false)
    }

    const handleSubmit = async (event) => {
        if (event.preventDefault) event.preventDefault();
        // Get the value of the input element
        const input = event.target.elements.message;
        const value = input.value;
        handleUserChatInput(value);
    }

        const handleUserChatInput = async (value) => {
            console.log('handleUserChatInput', handleUserChatInput)
        // Send the message to the localhost endpoint
        const agent = name;
        // const spell_handler = "charactercreator";

        const newMessages = [...messages];
        newMessages.push(speaker + ": " + value)
        setInput("");
        setMessages(newMessages);

        try {
            // const url = encodeURI(`http://216.153.52.197:8001/spells/${spell_handler}`)

            const driveId = '1QnOliOAmerMUNuo2wXoH-YoainoSjZen'

            const endpoint = 'https://upstreet.webaverse.com/api/ai'

let prompt = `
${composePrompt()}
###
The following is a friendly conversation between #speaker and ${agent}.
${messages.join('\n')}
${speaker}: ${input}
${agent}:`

            const query = {
                prompt,
                max_tokens: 100,
                temperature: 0.7,
                top_p: 1,
                frequency_penalty: 0.5,
                presence_penalty: 0.5,
                stop: [speaker + ':', agent + ':', '\\n'],
                };
                
            axios.post(endpoint, query).then((response) => {
                console.log('response is', response.data.choices[0].text)
                const output = response.data.choices[0].text;
                const ttsEndpoint = `https://voice.webaverse.com/tts?s=${output}&voice=${driveId}`

                // fetch the audio file from ttsEndpoint

                fetch(ttsEndpoint).then(async (response) => {
                    const blob = await response.blob();

                    // convert the blob to an array buffer
                    const arrayBuffer = await blob.arrayBuffer();

                    lipSync.startFromAudioFile(arrayBuffer);
                });

                setMessages([...newMessages, agent + ": " + output]);
            });
        } catch (error) {
            console.error(error);
        }
    };

    let hasSet = false;
    useEffect(() => {
        if(speechrecognition || hasSet) return;
        hasSet = true;
        const speechTest = new SpeechRecognition({
            
        });
        setSpeechrecognition(speechTest);

        console.log('speech recognition', speechTest)

        speechTest.onerror = (e) => console.error(e.error, e.message);
        speechTest.onresult = (e) => {
            const i = e.resultIndex;
            console.log(`${e.results[i].isFinal}`);
            if(e.results[i].isFinal) handleUserChatInput(`${e.results[i][0].transcript}`)
            else console.log(`${e.results[i][0].transcript}`)
        };
        
        speechTest.interimResults = true;
        speechTest.continuous = true;

    }, [])

    return (
        <div className={styles['chatBox']}>

            {/* input fields for name, bio, preferred greeting, question1 (dropdown and text input), question2 (dropdown and text input) and question3 (dropdown and text input) */}
            <span>
                <label htmlFor="name">Name</label>
                <input type="text" name="name" defaultValue={name} onChange={(e) => setName(e.target.value)} />
            </span>
            <span>
                <label htmlFor="greeting">Preferred Greeting</label>
                <input type="text" name="greeting" defaultValue={greeting} onChange={(e) => setGreeting(e.target.value)} />
            </span>

            <label htmlFor="bio">Bio</label>
            <textarea name="bio" rows="4" cols="50" defaultValue={bio} onChange={(e) => setBio(e.target.value)} />


            <label htmlFor="question1">Question 1</label>
            <select name="question1" defaultValue={question1} onChange={(e) => setQuestion1(e.target.value)}>
            {generalPersonality.map((question, i) => {
                return <option key={i} value={question}>{question}</option>
            })}
            </select>
            <textarea type="text" name="response1" onChange={(e) => setResponse1(e.target.value)} defaultValue={response1} />

            <label htmlFor="question2">Question 2</label>
            <select name="question3" defaultValue={question2} onChange={(e) => setQuestion2(e.target.value)}>
            {relationships.map((question, i) => {
                return <option key={i} value={question}>{question}</option>
            })}
            </select>
            

            <textarea type="text" name="response1" onChange={(e) => setResponse2(e.target.value)}>
                {response2}
            </textarea>

            <label htmlFor="question3">Question 3</label>
            <select name="question3" defaultValue={question3} onChange={(e) => setQuestion3(e.target.value)}>
            {hobbies.map((question, i) => {
                return <option key={i} value={question}>{question}</option>
            })}
            </select>

            <textarea type="text" name="response3" onChange={(e) => setResponse3(e.target.value)}>
                {response3}
            </textarea>

            <div className={styles["speaker"]}>
                <label htmlFor="speaker">Your Name</label>
                <input type="text" name="speaker" defaultValue={speaker} onChange={(e) => setSpeaker(e.target.value)} />
            </div>

            <h3>Conversation</h3>


            <div id = {"msgscroll"} className={styles["messages"]}>
                {messages.map((message, index) => (
                    <div key={index}>{message}</div>
                ))}
            </div>

            <form className={styles['send']} onSubmit={handleSubmit}>
                <input autoComplete="off" type="text" name="message" value={input} onInput={handleChange} onChange={handleChange} />
                <button className={styles["button"]} onSubmit={handleSubmit} type="submit">Send</button>
                {/* add a microphone button that will allow the user to speak into the mic and have the text appear in the input field */}
                {/* on click, indicate with style that the mic is active */}
                </form>
            <button className={micEnabled ? styles["button"] : styles["buttonInactive"]} onClick={() => !micEnabled ? startSpeech() : stopSpeech()}>Mic</button>
        </div>
    );
}