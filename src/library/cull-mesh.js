import { Note } from "@mui/icons-material";
import * as THREE from "three";
import { SAH,computeBoundsTree, disposeBoundsTree, acceleratedRaycast, StaticGeometryGenerator  } from 'three-mesh-bvh';


export const MeshIsHidden = async(mesh, traitModel, greed = 10) => {
    //console.log(mesh);
    if (mesh.lines == null)
        mesh.lines = [];
    else{
        mesh.lines.forEach(line => {
            line.visible = false;
        });
        mesh.lines.length = 0;
    }
    THREE.BufferGeometry.prototype.computeBoundsTree = computeBoundsTree;
    THREE.BufferGeometry.prototype.disposeBoundsTree = disposeBoundsTree;
    THREE.Mesh.prototype.raycast = acceleratedRaycast;
    //console.log(shapecast)
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
    //raycaster.firstHitOnly = true;
    
    raycaster.far = 0.4;

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

        if(mesh.name === "Bodybaked_1"){
            // var pointB = new THREE.Vector3();
            // pointB.addVectors ( origin, direction.multiplyScalar( raycaster.far ) );

            // const points = []
            // points.push( origin );
            // points.push( pointB );
            // const geometry = new THREE.BufferGeometry().setFromPoints( points );
            // var material = new THREE.LineBasicMaterial( { color : 0xffffff } );
            // var line = new THREE.Line( geometry, material );
            // mesh.parent.add( line );
            // mesh.lines.push(line);
        }

        if (raycaster.intersectObjects( traitMeshes, false, intersections ).length === 0){
            greedCounter++;
            //console.log("greed")
            if(mesh.name === "Bodybaked_5"){

                var pointB = new THREE.Vector3();
                pointB.addVectors ( origin.clone(), direction.multiplyScalar( raycaster.far ) );

                const points = []
                points.push( origin );
                points.push( pointB );
                const geometry = new THREE.BufferGeometry().setFromPoints( points );
                var material = new THREE.LineBasicMaterial( { color : 0xff0000 } );
                var line = new THREE.Line( geometry, material );
                mesh.parent.add( line );
                mesh.lines.push(line);
                
            }
            if (greedCounter >= greed){
                hidden = false;
                //break;
            }
        }
            
    }
    console.log(mesh.name)
    console.log(greedCounter);
    mesh.visible = !hidden;
}