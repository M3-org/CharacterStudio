import React, { useContext, useEffect } from "react"
import styles from "./Appearance.module.css"
import { ViewMode, ViewContext } from "../context/ViewContext"
import { SceneContext } from "../context/SceneContext"
import Editor from "../components/Editor"
import CustomButton from "../components/custom-button"
import { LanguageContext } from "../context/LanguageContext"
import { SoundContext } from "../context/SoundContext"
import { AudioContext } from "../context/AudioContext"
import FileDropComponent from "../components/FileDropComponent"
import { getFileNameWithoutExtension } from "../library/utils"
import { getTraitOption } from "../library/option-utils"

function Appearance({
  animationManager,
  blinkManager,
  lookatManager,
  effectManager,
  confirmDialog
}) {
  const { isLoading, setViewMode } = React.useContext(ViewContext)
  const {
    resetAvatar,
    getRandomCharacter,
    isChangingWholeAvatar,
    setIsChangingWholeAvatar,
    toggleDebugMNode,
    templateInfo,
    setSelectedOptions
  } = React.useContext(SceneContext)
  

  const { playSound } = React.useContext(SoundContext)
  const { isMute } = React.useContext(AudioContext)
  const back = () => {
    !isMute && playSound('backNextButton');
    resetAvatar()
    setViewMode(ViewMode.CREATE)
  }

  const [jsonSelection, setJsonSelection] = React.useState(null)
  

  const next = () => {
    !isMute && playSound('backNextButton');
    setViewMode(ViewMode.BIO)
  }

  const randomize = () => {
    if (!isChangingWholeAvatar) {
      !isMute && playSound('randomizeButton');
      getRandomCharacter()
    }
  }

  const debugMode = () =>{
    toggleDebugMNode()
  }

  useEffect(() => {
    const setIsChangingWholeAvatarFalse = () => setIsChangingWholeAvatar(false)

    effectManager.addEventListener(
      "fadeintraitend",
      setIsChangingWholeAvatarFalse,
    )
    effectManager.addEventListener(
      "fadeinavatarend",
      setIsChangingWholeAvatarFalse,
    )
    return () => {
      effectManager.removeEventListener(
        "fadeintraitend",
        setIsChangingWholeAvatarFalse,
      )
      effectManager.removeEventListener(
        "fadeinavatarend",
        setIsChangingWholeAvatarFalse,
      )
    }
  }, [])

  // Translate hook
  const { t } = useContext(LanguageContext)

  const handleFilesDrop = async(files) => {
    const file = files[0];
    // Check if the file has the .fbx extension
    if (file && file.name.toLowerCase().endsWith('.fbx')) {
      const animName = getFileNameWithoutExtension(file.name);
      console.log('Dropped .fbx file:', file);
      const path = URL.createObjectURL(file);
      console.log("path")
      await animationManager.loadAnimation(path, true, "", animName);
      // Handle the dropped .fbx file
    } 
    if (file && file.name.toLowerCase().endsWith('.json')) {
      //console.log('Dropped .json file:', file);
      const reader = new FileReader();
      const thumbLocation = `${templateInfo.assetsLocation}/anata/_thumbnails/t_${file.name.split('_')[0]}.jpg`
      const jsonName = file.name.split('.')[0];

      //const thumbnailName = 
      reader.onload = function(e) {
        try {
          const jsonContent = JSON.parse(e.target.result); // Parse the JSON content
          // Now you can work with the JSON data in the 'jsonContent' variable
          
          const options = [];

          const jsonAttributes = jsonContent.attributes.map((attribute) => {return { trait:attribute.trait_type, id:attribute.value }});
          
          
          const jsonSelection = {name: jsonName, thumb:thumbLocation,attributes:jsonAttributes}
          setJsonSelection(jsonSelection);

          jsonContent.attributes.forEach(attribute => {
            if (attribute.trait_type != "BRACE")
              options.push(getTraitOption(attribute.value, attribute.trait_type , templateInfo));
          });
          const filteredOptions = options.filter(element => element !== null);
          
          templateInfo.traits.map(trait => {
            const coincidence = filteredOptions.some(option => option.trait.trait == trait.trait);
            // find if trait.trait has coincidence in any of the filteredOptions[].trait
            // if no coincidence was foud add to filteredOptions {item:null, trait:templateInfo.traits.find((t) => t.name === currentTraitName}
            if (!coincidence) {
              // If no coincidence was found, add to filteredOptions
              filteredOptions.push({ item: null, trait: trait });
            }
          });

          if (filteredOptions.length > 0){
            setSelectedOptions(filteredOptions)
          }

          


        } catch (error) {
          console.error("Error parsing the JSON file:", error);
        }
      };
  
      reader.readAsText(file); // Read the file as text
      
      // Handle the dropped .fbx file
    } 
  };

  return (
    <div className={styles.container}>
      <div className={`loadingIndicator ${isLoading ? "active" : ""}`}>
        <img className={"rotate"} src="ui/loading.svg" />
      </div>
      <div className={"sectionTitle"}>{t("pageTitles.chooseAppearance")}</div>
      <FileDropComponent 
         onFilesDrop={handleFilesDrop}
      />
      <Editor
        animationManager={animationManager}
        blinkManager={blinkManager}
        lookatManager={lookatManager}
        effectManager={effectManager}
        confirmDialog={confirmDialog}
        jsonSelection={jsonSelection}
      />
      <div className={styles.buttonContainer}>
        <CustomButton
          theme="light"
          text={t('callToAction.back')}
          size={14}
          className={styles.buttonLeft}
          onClick={back}
        />
        <CustomButton
          theme="light"
          text={t('callToAction.next')}
          size={14}
          className={styles.buttonRight}
          onClick={next}
        />
        <CustomButton
          theme="light"
          text={t('callToAction.randomize')}
          size={14}
          className={styles.buttonCenter}
          onClick={randomize}
        />
        <CustomButton
          theme="light"
          text={"debug"}
          size={14}
          className={styles.buttonCenter}
          onClick={debugMode}
        />
      </div>
    </div>
  )
}

export default Appearance
