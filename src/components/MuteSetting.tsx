import {MusicButton} from "./MusicButton.tsx"
import {useMuteStore} from '../store'

export default function MuteSetting(props: any) {
    const isMute = useMuteStore((state) => state.isMute)
    const setMute = useMuteStore((state) => state.setMute)
    return (
        <div className="audio-setting">
          <MusicButton 
            isMute = {isMute}
            setMute = {setMute}
          />
        </div>
    )
}