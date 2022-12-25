import React, { useEffect } from "react";
import axios from "axios";
import { SceneContext } from "../context/SceneContext";
import styles from "./ChatBox.module.css";

export default function ChatBox() {

    const {lipSync} = React.useContext(SceneContext);
    const [input, setInput] = React.useState("");
    
    const [messages, setMessages] = React.useState([]);
    const handleChange = async (event) => {
        event.preventDefault();
        setInput(event.target.value);
    };


    // if user presses ctrl c, clear the messages
    useEffect(() => {
        const handleKeyDown = (event) => {
            if (event.ctrlKey && event.key === 'c') {
                setMessages([]);
            }
        }
        window.addEventListener('keydown', handleKeyDown);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        }
    }, [])

    const handleSubmit = async (event) => {
        event.preventDefault();
        // Get the value of the input element
        const input = event.target.elements.message;
        const value = input.value;

        // Send the message to the localhost endpoint
        const client = 1;
        const channelId = "three";
        const entity = 11;
        const speaker = "moon";
        const agent = "Eliza";
        const channel = "homepage";
        const spell_handler = "eliza_0.1.0";

        // get the first 5 messages
        const newMessages = [...messages];
        newMessages.push("Speaker: " + value)
        setInput("");
        setMessages(newMessages);

        try {
            const url = encodeURI(`https://localhost:8001/spells/${spell_handler}`)
            axios.post(`${url}`, {
                    Input: value,
                    Speaker: speaker,
                    Agent: agent,
                    Client: client,
                    ChannelID: channelId,
                    Entity: entity,
                    Channel: channel,
            }).then((response) => {
                const data = response.data;

                const outputs = data.outputs;

                const outputKey = Object.keys(outputs)[0];

                const output = outputs[outputKey];

                const driveId = '1QnOliOAmerMUNuo2wXoH-YoainoSjZen'

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

    return (
        <div className={styles['chatBox']}>
            <div className={styles["messages"]}>
                {messages.map((message, index) => (
                    <div key={index}>{message}</div>
                ))}
            </div>

            <form className={styles['send']} onSubmit={handleSubmit}>
                <input autoComplete="off" type="text" name="message" value={input} onInput={handleChange} onChange={handleChange} />
                <button className={styles["button"]} onSubmit={handleSubmit} type="submit">Send</button>
            </form>
        </div>
    );
}