import React, {useEffect,useState,useContext} from "react"
import styles from "./JsonAttributes.module.css"
import { SceneContext } from "../context/SceneContext"
import MenuTitle from "./MenuTitle"

export default function JsonAttributes({jsonSelectionArray}){
  const {
    characterManager
  } = useContext(SceneContext);
  const [index, setIndex] = useState(0);

  const nextJson = async () => {
    if (index >= jsonSelectionArray.length -1){
      characterManager.loadTraitsFromNFTObject(jsonSelectionArray[0]);
      setIndex(0);
    }
    else{
      const newIndex = index + 1;
      characterManager.loadTraitsFromNFTObject(jsonSelectionArray[newIndex]);
      setIndex(newIndex);
    }
  }
  const prevJson = async () => {
    if (index <= 0){
      characterManager.loadTraitsFromNFTObject(jsonSelectionArray[jsonSelectionArray.length-1]);
      setIndex(jsonSelectionArray.length -1);
    }
    else{
      const newIndex = index-1;
      characterManager.loadTraitsFromNFTObject(jsonSelectionArray[newIndex]);
      setIndex(newIndex);
    }
  }
  
  return (
      jsonSelectionArray?.length > 0 ? (
        <div className={styles["InformationContainerPos"]}>
          <MenuTitle title="TraitSelection" width={180} right={20} />
          <div className={styles["scrollContainer"]}>
            <div className={styles["flexSelect"]}>
              {jsonSelectionArray?.length > 1 ? <div // add left arrow only when array is greater than 1
                  className={`${styles["arrow-button"]} ${styles["left-button"]}`}
                  onClick={prevJson}
              />:<></>}
              {jsonSelectionArray[index].name && (
                <div style={{ textAlign: 'center', flex: 1}}>
                  <div className={styles["traitInfoTitle"]}>
                    {jsonSelectionArray[index].name}
                  </div>
                </div>
              )}
              {jsonSelectionArray?.length > 1 ? <div //add right arrow only when array is greater than 1
                className={`${styles["arrow-button"]} ${styles["right-button"]}`}
                onClick={nextJson}
              />:<></>}
            </div>
            {jsonSelectionArray[index].thumb && (
              <img
                src={jsonSelectionArray[index].thumb}
                alt="Selection Thumbnail"
                style={{
                  width: '280px',
                  height: '460px',
                  display: 'block',
                  margin: '20px auto 20px',
                }}
              />
            )}
            {jsonSelectionArray[index].attributes.map((attribute) => (
              <div key={`json:${attribute.trait_type}_${attribute.value}`}>
                <div className={styles["traitInfoText"]}>
                  {`${attribute.trait_type} : ${attribute.value}`}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (<></>)
    );
}