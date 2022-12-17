import {useState, createContext} from 'react';
export const AudioContext = createContext();

export const AudioProvider = ({ children }) => {
    const [isMute, setMute] = useState(false);
    return (
        <AudioContext.Provider value={{
            isMute, setMute,
        }}>
            {children}
        </AudioContext.Provider>
    )
}