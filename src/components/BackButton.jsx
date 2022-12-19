import React from "react"
import styles from './BackButton.module.css'

export const BackButton = ({onClick}) =>{
    return (
        <div onClick={onClick} className={styles['StyledBackButton']}>
        </div>
    )
}