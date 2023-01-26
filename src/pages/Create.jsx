import React from 'react';
import styles from './Create.module.css';
import { ViewMode, ViewContext } from '../context/ViewContext';
import CustomButton from '../components/custom-button';

function Create() {
    const { setViewMode } = React.useContext(ViewContext);

    const back = () => {
        console.log('back');
        setViewMode(ViewMode.LANDING)
    }

    const selectClass = (characterClass) => {
        console.log("TODO: set character class to: " + characterClass);
        setViewMode(ViewMode.APPEARANCE)
    }

    const classes = [
        {
            name: 'Beast Painter',
            image: 'https://i.imgur.com/8Z0QZ9M.png',
            description: 'Paints beasts',
            icon: '/assets/icons/class-beast-painter.svg',
            disabled: true,
        },
        {
            name: 'Engineer',
            image: 'https://i.imgur.com/8Z0QZ9M.png',
            description: 'Builds things',
            icon: '/assets/icons/class-engineer.svg',
            disabled: true,
        },
        {
            name: 'Drop Hunter',
            image: 'https://i.imgur.com/8Z0QZ9M.png',
            description: 'Hunts drops',
            icon: '/assets/icons/class-drop-hunter.svg',
            disabled: false,
        },
        {
            name: 'Neural Hacker',
            image: 'https://i.imgur.com/8Z0QZ9M.png',
            description: 'Hacks neural networks',
            icon: '/assets/icons/class-neural-hacker.svg',
            disabled: false,
        },
        {
            name: 'Lisk Witch',
            image: 'https://i.imgur.com/8Z0QZ9M.png',
            description: 'Witches lisk',
            icon: '/assets/icons/class-lisk-witch.svg',
            disabled: true,
        },
        {
            name: 'Bruiser',
            image: 'https://i.imgur.com/8Z0QZ9M.png',
            description: 'Bruises things',
            icon: '/assets/icons/class-bruiser.svg',
            disabled: true,
        }
    ]

    return (
        <div className={styles.container}>
            <div className={styles.title}>Choose Character Class</div>
            <div className={styles.classContainer}> 
                <div className={styles.topLine} />
                <div className={styles.bottomLine} />
                {classes.map((characterClass, i) => {
                    return (
                        <div key={i} className={!characterClass['disabled'] ? styles.class : styles.classdisabled} onClick={
                            characterClass['disabled'] ? null : () => selectClass(characterClass)
                        }>
                            <img src={characterClass['image']} alt={characterClass['name']} />
                            <div className={styles.icon}><img src={characterClass['icon']} alt={characterClass['name']} /></div>
                            <div className={styles.name}>{characterClass['name']}</div>
                            <div className={styles.description}>{characterClass['description']}</div>
                            <div className={styles.disabled}>{characterClass['disabled'] ? '' : ''}</div>
                        </div>
                    );
                })}
            </div>
            <div className={styles.buttonContainer}>
                <CustomButton
                    theme="light"
                    text="Back"
                    size={14}
                    className={styles.buttonLeft}
                    onClick={back}
                />
            </div>
        </div>
    )
}

export default Create;