import React from "react";
import classnames from "classnames";
import styles from "./TokenBox.module.css";
import defaultIcon from "../../images/magic-box.png"; 

export const TokenBox = (props) => {
    const {
        size,
        active,
        onClick,
        level,
        icon,
        rarity,
        style
    } = props;

    const [imageError, setImageError] = React.useState(false);
    const handleImageError = () => {
        setImageError(true);
    };

    return (
        <div
            className={styles.tokenBoxWrap}
            style={{width: size, height: size}}
            onClick={onClick}
        >
            {active && (
                <div className={classnames(styles.frame, styles.frameActive)} />
            )}
            <div
                className={classnames(styles.frame, rarity && styles[rarity])}
            />
            <img 
                src={imageError ? defaultIcon : icon}
                className={styles.emptyIcon} 
                style={style}
                onError={handleImageError}
            />
            {level && (
                <div
                    className={classnames(
                        styles.level,
                        rarity && styles[rarity]
                    )}
                >
                    Lv.{level}
                </div>
            )}
        </div>
    );
};
