import { SpriteJson } from "@/library/CharacterManifestData";
import React, { useEffect, useState } from "react";
import Select from 'react-select';
import { SceneContext } from "../context/SceneContext";
import styles from "./FloatingMenu.module.css";
import MenuTitle from "./MenuTitle";

export default function SpriteCreation(){
    const { manifest, spriteAtlasGenerator, sceneElements } = React.useContext(SceneContext)

    const [ options, setOptions ] = useState<(SpriteJson&{value:number})[]>([]) 
    const [ description, setDescription ] = useState<string|undefined>("");
    const [ spriteObject, setSpriteObject ] = useState<SpriteJson | null>(null);

    const onSelect = (sel:(SpriteJson & { value: number }) | null) =>{
        if(!sel) return;
        if (manifest?.sprites != null){
            setDescription(manifest.sprites[sel.value].description)
            setSpriteObject(manifest.sprites[sel.value]);
        }
    }

    const createSpritesData = async() =>{
        const parentScene = sceneElements.parent;

        if(!parentScene) {
            console.error("Parent scene not found");
            return;
        };
        parentScene.remove(sceneElements);
        await spriteAtlasGenerator.createSpriteAtlas(spriteObject?.manifest||"");
        parentScene.add(sceneElements);
      }


    useEffect(() => {
    if (manifest?.sprites != null){
        const manifestOptions = manifest.sprites.map((c,i) => {
            return {
                value:i, 
                ...c,
                label: c.name
            }
          })
          setOptions(manifestOptions);
    }
    }, [manifest])
    return (
        
        <div>
            <div className={styles["InformationContainerPos"]}>
                <MenuTitle title="Sprite Creation" width={180} right={20}/>
                <div className={styles["scrollContainer"]}>
                    <div className={styles["traitInfoTitle"]}>
                        Sprite Manifests
                    </div>
                    <Select 
                        className={styles.dropdownControl}
                        options={options} 
                        onChange={onSelect} 
                        placeholder="Select an option" />
                
                    <div className={styles["traitInfoText"]}>
                        {description || ""}
                    </div>
                    {
                        spriteObject != null && 
                        <div 
                            className={styles["actionButton"]}
                            onClick={createSpritesData}>
                            <div>  Create Sprite Data </div>
                        </div>
                    }
                </div>
            </div>
        </div>
      )
}