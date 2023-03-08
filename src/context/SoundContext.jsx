import React, { createContext, useEffect, useState } from "react"
import * as THREE from "three"
import useSound from "use-sound"
import soundFileSpecs from '../../public/sound/sound-files.json';
import soundUrl from '../../public/sound/sounds.mp3';

export const SoundContext = createContext()

export const SoundProvider = (props) => {
  const _getSoundFiles = regex => soundFileSpecs.find(f => regex.test(f.name));

  const [play] = useSound(soundUrl, {
    sprite: {
      switchItem: [_getSoundFiles(/switchingItem/).offset, _getSoundFiles(/switchingItem/).duration],
      classSelect: [_getSoundFiles(/class-select/).offset, _getSoundFiles(/class-select/).duration],
      characterLoad: [_getSoundFiles(/character-load/).offset, _getSoundFiles(/character-load/).duration],
      randomizeButton: [_getSoundFiles(/randomize-button/).offset, _getSoundFiles(/randomize-button/).duration],
      classMouseOver: [_getSoundFiles(/class-mouse-over/).offset, _getSoundFiles(/class-mouse-over/).duration],
      backNextButton: [_getSoundFiles(/back-next-button/).offset, _getSoundFiles(/back-next-button/).duration],
    }
  });

  const playSound = (name, delay = 0) => {
    delay === 0 ? play({ id: name }) : setTimeout(() => {
      play({ id: name });
    },delay);
  }

  return (
    <SoundContext.Provider
      value={{
        playSound
      }}
    >
      {props.children}
    </SoundContext.Provider>
  )
}
