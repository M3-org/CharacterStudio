// FileDropComponent.js
import React, { useEffect, useState } from 'react';
import styles from './FileDropComponent.module.css';

export default function FileDropComponent ({onFileDrop}){
  const [isDragging, setIsDragging] = useState(false);
  
  useEffect(() => {
    const handleDrop = (event) => {
      event.preventDefault();
      setIsDragging(false);
      console.log(onFileDrop);
      const file = event.dataTransfer.files[0];
      console.log('Dropped file:', file);
      if (onFileDrop) {
        onFileDrop(file);
      }
    };

    const handleDragOver = (event) => {
      event.preventDefault();
      setIsDragging(true);
    };

    // Attach event listeners to the window
    window.addEventListener('drop', handleDrop);
    window.addEventListener('dragover', handleDragOver);

    // Clean up event listeners on component unmount
    return () => {
      window.removeEventListener('drop', handleDrop);
      window.removeEventListener('dragover', handleDragOver);
    };
  }, []);

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  return (
    <div
      onDragLeave={handleDragLeave}
      className={styles.dropArea}
      style={{ display: isDragging ? 'flex': 'none' }}
    >
    </div>
  );
};

