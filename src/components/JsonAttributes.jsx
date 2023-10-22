import React, {useEffect,useState,useContext} from "react"
import styles from "./JsonAttributes.module.css"
import { SceneContext } from "../context/SceneContext"
import MenuTitle from "./MenuTitle"

export default function JsonAttributes({jsonSelectionArray}){
  const {
    setSelectedOptions
  } = useContext(SceneContext);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (jsonSelectionArray?.length >0)
      setSelectedOptions(jsonSelectionArray[0].options)
    setIndex(0);
  }, [jsonSelectionArray])

  const nextJson = async () => {
    if (index >= jsonSelectionArray.length -1){
      setSelectedOptions(jsonSelectionArray[0].options)
      setIndex(0);
    }
    else{
      const newIndex = index + 1;
      setSelectedOptions(jsonSelectionArray[newIndex].options)
      setIndex(newIndex);
    }
  }
  const prevJson = async () => {
    console.log("prev")
    if (index <= 0){
      setSelectedOptions(jsonSelectionArray[jsonSelectionArray.length-1].options)
      setIndex(jsonSelectionArray.length -1);
    }
    else{
      const newIndex = index-1;
      setSelectedOptions(jsonSelectionArray[newIndex].options)
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
              <div key={`json:${attribute.trait}_${attribute.name}`}>
                <div className={styles["traitInfoText"]}>
                  {`${attribute.trait} : ${attribute.id}`}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (<></>)
    );
}