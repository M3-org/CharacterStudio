import React, { useContext, useState, useEffect } from "react"
import styles from "./FloatingMenu.module.css"
import MenuTitle from "./MenuTitle"
import { SceneContext } from "../context/SceneContext";
import Slider from "./Slider";

export default function TraitInformation({selectedTrait, selectedVRM}){
    const {
        animationManager,
        characterManager,
    } = useContext(SceneContext);

    const [cullOutDistance, setCullOutDistance] = useState(0); // set from the values of the trait
    const [cullInDistance, setCullInDistance] = useState(0);
    const [cullLayer, setCullLayer] = useState(0);

    useEffect(() => {
        if (selectedVRM != null){
            setCullLayer(selectedVRM.data?.cullingLayer);
            setCullOutDistance(selectedVRM.data?.cullingDistance[0]||0);
            setCullInDistance(selectedVRM.data?.cullingDistance[1]||0);
        }
    }, [selectedVRM])

    

    const handleCullOutChange = (event) => {
        setCullOutDistance(event.target.value);
        if ( selectedVRM?.data){
            selectedVRM.data.cullingDistance[0] = event.target.value;
        }
        
    };

    const handleCullInChange = (event) => {
        setCullInDistance(event.target.value);
        if ( selectedVRM?.data){
            selectedVRM.data.cullingDistance[1] = event.target.value;
        }
       
    };


    const handleCullLayerChange = (event) => {
        if (selectedVRM?.data){
            setCullLayer(event.target.value);
            selectedVRM.data.cullingLayer = event.target.value;
        }
    };

    const updateCulling = () =>{
        characterManager.updateCullHiddenMeshes();
    }

    return (
        
        <div>
            <div className={styles["InformationContainerPos"]}>
                <MenuTitle title="Trait Information" width={180} right={20}/>
                <div className={styles["scrollContainer"]}>
                    {selectedTrait != null ? (
                        <>
                    <div className={styles["traitInfoTitle"]}>
                        Trait ID
                    </div>
                    <div className={styles["traitInfoText"]}>
                        {selectedTrait?.id}
                    </div>
                    <div className={styles["traitInfoTitle"]}>
                        Trait Name
                    </div>
                    <div className={styles["traitInfoText"]}>
                        {selectedTrait?.name}
                    </div>
                    <div className={styles["traitInfoTitle"]}>
                        Description
                    </div>
                    <div className={styles["traitInfoText"]}>
                        {selectedTrait?.description || "A nice " + selectedTrait?.name}
                    </div>
                    <div className={styles["traitInfoTitle"]}>
                        Culling Options
                    </div>
                    <br/>
                        <div className={styles["traitInfoText"]}>
                            Culling Layer
                                <input
                                    type="number"
                                    min="0"
                                    max="100"
                                    value={cullLayer}
                                    onChange={handleCullLayerChange}
                                    className={styles["input-box"]}
                                    step ={1}
                                />
                            <br/>
                            <br/>
                            
                            <Slider title={"Out Distance"} value={cullOutDistance} onChange={handleCullOutChange} min={0} max={1} step={0.001}stepBox={0.01}/>
                            <br/>
                            <Slider title={"In Distance"} value={cullInDistance} onChange={handleCullInChange}  min={0} max={1} step={0.001}stepBox={0.01}/>
                            <div 
                                className={styles["actionButton"]}
                                onClick={updateCulling}>
                                <div> 
                                    Update Culling </div>
                            </div>
                        </div>
                        
                        </>):(<>
                            <div className={styles["traitInfoTitle"]}>
                                No Trait Selected
                            </div>

                        </>)}
                    </div>

            </div>
        </div>
      )
}