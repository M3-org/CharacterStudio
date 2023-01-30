import React from 'react';
import styles from './Appearance.module.css';
import { ViewMode, ViewContext } from '../context/ViewContext';
import { SceneContext } from "../context/SceneContext"
import Editor from '../components/Editor';
import CustomButton from '../components/custom-button'

function Appearance({manifest, initialTraits, animationManager, blinkManager, effectManager, fetchNewModel}) {
    const { setViewMode } = React.useContext(ViewContext);
    const { resetAvatar, getRandomCharacter } = React.useContext(SceneContext)
    const { loading, effecting, setEffecting } = React.useContext(ViewContext)
    const back = () => {
        console.log('back 1');
        resetAvatar();
        setViewMode(ViewMode.CREATE)
    }
    effectManager.addEventListener('fadeintraitend', () => {
        setEffecting(false);
    })
    effectManager.addEventListener('fadeinavatarend', () => {
        setEffecting(false);
    })

    const next = () => {
        console.log('next B');
        setViewMode(ViewMode.BIO)
    }

    const randomize = () => {
        if (!effecting) {
            getRandomCharacter()
        }
    }

    return (
        <div className={styles.container}>
            <div className={`loadingIndicator ${loading?"active":""}`}>
                <img className={"rotate"} src="ui/loading.svg"/>
            </div>
            <div className={"sectionTitle"}>Choose Appearance</div>
            <Editor manifest = {manifest} animationManager={animationManager} initialTraits={initialTraits} blinkManager={blinkManager} effectManager={effectManager} fetchNewModel={fetchNewModel} />
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
                    text="Reset"
                    size={14}
                    className={styles.buttonCenter}
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