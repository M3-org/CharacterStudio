import React from 'react';
import styles from './Appearance.module.css';
import { ViewMode, ViewContext } from '../context/ViewContext';
import Editor from '../components/Editor';
import CustomButton from '../components/custom-button'

function Appearance({manifest, templateInfo, initialTraits, animationManager, blinkManager, effectManager, fetchNewModel}) {
    const { setViewMode } = React.useContext(ViewContext);

    const back = () => {
        console.log('back');
        setViewMode(ViewMode.CREATE)
    }

    const next = () => {
        console.log('next');
        setViewMode(ViewMode.BIO)
    }

    return (
        <div className={styles.container}>
            <div className={"sectionTitle"}>Choose Appearance</div>
        <Editor manifest = {manifest} animationManager={animationManager} initialTraits={initialTraits} templateInfo={templateInfo} blinkManager={blinkManager} effectManager={effectManager} fetchNewModel={fetchNewModel} />
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
                />
            </div>
        </div>
    );
}

export default Appearance;