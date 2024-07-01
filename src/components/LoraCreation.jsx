import React, { useContext, useState, useEffect } from "react"
import styles from "./FloatingMenu.module.css"
import MenuTitle from "./MenuTitle"
import { SceneContext } from "../context/SceneContext";
import Slider from "./Slider";
import Dropdown from 'react-dropdown';
import 'react-dropdown/style.css';

export default function LoraCreation({selectedTrait, selectedVRM}){
    const { manifest, loraDataGenerator, sceneElements } = React.useContext(SceneContext)

    const [ options, setOptions ] = useState([]) 
    //const [ description, setDescription ] = useState("");
    const [ targetLora, setTargetLora ] = useState(null);

    const onSelect = (sel) =>{
        if (manifest?.loras != null){
            //setDescription(manifest.loras[sel.value].description)
            setTargetLora(manifest.loras[sel.value]);

            console.log(manifest.loras[sel.value])
        }
    }

    const createLoraData = async() =>{
        const parentScene = sceneElements.parent;
        parentScene.remove(sceneElements);
        await loraDataGenerator.createLoraData(targetLora);
        parentScene.add(sceneElements);
      }


    useEffect(() => {
    if (manifest?.loras != null){
        const loraManifestOptions = manifest.loras.map((c,i) => {
            return {
                value:i, 
                label:c.name, 
                description: c.description,
                manifest: c.manifest,
            }
          })
          setOptions(loraManifestOptions);
    }
    }, [manifest])
    return (
        
        <div>
            <div className={styles["InformationContainerPos"]}>
                <MenuTitle title="Lora Creation" width={180} right={20}/>
                <div className={styles["scrollContainer"]}>
                    <div className={styles["traitInfoTitle"]}>
                        Lora Manifests
                    </div>
                    <Dropdown 
                        className={styles.dropdownControl}
                        options={options} 
                        onChange={onSelect} 
                        placeholder="Select an option" />;
                
                    <div className={styles["traitInfoText"]}>
                        {targetLora?.description || ""}
                    </div>
                    {
                        targetLora != null  && 
                        <div 
                            className={styles["actionButton"]}
                            onClick={createLoraData}>
                            <div>  Create Lora Data </div>
                        </div>
                    }
                </div>
            </div>
        </div>
      )
}