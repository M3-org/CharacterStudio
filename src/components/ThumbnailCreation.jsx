import React, { useContext, useState, useEffect } from "react"
import styles from "./FloatingMenu.module.css"
import MenuTitle from "./MenuTitle"
import { SceneContext } from "../context/SceneContext";
import Slider from "./Slider";
import Dropdown from 'react-dropdown';
import 'react-dropdown/style.css';

export default function ThumbnailCreation({selectedTrait, selectedVRM}){
    const { manifest, thumbnailsGenerator, sceneElements } = React.useContext(SceneContext)

    const [ options, setOptions ] = useState([]) 
    const [ description, setDescription ] = useState("");
    const [ manifestLocation, setManifestLocation ] = useState("");
    const [ viewingManifests,setViewingManifests ] = useState(true);

    const onSelect = (sel) =>{
        if (manifest?.thumbnails != null){
            setDescription(manifest.thumbnails[sel.value].description)
            setManifestLocation(manifest.thumbnails[sel.value].manifest);

            console.log(manifest.thumbnails[sel.value].manifest)
        }
    }

    const switchAction = () =>{
        setViewingManifests(!viewingManifests);
    }

    const createThumbnails = async () =>{
        const parentScene = sceneElements.parent;
        parentScene.remove(sceneElements);
        await thumbnailsGenerator.createThumbnails('./thumbnail-assets/manifest.json');
        parentScene.add(sceneElements);
      }


    useEffect(() => {
    if (manifest?.thumbnails != null){
        const manifestOptions = manifest.thumbnails.map((c,i) => {
            return {
                value:i, 
                label:c.name, 
                description: c.description,
                manifest: c.manifest,
            }
          })
          setOptions(manifestOptions);
    }
    }, [manifest])
    return (
        
        <div>
            <div className={styles["InformationContainerPos"]}>
                <MenuTitle title="Lora Creation" width={180} right={20}/>
                <div className={styles["scrollContainer"]}>
                    <div 
                        className={styles["actionButton"]}
                        onClick={switchAction}>
                        <div>  {viewingManifests ? "Custom" : "Manifests"} </div>
                    </div>
                    <div className={styles["traitInfoTitle"]}>
                        Thumbnail Manifests
                    </div>
                    <Dropdown options={options} onChange={onSelect} placeholder="Select an option" />;
                
                    <div className={styles["traitInfoText"]}>
                        {description || ""}
                    </div>
                    {
                        manifestLocation != "" && 
                        <div 
                            className={styles["actionButton"]}
                            onClick={createThumbnails}>
                            <div>  Create Thumbnails </div>
                        </div>
                    }
                </div>
            </div>
        </div>
      )
}