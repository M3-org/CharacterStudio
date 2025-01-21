import { getAsArray } from "./utils";
import { ManifestRestrictions } from "./manifestRestrictions";
import { OwnedTraitIDs } from "./ownedTraitIDs";
import { WalletCollections } from "./walletCollections";

/**
 * @typedef {import('./manifestRestrictions').TraitRestriction} TraitRestriction
 */

/**
 * @typedef {Object} TextureCollectionItem
 * @property {string} id
 * @property {string} name
 * @property {string} directory
 * @property {string} [fullDirectory]
 * @property {string} [thumbnail]
 */

/**
 * @typedef {Object} TextureCollection
 * @property {string} trait
 * @property {string} type
 * @property {TextureCollectionItem[]} collection
 * 
 */

export class CharacterManifestData{
    constructor(manifest, ownedTraits = null){
      const {
        chainName,
        collectionLockID,
        dataSource,
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

      // chainName:c.chainName || "ethereum",
      // dataSource:c.dataSource || "attributes"
      this.walletCollections = new WalletCollections();

      this.chainName = chainName;
      this.dataSource = dataSource;
      this.collectionLockID = collectionLockID;
      if (locked == null){
        this.locked = collectionLockID != null;
      }
      else{
        this.locked = locked;
      }

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
      this.createTextureTraits(textureCollections, false, ownedTraits);

      this.decalTraits = [];
      this.decalTraitsMap = null;
      this.createDecalTraits(decalCollections);

      this.colorTraits = [];
      this.colorTraitsMap = null;
      this.createColorTraits(colorCollections, false, ownedTraits);

      this.modelTraits = [];
      this.modelTraitsMap = null;
      this.createModelTraits(traits, false, ownedTraits);
      this.manifestRestrictions._init()
      

      this.unlockWalletOwnedTraits();
    }

    isNFTLocked(){
      return this.locked;
    }

    unlockWalletOwnedTraits(testWallet = null){
      this.walletCollections.getTraitsFromCollection(this.collectionLockID, this.chainName, this.dataSource, testWallet)
            .then(userOwnedTraits=>{

              const ownedIDs = userOwnedTraits.ownedIDs || [];
              const ownedTraits = userOwnedTraits.ownedTraits || {};

              this.modelTraits.forEach(groupModelTraits => {
                groupModelTraits.unlockTraits(ownedIDs)
              });

              for (const trait in ownedTraits){
                this.unlockTraits(trait, ownedTraits[trait]);
              }
            })
    }
    

    appendManifestData(manifestData, replaceExisting){
      console.log("append", manifestData);
      if (manifestData.collectionLockID != null){
        console.log("missing to lock append manifest data");
      }
      manifestData.textureTraits.forEach(newTextureTraitGroup => {
        const textureGroup = this.getTextureGroup(newTextureTraitGroup.trait)
        if (textureGroup != null){
          // append
          textureGroup.appendCollection(newTextureTraitGroup,replaceExisting)
        }
        else{
          // create
          //if (this.allowAddNewTraitGroups)
          this.textureTraits.push(newTextureTraitGroup)
          this.textureTraitsMap.set(newTextureTraitGroup.trait, newTextureTraitGroup);
        }
      });

      manifestData.colorTraits.forEach(newColorTraitGroup => {
        const colorGroup = this.getColorGroup(newColorTraitGroup.trait)
        if (colorGroup != null){
          // append
          colorGroup.appendCollection(newColorTraitGroup,replaceExisting)
        }
        else{
          // create
          //if (this.allowAddNewTraitGroups)
          this.colorTraits.push(newColorTraitGroup)
          this.colorTraitsMap.set(newColorTraitGroup.trait, newColorTraitGroup);
        }
      });

      manifestData.modelTraits.forEach(newModelTraitGroup => {
        const modelGroup = this.getModelGroup(newModelTraitGroup.trait)
        if (modelGroup != null){
          // append
          modelGroup.appendCollection(newModelTraitGroup,replaceExisting)
        }
        else{
          // create
          //if (this.allowAddNewTraitGroups)
          this.modelTraits.push(newModelTraitGroup)
          this.modelTraitsMap.set(newModelTraitGroup.trait, newModelTraitGroup);
        }
      });
      
      console.log(manifestData);
    }

    getExportOptions(){
      return this.downloadOptions;
    }

    getGroupModelTraits(){
      return this.modelTraits;
    }

    getInitialTraits(){
      return this.getRandomTraits(this.initialTraits);
    }
    getAllTraits(){
      return this.getRandomTraits(this.allTraits);
    }

    /**
     * Assumes the trait options have unique IDs;
     * @param {string} optionID
     */
    getTraitOptionById(optionID){
      return this.getAllTraitOptions().find((option)=>option.id == optionID);
    }
    /**
     * Get trait options by type;
     * @param {string} type
    */
    getTraitOptionsByType(type){
      return this.getAllTraitOptions().filter((option)=>option.type == type);
    }
    /**
     * Returns all ModelTrait items in an array.
     */
    getAllTraitOptions(){
      return this.modelTraits.map((trait)=>trait?.getCollection()).flat();
    }

    getAllBlendShapeTraits(){
      return this.modelTraits.map(traitGroup => traitGroup.getCollection()).flat().map((c)=>c.blendshapeTraits).flat().map((c)=>c?.collection).flat().filter((c)=>!!c);
    }
    isColliderRequired(groupTraitID){
      if (this.colliderTraits.indexOf(groupTraitID) != -1)
        return true;
      return false;
    }
    isLipsyncTrait(groupTraitID){
      if (this.lipSyncTraits.indexOf(groupTraitID) != -1)
        return true;
      return false;
    }

    async getNFTraitOptionsFromURL(url, ignoreGroupTraits){
      const nftTraits = await this._fetchJson(url);
      return this.getNFTraitOptionsFromObject(nftTraits, ignoreGroupTraits)
    }
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

    getRandomTraits(optionalGroupTraitIDs){
      const selectedOptions = []
      const searchArray = optionalGroupTraitIDs || this.randomTraits;
      searchArray.forEach(groupTraitID => {
        const traitSelectedOption = this.getRandomTrait(groupTraitID);
        if (traitSelectedOption)
          selectedOptions.push(traitSelectedOption)
      });
      return this._filterTraitOptions(selectedOptions);
    }

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



    async _fetchJson(location) {
      const response = await fetch(location)
      const data = await response.json()
      return data
    }

    getTraitOption(groupTraitID, traitID){
      const trait = this.getModelTrait(groupTraitID, traitID);
      if (trait){
        const traitTexture = trait.targetTextureCollection?.getRandomTrait();
        const traitColor = trait.targetColorCollection?.getRandomTrait();
        return new SelectedOption(trait,traitTexture, traitColor);
      }
      return null;
    }

    // XXX filtering will only work now when multiple options are selected
    _filterTraitOptions(selectedOptions){
      const finalOptions = []
      const filteredOptions = []
      for (let i = 0 ; i < selectedOptions.length ; i++){
        const trait = selectedOptions[i].traitModel;
        let isRestricted = false;
        
        for (let j =0; j < finalOptions.length;j++){
          const traitCompare = finalOptions[j].traitModel;
          isRestricted = trait.isRestricted(traitCompare);
          if (isRestricted)
            break;
        }
        if (!isRestricted)
          finalOptions.push(selectedOptions[i])
        else
          filteredOptions.push(selectedOptions[i])
      }
      if (filteredOptions.length > 0){
        console.log("options were filtered to fullfill restrictions: ", filteredOptions);
      }
      return finalOptions;
    }

    getCustomTraitOption(groupTraitID, url){
      const trait = this.getCustomModelTrait(groupTraitID, url);
      if (trait){
        return new SelectedOption(trait,null,null);
      }
      return null;
    }

    getCustomModelTrait(groupTraitID, url){
      return this.getModelGroup(groupTraitID)?.getCustomTrait(url);
    }

    // model traits
    getModelTrait(groupTraitID, traitID){
      return this.getModelGroup(groupTraitID)?.getTrait(traitID);
    }
    // returns all traits from given group trait
    getModelTraits(groupTraitID){
      const modelGroup = this.getModelGroup(groupTraitID);
      if (modelGroup){
        return modelGroup.getCollection();
      }
      else{
        console.warn("No model group with name " + groupTraitID);
        return null;
      }
    }
    unlockTraits(groupTraitID, traitIDs){
      const modelGroup = this.getModelGroup(groupTraitID);
      if (modelGroup){
        modelGroup.unlockTraits(traitIDs);
      }
      else{
        console.warn("No model group with name " + groupTraitID);
      }
    }
    getModelGroup(groupTraitID){
      return this.modelTraitsMap.get(groupTraitID);
    }

    // textures
    getTextureTrait(groupTraitID, traitID){
      return this.getTextureGroup(groupTraitID)?.getTrait(traitID);
    }
    getTextureGroup(groupTraitID){
      return this.textureTraitsMap.get(groupTraitID);
    }

    // decals
    getDecalTrait(groupTraitID, traitID){
      return this.getDecalGroup(groupTraitID)?.getTrait(traitID);
    }
    getDecalGroup(decalGroupTraitId){
      return this.decalTraitsMap.get(decalGroupTraitId);
    }

    // colors
    getColorTrait(groupTraitID, traitID){
      return this.getColorGroup(groupTraitID)?.getTrait(traitID);
    }
    getColorGroup(groupTraitID){
      return this.colorTraitsMap.get(groupTraitID);
    }



    // get directories
    getTraitsDirectory(){
      let result = (this.assetsLocation || "") + (this.traitsDirectory || "");
      if (!result.endsWith("/")&&!result.endsWith("\\"))
        result += "/";
      return result;
    }
    getThumbnailsDirectory(){
      let result = (this.assetsLocation || "") + (this.thumbnailsDirectory || "");
      if (!result.endsWith("/")&&!result.endsWith("\\"))
        result += "/";
      return result;
    }
    getTraitIconsDirectorySvg(){
      let result = (this.assetsLocation || "") + (this.traitIconsDirectorySvg || "");
      if (!result.endsWith("/")&&!result.endsWith("\\"))
        result += "/";
      return result;
    }
    getAssetsDirectory(){
      let result = (this.assetsLocation || "");
      if (!result.endsWith("/")&&!result.endsWith("\\"))
        result += "/";
      return result;
    }

    getDecalsDirectory(){
      let result = (this.assetsLocation || "") + (this.decalDirectory || "");
      if (!result.endsWith("/")&&!result.endsWith("\\"))
        result += "/";
      return result;
    }
    


    // Given an array of traits, saves an array of TraitModels
    createModelTraits(modelTraits, replaceExisting = false, ownedTraits = null){
      if (replaceExisting) this.modelTraits = [];
      let hasTraitWithDecals = false
      getAsArray(modelTraits).forEach(traitObject => {
        const group = new TraitModelsGroup(this, traitObject, ownedTraits)
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

    createTextureTraits(textureTraits, replaceExisting = false, ownedTraits = null){
      if (replaceExisting) this.textureTraits = [];

      getAsArray(textureTraits).forEach(traitObject => {
        this.textureTraits.push(new TraitTexturesGroup(this, traitObject, ownedTraits))
      });

      this.textureTraitsMap = new Map(this.textureTraits.map(item => [item.trait, item]));
    }
    /**
     * @param {TextureCollection[]} decalTraitGroups 
     * @param {boolean} [replaceExisting] 
     */
    createDecalTraits(decalTraitGroups, replaceExisting = false){
      if (replaceExisting) this.decalTraits = [];

      getAsArray(decalTraitGroups).forEach(traitObject => {
        this.decalTraits.push(new DecalTextureGroup(this, traitObject))
      });

      this.decalTraitsMap = new Map(this.decalTraits.map(item => [item.trait, item]));
    }

    createColorTraits(colorTraits, replaceExisting = false, ownedTraits = null){
      if (replaceExisting) this.colorTraits = [];

      getAsArray(colorTraits).forEach(traitObject => {
        this.colorTraits.push(new TraitColorsGroup(this, traitObject, ownedTraits))
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
   * @type {OwnedTraitIDs}
   */
    ownedTraits
  /**
   * @type {TraitRestriction|undefined}
   */
  restrictions

  constructor(manifestData, options, ownedTraits = null){
        const {
          locked,
          trait,
          name,
          iconSvg,
          cameraTarget = { distance:3 , height:1 },
          cullingDistance, // can be undefined; if undefined, will use default from manifestData
          cullingLayer, // can be undefined; if undefined, will use default from manifestData
          collection,
        } = options;
        this.manifestData = manifestData;

        
        this.locked = locked == null ? manifestData.locked : locked;
       
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
        if (ownedTraits == null){
          this.createCollection(collection);
        }
        else{
          this.createCollection(collection, false, ownedTraits.getOwnedTraitIDs(trait));
        }
        
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

    createCollection(itemCollection, replaceExisting = false, ownedTraitsArray = null){
      if (replaceExisting) this.collection = [];

      if (ownedTraitsArray == null){
        getAsArray(itemCollection).forEach(item => {
          this.collection.push(new ModelTrait(this, item))
        });
      }
      else{
        getAsArray(itemCollection).forEach(item => {
          if (ownedTraitsArray.includes(item.id)){
            this.collection.push(new ModelTrait(this, item))
          }
        });
      }
      this.collectionMap = new Map(this.collection.map(item => [item.id, item]));
    }

    getCustomTrait(url){
      return new ModelTrait(this, {directory:url, fullDirectory:url, id:"_custom", name:"Custom"})
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
      const collection = this.getCollection(lockFilter);
      return collection.length > 0 ? 
        collection[Math.floor(Math.random() * collection.length)] :
        null;
    }

    getCollection(lockFilter = true){
      if (lockFilter){
        const filteredCollection = this.collection.filter((trait)=>trait.locked === false)
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
   * @param {OwnedTraitIDs} ownedTraits 
   */
  constructor(manifestData, options, ownedTraits = null){
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
    this.collectionMap = null;

    if (ownedTraits == null){
      this.createCollection(collection);
    }
    else{
      this.createCollection(collection, false, ownedTraits.getOwnedTraitIDs[trait]);
    }

    
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
  createCollection(itemCollection, replaceExisting = false, ownedTraitsArray = null){
    if (replaceExisting) this.collection = [];

    if (ownedTraitsArray == null){
      getAsArray(itemCollection).forEach(item => {
        this.collection.push(new TextureTrait(this, item))
      });
    }
    else{
      getAsArray(itemCollection).forEach(item => {
        if (ownedTraitsArray.includes(item.id)){
          this.collection.push(new TextureTrait(this, item))
        }
      });
    }
    this.collectionMap = new Map(this.collection.map(item => [item.id, item]));
  }

  getTrait(traitID){
    return this.collectionMap.get(traitID);
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
   * @param {OwnedTraitIDs} ownedTraits 
   */
  constructor(manifestData, options, ownedTraits = null){
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
    this.collectionMap = null;
    if (ownedTraits == null){
      this.createCollection(collection);
    }
    else{
      this.createCollection(collection, false, ownedTraits.getOwnedTraitIDs[trait]);
    }
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

  createCollection(itemCollection, replaceExisting = false, ownedTraitsArray = null){
    if (replaceExisting) this.collection = [];
    if (ownedTraitsArray == null){
      getAsArray(itemCollection).forEach(item => {
        this.collection.push(new DecalTrait(this, item))
      });
    }
    else{
      getAsArray(itemCollection).forEach(item => {
        if (ownedTraitsArray.includes(item.id)){
          this.collection.push(new DecalTrait(this, item))
        }
      });
    }
    this.collectionMap = new Map(this.collection.map(item => [item.id, item]));
  }

  getTrait(traitID){
    return this.collectionMap.get(traitID);
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
  constructor(manifestData, options, ownedTraits = null){
    const {
        trait,
        collection
    }= options;
    this.manifestData = manifestData;
    this.trait = trait;

    this.collection = [];
    this.collectionMap = null;

    if (ownedTraits == null){
      this.createCollection(collection);
    }
    else{
      this.createCollection(collection, false, ownedTraits[trait] || []);
    }
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
  createCollection(itemCollection, replaceExisting = false, ownedTraitsArray = null){
    if (replaceExisting) this.collection = [];

    if (ownedTraitsArray == null){
      getAsArray(itemCollection).forEach(item => {
        this.collection.push(new ColorTrait(this, item))
      });
    }
    else{
      getAsArray(itemCollection).forEach(item => {
        if (ownedTraitsArray.includes(item.id)){
          this.collection.push(new ColorTrait(this, item))
        }
      });
    }
    this.collectionMap = new Map(this.collection.map(item => [item.id, item]));
  }

  getTrait(traitID){
    return this.collectionMap.get(traitID);
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
          restrictedItems
      }= options;
      this.manifestData = traitGroup.manifestData;
      
      this.locked = locked == null ? traitGroup.locked : locked;

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

    