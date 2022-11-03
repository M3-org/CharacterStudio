import * as THREE from "three";
import { SAH,computeBoundsTree, disposeBoundsTree, acceleratedRaycast, StaticGeometryGenerator  } from 'three-mesh-bvh';

function DebugRay(origin, direction, length, color, scene){
    if (scene.lines == null)
        scene.lines = [];
    else{
        scene.lines.forEach(line => {
            line.visible = false;
        });
        scene.lines.length = 0;
    }

    let endPoint = new THREE.Vector3();
    endPoint.addVectors ( origin, direction.multiplyScalar( length ) );

    const points = []
    points.push( origin );
    points.push( endPoint );
    const geometry = new THREE.BufferGeometry().setFromPoints( points );
    let material = new THREE.LineBasicMaterial( { color : color } );
    var line = new THREE.Line( geometry, material );
    scene.parent.add( line );
    scene.lines.push(line);
}

export const MeshIsHidden = async(mesh, traitModel, greed = 10) => {

    THREE.BufferGeometry.prototype.computeBoundsTree = computeBoundsTree;
    THREE.BufferGeometry.prototype.disposeBoundsTree = disposeBoundsTree;
    THREE.Mesh.prototype.raycast = acceleratedRaycast;

    let greedCounter =  0;
    const traitMeshes = [];

    traitModel.traverse((child)=>{
        if (child.isMesh){
            // create the bound tree whne loading model instead
            if (child.geometry.boundsTree == null)
                 child.geometry.computeBoundsTree({strategy:SAH});
            
            traitMeshes.push(child);
        }
    });
    // create the bound tree whne loading model instead
    if (mesh.geometry.boundsTree == null)
         mesh.geometry.computeBoundsTree({strategy:SAH});

    const raycaster = new THREE.Raycaster();
    raycaster.firstHitOnly = true;
    
    raycaster.far = 0.22;

    const index = mesh.geometry.index.array;
    const vertexData = mesh.geometry.attributes.position.array;
    const normalsData = mesh.geometry.attributes.normal.array;

    let hidden = true;
    let origin = new THREE.Vector3();
    let direction = new THREE.Vector3();
    
    const intersections = [];
    for (let i =0; i < index.length;i++){
        intersections.length = 0;
        const vi = index[i] * 3;
        direction.set(normalsData[vi],normalsData[vi+1],normalsData[vi+2]).normalize();
        origin.set(vertexData[vi],vertexData[vi+1],vertexData[vi+2]).add(direction.clone().multiplyScalar(0.2))
        
        raycaster.set(origin,direction.multiplyScalar(-1));

        if(mesh.name === "Bodybaked_1")
            DebugRay(origin, direction,raycaster.far, 0x00ff00,mesh );
        

        if (raycaster.intersectObjects( traitMeshes, false, intersections ).length === 0){
            //if(mesh.name === "Bodybaked_1")
                //DebugRay(origin, direction,raycaster.far, 0xff0000,mesh );
            
            greedCounter++;
            if (greedCounter >= greed){
                hidden = false;
                break;
            }
        }
            
    }
    mesh.visible = !hidden;
}