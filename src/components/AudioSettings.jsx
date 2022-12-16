import React from 'react';
import { useMuteStore } from '../store'
import { BottomRightMenu } from '../styles/Globals.styled'
import { MusicButton } from '../styles/AudioSettings.styled';

export default function AudioSettings() {
    const isMute = useMuteStore((state) => state.isMute)
    const setMute = useMuteStore((state) => state.setMute)
    return (
        <BottomRightMenu>
          <MusicButton 
            isMute = {isMute}
            onClick={() => {setMute(!isMute)}}
          />
        </BottomRightMenu>
    )
}