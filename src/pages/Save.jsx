// React page which shows the Scene and a back button and a "Mint" button which sets the view mode to MINT

import React from 'react';
import styles from './Save.module.css';

import { ViewMode, ViewContext } from '../context/ViewContext';

import Scene from '../components/Scene';

function Save() {
    const { setViewMode } = React.useContext(ViewContext);

    const back = () => {
        console.log('back');
        setViewMode(ViewMode.SAVE)
    }

    const mint = () => {
        console.log('mint');
        setViewMode(ViewMode.MINT)
    }

    return (
        <div className={styles.container}>
            <div className={styles.buttonContainer}>
                <button className={styles.button} onClick={back}>Back</button>
                <button className={styles.mint} onClick={mint}>Mint</button>
            </div>
            <Scene />
        </div>
    );
}

export default Save;