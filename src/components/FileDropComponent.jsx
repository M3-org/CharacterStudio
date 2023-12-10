// FileDropComponent.js
import React, { useEffect, useState } from 'react';
import styles from './FileDropComponent.module.css';

export default function FileDropComponent ({onFilesDrop}){
  const [isDragging, setIsDragging] = useState(false);
  const [files, setFiles] = React.useState(null);
  
  useEffect(() => {
    const handleDrop = (event) => {
      event.preventDefault();
      setIsDragging(false);
      const files = event.dataTransfer.files;
      if (onFilesDrop) {
        setFiles(files)
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

  useEffect(()=>{
    if (files){
      console.log("files");
      onFilesDrop(files);
    }
  },[files])

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

