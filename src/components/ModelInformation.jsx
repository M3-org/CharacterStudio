import React, { useState, useEffect } from "react"
import styles from "./ModelInformation.module.css"
import MenuTitle from "./MenuTitle"
import { findChildrenByType } from "../library/utils";
import { getAsArray, getMaterialsSortedByArray } from "../library/utils";

export default function ModelInformation({model}){
    const [meshQty, setMeshQty] = useState(0);
    const [skinnedMeshQty, setSkinnedMeshQty] = useState(0);

    const [standardMaterialQty, setStandardMaterialQty] = useState(0);
    const [standardTranspMaterialQty, setStandardTranspMaterialQty] = useState(0);
    const [standardCutoutMaterialQty, setStandardCutoutMaterialQty] = useState(0);
    
    const [vrmMaterialQty, setVrmMaterialQty] = useState(0);
    const [vrmTranspMaterialQty, setVrmTranspMaterialQty] = useState(0);
    const [vrmCutoutMaterialQty, setVrmCutoutMaterialQty] = useState(0);

    useEffect(() => {
        console.log(model); 
        
        console.log("ENTER0")
        if (model != null){
            console.log("ENTER")
            console.log(model.children[0]); 
            const meshes = findChildrenByType(model,"Mesh");
            const skinnedMesh = findChildrenByType(model,"SkinnedMesh");
            setMeshQty(meshes.length)
            setSkinnedMeshQty(skinnedMesh.length)
            const allMeshes =  meshes.concat(skinnedMesh);

            const {stdMats,stdCutoutpMats,stdTranspMats,mToonMats,mToonCutoutMats,mToonTranspMats} = getMaterialsSortedByArray(allMeshes);

            setStandardMaterialQty(stdMats.length);
            setStandardTranspMaterialQty(stdTranspMats.length);
            setStandardCutoutMaterialQty(stdCutoutpMats.length);

            setVrmMaterialQty(mToonMats.length);
            setVrmTranspMaterialQty(mToonTranspMats.length);
            setVrmCutoutMaterialQty(mToonCutoutMats.length);
        }
    }, [model])


    return (
        model != null ? (
        <div>
            <div className={styles["InformationContainerPos"]}>
                <MenuTitle title="Model Information" width={180} right={20}/>
                <div className={styles["scrollContainer"]}>
                    <div className={styles["traitInfoTitle"]}>
                        Meshes:
                    </div>
                    <div className={styles["traitInfoText"]}>
                       {meshQty}
                    </div>
                    <div className={styles["traitInfoTitle"]}>
                        SkinnedMeshes:
                    </div>
                    <div className={styles["traitInfoText"]}>
                        {skinnedMeshQty}
                    </div>
                    <div className={styles["traitInfoTitle"]}>
                        Standard Material Count:
                    </div>
                    <div className={styles["traitInfoText"]}>
                        opaque: {standardMaterialQty}
                    </div>
                    <div className={styles["traitInfoText"]}>
                        cutout: {standardCutoutMaterialQty}
                    </div>
                    <div className={styles["traitInfoText"]}>
                        transparent: {standardTranspMaterialQty}
                    </div>
                    <div className={styles["traitInfoTitle"]}>
                        MToon Material Count:
                    </div>
                    <div className={styles["traitInfoText"]}>
                        opaque: {vrmMaterialQty}
                    </div>
                    <div className={styles["traitInfoText"]}>
                        cutout: {vrmCutoutMaterialQty}
                    </div>
                    <div className={styles["traitInfoText"]}>
                        transparent: {vrmTranspMaterialQty}
                    </div>
                </div>
            </div>
        </div>
        ):(<></>)
      )
}