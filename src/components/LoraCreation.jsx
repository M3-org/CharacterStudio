import React, { useContext, useState, useEffect } from "react"
import styles from "./TraitInformation.module.css"
import MenuTitle from "./MenuTitle"
import { SceneContext } from "../context/SceneContext";
import Slider from "./Slider";

export default function LoraCreation({selectedTrait, selectedVRM}){

    return (
        
        <div>
            <div className={styles["InformationContainerPos"]}>
                <MenuTitle title="Lora Creation" width={180} right={20}/>
                <div className={styles["scrollContainer"]}>
                    <div className={styles["traitInfoTitle"]}>
                        Loras manifests
                    </div>
                </div>
            </div>
        </div>
      )
}