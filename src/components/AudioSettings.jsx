import React, { useEffect } from 'react';
import { useMuteStore } from '../store'
import { BottomRightMenu } from '../styles/Globals.styled'
import { MusicButton } from '../styles/AudioSettings.styled';
import useSound from "use-sound"
import bgm from "../../public/sound/cc_bgm_balanced.wav"

export default function AudioSettings() {
    const isMute = useMuteStore((state) => state.isMute)
    const setMute = useMuteStore((state) => state.setMute)
    const [backWav, {}] = useSound(bgm, { volume: 1.0, loop: true })

    useEffect(() => {
      backWav()
    }, [])

    return (
        <BottomRightMenu>
          <MusicButton 
            isMute = {isMute}
            onClick={() => {setMute(!isMute)}}
          />
        </BottomRightMenu>
    )
}