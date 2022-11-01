import * as THREE from "three";

export const MeshIsHidden = async(mesh, greed = 1) => {
    let greedCounter =  0;
    //console.log(mesh.geometry.attributes);
    const raycast = new THREE.Raycaster();
    
    //console.log(raycast);
    const vertexData = mesh.geometry.attributes.position.array;
    const normalsData = mesh.geometry.attributes.normal.array;
    //console.log(vertexData)
    for (let i =0; i < vertexData.length;i+=3){
        // set the origin
        const origin = new THREE.Vector3(vertexData[i],vertexData[i+1],vertexData[i+2])
        const direction = new THREE.Vector3(normalsData[i],normalsData[i+2],normalsData[i+2]);
        if (i === 0){
            console.log(origin.x)
            //console.log(direction)
        }

        raycast.set(origin,direction);
    }
}