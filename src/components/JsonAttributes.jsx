import React, {useEffect,useState,useContext} from "react"
import styles from "./JsonAttributes.module.css"
import { SceneContext } from "../context/SceneContext"
import MenuTitle from "./MenuTitle"
import { ViewContext } from "../context/ViewContext"

export default function JsonAttributes({jsonSelectionArray, byManifest = false}){
  const { isLoading, setIsLoading } = React.useContext(ViewContext)
  const {
    characterManager
  } = useContext(SceneContext);
  const [index, setIndex] = useState(0);
  const [currentAvatar, setCurrentAvatar] = React.useState({})
  const [currentAvatarKeys, setCurrentAvatarKeys] = React.useState([])

  const loadByManifest =(manifest)=>{
    characterManager.setManifest(manifest);
    characterManager.loadInitialTraits().then(()=>{
      setIsLoading(false);
    })
  }

  useEffect(() => {
    if (isLoading == false){
      setCurrentAvatar(characterManager.getAvatarSelection());
      setCurrentAvatarKeys(Object.keys(characterManager.getAvatarSelection()))
    }
  }, [isLoading])

  const loadByTraitData = (nftObject) => {
    characterManager.loadTraitsFromNFTObject(nftObject).then(()=>{
      setIsLoading(false);
    })
  }

  const nextJson = async () => {
    if (!isLoading){
      setIsLoading(true);
      if (index >= jsonSelectionArray.length -1){
        byManifest ? loadByManifest(jsonSelectionArray[0]) : loadByTraitData(jsonSelectionArray[0]);
        setIndex(0);
      }
      else{
        const newIndex = index + 1;
        byManifest ? loadByManifest(jsonSelectionArray[newIndex]) : loadByTraitData(jsonSelectionArray[newIndex]);
        setIndex(newIndex);
      }
    }
  }
  const prevJson = async () => {
    if (!isLoading){
      setIsLoading(true);
      if (index <= 0){
        byManifest ? loadByManifest(jsonSelectionArray[jsonSelectionArray.length-1])  : loadByTraitData(jsonSelectionArray[jsonSelectionArray.length-1]);
          
        setIndex(jsonSelectionArray.length -1);
      }
      else{
        const newIndex = index-1;
        byManifest ? loadByManifest(jsonSelectionArray[newIndex]) : loadByTraitData(jsonSelectionArray[newIndex])
        setIndex(newIndex);
      }
    }
  }
  
  return (
      jsonSelectionArray?.length > 0 ? (
        <div className={styles["InformationContainerPos"]}>
          <MenuTitle title="Trait Selection" width={180} right={20} />
          <div className={styles["scrollContainer"]}>
            <div className={styles["flexSelect"]}>
              {jsonSelectionArray?.length > 1 ? <div // add left arrow only when array is greater than 1
                  className={`${styles["arrow-button"]} ${styles["left-button"]}`}
                  onClick={prevJson}
              />:<></>}
              {(jsonSelectionArray[index].name || jsonSelectionArray[index].manifestName) && (
                <div style={{ textAlign: 'center', flex: 1}}>
                  <div className={styles["traitInfoTitle"]}>
                    {byManifest ? jsonSelectionArray[index].manifestName : jsonSelectionArray[index].name}
                  </div>
                </div>
              )}
              {jsonSelectionArray?.length > 1 ? <div //add right arrow only when array is greater than 1
                className={`${styles["arrow-button"]} ${styles["right-button"]}`}
                onClick={nextJson}
              />:<></>}
            </div>
            {(jsonSelectionArray[index].thumb || jsonSelectionArray[index].thumbnail) && (
              <img
                src={jsonSelectionArray[index].thumb || jsonSelectionArray[index].thumbnail}
                alt="Selection Thumbnail"
                style={{
                  width: '280px',
                  height: '460px',
                  display: 'block',
                  margin: '20px auto 20px',
                }}
              />
            )}
            {jsonSelectionArray[index].attributes && jsonSelectionArray[index].attributes.map((attribute) => (
              <div key={`json:${attribute.trait_type}_${attribute.value}`}>
                <div className={styles["traitInfoText"]}>
                  {`${attribute.trait_type} : ${attribute.value}`}
                </div>
              </div>
            ))}
            {byManifest && currentAvatarKeys.map((key) => (
              <div key={`val:${key}`}>
                <div className={styles["traitInfoText"]}>
                  {`${key} : ${currentAvatar[key].id}`}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (<></>)
    );
}