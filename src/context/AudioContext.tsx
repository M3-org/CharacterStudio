import React, {useState, createContext} from 'react';
import bgm from "../../public/sound/background/cc_bgm_balanced.wav"

export const AudioContext = createContext<{
    isMute: boolean;
    setMute: (mute: boolean) => void;
    enableAudio: () => void;
    disableAudio: () => void;
}>({
    isMute: false,
    setMute: () => {},
    enableAudio: () => {},
    disableAudio: () => {},
})

export const AudioProvider = ({ children }: React.PropsWithChildren<{}>) => {
    const [isMute, setMute] = useState(false);
    const audioRef = React.useRef<HTMLAudioElement>(null);

    const enableAudio = () => {
        setMute(false)
        // append the background music to the body and play, using html
        // audio element
        const audio = audioRef.current;
        if(!audio) {
            console.warn("Audio element not found")
            return
        }
        audio.src = bgm
        audio.loop = true
        audio.volume = 0.0
        audio.play()
        // fade audio in over 5 seconds in 1/60th of a second intervals
        let volume = 0.0
        const seconds = 5.0
        const interval = setInterval(() => {
            volume = Math.max(volume + 1.0 / (10 * seconds * 60.0), 1.0)
            if (volume >= 1.0) {
                clearInterval(interval)
            }
            audio.volume = volume

        }, 1000 / 60)
    }

    const disableAudio = () => {
        setMute(true)
        const audio = audioRef.current;
        if(!audio) {
            console.warn("Audio element not found")
            return
        }
        // pause audio
        audio.pause()
    }


    return (
        <AudioContext.Provider value={{
            isMute, setMute,
            enableAudio, disableAudio
        }}>
            <audio ref={audioRef} />
            {children}
        </AudioContext.Provider>
    )
}