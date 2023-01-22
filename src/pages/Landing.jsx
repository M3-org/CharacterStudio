// React component with two buttons: create character and load character
import React from 'react';
import styles from './Landing.module.css';

function Landing() {
    return (
        <div className={styles.container}>
            <div className={styles.buttonContainer}>
                <button className={styles.button}>Create Character</button>
                <button className={styles.button}>Load Character</button>
            </div>
        </div>
    );
}

export default Landing;