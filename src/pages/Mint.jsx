import React from 'react';
import styles from './Mint.module.css';
import { ViewMode, ViewContext } from '../context/ViewContext';

import Mint from '../components/Mint';

function MintComponent() {
    const { setViewMode } = React.useContext(ViewContext);

    const back = () => {
        console.log('back');
        setViewMode(ViewMode.SAVE)
    }

    return (
        <div className={styles.container}>
            <Mint />
            <div className={styles.buttonContainer}>
                <button className={styles.button} onClick={back}>Back</button>
            </div>
        </div>
    );
}

export default MintComponent;