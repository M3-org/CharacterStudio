import * as THREE from 'three';
import CSM from 'three-custom-shader-material/vanilla'

export class LayeredMaterial extends CSM {
    static MAX_LAYERS = 5;
    baseTexture: THREE.Texture | null;
    constructor(public sourceMaterial: THREE.MeshStandardMaterial, layers: THREE.Texture[] = []) {
        const baseTexture = sourceMaterial.map;
        const uniforms = {
            baseTexture: { type: "t", value: baseTexture },
            layers: { value: layers },
            layerCount: { value: layers.length }
        };
        const vertexShader = `
            varying vec2 vUv;
            void main() {
                vUv = uv;
            }
        `;

        const fragmentShader = `
            uniform sampler2D baseTexture;
            uniform sampler2D layers[${LayeredMaterial.MAX_LAYERS}];
            uniform int layerCount;
            varying vec2 vUv;
            void main() {
                vec4 baseColor = texture2D(baseTexture, vUv);
                vec4 layerColor;
                if(layerCount == 0) {
                    csm_DiffuseColor = baseColor;
                }else{
                    for (int i = 0; i < layerCount; i++) {
                        switch ( i ) 
                        {
                            case 0:
                                layerColor = texture2D(layers[0], vUv);
                                break;
                            case 1:
                                layerColor = texture2D(layers[1], vUv);
                                break;
                            case 2:
                                layerColor = texture2D(layers[2], vUv);
                                break;
                            case 3:
                                layerColor = texture2D(layers[3], vUv);
                                break;
                            case 4:
                                layerColor = texture2D(layers[4], vUv);
                                break;
                            // case 5:
                            //     layerColor = texture2D(layers[5], vUv);
                            //     break;
                            // case 6:
                            //     layerColor = texture2D(layers[6], vUv);
                            //     break;
                            // case 7:
                            //     layerColor = texture2D(layers[7], vUv);
                            //     break;
                            // case 8:
                            //     layerColor = texture2D(layers[8], vUv);
                            //     break;
                            // case 9:
                            //     layerColor = texture2D(layers[9], vUv);
                            //     break;
                            default:
                                layerColor = texture2D(layers[0], vUv);
                                break;
                        };
                        
                        baseColor = mix(baseColor, layerColor, layerColor.a); // Simple alpha blending
                    }
                    
                    csm_DiffuseColor = baseColor;
                }
 
            }
        `;

        super({
            baseMaterial: THREE.MeshStandardMaterial,
            uniforms: uniforms,
            ...sourceMaterial,
            map: baseTexture,
            vertexShader: vertexShader,
            fragmentShader: fragmentShader
        });
        this.baseTexture = baseTexture;
        this.dummyTexture.name = 'dummyTexture'; // Set a name for the dummy texture
    }
    
    get layers(): THREE.Texture[] {
        return this.uniforms.layers.value;
    }

    replaceLayer(index: number, texture: THREE.Texture) {
        this.uniforms.layers.value[index] = texture;
        this.needsUpdate = true;
    }
    private dummyTexture = new THREE.Texture(); // A dummy texture as a placeholder
    
    private getLastAvailableIndex(): number {
        for (let i = 0; i < LayeredMaterial.MAX_LAYERS; i++) {
            if (this.layers[i] === this.dummyTexture || this.layers[i] === undefined) {
                return i;
            }
        }
        return -1; // No available index
    }

    addLayer(texture: THREE.Texture,order?: number ) {
        if(!texture) {
            throw new Error("Texture cannot be null or undefined");
        }
        if(this.layers.length >= LayeredMaterial.MAX_LAYERS) {
            throw new Error("Cannot add more than 5 layers");
        }
        /**
         * @TODO: Commented because there was an issue where this is still a bit broken, especially when switching base texture.
         */
        // if(order !== undefined && order < LayeredMaterial.MAX_LAYERS) {
        //     // need to move the texture to the specified order
            
        //     const currentOverlay = this.layers[order];
        //     let lastAvailableIndex = this.getLastAvailableIndex();

        //     this.replaceLayer(order, texture);
        //     if(lastAvailableIndex === order){
        //         /**
        //          * we're replacing the same available index; replaceLayer already calls "update", so we can return safely
        //          */
        //         return
        //     }

        //     if(currentOverlay !== undefined && currentOverlay !== this.dummyTexture) {
        //         /**
        //          * CurrentOverlay is present and not the dummy texture
        //          */
        //         if(lastAvailableIndex !== -1) {
        //             /**
        //              * If we have a last available index, we can replace it with the current overlay
        //              */
        //             this.replaceLayer(lastAvailableIndex, currentOverlay);
        //         }
        //     }

        //     this.uniforms.layerCount.value++;
        //     this.needsUpdate = true;
        //     // console.log( this.uniforms.layerCount.value,this.layers)
        //     return
        // }


        for(let i = 0; i < this.layers.length; i++) {
            if(this.layers[i] === this.dummyTexture) {
                this.replaceLayer(i, texture);
                return;
            }
        }
        // Else add the texture to the end
        this.uniforms.layers.value.push(texture);
        this.uniforms.layerCount.value++;
        this.needsUpdate = true;

    }

    removeLayer(index: number) {
        this.replaceLayer(index, this.dummyTexture);
        this.needsUpdate = true;
    }

    clearLayers() {
        for (let i = 0; i < this.layers.length; i++) {
            this.removeLayer(i);
        }
    }
}