import { getAsArray } from "./utils";

export class CharacterManifestData{
    constructor(manifest){
      const {
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
        typeRestrictions,
        defaultCullingLayer,
        defaultCullingDistance,
        offset,
        vrmMeta,
        traits,
        textureCollections,
        colorCollections,
        canDownload = true,
        downloadOptions = {}
      }= manifest;

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
      this.typeRestrictions = typeRestrictions;  
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
      
      const populateTypeRestrictions = () =>{
        if (this.typeRestrictions){
          for (const prop in this.typeRestrictions){
            const typeRestrictionValues = getAsArray(this.typeRestrictions[prop]);
            typeRestrictionValues.forEach(tr => {
              if (this.typeRestrictions[tr] == null){
                this.typeRestrictions[tr] = [];
              }
              if (this.typeRestrictions[tr].indexOf(prop) == -1){
                this.typeRestrictions[tr].push(prop);
              }
            });
          }
        }
      }
      populateTypeRestrictions();
      
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


      // create texture and color traits first
      this.textureTraits = [];
      this.textureTraitsMap = null;
      this.createTextureTraits(textureCollections);

      this.colorTraits = [];
      this.colorTraitsMap = null;
      this.createColorTraits(colorCollections);

      this.modelTraits = [];
      this.modelTraitsMap = null;
      this.createModelTraits(traits);
    }
    appendManifestData(manifestData, replaceExisting){
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

    


    // Given an array of traits, saves an array of TraitModels
    createModelTraits(modelTraits, replaceExisting = false){
      if (replaceExisting) this.modelTraits = [];

      getAsArray(modelTraits).forEach(traitObject => {
        this.modelTraits.push(new TraitModelsGroup(this, traitObject))
      });

      this.modelTraitsMap = new Map(this.modelTraits.map(item => [item.trait, item]));

      // Updates all restricted traits for each group models
      this.modelTraits.forEach(modelTrait => {
        modelTrait.restrictedTraits.forEach(groupTraitID => {
          const groupModel = this.getModelGroup(groupTraitID);
          console.log(groupModel);
          if (groupModel){
            groupModel.addTraitRestriction(modelTrait.trait);
          }
        });
      });
    }

    createTextureTraits(textureTraits, replaceExisting = false){
      if (replaceExisting) this.textureTraits = [];

      getAsArray(textureTraits).forEach(traitObject => {
        this.textureTraits.push(new TraitTexturesGroup(this, traitObject))
      });

      this.textureTraitsMap = new Map(this.textureTraits.map(item => [item.trait, item]));
    }

    createColorTraits(colorTraits, replaceExisting = false){
      if (replaceExisting) this.colorTraits = [];

      getAsArray(colorTraits).forEach(traitObject => {
        this.colorTraits.push(new TraitColorsGroup(this, traitObject))
      });

      this.colorTraitsMap = new Map(this.colorTraits.map(item => [item.trait, item]));
    }

}


// Must be created AFTER color collections and texture collections have been created
class TraitModelsGroup{
    constructor(manifestData, options){
        const {
          trait,
          name,
          iconSvg,
          cameraTarget = { distance:3 , height:1 },
          cullingDistance, // can be undefined; if undefined, will use default from manifestData
          cullingLayer, // can be undefined; if undefined, will use default from manifestData
          collection,
          restrictedTraits = [],
          restrictedTypes = []
        } = options;
        this.manifestData = manifestData;

        this.isRequired = manifestData.requiredTraits.indexOf(trait) !== -1;
        this.trait = trait;
        this.name = name;
        this.iconSvg = iconSvg;
        this.fullIconSvg = manifestData.getTraitIconsDirectorySvg() + iconSvg;

        this.restrictedTraits = restrictedTraits;
        this.restrictedTypes = restrictedTypes;

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
    addTraitRestriction(traitID){
      if (this.restrictedTraits.indexOf(traitID) == -1){
        this.restrictedTraits.push(traitID)
      }
    }

    createCollection(itemCollection, replaceExisting = false){
      if (replaceExisting) this.collection = [];

      getAsArray(itemCollection).forEach(item => {
        this.collection.push(new ModelTrait(this, item))
      });
      this.collectionMap = new Map(this.collection.map(item => [item.id, item]));
    }

    getCustomTrait(url){
      return new ModelTrait(this, {directory:url, fullDirectory:url, id:"_custom", name:"Custom"})
    }

    getTrait(traitID){
      return this.collectionMap.get(traitID);
    }

    getTraitByIndex(index){
      return this.collection[index];
    }

    getRandomTrait(){
      // return SelectedTrait
      // const traitModel = this.collection[Math.floor(Math.random() * this.collection.length)];
      return this.collection.length > 0 ? 
        this.collection[Math.floor(Math.random() * this.collection.length)] : 
        null;
      //traitModel
      // return new SelectedTrait()
      // return 
    }

    getCollection(){
      return this.collection;
    }


}
class TraitTexturesGroup{
  constructor(manifestData, options){
    const {
        trait,
        collection
    }= options;
    this.manifestData = manifestData;
    this.trait = trait;

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

  getTraitByIndex(index){
    return this.collection[index];
  }

  getRandomTrait(){
    return this.collection.length > 0 ? 
      this.collection[Math.floor(Math.random() * this.collection.length)] : 
      null;
  }
}
class ModelTrait{
  blendshapeTraits = []; 
  blendshapeTraitsMap = new Map();
  constructor(traitGroup, options){
      const {
          id,
          directory,
          name,
          thumbnail,
          cullingDistance,
          cullingLayer,
          type = [],
          textureCollection,
          blendshapeTraits,
          colorCollection,
          fullDirectory,
          fullThumbnail,
      }= options;
      this.manifestData = traitGroup.manifestData;
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

    const groupTraitID = targetModelTrait.traitGroup.trait;
    if (this.traitGroup.restrictedTraits.indexOf(groupTraitID) != -1)
      return true;

    if (this.type.length > 0 && this.manifestData.restrictedTypes > 0){

      const haveCommonValue = (arr1, arr2) => {
        if (arr1 == null || arr2 == null)
          return false;
        for (let i = 0; i < arr1.length; i++) {
          if (arr2.includes(arr1[i])) {
            return true; // Found a common value
          }
        }
        return false; // No common value found
      }

      const restrictedTypes = this.manifestData.restrictedTypes;
      const traitTypes = getAsArray(this.type);
      traitTypes.forEach(type => {
        return haveCommonValue(restrictedTypes[type], traitTypes)
      });
    }
    return false;
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



 const getRestrictions = () => {

    const traitRestrictions = templateInfo.traitRestrictions // can be null
    const typeRestrictions = {};

    for (const prop in traitRestrictions){

      // create the counter restrcitions traits
      getAsArray(traitRestrictions[prop].restrictedTraits).map((traitName)=>{

        // check if the trait restrictions exists for the other trait, if not add it
        if (traitRestrictions[traitName] == null) traitRestrictions[traitName] = {}
        // make sure to have an array setup, if there is none, create a new empty one
        if (traitRestrictions[traitName].restrictedTraits == null) traitRestrictions[traitName].restrictedTraits = []

        // finally merge existing and new restrictions
        traitRestrictions[traitName].restrictedTraits = [...new Set([
          ...traitRestrictions[traitName].restrictedTraits ,
          ...[prop]])]  // make sure to add prop as restriction
      })

      // do the same for the types
      getAsArray(traitRestrictions[prop].restrictedTypes).map((typeName)=>{
        //notice were adding the new data to typeRestrictions and not trait
        if (typeRestrictions[typeName] == null) typeRestrictions[typeName] = {}
        //create the restricted trait in this type
        if (typeRestrictions[typeName].restrictedTraits == null) typeRestrictions[typeName].restrictedTraits = []

        typeRestrictions[typeName].restrictedTraits = [...new Set([
          ...typeRestrictions[typeName].restrictedTraits ,
          ...[prop]])]  // make sure to add prop as restriction
      })
    }

    // now merge defined type to type restrictions
    for (const prop in templateInfo.typeRestrictions){
      // check if it already exsits
      if (typeRestrictions[prop] == null) typeRestrictions[prop] = {}
      if (typeRestrictions[prop].restrictedTypes == null) typeRestrictions[prop].restrictedTypes = []
      typeRestrictions[prop].restrictedTypes = [...new Set([
        ...typeRestrictions[prop].restrictedTypes ,
        ...getAsArray(templateInfo.typeRestrictions[prop])])]  

      // now that we have setup the type restrictions, lets counter create for the other traits
      getAsArray(templateInfo.typeRestrictions[prop]).map((typeName)=>{
        // prop = boots
        // typeName = pants
        if (typeRestrictions[typeName] == null) typeRestrictions[typeName] = {}
        if (typeRestrictions[typeName].restrictedTypes == null) typeRestrictions[typeName].restrictedTypes =[]
        typeRestrictions[typeName].restrictedTypes = [...new Set([
          ...typeRestrictions[typeName].restrictedTypes ,
          ...[prop]])]  // make sure to add prop as restriction
      })
    }
  }

    // _filterRestrictedOptions(options){
    //     let removeTraits = [];
    //     for (let i =0; i < options.length;i++){
    //       const option = options[i];
          
    //      //if this option is not already in the remove traits list then:
    //      if (!removeTraits.includes(option.trait.name)){
    //         const typeRestrictions = restrictions?.typeRestrictions;
    //         // type restrictions = what `type` cannot go wit this trait or this type
    //         if (typeRestrictions){
    //           getAsArray(option.item?.type).map((t)=>{
    //             //combine to array
    //             removeTraits = [...new Set([
    //               ...removeTraits , // get previous remove traits
    //               ...findTraitsWithTypes(getAsArray(typeRestrictions[t]?.restrictedTypes)),  //get by restricted traits by types coincidence
    //               ...getAsArray(typeRestrictions[t]?.restrictedTraits)])]  // get by restricted trait setup
    
    //           })
    //         }
    
    //         // trait restrictions = what `trait` cannot go wit this trait or this type
    //         const traitRestrictions = restrictions?.traitRestrictions;
    //         if (traitRestrictions){
    //           removeTraits = [...new Set([
    //             ...removeTraits,
    //             ...findTraitsWithTypes(getAsArray(traitRestrictions[option.trait.name]?.restrictedTypes)),
    //             ...getAsArray(traitRestrictions[option.trait.name]?.restrictedTraits),
    
    //           ])]
    //         }
    //       }
    //     }
    
    //     // now update uptions
    //     removeTraits.forEach(trait => {
    //       let removed = false;
    //       updateCurrentTraitMap(trait, null);
          
    //       for (let i =0; i < options.length;i++){
    //         // find an option with the trait name 
    //         if (options[i].trait?.name === trait){
    //           options[i] = {
    //             item:null,
    //             trait:templateInfo.traits.find((t) => t.name === trait)
    //           }
    //           removed = true;
    //           break;
    //         }
    //       }
    //       // if no option setup was found, add a null option to remove in case user had it added before
    //       if (!removed){
    //         options.push({
    //           item:null,
    //           trait:templateInfo.traits.find((t) => t.name === trait)
    //         })
    //       }
    //     });
       
    //     return options;
    // }

        // const findTraitsWithTypes = (types) => {
        //   const typeTraits = [];
        //   for (const prop in avatar){
        //     for (let i = 0; i < types.length; i++){
        //       const t = types[i]
            
        //       if (avatar[prop].traitInfo?.type?.includes(t)){
        //         typeTraits.push(prop);
        //         break;
        //       }
        //     }
        //   }
        //   return typeTraits;
        // }
 
    