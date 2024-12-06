import React, { useEffect, useState } from "react"
import styles from "./Create.module.css"
import { ViewMode, ViewContext } from "../context/ViewContext"
import CustomButton from "../components/custom-button"
import { LanguageContext } from "../context/LanguageContext"
import { useContext } from "react"

import { SceneContext } from "../context/SceneContext"
import { SoundContext } from "../context/SoundContext"
import { AudioContext } from "../context/AudioContext"

import { getAsArray } from "../library/utils"
import { WalletCollections } from "../library/walletCollections"

function Create() {
  
  // Translate hook
  const {t} = useContext(LanguageContext);

  const { setViewMode, setIsLoading, isLoading } = React.useContext(ViewContext)
  const { playSound } = React.useContext(SoundContext)
  const { isMute } = React.useContext(AudioContext)
  const { manifest, characterManager } = React.useContext(SceneContext)
  const [ classes, setClasses ] = useState([]) 
  let [walletCollections, setWalletCollections] = useState(null)

  useEffect(()=>{
      if (walletCollections == null){
        setWalletCollections (new WalletCollections()); 	  
      }
    },[])
  useEffect(() => {

    if (manifest?.characters != null){

      const manifestClasses = getCharacterManifests(getAsArray(manifest.characters));
      const nonRepeatingCollections = [];
      const seenCollections = new Set();
      manifest.characters.forEach((c) => {
      if (c.collectionLock != null && !seenCollections.has(c.collectionLock)) {
          nonRepeatingCollections.push(c.collectionLock);
          seenCollections.add(c.collectionLock);
        }
      });
      setClasses(manifestClasses);

    }
  }, [manifest])

  const back = () => {
    setViewMode(ViewMode.LANDING)
    !isMute && playSound('backNextButton');
  }

  const getCharacterManifests = (charactersArray) =>{
      return charactersArray.map((c) => {
        let enabled = c.collectionLock == null ? false : true;
        return {
          name:c.name, 
          image:c.portrait, 
          description: c.description,
          manifest: c.manifest,
          icon:c.icon,
          format:c.format,
          disabled:enabled,
          collectionLock: getAsArray(c.collectionLock),
          manifestAppend: getCharacterManifests(getAsArray(c.manifestAppend)),
          fullTraits: c.fullTraits || false,
          chainName:c.chainName || "ethereum",
          dataSource:c.dataSource || "attributes"
        }
      })
  }

  const addressTest = null;
  const selectClass = async (index) => {
    setIsLoading(true)
    const selectedClass = classes[index];

    if (selectedClass.collectionLock.length > 0){
      const owns = await characterManager.loadManifestWithOwnedTraits(selectedClass.manifest,selectedClass.collectionLock[0],selectedClass.chainName,selectedClass.dataSource,selectedClass.fullTraits, addressTest);
      if (!owns){
        // display not own window
        return;
      }
    }
    else{
      await characterManager.loadManifest(selectedClass.manifest);
    }

    
    
    setViewMode(ViewMode.APPEARANCE)
    const promises = selectedClass.manifestAppend.map(manifestAppend => {
      return new Promise((resolve)=>{
        // check if it requires nft validation
        if (manifestAppend.collectionLock.length > 0){
          characterManager.loadAppendManifestWithOwnedTraits(manifestAppend.manifest, false, manifestAppend.collectionLock, manifestAppend.chainName, manifestAppend.dataSource,manifestAppend.fullTraits,addressTest).then((owns)=>{
            resolve(owns);
          })
        }
        else{
          characterManager.loadAppendManifest(manifestAppend.manifest, false).then((owns)=>{
            resolve(owns);
          })
        }
      })
    });

    await Promise.all(promises);
    // When Manifest is Loaded, load initial traits from given manifest

    characterManager.loadInitialTraits().then(()=>{
      setIsLoading(false)
    })
    !isMute && playSound('classSelect');

  }

  const hoverSound = () => {
    !isMute && playSound('classMouseOver');
  }
  
  return (
    <div className={`${styles.container} horizontalScroll`}>
      <div className={"sectionTitle"}>{t('pageTitles.chooseClass')}</div>
      <div className={styles.vrmOptimizerButton}>
      </div>

      
      <div className={styles.topLine} />
      
      <div className={styles.classContainer}>
        {classes.map((characterClass, i) => {
          return (
            <div
              key={i}
              className={
                !characterClass["disabled"]
                  ? styles.class
                  : styles.classdisabled
              }
              onClick={
                  () => selectClass(i)
              }
              onMouseOver={
                  () => hoverSound()
              }
            >
            <div
                className={styles.classFrame}
                style={{
                  "backgroundImage": `url(${characterClass["image"]})`,
                }}
              >
                <div className={styles.frameContainer}>
                  <img
                    src={"./assets/backgrounds/class-frame.svg"}
                    className={styles.frame}
                  />
                </div>

                <div className={styles.lockedContainer}>
                  {characterClass["disabled"] && (
                    <img
                      src={"./assets/icons/locked.svg"}
                      className={styles.locked}
                    />
                  )}
                </div>
              </div>
              
              <div className={styles.name}>{characterClass["name"]}</div>
              <div className={styles.description}>
                {characterClass["description"]}
              </div>
            </div>
          )
        })}
      </div>

      <div className={styles.bottomLine} />
      <div className={styles.buttonContainer}>
        { <CustomButton
          theme="light"
          text={t('callToAction.back')}
          size={14}
          className={styles.buttonLeft}
          onClick={back}
      />}
      </div>
    </div>
  )
}

export default Create
