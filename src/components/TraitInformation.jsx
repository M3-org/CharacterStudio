import React, { useContext } from "react"
import styles from "./TraitInformation.module.css"
import MenuTitle from "./MenuTitle"
import { SceneContext } from "../context/SceneContext";

export default function TraitInformation(){
    const {
        displayTraitOption
      } = useContext(SceneContext);

    return (
        displayTraitOption != null ? (
        <div>
            <div className={styles["InformationContainerPos"]}>
                <MenuTitle title="Trait Information" width={180} right={20}/>
                <div className={styles["traitInfoTitle"]}>
                    Trait ID
                </div>
                <div className={styles["traitInfoText"]}>
                    {displayTraitOption.item?.id}
                </div>
                <div className={styles["traitInfoTitle"]}>
                    Trait Name
                </div>
                <div className={styles["traitInfoText"]}>
                    {displayTraitOption.item?.name}
                </div>
                <div className={styles["traitInfoTitle"]}>
                    Culling Layer
                </div>
                <div className={styles["traitInfoText"]}>
                    {displayTraitOption.item?.cullingLayer || "-"}
                </div>
                <div className={styles["traitInfoTitle"]}>
                    Description
                </div>
                <div className={styles["traitInfoText"]}>
                    {displayTraitOption.item?.description || "A nice " + displayTraitOption.item?.name}
                </div>
                <div className={styles["traitInfoTitle"]}>
                    Culling Distance
                </div>
                <div className={styles["traitInfoText"]}>
                    Out Distance Slider
                    <br/><br/>
                    In Distance Slider
                </div>
            </div>
        </div>
        ):(<></>)
      )
}