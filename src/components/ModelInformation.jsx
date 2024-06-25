import React, { useState, useEffect } from "react"
import styles from "./ModelInformation.module.css"
import MenuTitle from "./MenuTitle"
import { findChildrenByType } from "../library/utils";
import { getMaterialsSortedByArray } from "../library/utils";
import { SceneContext } from "../context/SceneContext"

export default function ModelInformation({model, name, files, index, nextVrm, previousVrm}){
    const {
        characterManager
      } = React.useContext(SceneContext)

    const [meshQty, setMeshQty] = useState(0);
    const [skinnedMeshQty, setSkinnedMeshQty] = useState(0);

    const [standardMaterialQty, setStandardMaterialQty] = useState(0);
    const [standardTranspMaterialQty, setStandardTranspMaterialQty] = useState(0);
    const [standardCutoutMaterialQty, setStandardCutoutMaterialQty] = useState(0);
    
    const [vrmMaterialQty, setVrmMaterialQty] = useState(0);
    const [vrmTranspMaterialQty, setVrmTranspMaterialQty] = useState(0);
    const [vrmCutoutMaterialQty, setVrmCutoutMaterialQty] = useState(0);

    const [trianglesCount, setTrianglesCount] = useState(0);
    const [bonesCount, setBonesCount] = useState(0);


    useEffect(() => {
        if (model != null){
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

            const {
                triangles,
                bones
            } = characterManager.getBoneTriangleCount();
            setTrianglesCount(triangles);
            setBonesCount(bones);
        }
    }, [model])


    return (
        model != null ? (
        <div>
            <div className={styles["InformationContainerPos"]}>
                <MenuTitle title="Model Information" width={180} right={20}/>
                <div className={styles["scrollContainer"]}>
                    <div className={styles["flexSelect"]}>


                        {files?.length > 1 ? <div // add left arrow only when array is greater than 1
                            className={`${styles["arrow-button"]} ${styles["left-button"]}`}
                            onClick={previousVrm}
                        />:<></>}


                        {(name) && (
                            <div style={{ textAlign: 'center' }}>
                                <div className={styles["traitInfoTitle"]} style={{ 
                                    margin:'auto',
                                    fontSize: '14px' ,
                                    width:'200px',
                                    textAlign:'center',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap',
                                    overflow: 'hidden',
                                    }}>
                                    {name}
                                </div>
                            </div>
                        )}


                        {files?.length > 1 ? <div //add right arrow only when array is greater than 1
                            className={`${styles["arrow-button"]} ${styles["right-button"]}`}
                            onClick={nextVrm}
                        />:<></>}
                    </div>
                    <div className={styles["traitInfoTitle"]}>
                        Geometry info:
                    </div>
                    <div className={styles["traitInfoText"]}>
                        Meshes: {meshQty}
                    </div>
                    <div className={styles["traitInfoText"]}>
                        SkinnedMeshes: {skinnedMeshQty}
                    </div>
                    <div className={styles["traitInfoText"]}>
                        Triangles: {trianglesCount}
                    </div>
                    <div className={styles["traitInfoText"]}>
                        Bones: {bonesCount}
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