import { getAsArray } from "./utils";
import { ManifestRestrictions } from "./manifestRestrictions";
import { WalletCollections } from "./walletCollections";



/**
 * @typedef {import('./manifestRestrictions').TraitRestriction} TraitRestriction
 */

/**
 * @typedef {Object} TextureCollectionItem
 * @property {string} id - Unique identifier for the texture item
 * @property {string} name - Display name of the texture item
 * @property {string} directory - Directory path for the texture
 * @property {string} [fullDirectory] - Optional full directory path
 * @property {string} [thumbnail] - Optional thumbnail path
 */

/**
 * @typedef {Object} TextureCollection
 * @property {string} trait - Trait identifier
 * @property {string} type - Type of texture collection
 * @property {TextureCollectionItem[]} collection - Array of texture items
 */

/**
 * Main class for managing character manifest data and traits
 * @class CharacterManifestData
 */
export class CharacterManifestData{
    /**
     * Creates a new CharacterManifestData instance
     * @param {Object} manifest - The manifest data object
     * @param {string} collectionID - The collection identifier
     */
    constructor(manifest, collectionID){
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
        downloadOptions = {}
      }= manifest;

      this.collectionID = collectionID;
      // chainName:c.chainName || "ethereum",
      // dataSource:c.dataSource || "attributes"
      this.walletCollections = new WalletCollections();
      

      this.chainName = chainName;
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

      this.price = price;
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
      this.textureTraitsMap = null;
      this.createTextureTraits(textureCollections, false);

      this.decalTraits = [];
      this.decalTraitsMap = null;
      this.createDecalTraits(decalCollections);

      this.colorTraits = [];
      this.colorTraitsMap = null;
      this.createColorTraits(colorCollections, false);

      this.modelTraits = [];
      this.modelTraitsMap = null;
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
    unlockPurchasedAssetsWithWallet(testWallet){
      if (this.solanaPurchaseAssets == null){
        return Promise.resolve();
      }
      return new Promise((resolve)=>{
        this.walletCollections
          .getSolanaPurchasedAssets(this.solanaPurchaseAssets,testWallet)
          .then(userOwnedTraits => {
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
    unlockNFTAssetsWithWallet(testWallet = null){
      if (this.collectionLockID == null){
        return Promise.resolve();
      }
      else{
        return new Promise((resolve)=>{
          this.walletCollections.getTraitsFromCollection(this.collectionLockID, this.chainName, this.dataSource, testWallet)
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
    unlockWalletOwnedTraits(testWallet = null){
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
    getTraitOptionById(optionID){
      return this.getAllTraitOptions().find((option)=>option.id == optionID);
    }
    /**
     * Gets trait options by type
     * @param {string} type - The trait type
     * @returns {Array} Array of trait options
     */
    getTraitOptionsByType(type){
      return this.getAllTraitOptions().filter((option)=>option.type == type);
    }
    /**
     * Gets all trait options
     * @returns {Array} Array of all trait options
     */
    getAllTraitOptions(){
      return this.modelTraits.map((trait)=>trait?.getCollection()).flat();
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
    isColliderRequired(groupTraitID){
      if (this.colliderTraits.indexOf(groupTraitID) != -1)
        return true;
      return false;
    }
    /**
     * Checks if a trait is a lip sync trait
     * @param {string} groupTraitID - The group trait ID
     * @returns {boolean} True if it's a lip sync trait, false otherwise
     */
    isLipsyncTrait(groupTraitID){
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
    getNFTraitOptionsFromURL(url, ignoreGroupTraits){
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
    getNFTraitOptionsFromObject(object, ignoreGroupTraits){
      const attributes = object.attributes;
      if (attributes){
        ignoreGroupTraits = getAsArray(ignoreGroupTraits);
        const selectedOptions = []
        attributes.forEach(attribute => {
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
    getRandomTraits(optionalGroupTraitIDs){
      const selectedOptions = []
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
    getRandomTrait(groupTraitID){
      // set to SelectedOption
      const traitModelsGroup = this.getModelGroup(groupTraitID);
      if (traitModelsGroup){
        const trait =  traitModelsGroup.getRandomTrait();
        if (trait){
          const traitTexture = trait.targetTextureCollection?.getRandomTrait();
          const traitColor = trait.targetColorCollection?.getRandomTrait();
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
    async _fetchJson(location) {
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
    getTraitOption(groupTraitID, traitID){
      const trait = this.getModelTrait(groupTraitID, traitID);
      if (trait){
        const traitTexture = trait.targetTextureCollection?.getRandomTrait();
        const traitColor = trait.targetColorCollection?.getRandomTrait();
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
    getCustomTraitOption(groupTraitID, url){
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
    getCustomModelTrait(groupTraitID, url){
      return this.getModelGroup(groupTraitID)?.getCustomTrait(url);
    }

    // model traits
    /**
     * Gets model trait
     * @param {string} groupTraitID - The group trait ID
     * @param {string} traitID - The trait ID
     * @returns {Object|null} Model trait or null if not found
     */
    getModelTrait(groupTraitID, traitID){
      return this.getModelGroup(groupTraitID)?.getTrait(traitID);
    }
    /**
     * Gets model traits for a group
     * @param {string} groupTraitID - The group trait ID
     * @returns {Array|null} Array of model traits or null if not found
     */
    getModelTraits(groupTraitID){
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
    unlockTraits(userOwnedTraits){
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
    getModelGroup(groupTraitID){
      return this.modelTraitsMap.get(groupTraitID);
    }

    // textures
    /**
     * Gets texture trait
     * @param {string} groupTraitID - The group trait ID
     * @param {string} traitID - The trait ID
     * @returns {Object|null} Texture trait or null if not found
     */
    getTextureTrait(groupTraitID, traitID){
      return this.getTextureGroup(groupTraitID)?.getTrait(traitID);
    }
    /**
     * Gets texture group
     * @param {string} groupTraitID - The group trait ID
     * @returns {Object|null} Texture group or null if not found
     */
    getTextureGroup(groupTraitID){
      return this.textureTraitsMap.get(groupTraitID);
    }

    // decals
    /**
     * Gets decal trait
     * @param {string} groupTraitID - The group trait ID
     * @param {string} traitID - The trait ID
     * @returns {Object|null} Decal trait or null if not found
     */
    getDecalTrait(groupTraitID, traitID){
      return this.getDecalGroup(groupTraitID)?.getTrait(traitID);
    }
    /**
     * Gets decal group
     * @param {string} decalGroupTraitId - The decal group trait ID
     * @returns {Object|null} Decal group or null if not found
     */
    getDecalGroup(decalGroupTraitId){
      return this.decalTraitsMap.get(decalGroupTraitId);
    }

    // colors
    /**
     * Gets color trait
     * @param {string} groupTraitID - The group trait ID
     * @param {string} traitID - The trait ID
     * @returns {Object|null} Color trait or null if not found
     */
    getColorTrait(groupTraitID, traitID){
      return this.getColorGroup(groupTraitID)?.getTrait(traitID);
    }
    /**
     * Gets color group
     * @param {string} groupTraitID - The group trait ID
     * @returns {Object|null} Color group or null if not found
     */
    getColorGroup(groupTraitID){
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

    /**
     * Gets decals directory
     * @returns {string} The decals directory path
     */
    getDecalsDirectory(){
      let result = (this.assetsLocation || "") + (this.decalDirectory || "");
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
    createModelTraits(modelTraits, replaceExisting = false){
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
    createTextureTraits(textureTraits, replaceExisting = false){
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
    createDecalTraits(decalTraitGroups, replaceExisting = false){
      if (replaceExisting) this.decalTraits = [];

      getAsArray(decalTraitGroups).forEach(traitObject => {
        this.decalTraits.push(new DecalTextureGroup(this, traitObject))
      });

      this.decalTraitsMap = new Map(this.decalTraits.map(item => [item.trait, item]));
    }

    /**
     * Creates color traits
     * @param {Object} colorTraits - The color traits object
     * @param {boolean} [replaceExisting=false] - Whether to replace existing traits
     */
    createColorTraits(colorTraits, replaceExisting = false){
      if (replaceExisting) this.colorTraits = [];

      getAsArray(colorTraits).forEach(traitObject => {
        this.colorTraits.push(new TraitColorsGroup(this, traitObject))
      });

      this.colorTraitsMap = new Map(this.colorTraits.map(item => [item.trait, item]));
    }

}


// Must be created AFTER color collections and texture collections have been created
export class TraitModelsGroup{
  /** 
   * @type {ModelTrait[]}
  */
  collection
  /**
   * @type {CharacterManifestData}
   */
  manifestData
  /**
   * @type {TraitRestriction|undefined}
   */
  restrictions

  constructor(manifestData, options){
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
        this.collectionID = manifestData.collectionID;
        
        this.locked = locked == null ? manifestData.locked : locked;
        this.price = price == null ? manifestData.price : price;
        this.purchasable = purchasable == null ? manifestData.purchasable : purchasable;
       
        this.isRequired = manifestData.requiredTraits.indexOf(trait) !== -1;
        this.trait = trait;
        this.name = name;
        this.iconSvg = iconSvg;
        this.fullIconSvg = manifestData.getTraitIconsDirectorySvg() + iconSvg;

        this.cameraTarget = cameraTarget;
        this.cullingDistance = cullingDistance;
        this.cullingLayer = cullingLayer;
        
        this.collection = [];
        this.collectionMap = null;
        this.createCollection(collection);
        
    }

    appendCollection(modelTraitGroup, replaceExisting){
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

    createCollection(itemCollection, replaceExisting = false){
      if (replaceExisting) this.collection = [];

      getAsArray(itemCollection).forEach(item => {
        this.collection.push(new ModelTrait(this, item))
      });
      this.collectionMap = new Map(this.collection.map(item => [item.id, item]));
    }

    getCustomTrait(url){
      return new ModelTrait(this, {directory:url, fullDirectory:url, collectionID:this.collectionID, id:"_custom", name:"Custom"})
    }

    getTrait(traitID){
      return this.collectionMap.get(traitID);
    }

    unlockTraits(traitIDs){
      traitIDs.forEach(traitID => {
        const trait = this.collectionMap.get(traitID);
        if (trait != null){
          trait.locked = false;
        }
      });
    }

    /**
     * 
     * @returns {DecalTrait[]}
     */
    getAllDecals(){
      const decalGroup = this.collection.map(trait => trait.targetDecalCollection).flat();
      return decalGroup.map((c)=>c?.collection).flat().filter((c)=>!!c);
    }

    getTraitByIndex(lockFilter = true){
      const collection = this.getCollection(lockFilter)
      return collection[index];
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
  /**
   * 
   * @param {CharacterManifestData} manifestData 
   * @param {TextureCollection} options 
   */
  constructor(manifestData, options){
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
    this.collectionID = manifestData.collectionID;

    this.collection = [];
    this.collectionMap = null;

    this.createCollection(collection);
    
  }

  appendCollection(textureTraitGroup, replaceExisting){
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
  createCollection(itemCollection, replaceExisting = false){
    if (replaceExisting) this.collection = [];

    getAsArray(itemCollection).forEach(item => {
      this.collection.push(new TextureTrait(this, item))
    });

    this.collectionMap = new Map(this.collection.map(item => [item.id, item]));
  }

  getTrait(traitID){
    return this.collectionMap.get(traitID);
  }

  unlockTraits(traitIDs){
    traitIDs.forEach(traitID => {
      const trait = this.collectionMap.get(traitID);
      if (trait != null){
        trait.locked = false;
      }
    });
  }

  getTraitByIndex(index){
    return this.collection[index];
  }

  getRandomTrait(){
    return this.collection.length > 0 ? 
      this.collection[Math.floor(Math.random() * this.collection.length)] : 
      null;
  }
}
export class DecalTextureGroup{
  /**
   * @type {string}
   */
  trait
  /**
   * @type {DecalTrait[]}
   */
  collection
  /**
   * @type {Map<string,DecalTrait>}
   */
  collectionMap
  /**
   * 
   * @param {CharacterManifestData} manifestData 
   * @param {TextureCollection} options 
   */
  constructor(manifestData, options){
    const {
        trait,
        collection
    }= options;
    this.manifestData = manifestData;
    this.collectionID = manifestData.collectionID;
    if(!trait){
      console.warn("DecalTextureGroup is missing property trait")
      this.trait = "undefined"+Math.floor(Math.random()*10)
    }else{
      this.trait = trait;
    }
    this.collection = [];
    this.collectionMap = null;
    this.createCollection(collection);
    
  }

  appendCollection(decalTraitGroup, replaceExisting=false){
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

  createCollection(itemCollection, replaceExisting = false){
    if (replaceExisting) this.collection = [];

    getAsArray(itemCollection).forEach(item => {
      this.collection.push(new DecalTrait(this, item))
    });


    this.collectionMap = new Map(this.collection.map(item => [item.id, item]));
  }

  getTrait(traitID){
    return this.collectionMap.get(traitID);
  }

  unlockTraits(traitIDs){
    traitIDs.forEach(traitID => {
      const trait = this.collectionMap.get(traitID);
      if (trait != null){
        trait.locked = false;
      }
    });
  }

  getTraitByIndex(index){
    return this.collection[index];
  }

  getRandomTrait(){
    return this.collection.length > 0 ? 
      this.collection[Math.floor(Math.random() * this.collection.length)] : 
      null;
  }
}
class TraitColorsGroup{
  constructor(manifestData, options){
    const {
        trait,
        collection
    }= options;
    this.manifestData = manifestData;
    this.collectionID = manifestData.collectionID;
    this.trait = trait;

    this.collection = [];
    this.collectionMap = null;

    this.createCollection(collection);

  }

  appendCollection(colorTraitGroup, replaceExisting){
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
  createCollection(itemCollection, replaceExisting = false){
    if (replaceExisting) this.collection = [];

    getAsArray(itemCollection).forEach(item => {
      this.collection.push(new ColorTrait(this, item))
    });

    this.collectionMap = new Map(this.collection.map(item => [item.id, item]));
  }

  getTrait(traitID){
    return this.collectionMap.get(traitID);
  }

  unlockTraits(traitIDs){
    traitIDs.forEach(traitID => {
      const trait = this.collectionMap.get(traitID);
      if (trait != null){
        trait.locked = false;
      }
    });
  }

  getTraitByIndex(index){
    return this.collection[index];
  }

  getRandomTrait(){
    return this.collection.length > 0 ? 
      this.collection[Math.floor(Math.random() * this.collection.length)] : 
      null;
  }
}
export class ModelTrait{
  /**
   * @type {string}
   */
  type

  blendshapeTraits = [];
  /**
   * @type {string[]}
   * */ 
  decalMeshNameTargets=[]
  /**
   * @type {DecalTextureGroup | null}
   */
  targetDecalCollection=null
  /**
   * @type {TraitModelsGroup}
   */
  traitGroup
  blendshapeTraitsMap = new Map();
  /**
   * @type {string[]}
   */
  _restrictedItems = []
  constructor(traitGroup, options){
      const {
          locked,
          price,
          id,
          purchasable,
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
          restrictedItems
      }= options;
      this.manifestData = traitGroup.manifestData;
      this.collectionID = traitGroup.collectionID;
      
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

      this.targetTextureCollection = textureCollection ? traitGroup.manifestData.getTextureGroup(textureCollection) : null;
      this.targetColorCollection = colorCollection ? traitGroup.manifestData.getColorGroup(colorCollection) : null;
      this.targetDecalCollection = decalCollection ? traitGroup.manifestData.getDecalGroup(decalCollection) : null;

      if(blendshapeTraits && Array.isArray(blendshapeTraits)){

        this.blendshapeTraits = blendshapeTraits.map((blendshapeGroup) => {
          return new BlendShapeGroup(this, blendshapeGroup)
        })

        this.blendshapeTraitsMap = new Map(this.blendshapeTraits.map(item => [item.trait, item]));
      }
  }
  isRestricted(targetModelTrait){
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
  getBlendShapes(traitGroupID){
    return this.blendshapeTraitsMap?.get(traitGroupID)?.collection
  }

  /**
   * 
   * @param {string} traitGroupID 
   * @param {string} traitID 
   * @returns {BlendShapeTrait | undefined}
   */
  getBlendShape(traitGroupID,traitID){
    return this.blendshapeTraitsMap?.get(traitGroupID)?.getTrait(traitID);
  }
}


export class BlendShapeGroup {
  trait
  name
  isBlendShapeGroup = true
  collection=[]
  cameraTarget=null
  collectionMap= null
  /**
   * @param {ModelTrait} modelTrait 
   * @param {BlendShapeGroupModelTraitData} options 
   */
  constructor( modelTrait, options){
    const {
        trait,
        name,
        collection,
        cameraTarget = modelTrait.traitGroup.cameraTarget || { distance:3 , height:1 }
    }= options;
    this.modelTrait = modelTrait;
    this.collectionID = modelTrait.collectionID;
    this.trait = trait;
    this.name = name;

    this.cameraTarget = cameraTarget;
    this.createCollection(collection);
  }
  /**
   * @param {BlendShapeTraitData[]} itemCollection 
   * @param {boolean} [replaceExisting] (default false)
   */
  createCollection(itemCollection, replaceExisting = false){
    if (replaceExisting) this.collection = [];

    getAsArray(itemCollection).forEach(item => {
      this.collection.push(new BlendShapeTrait(this, item))
    });
    this.collectionMap = new Map(this.collection.map(item => [item.id, item]));
  }

  getTrait(traitID){
    return this.collectionMap.get(traitID);
  }

  /**
   * @param {number} index 
   */
  getTraitByIndex(index){
    return this.collection[index];
  }

  getRandomTrait(){
    return this.collection.length > 0 ? 
      this.collection[Math.floor(Math.random() * this.collection.length)] : 
      null;
  }
}

export class BlendShapeTrait{
  id
  name
  fullThumbnail=undefined
  isBlendShape = true
  /**
   * @param {BlendShapeGroup} parentGroup 
   * @param {BlendShapeTraitData} options 
   */
  constructor(parentGroup,options){
      const {
          id,
          name,
          fullThumbnail
      }= options;

      if(!id){
        console.warn("BlendShapeTrait is missing id, parent trait: "+ parentGroup.trait)
      }
      if(!name){
        console.warn("BlendShapeTrait is missing name, parent trait: "+ parentGroup.trait)
      }

      this.parentGroup = parentGroup;
      this.collectionID = parentGroup.collectionID;
      this.id = id;
      this.fullThumbnail = fullThumbnail;
      this.name = name;
  }

  getGroupId(){
    return this.parentGroup.trait;
  }
}

class TextureTrait{
  /**
   * @param {TraitTexturesGroup} traitGroup 
   * @param {TextureCollectionItem} options 
   */
  constructor(traitGroup, options){
      const {
          id,
          directory,
          fullDirectory,
          name,
          thumbnail,
      }= options;
      this.traitGroup = traitGroup;
      this.collectionID = traitGroup.collectionID;

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
}
export class DecalTrait extends TextureTrait{
  /**
   * @type {string}
   */
  id
  /**
   * @type {string}
   */
  directory
  /**
   * @type {string | undefined}
   * */
  fullDirectory
  name
  thumbnail
  /**
   * @type {string|undefined}
   */
  fullThumbnail
  /**
   * @type {TraitTexturesGroup}
   */
  traitGroup
  /**
   * @param {TraitTexturesGroup} traitGroup 
   * @param {TextureCollectionItem} options 
   */
  constructor( traitGroup, options){
      super(traitGroup,options);  
    const {
            id,
            directory,
            fullDirectory,
            name,
            thumbnail,
        }= options;
      this.traitGroup = traitGroup;
      this.collectionID = traitGroup.collectionID;
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
}
class ColorTrait{
    constructor(traitGroup, options){
        const {
            id,
            value,
            name,
        }= options;

        this.traitGroup = traitGroup;
        this.collectionID = traitGroup.collectionID;
        this.id = id;
        this.name = name;
        this.value = value;
        
    }
}
class SelectedOption{
  constructor(traitModel, traitTexture, traitColor){
    this.traitModel = traitModel;
    this.traitTexture = traitTexture;
    this.traitColor = traitColor;
  }
}



class SolanaPurchaseAssets{
  constructor(solanapurchaseAssetsDefinition){
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

function createSolanaPurchaseCNFT(solanapurchaseAssetsDefinition) {
  if (solanapurchaseAssetsDefinition == null)
    return null
  if (!solanapurchaseAssetsDefinition?.merkleTreeAddress || !solanapurchaseAssetsDefinition?.collectionName  || !solanapurchaseAssetsDefinition?.depositAddress) {
    console.warn("solanaPurchaseCNFT defined incomplete in manifest, missing either merkleTreeAddress or collectionName or depositAddress, setting as null", )
    return null;
  }
  return new SolanaPurchaseAssets(solanapurchaseAssetsDefinition);

}


    