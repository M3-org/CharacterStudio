import React, { useEffect } from 'react';
import styles from './Appearance.module.css';
import { ViewMode, ViewContext } from '../context/ViewContext';
import { SceneContext } from "../context/SceneContext"
import { SoundContext } from "../context/SoundContext"
import { AudioContext } from "../context/AudioContext"
import Editor from '../components/Editor';
import CustomButton from '../components/custom-button'


function Appearance({animationManager, blinkManager, lookatManager, effectManager, fetchNewModel}) {
    const { isLoading, setViewMode } = React.useContext(ViewContext)
    const { resetAvatar, getRandomCharacter, isChangingWholeAvatar, setIsChangingWholeAvatar } = React.useContext(SceneContext)
    const { playSound } = React.useContext(SoundContext)
    const { isMute } = React.useContext(AudioContext)
    const back = () => {
        !isMute && playSound('backNextButton');
        resetAvatar();
        setViewMode(ViewMode.CREATE)
        
    }

    const next = () => {
        !isMute && playSound('backNextButton');
        setViewMode(ViewMode.BIO)
        
    }

    const randomize = () => {
        if (!isChangingWholeAvatar) {
            !isMute && playSound('randomizeButton');
            getRandomCharacter()
        }
    }

    useEffect(() => {
        const setIsChangingWholeAvatarFalse = () => setIsChangingWholeAvatar(false);

        effectManager.addEventListener('fadeintraitend', setIsChangingWholeAvatarFalse)
        effectManager.addEventListener('fadeinavatarend', setIsChangingWholeAvatarFalse)
        return () => {
            effectManager.removeEventListener('fadeintraitend', setIsChangingWholeAvatarFalse)
            effectManager.removeEventListener('fadeinavatarend', setIsChangingWholeAvatarFalse)
        }
    }, [])


    return (
        <div className={styles.container}>
            <div className={`loadingIndicator ${isLoading?"active":""}`}>
                <img className={"rotate"} src="ui/loading.svg"/>
            </div>
            <div className={"sectionTitle"}>Choose Appearance</div>
        <Editor animationManager={animationManager} blinkManager={blinkManager} lookatManager={lookatManager} effectManager={effectManager} fetchNewModel={fetchNewModel} />
            <div className={styles.buttonContainer}>
                <CustomButton
                    theme="light"
                    text="Back"
                    size={14}
                    className={styles.buttonLeft}
                    onClick={back}
                />
                <CustomButton
                    theme="light"
                    text="Next"
                    size={14}
                    className={styles.buttonRight}
                    onClick={next}
                />
                <CustomButton
                    theme="light"
                    text="Randomize"
                    size={14}
                    className={styles.buttonCenter}
                    onClick={randomize}
                />
            </div>
        </div>
    );
}

export default Appearance;