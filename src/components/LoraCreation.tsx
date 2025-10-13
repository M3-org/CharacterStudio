import { LoraJsonDescription } from "@/library/CharacterManifestData";
import React, { useMemo, useState } from "react";
import Select from 'react-select';
import { SceneContext } from "../context/SceneContext";
import styles from "./FloatingMenu.module.css";
import MenuTitle from "./MenuTitle";

export default function LoraCreation(){
    const { manifest, loraDataGenerator, sceneElements } = React.useContext(SceneContext)

    const options = useMemo(()=>{
        return manifest?.loras?.map((c,i) => {
            return {
                value:i, 
                ...c,
                label:c.name
            }
          }) || []
    },[manifest])

    //const [ description, setDescription ] = useState("");
    const [ targetLora, setTargetLora ] = useState<LoraJsonDescription | null>(null);

    const onSelect = (sel: (LoraJsonDescription & { value: number }) | null) =>{
        if (!sel){
            return
        }
        if (manifest?.loras != null){
            //setDescription(manifest.loras[sel.value].description)
            setTargetLora(manifest.loras[sel.value]);

            console.log(manifest.loras[sel.value])
        }
    }

    const createLoraData = async() =>{
        const parentScene = sceneElements.parent;
        if (parentScene == null || targetLora == null) return;
        parentScene.remove(sceneElements);
        await loraDataGenerator.createLoraData(targetLora);
        parentScene.add(sceneElements);
      }


    return (
        
        <div>
            <div className={styles["InformationContainerPos"]}>
                <MenuTitle title="Lora Creation" width={180} right={20}/>
                <div className={styles["scrollContainer"]}>
                    <div className={styles["traitInfoTitle"]}>
                        Lora Manifests
                    </div>
                    <Select 
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