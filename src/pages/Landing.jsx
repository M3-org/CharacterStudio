import React from 'react';
import styles from './Landing.module.css';
import { ViewMode, ViewContext } from '../context/ViewContext';

function Landing() {
    const { setViewMode } = React.useContext(ViewContext);

    const createCharacter = () => {
        console.log('create character');
        // set the view mode to create
        setViewMode(ViewMode.CREATE);
    }

    const loadCharacter = () => {
        console.log('load character');
        setViewMode(ViewMode.LOAD);
    }

    return (
        <div className={styles.container}>
            <div className={styles.buttonContainer}>
                <button className={styles.button}
                    onClick={
                        createCharacter
                    }>Create Character</button>
                <button className={styles.button}
                    onClick={
                        loadCharacter
                    }>Load Character</button>
            </div>
        </div>
    );
}

export default Landing;