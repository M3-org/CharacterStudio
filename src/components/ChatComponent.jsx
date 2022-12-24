import React from "react";
import axios from "axios";
import { SceneContext } from "../context/SceneContext";

export default function ChatBox() {

    const {lipSync} = React.useContext(SceneContext);
    
    const [messages, setMessages] = React.useState([]);
    const handleChange = async (event) => {
        event.preventDefault();
    };
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
        const agent = "eliza";
        const channel = "homepage";
        const spell_handler = "eliza_0.1.0";

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

                // get the first 5 messages
                const newMessages = messages.slice(-5);

                setMessages([...newMessages, output]);
            });
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div style={{zIndex: 1000000, opacity: 0.3, position: "absolute", width: "300px", fontSize: ".5rem", right: "100px", bottom: "20px", padding: "1em", margin: "1em", color: "#fff", backgroundColor: "#000"}}>
            <div style={{ display: "flex", flexDirection: "column", height: "100%", overflow: "auto" }}>
                {messages.map((message, index) => (
                    <div key={index}>{message}</div>
                ))}
            </div>

            <form style={{ display: "flex" }} onSubmit={handleSubmit}>
                <input type="text" name="message" onInput={handleChange} onChange={handleChange} />
                <button type="submit">Send</button>
            </form>
        </div>
    );
}