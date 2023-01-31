import React from 'react';
import styles from './Save.module.css';
import { ExportMenu } from '../components/ExportMenu';

import { ViewMode, ViewContext } from '../context/ViewContext';
import CustomButton from '../components/custom-button';

function Save() {
    const { setViewMode } = React.useContext(ViewContext);

    const back = () => {
        console.log('back');
        setViewMode(ViewMode.BIO)
    }

    const mint = () => {
        console.log('chat');
        setViewMode(ViewMode.CHAT)
    }

    return (
        <div className={styles.container}>
            <div className={"sectionTitle"}>Save Your Character</div>
            <div className={styles.buttonContainer}>
                <CustomButton
                    theme="light"
                    text="Back"
                    size={14}
                    className={styles.buttonLeft}
                    onClick={back}
                />
                <ExportMenu />
                <CustomButton
                    theme="light"
                    text="Chat"
                    size={14}
                    className={styles.buttonRight}
                    onClick={mint}
                />
            </div>
        </div>
    );
}

export default Save;