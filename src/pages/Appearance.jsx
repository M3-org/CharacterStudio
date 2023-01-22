// React Component which displays the Scene, Editor and Selector components as well as a "back" button (setViewMode CREATE) 
// and a "next" button (setViewMode BIO)

import React from 'react';
import styles from './Appearance.module.css';
import { ViewMode, ViewContext } from '../context/ViewContext';

function Appearance() {
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
            <div className={styles.buttonContainer}>
                <button className={styles.button} onClick={back}>Back</button>
                <button className={styles.button} onClick={next}>Next</button>
            </div>
        </div>
    );
}

export default Appearance;