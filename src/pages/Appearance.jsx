import React, { useEffect } from 'react';
import styles from './Appearance.module.css';
import { ViewMode, ViewContext } from '../context/ViewContext';
import { SceneContext } from "../context/SceneContext"
import Editor from '../components/Editor';
import CustomButton from '../components/custom-button'

function Appearance({initialTraits, animationManager, blinkManager, effectManager, fetchNewModel}) {
    const { setViewMode } = React.useContext(ViewContext);
    const { resetAvatar, getRandomCharacter,saveAvatarToLocalStorage,loadAvatarFromLocalStorage } = React.useContext(SceneContext)
    const { isLoading, isPlayingEffect, setIsPlayingEffect } = React.useContext(ViewContext)
    const back = () => {
        resetAvatar();
        setViewMode(ViewMode.CREATE)
    }
    useEffect(() => {
        const setIsPlayingEffectFalse = () => {
            setIsPlayingEffect(false);
        }
        effectManager.addEventListener('fadeintraitend', setIsPlayingEffectFalse)
        effectManager.addEventListener('fadeinavatarend', setIsPlayingEffectFalse)
        return () => {
            effectManager.removeEventListener('fadeintraitend', setIsPlayingEffectFalse)
            effectManager.removeEventListener('fadeinavatarend', setIsPlayingEffectFalse)
        }
    }, [])

    const next = () => {
        setViewMode(ViewMode.BIO)
    }

    const randomize = () => {
        if (!isPlayingEffect) {
            getRandomCharacter()
            //
        }
    }
    const reset = () =>{
        //loadAvatarFromLocalStorage("character");
    }
    const save = () =>{
        //saveAvatarToLocalStorage("character");
    }


    return (
        <div className={styles.container}>
            <div className={`loadingIndicator ${isLoading?"active":""}`}>
                <img className={"rotate"} src="ui/loading.svg"/>
            </div>
            <div className={"sectionTitle"}>Choose Appearance</div>
        <Editor animationManager={animationManager} initialTraits={initialTraits} blinkManager={blinkManager} effectManager={effectManager} fetchNewModel={fetchNewModel} />
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