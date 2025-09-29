import React, { createContext, } from "react"

import useSound from "use-sound"
import soundFileSpecs from '../../public/sound/sound-files.json';
import soundUrl from '../../public/sound/sounds.mp3';

export type SoundContextType = {
  playSound: (name:string, delay?:number) => void
}

export const SoundContext = createContext<SoundContextType>({
  playSound: (name:string, delay?:number) => {}
})

export const SoundProvider = ({children}:{children?:React.ReactNode}) => {
  const _getSoundFiles = (regex:RegExp) => soundFileSpecs.find(f => regex.test(f.name));

  const [play] = useSound(soundUrl, {
    sprite: {
      switchItem: [_getSoundFiles(/switchingItem/)?.offset||0, _getSoundFiles(/switchingItem/)?.duration||0],
      classSelect: [_getSoundFiles(/class-select/)?.offset||0, _getSoundFiles(/class-select/)?.duration||0],
      characterLoad: [_getSoundFiles(/character-load/)?.offset||0, _getSoundFiles(/character-load/)?.duration||0],
      randomizeButton: [_getSoundFiles(/randomize-button/)?.offset||0, _getSoundFiles(/randomize-button/)?.duration||0],
      classMouseOver: [_getSoundFiles(/class-mouse-over/)?.offset||0, _getSoundFiles(/class-mouse-over/)?.duration||0],
      backNextButton: [_getSoundFiles(/back-next-button/)?.offset||0, _getSoundFiles(/back-next-button/)?.duration||0],
    }
  });

  const playSound = (name:string, delay = 0) => {
    delay === 0 ? play({ id: name }) : setTimeout(() => {
      play({ id: name });
    },delay);
  }

  return (
    //@ts-ignore
    <SoundContext.Provider
      value={{
        playSound
      }}
    >
      {children}
    </SoundContext.Provider>
  )
}
