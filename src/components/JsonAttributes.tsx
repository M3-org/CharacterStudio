import { AvatarSelection } from "@/library/characterManager"
import { manifestJson } from "@/library/CharacterManifestData"
import React, { useContext, useEffect, useState } from "react"
import { SceneContext } from "../context/SceneContext"
import { ViewContext } from "../context/ViewContext"
import styles from "./JsonAttributes.module.css"
import MenuTitle from "./MenuTitle"

type AvatarJsonWithAttributes = {
      name?:string,
      manifestName:string,
      thumbnail?:string,
      thumb?:string,
      attributes:{ trait_type: string; value: string }[],
      // Remove or narrow the index signature if needed
      // [key: string]: { name: string; id:string }
    }

export type JsonAttributesProps = AvatarJsonWithAttributes & {
  [key: string]: { name: string; id:string }
}

export default function JsonAttributes({jsonSelectionArray, byManifest = false}:{
  jsonSelectionArray:JsonAttributesProps[] | null,
  byManifest?:boolean
}){
  const { isLoading, setIsLoading } = React.useContext(ViewContext)
  const {
    characterManager
  } = useContext(SceneContext);
  const [index, setIndex] = useState(0);
  const [currentAvatar, setCurrentAvatar] = React.useState<AvatarSelection>({})
  const [currentAvatarKeys, setCurrentAvatarKeys] = React.useState<string[]>([])

  const loadByManifest =(manifest:manifestJson)=>{
    characterManager.removeCurrentManifest();
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

  const loadByTraitData = (nftObject: JsonAttributesProps) => {
    characterManager.loadTraitsFromNFTObject(nftObject).then(()=>{
      setIsLoading(false);
    })
  }

  const nextJson = async () => {
    if (!jsonSelectionArray) return;
    if (!isLoading){
      setIsLoading(true);
      if (index >= jsonSelectionArray.length -1){
        byManifest ? loadByManifest(jsonSelectionArray[0] as any) : loadByTraitData(jsonSelectionArray[0]);
        setIndex(0);
      }
      else{
        const newIndex = index + 1;
        byManifest ? loadByManifest(jsonSelectionArray[newIndex] as any) : loadByTraitData(jsonSelectionArray[newIndex]);
        setIndex(newIndex);
      }
    }
  }
  const prevJson = async () => {
    if (!jsonSelectionArray) return;
    if (!isLoading){
      setIsLoading(true);
      if (index <= 0){
        byManifest ? loadByManifest(jsonSelectionArray[jsonSelectionArray.length-1] as any)  : loadByTraitData(jsonSelectionArray[jsonSelectionArray.length-1]);
          
        setIndex(jsonSelectionArray.length -1);
      }
      else{
        const newIndex = index-1;
        byManifest ? loadByManifest(jsonSelectionArray[newIndex] as any) : loadByTraitData(jsonSelectionArray[newIndex])
        setIndex(newIndex);
      }
    }
  }

  if(!jsonSelectionArray) return (<></>)
  
  return (
      jsonSelectionArray.length > 0 ? (
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
                  width: '256px',
                  height: '256px',
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
