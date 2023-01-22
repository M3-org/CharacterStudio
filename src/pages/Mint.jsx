// Mint page which shows the Scene and Mint Component along with a back button

import React from 'react';
import styles from './Mint.module.css';
import { ViewMode, ViewContext } from '../context/ViewContext';

import Scene from '../components/Scene';
import Mint from '../components/Mint';

function MintComponent() {
    const { setViewMode } = React.useContext(ViewContext);

    const back = () => {
        console.log('back');
        setViewMode(ViewMode.SAVE)
    }

    return (
        <div className={styles.container}>
            <div className={styles.buttonContainer}>
                <button className={styles.button} onClick={back}>Back</button>
            </div>
            <Scene />
            <Mint />
        </div>
    );
}

export default MintComponent;