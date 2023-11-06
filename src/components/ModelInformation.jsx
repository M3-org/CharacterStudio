import React, { useContext, useState, useEffect } from "react"
import styles from "./ModelInformation.module.css"
import MenuTitle from "./MenuTitle"
import { SceneContext } from "../context/SceneContext";
import { findChildrenByType } from "../library/utils";
import { getAsArray } from "../library/utils";

export default function ModelInformation({currentVRM}){
    const [meshQty, setMeshQty] = useState(0);
    const [skinnedMeshQty, setSkinnedMeshQty] = useState(0);

    const [standardMaterialQty, setStandardMaterialQty] = useState(0);
    const [standardTranspMaterialQty, setStandardTranspMaterialQty] = useState(0);
    const [standardCutoutMaterialQty, setStandardCutoutMaterialQty] = useState(0);
    
    const [vrmMaterialQty, setVrmMaterialQty] = useState(0);
    const [vrmTranspMaterialQty, setVrmTranspMaterialQty] = useState(0);
    const [vrmCutoutMaterialQty, setVrmCutoutMaterialQty] = useState(0);

    useEffect(() => {
        if (currentVRM != null){
            const meshes = findChildrenByType(currentVRM.scene,"Mesh");
            const skinnedMesh = findChildrenByType(currentVRM.scene,"SkinnedMesh");

            setMeshQty(meshes.length)
            setSkinnedMeshQty(skinnedMesh.length)


            const allMeshes =  meshes.concat(skinnedMesh);
            let stdMaterialCount = 0;
            let stdTranspMaterialCount = 0;
            let stdCutoutMaterialCount = 0;

            let shaderMaterialCount = 0;
            let shaderTranspMaterialCount = 0;
            let shaderTCutoutMaterialCount = 0;
            console.log(allMeshes);
            allMeshes.forEach(mesh => {
                const mats = getAsArray(mesh.material);
                mats.forEach(mat => {
                    if (mat.type == "ShaderMaterial"){
                        if (mat.transparent == true)
                            shaderTranspMaterialCount++
                        else if (mat.uniforms.alphaTest.value != 0)
                            shaderTCutoutMaterialCount++
                        else
                            shaderMaterialCount++;
                    }
                    else{
                        if (mat.transparent == true)
                            stdTranspMaterialCount++
                        else if (mat.alphaTest != 0)
                            stdCutoutMaterialCount++
                        else
                            stdMaterialCount++;
                            
                    }
                    // if (mat.type == "MeshStandardMaterial")
                    //     stdMaterialCount++;
                });
            });
            setStandardMaterialQty(stdMaterialCount);
            setStandardTranspMaterialQty(stdTranspMaterialCount);
            setStandardCutoutMaterialQty(stdCutoutMaterialCount);

            setVrmMaterialQty(shaderMaterialCount);
            setVrmTranspMaterialQty(shaderTranspMaterialCount);
            setVrmCutoutMaterialQty(shaderTCutoutMaterialCount);
        }
    }, [currentVRM])


    return (
        currentVRM != null ? (
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