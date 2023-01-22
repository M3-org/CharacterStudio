import React from 'react';
import styles from './Save.module.css';

import { ViewMode, ViewContext } from '../context/ViewContext';

function Save() {
    const { setViewMode } = React.useContext(ViewContext);

    const back = () => {
        console.log('back');
        setViewMode(ViewMode.BIO)
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
        </div>
    );
}

export default Save;