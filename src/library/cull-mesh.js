import { Mesh, Triangle, BufferAttribute, BackSide, FrontSide, Raycaster, Vector3, Color, BufferGeometry,LineBasicMaterial,Line, MeshBasicMaterial } from "three";
import { computeBoundsTree, disposeBoundsTree, acceleratedRaycast, SAH } from 'three-mesh-bvh';

let origin = new Vector3();
let direction = new Vector3();
const intersections = [];

const raycaster = new Raycaster();

const distance = 0.03;
const distanceAfter = 0.03;

const frontMat = new MeshBasicMaterial({side:FrontSide})
const backMat = new MeshBasicMaterial({side:BackSide})

let mainScene;

BufferGeometry.prototype.computeBoundsTree = computeBoundsTree;
BufferGeometry.prototype.disposeBoundsTree = disposeBoundsTree;
Mesh.prototype.raycast = acceleratedRaycast;

const createFaceNormals = (geometry) => {
    const pos = geometry.attributes.position;
    const idx = geometry.index;
  
    const tri = new Triangle(); // for re-use
    const a = new Vector3(), b = new Vector3(), c = new Vector3(); // for re-use
  
    const faceNormals = [];
  
    //set foreach vertex
    for (let f = 0; f < (idx.array.length / 3); f++) {
      const idxBase = f * 3;
      a.fromBufferAttribute(pos, idx.getX(idxBase + 0));
      b.fromBufferAttribute(pos, idx.getX(idxBase + 1));
      c.fromBufferAttribute(pos, idx.getX(idxBase + 2));
      tri.set(a, b, c);
      faceNormals.push(tri.getNormal(new Vector3()));
    }
    geometry.userData.faceNormals = faceNormals;
}

const createCloneCullMesh = (mesh) => {
    // clone mesh
    const clonedGeometry = mesh.geometry.clone();
    let clonedMaterial = [];
    if (Array.isArray(mesh.material)) {
        for(let i = 0; i < mesh.material.length; i++) {
            clonedMaterial.push(mesh.material[i].clone());
        }
    } else {
        clonedMaterial = mesh.material.clone();
    }

    
    // vrm0 mesh rotation
    if (!mesh.userData.isVRM0){
        const positions = clonedGeometry.attributes.position;  
        for (let i = 0; i < positions.array.length; i += 3) {
            positions.array[i] = -positions.array[i]; // Flip x-coordinate
            positions.array[i + 2] = -positions.array[i + 2]; // Flip z-coordinate
        }
        positions.needsUpdate = true;
    }
    
    const clonedMesh = new Mesh(clonedGeometry, clonedMaterial);
    
     // bvh calculation
    createFaceNormals(clonedMesh.geometry)
    clonedMesh.geometry.computeBoundsTree({strategy:SAH});
    return clonedMesh;
}

const disposeMesh = (mesh) => {
    if (mesh.isMesh){
      mesh.geometry.userData.faceNormals = null;
      mesh.geometry.dispose();
      mesh.geometry.disposeBoundsTree();
      if (mesh.parent) {
        mesh.parent.remove(mesh);
      }
      if (mesh.userData.cancelMesh){
        disposeMesh(mesh.userData.cancelMesh)
      }
    }
  }

export const DisposeCullMesh = (mesh) =>{
    if (mesh.userData.cullingClone) {
        disposeMesh(mesh.userData.cullingClone);
        mesh.userData.cullingClone = null;
  
        disposeMesh(mesh.userData.cullingCloneP);
        mesh.userData.cullingCloneP = null;
  
        disposeMesh(mesh.userData.cullingCloneN);
        mesh.userData.cullingCloneN = null;
  
        if (mesh.userData?.clippedIndexGeometry != null){
            mesh.userData.clippedIndexGeometry = null;
        }

        if (mesh.userData?.origIndexBuffer != null){
            mesh.userData.origIndexBuffer = null;
        }
    }
}

export const CullHiddenFaces = async(meshes) => {
    if (meshes == null){
        console.warn("Null parameter for meshes was provided. Skipping mesh culling.");
        return;
    }
    if(!Array.isArray(meshes)){
        console.warn("No valid mesh array was provided. Skipping mesh culling.");
        return;
    }
    if (meshes.length == 0){
        console.warn("No mesh array with elements was provided. Skipping mesh culling.");
        return;
    }
    // make a 2 dimensional array that will hold the layers
    const meshData = [];
    
    mainScene = meshes[0].parent;
    
    if (mainScene.lines != null){
        mainScene.lines.forEach(line => {
            line.visible = false;
        });
        mainScene.lines.length = 0;
    }

    // make sure to place them in the correct array group based on their culling layer
    meshes.forEach(mesh => {
        if (mesh.userData.cullLayer != null){
            //save original data if it hasnt been previously saved
            if (mesh.userData.origIndexBuffer == null)
                mesh.userData.origIndexBuffer = mesh.geometry.index.clone();
        
            // if it hasnt been previously created an array in this index value, create it
            if (meshData[mesh.userData.cullLayer] == null){
            meshData[mesh.userData.cullLayer] = {origMeshes:[], cloneMeshes:[], posMeshes:[], negMeshes:[], scaleMeshes:[], positionMeshes:[]}
            }        
            
            if (mesh.userData.cullingClone == null){
                mesh.userData.cullingClone = createCloneCullMesh(mesh);
                mesh.userData.cullingCloneP = mesh.userData.cullingClone.clone();
                mesh.userData.cullingCloneN = mesh.userData.cullingClone.clone();
            }

            // clone the mesh to only detect collisions in front faces
            const clone = mesh.userData.cullingClone;
            const cloneP = mesh.userData.cullingCloneP;
            const cloneN = mesh.userData.cullingCloneN

            cloneP.material = frontMat;
            cloneN.userData.cancelMesh = cloneP;
            cloneN.material = backMat;
            cloneP.userData.maxCullDistance  = cloneN.userData.maxCullDistance = mesh.userData.maxCullDistance;
            
            meshData[mesh.userData.cullLayer].origMeshes.push(mesh)
            meshData[mesh.userData.cullLayer].cloneMeshes.push(clone)
            meshData[mesh.userData.cullLayer].posMeshes.push(cloneP)
            meshData[mesh.userData.cullLayer].negMeshes.push(cloneN)
            
            // reset to original before doing raycasts, modified geom has issues with raycasts
            mesh.geometry.setIndex(mesh.userData.origIndexBuffer);
        }
    });
    // remove empty index spaces
    for (let i = meshData.length - 1; i >= 0; i--) {
        if (meshData[i] == null){
            meshData.splice(i, 1)
            //origMesh.splice(i,1)
        }
    }
    // this array will hold all possible mesh colliders
    let hitArr = [];
    // store in an array new indixes, chanbging them on the go, produces errors
    const geomsIndices = [];
    // go from top to bottom to increase array size of collide meshes
    // lowest layer should consider all meshes
    // top layer will always be visible (if theres only 1 lkayer (base layer), then it will be visible)
    for (let i = meshData.length - 1; i >= 0; i--) {
        if (hitArr.length != 0 || meshData.length >= 1){
            for (let k = 0; k < meshData[i].origMeshes.length; k++){
                
                const mesh = meshData[i].origMeshes[k];
                const cloneMesh = meshData[i].cloneMeshes[k];
                const index = mesh.userData.origIndexBuffer.array;
                const vertexData = cloneMesh.geometry.attributes.position.array;
                const normalsData = cloneMesh.geometry.attributes.normal.array;
                const faceNormals = cloneMesh.geometry.userData.faceNormals;
                geomsIndices.push({
                    geom: mesh.geometry,
                    index: getIndexBuffer(index,vertexData,normalsData, faceNormals, hitArr,mesh.userData.cullDistance/*,i === 0*/)
                })
            }
        }
        hitArr = [...hitArr, ...meshData[i].posMeshes, ...meshData[i].negMeshes]
        
    }

    geomsIndices.forEach(elem => {
        elem.geom.setIndex(elem.index)
    });
}

const getDistanceInOut = (distanceArr) => {
    let distIn = distance;
    let distOut = distanceAfter;

    // distance set by the user in an array form (ditance far, distance after)
    if (distanceArr){
        if (!isNaN(distanceArr)){   // is its a number
            distIn = distanceArr;
        }
        else{
            if (Array.isArray(distanceArr)){
                if (!isNaN(distanceArr[0])){
                    distIn = distanceArr[0];
                }
                if (!isNaN(distanceArr[1])){
                    distOut =  distanceArr[1];
                }
            }
        }
    }

    return [distIn, distOut]
}

const getIndexBuffer = (index, vertexData, normalsData, faceNormals, intersectModels, distanceArr, debug = false) =>{

    const indexCustomArr = [];
    const distArr = getDistanceInOut(distanceArr);
    
    let distIn = distArr[0];
    let distOut = distArr[1];

    raycaster.far = distIn + distOut;
    
    for (let i =0; i < index.length/3 ;i++){

        //set the direction of the raycast with the normals of the faces
        if (faceNormals)
            direction.set(faceNormals[i].x,faceNormals[i].y,faceNormals[i].z).normalize();

        const idxBase = i * 3;
        //if at least 1 vertex collides with nothing, it is visible
        let intersectedDups = [];
        for (let j = 0; j < 3 ; j++){
            // reset intersections
            intersections.length = 0;

            // mutliplied by 3 as it refers to a vector3 saved as a float array
            const vi = index[idxBase+j] * 3;

            // if face normals was not defined, use vertex normals instead
            if (faceNormals == null)
                direction.set(normalsData[vi],normalsData[vi+1],normalsData[vi+2]).normalize();

            // move the origin away to have the raycast being casted from outside
            origin.set( 
                vertexData[vi], 
                vertexData[vi+1],
                vertexData[vi+2])
                .add(direction.clone().multiplyScalar(distIn))
            
            //invert the direction of the raycaster as we moved it away from its origin
            raycaster.set( origin, direction.clone().multiplyScalar(-1));

            // main model is ignored, if it hits with something it means base mesh is behind a mesh
            const hitObjs = raycaster.intersectObjects( intersectModels, false, intersections )
            // remove if value is higher than the max hit distance
            for (let k = hitObjs.length - 1; k >= 0;k--){
                if ((distIn - hitObjs[k].distance) >= hitObjs[k].object.userData.maxCullDistance){
                    hitObjs.splice(k,1)
                }
            }
            // remove hit objects whose distance is further
            
            if (hitObjs.length === 0){
                // no object is interfering with the view of this vertex, so its visible
                //if (debug) DebugRay(origin, direction.clone().multiplyScalar(-1) , raycaster.far, 0xffff00,mainScene );
                for (let k = 0; k < 3 ; k++){
                    indexCustomArr.push(index[idxBase+k])
                }
                break;
            }
            else{
                /*
                Double cullig section:
                2 meshes were created for the raycast, 1 material is facing front and the other back
                if the raycast hits the mesh with the back face, it will hits with front face
                this way we make sure only elements that are truly behind a single face geometry are hidden
                */
                const invHits = hitObjs.map(v => v.object)
                
                // using for to update the modify and update the array
                for (let i =0; i < invHits.length;i++){
                    const o = invHits[i]
                    // check if the element has not been removed yet
                    if (o != null){
                        if (o.userData.cancelMesh){
                            const index = invHits.indexOf(o.userData.cancelMesh)
                            invHits[i] = null;
                            if (index != -1 && index < i){  //only remove previous hit elements
                                invHits[index] = null;
                            }

                        }
                    }
                }

                if (invHits.filter(n=>n).length === 0){
                    for (let k = 0; k < 3 ; k++){
                        indexCustomArr.push(index[idxBase+k])
                    }
                    break;
                }
                
                /*
                Ignore when different meshes are hiding the mesh below
                this to avoids for example: when a shirt model, is close to a pants model
                but there is a small gap between them, not doing the code below, it would
                remove the face and make an undesired a hole in the base mesh
                */
                if (j === 0){ 
                    // save the initial hits
                    intersectedDups = hitObjs.map(v => v.object)
                    
                }
                else{ 
                    // only store repeated hits
                    intersectedDups = hitObjs.map(v => {
                        if (intersectedDups.indexOf(v.object) !== -1){
                            return v.object;
                        }
                    })
                    intersectedDups = intersectedDups.filter(n=>n);

                    // check only hits that repeated across
                    if (j === 2){
                        if (intersectedDups.filter(n=>n).length === 0){
                            for (let k = 0; k < 3 ; k++){
                                indexCustomArr.push(index[idxBase+k])
                            }
                        }
                    }
                }
                if (debug)
                    DebugRay(origin, direction.clone().multiplyScalar(-1) , raycaster.far, 0xff0000,mainScene );
            }
        }
    }

    const indexArr = new Uint32Array(indexCustomArr);
    return new BufferAttribute(indexArr,1,false);
}

export const DisplayMeshIfVisible = async(mesh, traitModel) => {

    if (mesh.userData.origIndexBuffer == null)
        mesh.userData.origIndexBuffer = mesh.geometry.index.clone();

    const traitMeshes = [];
    
    traitModel?.traverse((child)=>{
        if (child.isMesh){
            traitMeshes.push(child);
        }
    });

    const raycaster = new Raycaster();
    raycaster.firstHitOnly = true;
    
    raycaster.far = 0.035;

    const index = mesh.userData.origIndexBuffer.array;
    const vertexData = mesh.geometry.attributes.position.array;
    const normalsData = mesh.geometry.attributes.normal.array;

    let origin = new Vector3();
    let direction = new Vector3();
    
    const intersections = [];
    
    const indexCustomArr = [];
    for (let i =0; i < index.length;i+=3){

        //if at least 1 vertex collides with nothing, it is vi9sible
        for (let j = 0; j < 3 ; j++){

            intersections.length = 0;
            // mutliplied by 3 as it refers to a vector3 saved as a float array
            const vi = index[i+j] * 3;

            direction.set(normalsData[vi],normalsData[vi+1],normalsData[vi+2]).normalize();
            origin.set(vertexData[vi],vertexData[vi+1],vertexData[vi+2]).add(direction.clone().multiplyScalar(0.03))
            
            raycaster.set(origin,direction.multiplyScalar(-1));

            if (raycaster.intersectObjects( traitMeshes, false, intersections ).length === 0){
                
                //DebugRay(origin, direction,raycaster.far, 0xff0000,mesh );
                for (let k = 0; k < 3 ; k++){
                    indexCustomArr.push(index[i+k])
                }
                break;
            }
        }
    }

    const indexArr = new Uint32Array(indexCustomArr);
    const buffer = new BufferAttribute(indexArr,1,false);

    mesh.geometry.setIndex(buffer);
}

function DebugRay(origin, direction, length, color, scene){
    if (scene.lines == null)
        scene.lines = [];

    let endPoint = new Vector3();
    endPoint.addVectors ( origin, direction.clone().multiplyScalar( length ) );

    const points = []
    points.push( origin );
    points.push( endPoint );
    const geometry = new BufferGeometry().setFromPoints( points );

    const cols = [];
    cols.push(new Color(0x000000));
    cols.push(new Color(0xffffff)); 

    let material = new LineBasicMaterial( {color:color } );
    var line = new Line( geometry, material );

    line.renderOrder = 100;
    scene.add( line );
    scene.lines.push(line);
}