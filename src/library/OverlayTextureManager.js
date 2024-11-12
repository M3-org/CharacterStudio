
/** @typedef {import("@pixiv/three-vrm").VRM} VRM */
import * as THREE from "three";
/** @typedef {import("./CharacterManifestData").TraitModelsGroup} TraitModelsGroup */
/** @typedef {import("./characterManager").CharacterManager} CharacterManager */
import { combineURLs } from "./load-utils";
import { createContext, getAsArray } from "./utils";
import TextureImageDataRenderer from "./textureImageDataRenderer";

/**
 * Implementation of a Decal-like system.
 * Will overlay textures on top of the base texture of a VRM mesh and through a renderer will bake the textures into a single texture.
 * When textures are added or removed, the renderer will update the texture on the VRM mesh.
 * 
 * Not the best implementation, but it works.
 */
export default class OverlayedTextureManager{
    /**
     * @type {THREE.SkinnedMesh<THREE.BufferGeometry, THREE.MeshStandardMaterial>[]}
     */
    targetVRMMeshes = [];
    /**
     * The base texture of the VRM mesh
     * @type {THREE.Texture|null}
     */
    baseTexture = null;
    /**
     * @type {THREE.Texture[]}
     */
    textures = [];
    /**
     * @type {Map<string, THREE.Texture>}
     */
    applied = new Map();
    /**
     * @type {TextureImageDataRenderer}
     */
    imageDataRenderer;
    /**
     * 
     * @param {CharacterManager} characterManager 
     */
    constructor(characterManager){
        this.characterManager = characterManager;
        // create a renderer to render the textures; size is arbitrary (replaced later)
        this.imageDataRenderer = new TextureImageDataRenderer(512, 512);
    }

    get scene(){
        return this.characterManager.parentModel
    }

    get manifest(){
        return this.characterManager.manifestData;
    }

    /**
     * Make sure the target material has a diffuse map
     */
    get targetMaterial(){
        if(!this.targetVRMMeshes.length){
            throw new Error("No target meshes found, call setTargetVRM");
        }

        let mats = this.targetVRMMeshes.map(mesh=>getAsArray(mesh.material)).flat();
        let mat = mats[0]
        if(!mat.map){
            for(let i = 1; i < mats.length; i++){
                if(!mats[i].map){
                    continue;
                }else{
                    mat = mats[i];
                    break;
                }
            }
            return mat
        }else{
            return mat;
        }

    }

    /**
     * @param {VRM} targetVRM - the VRM to apply the overlay textures to
     * @param {string[]} [decalMeshNameTargets] - [optional] a list of mesh names to target for decal application; if not provided, all skinned meshes will be targeted
     */
    setTargetVRM(targetVRM, decalMeshNameTargets){
        this.targetVRMMeshes = [];
        targetVRM.scene.traverse((child)=>{
            if (child instanceof THREE.SkinnedMesh){
                if(decalMeshNameTargets && decalMeshNameTargets.length){
                    // if we've defined a list of mesh names to target, only add those meshes
                    if(decalMeshNameTargets.includes(child.name)){
                        this.targetVRMMeshes.push(child);
                    }
                }else{
                    this.targetVRMMeshes.push(child);
                }
            }
        })
    }

    async update(){
        const mat = this.targetMaterial
        const image = mat.map.image
        const width = image.width;
        const height = image.height;
        // clear imageDataRenderer
        this.imageDataRenderer.clearRenderer();
        this.imageDataRenderer.width = width;
        this.imageDataRenderer.height = height;

        // render the textures through the imageDataRenderer
        const imgData= this.imageDataRenderer.render(this.textures, mat.color || new THREE.Color(1, 1, 1), new THREE.Color(1, 1, 1), true, true);
        if(!imgData){
            console.error("Failed to update OverlayTextureManager, ImageData is undefined");
        }
        const context = createContext({width,height,transparent:true})

        const bitmap = await createImageBitmap(imgData)
        context.drawImage(bitmap,0,0)
        const texture = new THREE.Texture(context.canvas)
        texture.colorSpace = THREE.SRGBColorSpace;
        // flip the texture
        texture.flipY = false;
        texture.needsUpdate = true;

        // update the material
        this.targetMaterial.map = texture
    }

    /**
     * Add an overlay texture to the VRM mesh
     * @param {TraitModelsGroup} traitGroup trait group to load the decal from
     * @param {string} decalId decal ID to load
     * @returns 
     */
    async loadOverlayTexture(traitGroup,decalId){
        const textureLoader = new THREE.TextureLoader();
        const decal = traitGroup.decals.find(decal=>decal.id === decalId);
        if(!decal) {
            throw new Error("Decal "+decalId+" not found in trait group");
        }
        if(this.targetVRMMeshes.length === 0){
            throw new Error("No target meshes found");
        }
        const diffusePath = decal.diffuse;
        if(!diffusePath) {
            throw new Error("Decal not found in trait group");
        }

        const diffuseFullPath = combineURLs(this.manifest.getDecalsDirectory(),diffusePath);
        const decalDiffuse = await textureLoader.loadAsync( diffuseFullPath );

        decalDiffuse.colorSpace = THREE.SRGBColorSpace;
        decalDiffuse.flipY = false;
        if(!this.textures.length){
            this.textures.push(this.targetMaterial.map.clone());
        }
        this.textures.push(decalDiffuse);
        this.applied.set(decalId,decalDiffuse);

        return this.update();
    }

    /**
     * @param {string} decalId 
     * @returns 
     */
    removeOverlayTexture( decalId ){
        if(this.applied.has(decalId)){
            const text = this.applied.get(decalId);
            if(!text) {
                this.applied.delete(decalId);
                return Promise.resolve();
            }
            this.textures.splice(this.textures.indexOf(text),1);
            this.applied.delete(decalId);
        }
        return this.update()
    }


    removeAllOverlayedTextures(){
        this.textures = [this.textures[0]];
        this.applied.clear();
        this.update();
    }
}