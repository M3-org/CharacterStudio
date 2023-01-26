import React from 'react';
import styles from './Bio.module.css';
import { ViewMode, ViewContext } from '../context/ViewContext';
import Bio from '../components/Bio';

function BioPage() {
    const { setViewMode } = React.useContext(ViewContext);

    const back = () => {
        console.log('back');
        setViewMode(ViewMode.APPEARANCE)
    }

    const next = () => {
        console.log('next');
        setViewMode(ViewMode.SAVE)
    }

    return (
        <div className={styles.container}>
        <Bio />
            <div className={styles.buttonContainer}>
                <button className={styles.button} onClick={back}>Back</button>
                <button className={styles.button} onClick={next}>Next</button>
            </div>
        </div>
    );
}

export default BioPage;