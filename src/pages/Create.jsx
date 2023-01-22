import React from 'react';
import styles from './Create.module.css';
import { ViewMode, ViewContext } from '../context/ViewContext';

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
            icon: 'https://i.imgur.com/8Z0QZ9M.png',
            disabled: true,
        },
        {
            name: 'Engineer',
            image: 'https://i.imgur.com/8Z0QZ9M.png',
            description: 'Builds things',
            icon: 'https://i.imgur.com/8Z0QZ9M.png',
            disabled: true,
        },
        {
            name: 'Drop Hunter',
            image: 'https://i.imgur.com/8Z0QZ9M.png',
            description: 'Hunts drops',
            icon: 'https://i.imgur.com/8Z0QZ9M.png',
            disabled: false,
        },
        {
            name: 'Neural Hacker',
            image: 'https://i.imgur.com/8Z0QZ9M.png',
            description: 'Hacks neural networks',
            icon: 'https://i.imgur.com/8Z0QZ9M.png',
            disabled: false,
        },
        {
            name: 'Lisk Witch',
            image: 'https://i.imgur.com/8Z0QZ9M.png',
            description: 'Witches lisk',
            icon: 'https://i.imgur.com/8Z0QZ9M.png',
            disabled: true,
        },
        {
            name: 'Bruiser',
            image: 'https://i.imgur.com/8Z0QZ9M.png',
            description: 'Bruises things',
            icon: 'https://i.imgur.com/8Z0QZ9M.png',
            disabled: true,
        }
    ]

    return (
        <div className={styles.container}>
            <div className={styles.title}>Choose Character Class</div>
            <div className={styles.classContainer}>
                {classes.map((characterClass, i) => {
                    return (
                        <div key={i} className={styles.class} onClick={
                            characterClass['disabled'] ? null : () => selectClass(characterClass)
                        }>
                            <img src={characterClass['image']} alt={characterClass['name']} />
                            <div className={styles.icon}><img src={characterClass['icon']} alt={characterClass['name']} /></div>
                            <div className={styles.name}>{characterClass['name']}</div>
                            <div className={styles.description}>{characterClass['description']}</div>
                            <div className={styles.disabled}>{characterClass['disabled'] ? 'Coming Soon' : ''}</div>
                        </div>
                    );
                })}
            </div>
            <button className={styles.button} onClick={() => back()}>Back</button>
        </div>
    )
}

export default Create;