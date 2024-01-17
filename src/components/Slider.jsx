import React from 'react';
import styles from './Slider.module.css'; // Import CSS for styling

export default function Slider ({ title, value, min, max, onChange, step, stepBox }) {
  
  return (
    <>
    <div className={styles["infoContainer"]}>   
    {title}
    {stepBox &&
        <input
          type="number"
          min="0"
          max="100"
          value={value}
          onChange={onChange}
          className={styles["input-box"]}
          step ={stepBox}
        />
      }
      </div>
    <div className={styles["slider-container"]}>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={onChange}
        className={styles["slider"]}
        step ={step}
      />
      
    </div>
    </>
  );
};


