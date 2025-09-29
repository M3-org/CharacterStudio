import { getAsArray } from "./utils";
import { ManifestRestrictions, TraitRestriction } from "./manifestRestrictions";
import { WalletCollections } from "./walletCollections";
import { VRMMeta } from "@pixiv/three-vrm";
import { Color } from "three";


export type colorCollectionItem = {
  name:string,
  id:string,
  value:string[]
  locked?:boolean
}

export type colorCollection = {
  trait:string,
  collection:colorCollectionItem[]
}
export type OnActiveProps = {
	texture?:{
	  collectionId:string,
	  textureId:string
	},
	blendshape?:{
		targetTrait:string
		blendshapeID:string
	}
}


export type BlendShapeTraitData ={
  blendshapeId:string,
  id:string,
  name:string,
  fullThumbnail?:string
  unique?:boolean
  onActive?:OnActiveProps
}

export type BlendShapeGroupModelTraitData = {
  trait:string,
  name:string,
  copyTo?:{[trait:string]:string[]},
  cameraTarget?:{
    distance:number,
    height:number
  },
  collection:BlendShapeTraitData[]
}
export type ModelTraitData = {
  id:string,
  name:string,
  directory:string,
  highPoly:string,
  thumbnail:string,
  meshTargets:string[],
  /**
   * The name of the mesh that will be used for layered textures Manager
   */
  decalMeshNameTargets:string[],
  blendshapeTraits?:BlendShapeGroupModelTraitData[]
  cullingIgnore:string[],
  textureCollection:string
  decalCollection:string,
  isEmptyAsset?:boolean
  thumbnailOverrides:string[]
  cullingDistance?: number[]
  cullingLayer?:number,
  maxCullingDistance?:number,
  /**
   * Item specific restrictions; if the trait item is present, the item will be restricted
   */
  restrictedItems?:string[]
  type?:string,
  colorCollection:string,
  fullThumbnail:string|string[],
  fullDirectory?:string|string[]
  onActive?:OnActiveProps

  locked?:boolean
  price?:number
  purchasable?:boolean
}

export type ModelTraitCollectionData = {
  trait:string,
  name:string,
  icon:string,
  iconSvg:string,
  type:string,
  iconGradient:string,
  cullingLayer:number,
  cullingDistance:number[],
  nudgeHips:boolean,
  cameraTarget:{
    distance:number,
    height:number
  },
  required:boolean,
  collection:ModelTraitData[]

  locked?:boolean,
  price?:number,
  purchasable?:boolean,
}

export type DownloadOptionsManifest = {
  vrmMeta:Partial<VRMMeta>,
  scale:number,
  mergeAppliedMorphs?:boolean,
  mToonAtlasSize:number,
  mToonAtlasSizeTransp:number,
  stdAtlasSize:number,
  createTextureAtlas:boolean,
  optimized?:boolean,
  stdAtlasSizeTransp:number,
  exportStdAtlas:boolean,
  exportMtoonAtlas:boolean,
  screenshotFaceDistance:number,
  screenshotFaceOffset:number[],
  screenshotResolution:number[],
  screenshotBackground:number[],
  screenshotFOV:number
  isVrm0?:boolean
  ktxCompression?:boolean
  
  screenshot?:{image:any}
  includeNonTexturedMeshesInAtlas?:boolean,
  outputVRM0?:boolean
  vrmName?:string
  twoSidedMaterial?:boolean
  transparentColor?:Color
}

export type manifestJson = {
  assetsLocation:string;
  traitsDirectory:string;
  textureDirectory?:string;
  decalTextureDirectory?:string;
  thumbnailsDirectory:string;
  traitIconsDirectorySvg:string;
  animationPath:string[];
  displayScale:number;
  exportScale?:number;
  requiredTraits:string[];
  randomTraits:string[];
  initialTraits:string[];
  colliderTraits:string[];
  lipSyncTraits:string[];
  blinkerTraits:string[];
  traitRestrictions:Record<string,{
      restrictedTraits:string[],
      restrictedTypes:string[],
      restrictedBlendshapes:string[]
  }>,
  defaultCullingLayer:number;
  defaultCullingDistance:number[];
  offset:number[];
  vrmMeta:Record<string,any>;
  traits:ModelTraitCollectionData[];
  textureCollections:TextureCollection[];
  decalCollections:TextureCollection[];
  colorCollections:colorCollection[];
  canDownload:boolean;
  downloadOptions?:DownloadOptionsManifest

  chainName?:string;
  collectionLockID?:string
  dataSource?:any;
  solanaPurchaseAssets?:any
  price?:number
  currency?:string
  purchasable?:boolean
  locked?:boolean
}
export type TextureCollectionItem = {
  id:string,
  name:string,
  directory:string,
  fullDirectory?:string,
  thumbnail:string
  locked?:boolean
}

export type TextureCollection = {
  trait:string,
  visible?:boolean
  type: "texture"
	colorCollections?: string|string[]
  collection:TextureCollectionItem[]
}
export type DecalCollection = {
  trait:string,
  type: "texture"
  colorCollections?: string|string[]
  canBeStacked?:boolean
  collection:TextureCollectionItem[]
}

export type LoraJsonDescription={
  "name": string,
  "description": string,
  "manifest":string,
  "icon": string
}
export type ClassCharacterJson = {
  name:string,
  description:string,
  portrait?: string,
  baseUrl?: string,
  loras?: string,
  manifest:string,
  manifestAppend?:Array<ClassCharacterJson>,
  icon?: string,
  disabled?: boolean,
  format?: "vrm"
}

export type GlobalManifestJson = {
  characters:ClassCharacterJson[]
  loras:LoraJsonDescription[]
  defaultAnimations?:{
      "name": string,
      "description"?:string
      "location":string
      "icon"?: string
    }[],
  sprites:{ 
    "name": string,
    "description"?: string
    "manifest": string
    "icon"?: string
  }[]
}
/**
 * Main class for managing character manifest data and traits
 * @class CharacterManifestData
 */
export class CharacterManifestData{

    static polyMode:'low' | 'mid' = 'low'

    // From manifest
    assetsLocation:string;
    traitsDirectory:string;
    textureDirectory?:string;
    decalTextureDirectory?:string;
    thumbnailsDirectory:string;
    traitIconsDirectorySvg:string;
    animationPath:string[];
    displayScale:number;
    requiredTraits:string[];
    randomTraits:string[];
    initialTraits:string[];
    colliderTraits:string[];
    lipSyncTraits:string[];
    blinkerTraits:string[];
    traitRestrictions:manifestJson['traitRestrictions']
    defaultCullingLayer:number;
    defaultCullingDistance:number[]
    offset:number[];
    vrmMeta:Record<string,any> ={};
    traits:ModelTraitCollectionData[] = [];
    canDownload:boolean;
    downloadOptions:Partial<DownloadOptionsManifest>;


    walletCollections:WalletCollections;

    // processed
    /**
     * list of Group trait IDs
     */
    allTraits:string[];
    textureTraits:TraitTexturesGroup[];
    textureTraitsMap:Map<string,TraitTexturesGroup> = new Map();

    colorTraits:TraitColorsGroup[];
    colorTraitsMap:Map<string,TraitColorsGroup> = new Map();

    decalTraits:DecalTextureGroup[];
    decalTraitsMap:Map<string,DecalTextureGroup> = new Map();

    modelTraits:TraitModelsGroup[] = [];
    modelTraitsMap:Map<string,TraitModelsGroup> = new Map();
    manifestRestrictions:ManifestRestrictions;

    /**
     * Blockchain stuff
     */
    collectionID?:string;
    chainName?:"ethereum"|"polygon"|"solana" = "solana";
    collectionLockID?:string
    dataSource?:any;
    solanaPurchaseAssets?:any
    price:number = 0
    currency?:string
    purchasable?:boolean
    locked?:boolean

    /**
     * Creates a new CharacterManifestData instance
     * @param {Object} manifest - The manifest data object
     * @param {string} collectionID - The collection identifier
     */
    constructor(manifest:manifestJson, collectionID?:string){
      const {
        chainName,
        collectionLockID,
        dataSource,
        solanaPurchaseAssets,
        price,
        currency,
        purchasable,
        locked,

        assetsLocation,
        traitsDirectory,
        thumbnailsDirectory,
        traitIconsDirectorySvg,
        animationPath,
        exportScale,
        displayScale,
        initialTraits,
        requiredTraits,
        randomTraits,
        colliderTraits,
        lipSyncTraits,
        blinkerTraits,
        traitRestrictions,
        defaultCullingLayer,
        defaultCullingDistance,
        offset,
        vrmMeta,
        traits,
        textureCollections,
        decalCollections,
        colorCollections,
        canDownload = true,
        downloadOptions ={} as DownloadOptionsManifest
      }= manifest;

      this.collectionID = collectionID;
      // chainName:c.chainName || "ethereum",
      // dataSource:c.dataSource || "attributes"
      this.walletCollections = new WalletCollections();
      

      this.chainName = chainName as "ethereum"|"polygon"|"solana";
      this.dataSource = dataSource;
      this.collectionLockID = collectionLockID;
      this.solanaPurchaseAssets = createSolanaPurchaseCNFT (solanaPurchaseAssets);
      if (locked == null){
        this.locked = (collectionLockID != null || this.solanaPurchaseAssets != null);
      }
      else{
        this.locked = locked;
      }

      console.log(this.solanaPurchaseAssets);

      this.price = price||0;
      this.currency = currency || "sol";
      this.purchasable = purchasable;

      this.assetsLocation = assetsLocation;
      this.traitsDirectory = traitsDirectory;
      this.thumbnailsDirectory = thumbnailsDirectory;
      this.traitIconsDirectorySvg = traitIconsDirectorySvg;
      this.displayScale = displayScale || exportScale || 1;
      this.animationPath = getAsArray(animationPath);
      
      this.requiredTraits = getAsArray(requiredTraits);
      this.randomTraits = getAsArray(randomTraits);
      this.initialTraits = initialTraits || [...new Set(this.requiredTraits.concat(this.randomTraits))];
      this.colliderTraits = getAsArray(colliderTraits);
      this.lipSyncTraits = getAsArray(lipSyncTraits);   
      this.blinkerTraits = getAsArray(blinkerTraits);   
      this.traitRestrictions = traitRestrictions;
      this.defaultCullingLayer = defaultCullingLayer
      this.defaultCullingDistance = defaultCullingDistance 
      this.offset = offset;
      this.canDownload = canDownload;
      this.downloadOptions = downloadOptions;

      const getAllTraitsGroupID = () => {
        const traitsGroupIDs = [];
        for (const prop in traits){
          traitsGroupIDs.push(traits[prop].trait);
        }
        return traitsGroupIDs;
      }
      this.allTraits = getAllTraitsGroupID();

      getAllTraitsGroupID();
      
      const defaultOptions = () =>{
        // Support Old configuration
        downloadOptions.vrmMeta = downloadOptions.vrmMeta || vrmMeta;
        downloadOptions.scale = downloadOptions.scale || exportScale || 1;
        // New Configturation
        downloadOptions.mToonAtlasSize = downloadOptions.mToonAtlasSize || 2048;
        downloadOptions.mToonAtlasSizeTransp = downloadOptions.mToonAtlasSizeTransp || 1024;
        downloadOptions.stdAtlasSize = downloadOptions.stdAtlasSize || 2048;
        downloadOptions.stdAtlasSizeTransp = downloadOptions.stdAtlasSizeTransp || 1024;
        downloadOptions.exportStdAtlas = downloadOptions.exportStdAtlas || false;
        downloadOptions.exportMtoonAtlas = downloadOptions.exportMtoonAtlas || true;
        downloadOptions.screenshotFaceDistance = downloadOptions.screenshotFaceDistance || 1;
        downloadOptions.screenshotFaceOffset = downloadOptions.screenshotFaceOffset || [0,0,0];
        downloadOptions.screenshotResolution = downloadOptions.screenshotResolution || [512,512];
        downloadOptions.screenshotBackground = downloadOptions.screenshotBackground || [0.1,0.1,0.1];
        downloadOptions.screenshotFOV = downloadOptions.screenshotFOV || 75;

        if (!downloadOptions.exportStdAtlas && !downloadOptions.exportMtoonAtlas){
          downloadOptions.exportMtoonAtlas = true;
        }
      }
      defaultOptions();

      this.manifestRestrictions = new ManifestRestrictions(this);

      // create texture and color traits first
      this.textureTraits = [];
      this.createTextureTraits(textureCollections, false);

      this.decalTraits = [];
      this.createDecalTraits(decalCollections);

      this.colorTraits = [];
      this.createColorTraits(colorCollections, false);

      this.modelTraits = [];
      this.createModelTraits(traits, false);
      this.manifestRestrictions._init()
      
      this.unlockPurchasedAssetsWithWallet();
      // if (this.solanaPurchaseAssets){
      //   this.walletCollections.getSolanaPurchasedAssets(this.solanaPurchaseAssets).then(owned=>{console.log("owned", owned)})
      // }
      //this.unlockWalletOwnedTraits();
    }

    /**
     * Gets the currency type
     * @returns {string} The currency type
     */
    getCurrency(){
      return this.currency;
    }

    /**
     * Gets Solana purchase assets
     * @returns {Object|null} Solana purchase assets or null if not available
     */
    getSolanaPurchaseAssets(){
      return this.solanaPurchaseAssets;
    }

    /**
     * Checks if NFT is locked
     * @returns {boolean} True if NFT is locked, false otherwise
     */
    isNFTLocked(){
      return this.locked;
    }

    /**
     * Unlocks purchased assets with wallet
     * @param {Object} [testWallet] - Optional test wallet object
     * @returns {Promise} Promise that resolves when assets are unlocked
     */
    unlockPurchasedAssetsWithWallet(testWallet?:string):Promise<void>{
      if (this.solanaPurchaseAssets == null){
        return Promise.resolve();
      }
      return new Promise((resolve)=>{
        this.walletCollections
          .getSolanaPurchasedAssets(this.solanaPurchaseAssets,testWallet)
          .then((userOwnedTraits:any) => {
            this.unlockTraits(userOwnedTraits)
            resolve()
          })
          .catch(err => {
            console.log(err);
            resolve();
          });
      }); 
    }

    /**
     * Unlocks NFT assets with wallet
     * @param {Object} [testWallet] - Optional test wallet object
     * @returns {Promise} Promise that resolves when assets are unlocked
     */
    unlockNFTAssetsWithWallet(testWallet?:string):Promise<void>{
      if (!this.collectionLockID){
        return Promise.resolve();
      }
      else{
        return new Promise((resolve)=>{
          this.walletCollections.getTraitsFromCollection(this.collectionLockID!, this.chainName, this.dataSource, testWallet)
          .then(userOwnedTraits=>{
            this.unlockTraits(userOwnedTraits)
            resolve();
          })
          .catch(err=>{
            resolve();
          })
        })
      }
    }

    /**
     * Unlocks wallet owned traits
     * @param {Object} [testWallet] - Optional test wallet object
     * @returns {Promise} Promise that resolves when traits are unlocked
     */
    unlockWalletOwnedTraits(testWallet?:string):Promise<void>{
      if (this.locked == false){
        console.log(`Already unlocked`);
        return Promise.resolve();
      }
      return new Promise((resolve) => {
        Promise.all([this.unlockNFTAssetsWithWallet(testWallet),this.unlockPurchasedAssetsWithWallet(testWallet)])
          .then(() => {
            console.log("fini")
            resolve();
          })
          .catch((err) => {
            console.log("Error:", err);
            resolve(); 
          });
      });
      
    }

    /**
     * Gets export options
     * @returns {Object} Export options
     */
    getExportOptions(){
      return this.downloadOptions;
    }

    /**
     * Gets group model traits
     * @returns {Array} Array of model traits
     */
    getGroupModelTraits(){
      return this.modelTraits;
    }

    /**
     * Gets initial traits
     * @returns {Array} Array of initial traits
     */
    getInitialTraits(){
      return this.getRandomTraits(this.initialTraits);
    }
    /**
     * Gets selection for all traits
     * @returns {Array} Array of all traits
     */
    getSelectionForAllTraits(){
      return this.getRandomTraits(this.allTraits);
    }

    /**
     * Gets trait option by ID
     * @param {string} optionID - The option ID
     * @returns {Object|null} Trait option or null if not found
     */
    getTraitOptionById(optionID:string){
      return this.getAllTraitOptions().find((option)=>option.id == optionID);
    }
    /**
     * Gets trait options by type
     * @param {string} type - The trait type
     * @returns {Array} Array of trait options
     */
    getTraitOptionsByType(type:string){
      return this.getAllTraitOptions().filter((option)=>option.type == type);
    }
    /**
     * Gets all trait options
     * @returns {Array} Array of all trait options
     */
    getAllTraitOptions(){
      return this.modelTraits.map((trait)=>trait?.getCollection()).flat();
    }
    getAllBlendShapeTraitGroups(){
      return this.modelTraits.map(traitGroup => traitGroup.getCollection()).flat().map((c)=>c.blendshapeTraits).flat().filter((c)=>!!c);
    }
    /**
     * Gets all blend shape traits
     * @returns {Array} Array of blend shape traits
     */
    getAllBlendShapeTraits(){
      return this.modelTraits.map(traitGroup => traitGroup.getCollection()).flat().map((c)=>c.blendshapeTraits).flat().map((c)=>c?.collection).flat().filter((c)=>!!c);
    }
    /**
     * Checks if collider is required for a trait group
     * @param {string} groupTraitID - The group trait ID
     * @returns {boolean} True if collider is required, false otherwise
     */
    isColliderRequired(groupTraitID:string){
      if (this.colliderTraits.indexOf(groupTraitID) != -1)
        return true;
      return false;
    }
    /**
     * Checks if a trait is a lip sync trait
     * @param {string} groupTraitID - The group trait ID
     * @returns {boolean} True if it's a lip sync trait, false otherwise
     */
    isLipsyncTrait(groupTraitID:string){
      if (this.lipSyncTraits.indexOf(groupTraitID) != -1)
        return true;
      return false;
    }

    /**
     * Gets NFT trait options from URL
     * @param {string} url - The URL to fetch from
     * @param {Array} [ignoreGroupTraits] - Optional array of group traits to ignore
     * @returns {Promise<Array>} Promise that resolves to array of NFT trait options
     */
    getNFTraitOptionsFromURL(url:string, ignoreGroupTraits:string[]=[]){
      return new Promise(async (resolve) => {
        try{
          const nftTraits = await this._fetchJson(url);
          resolve(this.getNFTraitOptionsFromObject(nftTraits, ignoreGroupTraits));
        }
        catch{
          console.log("unable to fetch from url:", url);
          resolve(null);
        }
      });
      
      
    }
    /**
     * Gets NFT trait options from object
     * @param {Object} object - The object containing NFT data
     * @param {Array} [ignoreGroupTraits] - Optional array of group traits to ignore
     * @returns {Array|null} Array of NFT trait options or null if invalid
     */
    getNFTraitOptionsFromObject(object:Record<string,any>, ignoreGroupTraits:string[]=[]){
      const attributes = object.attributes;
      if (attributes){
        ignoreGroupTraits =ignoreGroupTraits.length? getAsArray(ignoreGroupTraits):[];
        const selectedOptions:SelectedOption[] = []
        attributes.forEach((attribute:any) => {
          if (ignoreGroupTraits.indexOf(attribute.trait_type) == -1){
            const traitSelectedOption = this.getTraitOption(attribute.trait_type, attribute.value);
            if (traitSelectedOption)
              selectedOptions.push(traitSelectedOption)
          }
        });
        return selectedOptions;
      }
      else{
        console.warn("No attiributes parameter was found in ", object)
        return null;
      }
    }

    /**
     * Gets random traits
     * @param {Array} [optionalGroupTraitIDs] - Optional array of group trait IDs
     * @returns {Array} Array of random traits
     */
    getRandomTraits(optionalGroupTraitIDs?:string[]){
      const selectedOptions:SelectedOption[] = []
      const searchArray = optionalGroupTraitIDs || this.randomTraits;
      searchArray.forEach(groupTraitID => {
        const traitSelectedOption = this.getRandomTrait(groupTraitID);
        if (traitSelectedOption)
          selectedOptions.push(traitSelectedOption)
      });
      return selectedOptions;
    }

    /**
     * Gets a random trait for a group
     * @param {string} groupTraitID - The group trait ID
     * @returns {Object|null} Random trait or null if not found
     */
    getRandomTrait(groupTraitID:string){
      // set to SelectedOption
      const traitModelsGroup = this.getModelGroup(groupTraitID);
      if (traitModelsGroup){
        const trait =  traitModelsGroup.getRandomTrait();
        if (trait){
          const traitTexture = trait.targetTextureCollection?.getRandomTrait() || null;
          const traitColor = trait.targetColorCollection?.getRandomTrait() || null;
          return new SelectedOption(trait,traitTexture, traitColor);
        }
        else{
          return null;
        }
      }
      else{
        console.warn("No trait group with name " + groupTraitID + " was found.")
        return null;
      }
    }



    /**
     * Fetches JSON from a location
     * @param {string} location - The URL to fetch from
     * @returns {Promise<Object>} Promise that resolves to the JSON data
     * @private
     */
    async _fetchJson(location:string){
      const response = await fetch(location)
      const data = await response.json()
      return data
    }

    /**
     * Gets trait option for a group and trait
     * @param {string} groupTraitID - The group trait ID
     * @param {string} traitID - The trait ID
     * @returns {Object|null} Trait option or null if not found
     */
    getTraitOption(groupTraitID:string, traitID:string){
      const trait = this.getModelTrait(groupTraitID, traitID);
      if (trait){
        const traitTexture = trait.targetTextureCollection?.getRandomTrait()||null;
        const traitColor = trait.targetColorCollection?.getRandomTrait()||null;
        return new SelectedOption(trait,traitTexture, traitColor);
      }
      return null;
    }

    /**
     * Gets custom trait option
     * @param {string} groupTraitID - The group trait ID
     * @param {string} url - The custom URL
     * @returns {Object|null} Custom trait option or null if not found
     */
    getCustomTraitOption(groupTraitID:string, url:string){
      const trait = this.getCustomModelTrait(groupTraitID, url);
      if (trait){
        return new SelectedOption(trait,null,null);
      }
      return null;
    }

    /**
     * Gets custom model trait
     * @param {string} groupTraitID - The group trait ID
     * @param {string} url - The custom URL
     * @returns {Object|null} Custom model trait or null if not found
     */
    getCustomModelTrait(groupTraitID:string, url:string){
      return this.getModelGroup(groupTraitID)?.getCustomTrait(url);
    }

    // model traits
    /**
     * Gets model trait
     * @param {string} groupTraitID - The group trait ID
     * @param {string} traitID - The trait ID
     * @returns {Object|null} Model trait or null if not found
     */
    getModelTrait(groupTraitID:string, traitID:string){
      return this.getModelGroup(groupTraitID)?.getTrait(traitID);
    }
    /**
     * Gets model traits for a group
     * @param {string} groupTraitID - The group trait ID
     * @returns {Array|null} Array of model traits or null if not found
     */
    getModelTraits(groupTraitID:string){
      const modelGroup = this.getModelGroup(groupTraitID);
      if (modelGroup){
        return modelGroup.getCollection();
      }
      else{
        return null;
      }
    }
    /**
     * Unlocks traits for a user
     * @param {Object} userOwnedTraits - Object containing user owned traits
     */
    unlockTraits(userOwnedTraits:{
      ownedIDs?:string[],
      ownedTraits?:Record<string,string[]>
    }){
      const ownedIDs = userOwnedTraits.ownedIDs || [];
      const ownedTraits = userOwnedTraits.ownedTraits || {};

      if (ownedIDs.length > 0){
        this.textureTraits.forEach(groupTrait =>{
          groupTrait.unlockTraits(ownedIDs);
        })
        this.decalTraits.forEach(groupTrait =>{
          groupTrait.unlockTraits(ownedIDs);
        })
        this.colorTraits.forEach(groupTrait =>{
          groupTrait.unlockTraits(ownedIDs);
        })
        this.modelTraits.forEach(groupTrait => {
          groupTrait.unlockTraits(ownedIDs)
        });
      }
      for (const trait in ownedTraits){
        const textureGroup = this.getTextureGroup(trait)
        if (textureGroup){
          textureGroup.unlockTraits(ownedTraits[trait]);
        }
        const decalGroup = this.getDecalGroup(trait)
        if (decalGroup){
          decalGroup.unlockTraits(ownedTraits[trait]);
        }
        const colorGroup = this.getColorGroup(trait)
        if (colorGroup){
          colorGroup.unlockTraits(ownedTraits[trait]);
        }
        const modelGroup = this.getModelGroup(trait);
        if (modelGroup){
          modelGroup.unlockTraits(ownedTraits[trait]);
        }
      }
    }

    /**
     * Gets model group
     * @param {string} groupTraitID - The group trait ID
     * @returns {Object|null} Model group or null if not found
     */
    getModelGroup(groupTraitID:string){
      return this.modelTraitsMap.get(groupTraitID);
    }

    // textures
    /**
     * Gets texture trait
     * @param {string} groupTraitID - The group trait ID
     * @param {string} traitID - The trait ID
     * @returns {Object|null} Texture trait or null if not found
     */
    getTextureTrait(groupTraitID:string, traitID:string){
      return this.getTextureGroup(groupTraitID)?.getTrait(traitID);
    }
    /**
     * Gets texture group
     * @param {string} groupTraitID - The group trait ID
     * @returns {Object|null} Texture group or null if not found
     */
    getTextureGroup(groupTraitID:string){
      return this.textureTraitsMap.get(groupTraitID);
    }

    // decals
    /**
     * Gets decal trait
     * @param {string} groupTraitID - The group trait ID
     * @param {string} traitID - The trait ID
     * @returns {Object|null} Decal trait or null if not found
     */
    getDecalTrait(groupTraitID:string, traitID:string){
      return this.getDecalGroup(groupTraitID)?.getTrait(traitID);
    }
    /**
     * Gets decal group
     * @param {string} decalGroupTraitId - The decal group trait ID
     * @returns {Object|null} Decal group or null if not found
     */
    getDecalGroup(decalGroupTraitId:string){
      return this.decalTraitsMap.get(decalGroupTraitId);
    }

    // colors
    /**
     * Gets color trait
     * @param {string} groupTraitID - The group trait ID
     * @param {string} traitID - The trait ID
     * @returns {Object|null} Color trait or null if not found
     */
    getColorTrait(groupTraitID:string, traitID:string){
      return this.getColorGroup(groupTraitID)?.getTrait(traitID);
    }
    /**
     * Gets color group
     * @param {string} groupTraitID - The group trait ID
     * @returns {Object|null} Color group or null if not found
     */
    getColorGroup(groupTraitID:string){
      return this.colorTraitsMap.get(groupTraitID);
    }



    // get directories
    /**
     * Gets traits directory
     * @returns {string} The traits directory path
     */
    getTraitsDirectory(){
      let result = (this.assetsLocation || "") + (this.traitsDirectory || "");
      if (!result.endsWith("/")&&!result.endsWith("\\"))
        result += "/";
      return result;
    }
    /**
     * Gets thumbnails directory
     * @returns {string} The thumbnails directory path
     */
    getThumbnailsDirectory(){
      let result = (this.assetsLocation || "") + (this.thumbnailsDirectory || "");
      if (!result.endsWith("/")&&!result.endsWith("\\"))
        result += "/";
      return result;
    }
    /**
     * Gets trait icons directory SVG
     * @returns {string} The trait icons directory path
     */
    getTraitIconsDirectorySvg(){
      let result = (this.assetsLocation || "") + (this.traitIconsDirectorySvg || "");
      if (!result.endsWith("/")&&!result.endsWith("\\"))
        result += "/";
      return result;
    }
    /**
     * Gets assets directory
     * @returns {string} The assets directory path
     */
    getAssetsDirectory(){
      let result = (this.assetsLocation || "");
      if (!result.endsWith("/")&&!result.endsWith("\\"))
        result += "/";
      return result;
    }


    // Given an array of traits, saves an array of TraitModels
    /**
     * Creates model traits
     * @param {Object} modelTraits - The model traits object
     * @param {boolean} [replaceExisting=false] - Whether to replace existing traits
     */
    createModelTraits(modelTraits:ModelTraitCollectionData[], replaceExisting = false){
      if (replaceExisting) this.modelTraits = [];
      let hasTraitWithDecals = false
      getAsArray(modelTraits).forEach(traitObject => {
        const group = new TraitModelsGroup(this, traitObject)
        this.modelTraits.push(group)

        /**
         * We only support one group with decals at the moment; if there are multiple groups with decals, we will log a warning
         */
        if(hasTraitWithDecals && group.getAllDecals()?.length){
          console.warn("Detected multiple traits with decals; only one trait with decals is supported at the moment")
        }else if (!group.getAllDecals()?.length){
          hasTraitWithDecals = true
        }
      });


      this.modelTraitsMap = new Map(this.modelTraits.map(item => [item.trait, item]));

      // Updates all restricted traits for each group models
      this.modelTraits.forEach(modelTrait => {
        this.manifestRestrictions.createTraitRestriction(modelTrait);
      });
    }

    /**
     * Creates texture traits
     * @param {Object} textureTraits - The texture traits object
     * @param {boolean} [replaceExisting=false] - Whether to replace existing traits
     */
    createTextureTraits(textureTraits:TextureCollection[], replaceExisting = false){
      if (replaceExisting) this.textureTraits = [];

      getAsArray(textureTraits).forEach(traitObject => {
        this.textureTraits.push(new TraitTexturesGroup(this, traitObject))
      });

      this.textureTraitsMap = new Map(this.textureTraits.map(item => [item.trait, item]));
    }
    /**
     * @param {TextureCollection[]} decalTraitGroups 
     * @param {boolean} [replaceExisting] 
     */
    /**
     * Creates decal traits
     * @param {Object} decalTraitGroups - The decal trait groups object
     * @param {boolean} [replaceExisting=false] - Whether to replace existing traits
     */
    createDecalTraits(decalTraits:DecalCollection[], replaceExisting = false){
      if (replaceExisting) this.decalTraits = [];

      getAsArray(decalTraits).forEach(traitObject => {
        this.decalTraits.push(new DecalTextureGroup(this, traitObject))
      });

      this.decalTraitsMap = new Map(this.decalTraits.map(item => [item.trait, item]));
    }

    /**
     * Creates color traits
     * @param {Object} colorTraits - The color traits object
     * @param {boolean} [replaceExisting=false] - Whether to replace existing traits
     */
    createColorTraits(colorTraits:colorCollection[], replaceExisting = false){
      if (replaceExisting) this.colorTraits = [];

      getAsArray(colorTraits).forEach(traitObject => {
        this.colorTraits.push(new TraitColorsGroup(this, traitObject))
      });

      this.colorTraitsMap = new Map(this.colorTraits.map(item => [item.trait, item]));
    }

}


// Must be created AFTER color collections and texture collections have been created
export class TraitModelsGroup{
  trait:string
  name:string
  iconSvg:string
  fullIconSvg:string
  isRequired:boolean
  cameraTarget:{
    distance:number,
    height:number
  }
  cullingDistance:number[]
  cullingLayer:number
  nudgeHips:boolean = false
  collection:ModelTrait[]
  collectionMap:Map<string,ModelTrait> = new Map();

  restrictions:TraitRestriction | undefined
  locked:boolean = false
  price:number = 0
  purchasable:boolean = false
  constructor(public manifestData:CharacterManifestData, options:ModelTraitCollectionData){
        const {
          locked,
          price,
          purchasable,
          trait,
          name,
          iconSvg,
          cameraTarget = { distance:3 , height:1 },
          cullingDistance, // can be undefined; if undefined, will use default from manifestData
          cullingLayer, // can be undefined; if undefined, will use default from manifestData
          collection,
        } = options;
        this.manifestData = manifestData;
        
        this.locked = (locked ?? manifestData.locked)?? false;
        this.price = price ?? manifestData.price ?? 0;
        this.purchasable = purchasable ?? manifestData.purchasable ?? false;
       
        this.isRequired = manifestData.requiredTraits.indexOf(trait) !== -1;
        this.trait = trait;
        this.name = name;
        this.iconSvg = iconSvg;
        this.fullIconSvg = manifestData.getTraitIconsDirectorySvg() + iconSvg;

        this.cameraTarget = cameraTarget;
        this.cullingDistance = cullingDistance;
        this.cullingLayer = cullingLayer;
        
        this.collection = [];
        this.createCollection(collection);
        
    }

    get collectionID(){
      return this.manifestData.collectionID;
    }


    appendCollection(modelTraitGroup:TraitModelsGroup, replaceExisting=false){
      modelTraitGroup.collection.forEach(newModelTrait => {
        const modelTrait = this.getTrait(newModelTrait.id)
        if (modelTrait != null){
          // replace only if requested ro replace
          if (replaceExisting){
            console.log(`Model with id ${newModelTrait.id} exists and will be replaced with new one`)
            this.collectionMap.set(newModelTrait.id, newModelTrait)
            const ind = this.collection.indexOf(modelTrait)
            this.collection[ind] = newModelTrait;
          }
          else{
            console.log(`Model with id ${newModelTrait.id} exists, skipping`)
          }
        }
        else{
          // create
          this.collection.push(newModelTrait)
          this.collectionMap.set(newModelTrait.id, newModelTrait);
        }
      });
    }

    createCollection(itemCollection:ModelTraitData[], replaceExisting = false){
      if (replaceExisting) this.collection = [];

      getAsArray(itemCollection).forEach(item => {
        this.collection.push(new ModelTrait(this, item))
      });
      this.collectionMap = new Map(this.collection.map(item => [item.id, item]));
    }

    getCustomTrait(url:string){
      return new ModelTrait(this, {directory:url, fullDirectory:url, id:"_custom", name:"Custom"} as ModelTraitData)
    }

    getTrait(traitID:string){
      return this.collectionMap.get(traitID);
    }

    unlockTraits(traitIDs:string[]){
      traitIDs.forEach(traitID => {
        const trait = this.collectionMap.get(traitID);
        if (trait != null){
          trait.locked = false;
        }
      });
    }


    getAllDecals(){
      const decalGroup = this.collection.map(trait => trait.targetDecalCollection).flat();
      return decalGroup.map((c)=>c?.collection).flat().filter((c)=>!!c);
    }

    getRandomTrait(lockFilter = true){
      const collection = this.getCollection(lockFilter, false);
      return collection.length > 0 ? 
        collection[Math.floor(Math.random() * collection.length)] :
        null;
    }

    getCollection(lockFilter = true, getPurchasables = true){
      if (lockFilter){
        const filteredCollection = this.collection.filter((trait)=>trait.locked === false || (trait.purchasable === true && trait.price != null && getPurchasables === true))
        return filteredCollection;
      }
      else{
        return this.collection;
      }
    }


}
class TraitTexturesGroup{
  trait:string
  visible?:boolean
  collection:TextureTrait[]
  colorCollections:string[] = []
  collectionMap:Map<string,TextureTrait> = new Map();
  constructor(public manifestData:CharacterManifestData, options:TextureCollection){
    const {
        trait,
        collection
    }= options;
    if(!trait){
      console.warn("TraitTexturesGroup is missing property trait")
      this.trait = "undefined"+Math.floor(Math.random()*10)
    }else{
      this.trait = trait;
    }
    this.manifestData = manifestData;

    this.collection = [];

    this.createCollection(collection);
    
  }

  get collectionID(){
    return this.manifestData.collectionID;
  }

  appendCollection(textureTraitGroup:TraitTexturesGroup, replaceExisting=false){
    textureTraitGroup.collection.forEach(newTextureTrait => {
      const textureTrait = this.getTrait(newTextureTrait.id)
      if (textureTrait != null){
        // replace only if requested ro replace
        if (replaceExisting){
          console.log(`Texture with id ${newTextureTrait.id} exists and will be replaced with new one`)
          this.collectionMap.set(newTextureTrait.id, newTextureTrait)
          const ind = this.collection.indexOf(textureTrait)
          this.collection[ind] = newTextureTrait;
        }
        else{
          console.log(`Texture with id ${newTextureTrait.id} exists, skipping`)
        }
      }
      else{
        // create
        this.collection.push(newTextureTrait)
        this.collectionMap.set(newTextureTrait.id, newTextureTrait);
      }
    });
  }
  createCollection(itemCollection:TextureCollectionItem[], replaceExisting = false){
    if (replaceExisting) this.collection = [];

    getAsArray(itemCollection).forEach(item => {
      this.collection.push(new TextureTrait(this, item))
    });

    this.collectionMap = new Map(this.collection.map(item => [item.id, item]));
  }

  getTrait(traitID:string){
    return this.collectionMap.get(traitID);
  }

  unlockTraits(traitIDs:string[]){
    traitIDs.forEach(traitID => {
      const trait = this.collectionMap.get(traitID);
      if (trait != null){
        trait.locked = false;
      }
    });
  }

  getTraitByIndex(index:number){
    return this.collection[index];
  }

  getRandomTrait(){
    return this.collection.length > 0 ? 
      this.collection[Math.floor(Math.random() * this.collection.length)] : 
      null;
  }
}
export class DecalTextureGroup{
  trait:string
  collection:DecalTrait[]
  collectionMap:Map<string,DecalTrait> = new Map();
  canBeStacked:boolean = false
  colorCollections:string[] = []
  constructor(public manifestData:CharacterManifestData, options:DecalCollection){
    const {
        trait,
        collection
    }= options;
    this.manifestData = manifestData;

    if(!trait){
      console.warn("DecalTextureGroup is missing property trait")
      this.trait = "undefined"+Math.floor(Math.random()*10)
    }else{
      this.trait = trait;
    }
    this.collection = [];
    this.createCollection(collection);
    
  }

  get collectionID(){
    return this.manifestData.collectionID;
  }

  appendCollection(decalTraitGroup:DecalTextureGroup, replaceExisting=false){
    decalTraitGroup.collection.forEach(newTextureTrait => {
      const textureTrait = this.getTrait(newTextureTrait.id)
      if (textureTrait != null){
        // replace only if requested ro replace
        if (replaceExisting){
          console.log(`Texture with id ${newTextureTrait.id} exists and will be replaced with new one`)
          this.collectionMap.set(newTextureTrait.id, newTextureTrait)
          const ind = this.collection.indexOf(textureTrait)
          this.collection[ind] = newTextureTrait;
        }
        else{
          console.log(`Texture with id ${newTextureTrait.id} exists, skipping`)
        }
      }
      else{
        // create
        this.collection.push(newTextureTrait)
        this.collectionMap.set(newTextureTrait.id, newTextureTrait);
      }
    });
  }

  createCollection(itemCollection:TextureCollectionItem[], replaceExisting = false){
    if (replaceExisting) this.collection = [];

    getAsArray(itemCollection).forEach(item => {
      this.collection.push(new DecalTrait(this, item))
    });


    this.collectionMap = new Map(this.collection.map(item => [item.id, item]));
  }

  getTrait(traitID:string){
    return this.collectionMap.get(traitID);
  }

  unlockTraits(traitIDs:string[]){
    traitIDs.forEach(traitID => {
      const trait = this.collectionMap.get(traitID);
      if (trait != null){
        trait.locked = false;
      }
    });
  }

  getTraitByIndex(index:number){
    return this.collection[index];
  }

  getRandomTrait(){
    return this.collection.length > 0 ? 
      this.collection[Math.floor(Math.random() * this.collection.length)] : 
      null;
  }
}

class TraitColorsGroup{
  trait:string
  collection:ColorTrait[]
  collectionMap:Map<string,ColorTrait> = new Map();
  constructor(public manifestData:CharacterManifestData, options:colorCollection){
    const {
        trait,
        collection
    }= options;
    this.manifestData = manifestData;
    this.trait = trait;

    this.collection = [];
    this.createCollection(collection);
  }

  get collectionID(){
    return this.manifestData.collectionID;
  }

  appendCollection(colorTraitGroup:TraitColorsGroup, replaceExisting = false){
    colorTraitGroup.collection.forEach(newColorTrait => {
      const colorTrait = this.getTrait(newColorTrait.id)
      if (colorTrait != null){
        // replace only if requested ro replace
        if (replaceExisting){
          console.log(`Color with id ${newColorTrait.id} exists and will be replaced with new one`)
          this.collectionMap.set(newColorTrait.id, newColorTrait)
          const ind = this.collection.indexOf(colorTrait)
          this.collection[ind] = newColorTrait;
        }
        else{
          console.log(`Color with id ${newColorTrait.id} exists, skipping`)
        }
      }
      else{
        // create
        this.collection.push(newColorTrait)
        this.collectionMap.set(newColorTrait.id, newColorTrait);
      }
    });
  }
  createCollection(itemCollection:colorCollectionItem[], replaceExisting = false){
    if (replaceExisting) this.collection = [];

    getAsArray(itemCollection).forEach(item => {
      this.collection.push(new ColorTrait(this, item))
    });

    this.collectionMap = new Map(this.collection.map(item => [item.id, item]));
  }

  getTrait(traitID:string){
    return this.collectionMap.get(traitID);
  }

  unlockTraits(traitIDs:string[]){
    traitIDs.forEach(traitID => {
      const trait = this.collectionMap.get(traitID);
      if (trait != null){
        trait.locked = false;
      }
    });
  }

  getTraitByIndex(index:number){
    return this.collection[index];
  }

  getRandomTrait(){
    return this.collection.length > 0 ? 
      this.collection[Math.floor(Math.random() * this.collection.length)] : 
      null;
  }
}

export class ModelTrait{
  id:string
  type:string
  directory:string
  fullDirectory?:string|string[]
  name:string
  thumbnail:string
  blendshapeTraits?:BlendShapeGroup[]
  blendshapeTraitsMap:Map<string,BlendShapeGroup> = null!
  fullThumbnail:string | string[]
  cullHiddenMeshes:number[]
  cullingLayer:number
  cullingIgnore:string[] =[]
  meshTargets:string[]=[]
  decalMeshNameTargets:string[]=[]
  targetTextureCollection:TraitTexturesGroup|null = null
  targetDecalCollection:DecalTextureGroup |null = null
  targetColorCollection:TraitColorsGroup|null
  _restrictedItems:string[]

  cullingDistance:number[]=[0,0]
  maxCullingDistance:number=0

  locked:boolean = false
  price:number = 0
  purchasable:boolean = false

  constructor(public traitGroup:TraitModelsGroup, options:ModelTraitData){
      const {
          id,
          type = '',
          directory,
          name,
          thumbnail,
          cullingDistance,
          cullingLayer,
          textureCollection,
          blendshapeTraits,
          colorCollection,
          decalCollection,
          decalMeshNameTargets,
          fullDirectory,
          fullThumbnail,
          restrictedItems,
          locked,
          price,
          purchasable,
      }= options;
      
      this.locked = locked == null ? traitGroup.locked : locked;
      this.price = price == null ? traitGroup.price : price;
      this.purchasable = purchasable == null ? traitGroup.purchasable : purchasable;

      this.traitGroup = traitGroup;
      this.decalMeshNameTargets = getAsArray(decalMeshNameTargets);

      this.id = id;
      this.directory = directory;

      this._restrictedItems = restrictedItems||[];
      if (fullDirectory){
        this.fullDirectory = fullDirectory
      }
      else{
        if (Array.isArray(directory))
        {
          this.fullDirectory = [];
          for (let i =0;i< directory.length;i++){
            this.fullDirectory[i] = traitGroup.manifestData.getTraitsDirectory() + directory[i]
          }  
        }
        else
        {
          this.fullDirectory = traitGroup.manifestData.getTraitsDirectory() + directory;
        }
      }
      
      this.name = name;
      this.thumbnail = thumbnail;
      this.fullThumbnail = fullThumbnail || traitGroup.manifestData.getThumbnailsDirectory() + thumbnail;

      this.cullHiddenMeshes = cullingDistance|| [0,0];
      // Prioritize cullingLayer from trait, then from traitGroup, then default
      this.cullingLayer = cullingLayer ?? traitGroup.cullingLayer ?? traitGroup.manifestData.defaultCullingLayer ?? 0;
      // Prioritize cullingDistance from trait, then from traitGroup, then default
      this.cullingDistance = cullingDistance || traitGroup.cullingDistance || traitGroup.manifestData.defaultCullingDistance || [0,0];
      this.type = type;

      this.targetTextureCollection = textureCollection ? traitGroup.manifestData.getTextureGroup(textureCollection)||null : null;
      this.targetColorCollection = colorCollection ? traitGroup.manifestData.getColorGroup(colorCollection)||null : null;
      this.targetDecalCollection = decalCollection ? traitGroup.manifestData.getDecalGroup(decalCollection)||null : null;

      if(blendshapeTraits && Array.isArray(blendshapeTraits)){

        this.blendshapeTraits = blendshapeTraits.map((blendshapeGroup) => {
          return new BlendShapeGroup(this, blendshapeGroup)
        })

        this.blendshapeTraitsMap = new Map(this.blendshapeTraits.map(item => [item.trait, item]));
      }
  }

  get collectionID(){
    return this.traitGroup.collectionID;
  }

  get manifestData(){
    return this.traitGroup.manifestData;
  }

  isRestricted(targetModelTrait:ModelTrait){
    if (targetModelTrait == null)
      return false;
    if(this.traitGroup.restrictions?.isTraitAllowed(targetModelTrait.traitGroup.trait)){
      return false;
    }
    if(this.traitGroup.restrictions?.isTypeAllowed(targetModelTrait.type)){
      return false;
    }
    return true
  }
  getGroupBlendShapeTraits(){
    return this.blendshapeTraits;
  }

  /**
   * 
   * @param {string} traitGroupID 
   * @returns {BlendShapeTrait[]}
   */
  getBlendShapes(traitGroupID:string){
    return this.blendshapeTraitsMap?.get(traitGroupID)?.collection
  }

  /**
   * 
   * @param {string} traitGroupID 
   * @param {string} traitID 
   * @returns {BlendShapeTrait | undefined}
   */
  getBlendShape(traitGroupID:string,traitID:string){
    return this.blendshapeTraitsMap?.get(traitGroupID)?.getTrait(traitID);
  }
}


export class BlendShapeGroup {
  trait:string
  name:string
  copyTo:{[trait:string]:string[]} = {}
  isBlendShapeGroup:boolean = true
  collection:BlendShapeTrait[] = []
  cameraTarget:{
    distance:number,
    height:number
  }
  collectionMap:Map<string,BlendShapeTrait> = new Map();

  constructor( public modelTrait:ModelTrait, options:BlendShapeGroupModelTraitData){
    const {
        trait,
        name,
        collection,
        cameraTarget = modelTrait.traitGroup.cameraTarget || { distance:3 , height:1 }
    }= options;
    this.modelTrait = modelTrait;
    this.trait = trait;
    this.name = name;

    this.cameraTarget = cameraTarget;
    this.createCollection(collection);
  }
  get manifestData(){
    return this.modelTrait.manifestData;
  }

  get collectionID(){
    return this.modelTrait.collectionID;
  }

  /**
   * @param {BlendShapeTraitData[]} itemCollection 
   * @param {boolean} [replaceExisting] (default false)
   */
  createCollection(itemCollection:BlendShapeTraitData[], replaceExisting = false){
    if (replaceExisting) this.collection = [];

    getAsArray(itemCollection).forEach(item => {
      this.collection.push(new BlendShapeTrait(this, item))
    });
    this.collectionMap = new Map(this.collection.map(item => [item.id, item]));
  }

  getTrait(traitID:string){
    return this.collectionMap.get(traitID);
  }

  /**
   * @param {number} index 
   */
  getTraitByIndex(index:number){
    return this.collection[index];
  }

  getRandomTrait(){
    return this.collection.length > 0 ? 
      this.collection[Math.floor(Math.random() * this.collection.length)] : 
      null;
  }
}

export class BlendShapeTrait{
  blendshapeId:string
  id:string
  name:string
  fullThumbnail?:string
  unique:boolean = false
  isBlendShape:boolean = true

  constructor(public parentGroup:BlendShapeGroup,options:BlendShapeTraitData){
      const {
          id,
          name,
          blendshapeId,
          fullThumbnail,
          unique,
      }= options;

      if(!id){
        console.warn("BlendShapeTrait is missing id, parent trait: "+ parentGroup.trait)
      }
      if(!blendshapeId){
        console.warn("BlendShapeTrait is missing blendshapeId, parent trait: "+ parentGroup.trait)
      }
      if(!name){
        console.warn("BlendShapeTrait is missing name, parent trait: "+ parentGroup.trait)
      }

      this.blendshapeId = blendshapeId;
      this.id = id;
      this.fullThumbnail = fullThumbnail;
      this.name = name;
      this.unique = unique ?? false;
  }
  get isUnique(){
    return this.unique;
  }
  getGroupId(){
    return this.parentGroup.trait;
  }
}

export class TextureTrait{
  id:string
  directory:string
  fullDirectory?:string|string[]
  name:string
  thumbnail:string
  fullThumbnail:string
  locked?:boolean = false
  constructor(public traitGroup:TraitTexturesGroup, options:TextureCollectionItem){
      const {
          id,
          directory,
          fullDirectory,
          name,
          thumbnail,
          locked
      }= options;
      this.traitGroup = traitGroup;
      this.id = id;
      this.directory = directory;
      this.locked = locked ?? false;
      if (fullDirectory){
        this.fullDirectory = fullDirectory
      }
      else{
        if (Array.isArray(directory))
        {
          this.fullDirectory = [];
          for (let i =0;i< directory.length;i++){
            this.fullDirectory[i] = traitGroup.manifestData.getTraitsDirectory() + directory[i]
          }  
        }
        else
        {
          this.fullDirectory = traitGroup.manifestData.getTraitsDirectory() + thumbnail;
        }
      }

      this.name = name;
      this.thumbnail = thumbnail;
      this.fullThumbnail = traitGroup.manifestData.getThumbnailsDirectory() + thumbnail;
  }

  get collectionID(){
    return this.traitGroup.collectionID;
  }
}
export class DecalTrait extends TextureTrait{
  id:string
  directory:string
  fullDirectory?:string|string[]
  name:string
  thumbnail:string
  fullThumbnail:string
  constructor( public traitGroup:DecalTextureGroup, options:TextureCollectionItem){
      super(traitGroup,options);  
    const {
            id,
            directory,
            fullDirectory,
            name,
            thumbnail,
        }= options;
      this.traitGroup = traitGroup;
      this.id = id;
      this.directory = directory;
      if (fullDirectory){
        this.fullDirectory = fullDirectory
      }
      else{
        if (Array.isArray(directory))
        {
          this.fullDirectory = [];
          for (let i =0;i< directory.length;i++){
            this.fullDirectory[i] = traitGroup.manifestData.getTraitsDirectory() + directory[i]
          }  
        }
        else
        {
          this.fullDirectory = traitGroup.manifestData.getTraitsDirectory() + thumbnail;
        }
      }

      this.name = name;
      this.thumbnail = thumbnail;
      this.fullThumbnail = traitGroup.manifestData.getThumbnailsDirectory() + thumbnail;
  }

  get collectionID(){
    return this.traitGroup.collectionID;
  }
}

export class ColorTrait{
    id:string
    value:string[]
    name:string
    locked?:boolean
    constructor(public traitGroup:TraitColorsGroup, options:colorCollectionItem){
        const {
            id,
            value,
            name,
            locked
        }= options;

        this.traitGroup = traitGroup;
        this.id = id;
        this.name = name;
        this.value = value;
        this.locked = locked ?? false;
        
    }

    get collectionID(){
      return this.traitGroup.collectionID;
    }
}
export class SelectedOption{
  constructor(public traitModel:ModelTrait,public traitTexture:TextureTrait|null ,public traitColor:ColorTrait|null){

  }
}


class SolanaPurchaseAssets{
  merkleTreeAddress:string
  depositAddress:string
  collectionName:string
  constructor(solanapurchaseAssetsDefinition:{
      merkleTreeAddress:string,
      depositAddress:string,
      collectionName:string
  }){
    const {
      merkleTreeAddress,
      depositAddress,
      collectionName
    } = solanapurchaseAssetsDefinition;

    this.merkleTreeAddress = merkleTreeAddress;
    this.collectionName = collectionName;
    this.depositAddress = depositAddress;
  }
}

function createSolanaPurchaseCNFT(solanapurchaseAssetsDefinition:{
    merkleTreeAddress:string,
    depositAddress:string,
    collectionName:string
}) {
  if (solanapurchaseAssetsDefinition == null)
    return null
  if (!solanapurchaseAssetsDefinition?.merkleTreeAddress || !solanapurchaseAssetsDefinition?.collectionName  || !solanapurchaseAssetsDefinition?.depositAddress) {
    console.warn("solanaPurchaseCNFT defined incomplete in manifest, missing either merkleTreeAddress or collectionName or depositAddress, setting as null", )
    return null;
  }
  return new SolanaPurchaseAssets(solanapurchaseAssetsDefinition);

}


    