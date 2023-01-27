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
      optionClick: [_getSoundFiles(/option_click/).offset, _getSoundFiles(/option_click/).duration],
    }
  });

  const playSound = (name) => {
    play({ id: name });
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
