import React from 'react';
import styles from './Save.module.css';
import { ExportMenu } from '../components/ExportMenu';

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
        <ExportMenu />
            <div className={styles.buttonContainer}>
                <button className={styles.button} onClick={back}>Back</button>
                <button className={styles.mint} onClick={mint}>Mint</button>
            </div>
        </div>
    );
}

export default Save;