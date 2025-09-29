// FileDropComponent.js
import React, { useEffect, useState } from 'react';
import styles from './FileDropComponent.module.css';

export default function FileDropComponent ({onFilesDrop}:{
  onFilesDrop:(files:FileList)=>void
}){
  const [isDragging, setIsDragging] = useState(false);
  const [files, setFiles] = React.useState<FileList|null>(null);
  
  useEffect(() => {
    const handleDrop = (event: DragEvent) => {
      event.preventDefault();
      setIsDragging(false);
      const files = event.dataTransfer?.files;
      if (files) {
        setFiles(files)
      }
    };

    const handleDragOver = (event: DragEvent) => {
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

