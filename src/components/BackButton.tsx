import styles from './BackButton.module.css'

export const BackButton = ({onClick}:{
    onClick:()=>void
}) =>{
    return (
        <div onClick={onClick} className={styles['StyledBackButton']}>
        </div>
    )
}