import * as THREE from "three";
import { VRM } from "@pixiv/three-vrm";
import type { TraitModelsGroup } from "./CharacterManifestData";
import type { CharacterManager } from "./characterManager";
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
export default class OverlayedTextureManager {
    /**
     * The target VRM meshes to apply overlays to
     */
    targetVRMMeshes: THREE.SkinnedMesh<THREE.BufferGeometry, THREE.MeshStandardMaterial>[] = [];
    
    /**
     * The base texture of the VRM mesh
     */
    baseTexture: THREE.Texture | null = null;
    
    /**
     * Array of textures to be overlayed
     */
    textures: THREE.Texture[] = [];
    
    /**
     * Map of applied textures by their ID
     */
    applied: Map<string, THREE.Texture> = new Map();
    
    /**
     * The image data renderer for combining textures
     */
    imageDataRenderer: TextureImageDataRenderer;
    
    /**
     * Reference to the character manager
     */
    characterManager: CharacterManager;
    
    /**
     * Creates a new OverlayedTextureManager instance
     * @param characterManager - The character manager instance
     */
    constructor(characterManager: CharacterManager) {
        this.characterManager = characterManager;
        // create a renderer to render the textures; size is arbitrary (replaced later)
        this.imageDataRenderer = new TextureImageDataRenderer(512, 512);
    }

    get scene(): THREE.Object3D | null {
        return this.characterManager.parentModel;
    }

    get manifest() {
        return this.characterManager.manifestData;
    }

    /**
     * Make sure the target material has a diffuse map
     */
    get targetMaterial(): THREE.MeshStandardMaterial {
        if (!this.targetVRMMeshes.length) {
            throw new Error("No target meshes found, call setTargetVRM");
        }

        const mats = this.targetVRMMeshes.map(mesh => getAsArray(mesh.material)).flat();
        let mat = mats[0];
        
        if (!mat.map) {
            for (let i = 1; i < mats.length; i++) {
                if (!mats[i].map) {
                    continue;
                } else {
                    mat = mats[i];
                    break;
                }
            }
            return mat;
        } else {
            return mat;
        }
    }

    /**
     * Sets the target VRM for overlay application
     * @param targetVRM - the VRM to apply the overlay textures to
     * @param decalMeshNameTargets - [optional] a list of mesh names to target for decal application; if not provided, all skinned meshes will be targeted
     */
    setTargetVRM(targetVRM: VRM, decalMeshNameTargets?: string[]): void {
        this.targetVRMMeshes = [];
        targetVRM.scene.traverse((child) => {
            if (child instanceof THREE.SkinnedMesh) {
                if (decalMeshNameTargets && decalMeshNameTargets.length) {
                    // if we've defined a list of mesh names to target, only add those meshes
                    if (decalMeshNameTargets.includes(child.name)) {
                        this.targetVRMMeshes.push(child);
                    }
                } else {
                    this.targetVRMMeshes.push(child);
                }
            }
        });
    }

    /**
     * Updates the overlayed texture by rendering all textures together
     */
    async update(): Promise<void> {
        const mat = this.targetMaterial;
        const image = mat.map?.image;
        
        if (!image) {
            throw new Error("Target material does not have a valid map image");
        }
        
        const width = image.width;
        const height = image.height;
        
        // clear imageDataRenderer
        this.imageDataRenderer.clearRenderer();
        this.imageDataRenderer.width = width;
        this.imageDataRenderer.height = height;

        // render the textures through the imageDataRenderer
        const imgData = this.imageDataRenderer.render(
            this.textures, 
            mat.color || new THREE.Color(1, 1, 1), 
            new THREE.Color(1, 1, 1), 
            true, 
            true
        );
        
        if (!imgData) {
            console.error("Failed to update OverlayTextureManager, ImageData is undefined");
            return;
        }
        
        const context = createContext({ width, height, transparent: true });
        const bitmap = await createImageBitmap(imgData);
        context.drawImage(bitmap, 0, 0);
        
        const texture = new THREE.Texture(context.canvas);
        texture.colorSpace = THREE.SRGBColorSpace;
        // flip the texture
        texture.flipY = false;
        texture.needsUpdate = true;

        // update the material
        this.targetMaterial.map = texture;
    }

    /**
     * Add an overlay texture to the VRM mesh
     * @param traitGroup - trait group to load the decal from
     * @param decalId - decal ID to load
     */
    async loadOverlayTexture(traitGroup: TraitModelsGroup, decalId: string): Promise<void> {
        const textureLoader = new THREE.TextureLoader();
        const decal = traitGroup.getAllDecals().find(decal => decal.id === decalId);
        
        if (!decal) {
            throw new Error("Decal " + decalId + " not found in trait group");
        }
        
        if (this.targetVRMMeshes.length === 0) {
            throw new Error("No target meshes found");
        }
        
        const diffusePath = decal.directory;
        if (!diffusePath) {
            throw new Error("Decal not found in trait group");
        }

        const diffuseFullPath = combineURLs(this.manifest.getTraitsDirectory(), diffusePath);
        const decalDiffuse = await textureLoader.loadAsync(diffuseFullPath);

        decalDiffuse.colorSpace = THREE.SRGBColorSpace;
        decalDiffuse.flipY = false;
        
        if (!this.textures.length) {
            const baseMap = this.targetMaterial.map;
            if (baseMap) {
                this.textures.push(baseMap.clone());
            }
        }
        
        this.textures.push(decalDiffuse);
        this.applied.set(decalId, decalDiffuse);

        return this.update();
    }

    /**
     * Removes an overlay texture by its ID
     * @param decalId - The ID of the decal to remove
     */
    removeOverlayTexture(decalId: string): Promise<void> {
        if (this.applied.has(decalId)) {
            const text = this.applied.get(decalId);
            if (!text) {
                this.applied.delete(decalId);
                return Promise.resolve();
            }
            
            const index = this.textures.indexOf(text);
            if (index > -1) {
                this.textures.splice(index, 1);
            }
            this.applied.delete(decalId);
        }
        return this.update();
    }

    /**
     * Removes all overlayed textures, keeping only the base texture
     */
    removeAllOverlayedTextures(): void {
        this.textures = this.textures.length > 0 ? [this.textures[0]] : [];
        this.applied.clear();
        this.update();
    }
}