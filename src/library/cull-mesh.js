import * as THREE from "three";

export const MeshIsHidden = async(mesh, traitModel, greed = 20) => {
    let greedCounter =  0;
    const traitMeshes = [];
    traitModel.traverse((child)=>{
        if (child.isMesh)
            traitMeshes.push(child);
    });
    
    //console.log(traitMeshes)

    const ray = new THREE.Ray();

    const raycast = new THREE.Raycaster();
    raycast.far = 0.1;
    const index = mesh.geometry.index.array;
    // //debug section
    // console.log ("length")
    // console.log (mesh.geometry.index.array.length);

    // console.log ("max vertices")
    // console.log (mesh.geometry.attributes.position.array.length/3);
    
    // 
    // let maxval = 0;
    // for (let i =0; i < index.length;i++){
    //     if (index[i] > maxval)
    //         maxval = index[i];
    // }
    // console.log ("max index")
    // console.log(maxval);
    // console.log("============================")
    // //end debug section

    const vertexData = mesh.geometry.attributes.position.array;
    const normalsData = mesh.geometry.attributes.normal.array;

    let hidden = true;
    let origin = new THREE.Vector3();
    let direction = new THREE.Vector3();
    // setting += 3 to only check 1 vertex of each face
    const intersections = [];
    for (let i =0; i < index.length;i+=3){
        intersections.length = 0;
        const vi = index[i] * 3;
        origin.set(vertexData[vi],vertexData[vi+1],vertexData[vi+2])
        direction.set(normalsData[vi],normalsData[vi+1],normalsData[vi+2]);
        raycast.set(origin,direction);
        if (raycast.intersectObjects( traitMeshes, false , intersections).length === 0){
            greedCounter++;
            if (greedCounter >= greed){
                hidden = false;
                break;
            }
        }
            
    }
    mesh.visible = !hidden;


        




    // for (let i =0; i < vertexData.length;i+=3){
    //     // set the origin
    //     const origin = new THREE.Vector3(vertexData[i],vertexData[i+1],vertexData[i+2])
    //     const direction = new THREE.Vector3(normalsData[i],normalsData[i+2],normalsData[i+2]);
    //     if (i === 0){
    //         //console.log(origin)
    //         //console.log(direction)
    //     }

    //     raycast.set(origin,direction);
    // }
}