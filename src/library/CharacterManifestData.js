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
        requiredTraits,
        randomTraits,
        colliderTraits,
        lipSyncTraits,
        blinkerTraits,
        traitRestrictions,
        typeRestrictions,
        defaultCullingLayer,
        defaultCullingDistance,
        offset,
        vrmMeta,

        traits,
        textureCollections,
        colorCollections

      }= manifest;

      this.assetsLocation = assetsLocation;
      this.traitsDirectory = traitsDirectory;
      this.thumbnailsDirectory = thumbnailsDirectory;
      this.traitIconsDirectorySvg = traitIconsDirectorySvg;
      this.exportScale = exportScale || 1;
      this.animationPath = getAsArray(animationPath);
      this.requiredTraits = getAsArray(requiredTraits);
      this.randomTraits = getAsArray(randomTraits);
      this.initialTraits = [...new Set(this.requiredTraits.concat(this.randomTraits))];
      this.colliderTraits = getAsArray(colliderTraits);
      this.lipSyncTraits = getAsArray(lipSyncTraits);   
      this.blinkerTraits = getAsArray(blinkerTraits);   
      this.traitRestrictions = traitRestrictions  // get as array?
      this.typeRestrictions = typeRestrictions    // get as array?
      this.defaultCullingLayer = defaultCullingLayer
      this.defaultCullingDistance = defaultCullingDistance 
      this.offset = offset;
      this.vrmMeta = vrmMeta;

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

    getExportOptions(){
      return {
        // XXX Add this options to manifest data
        // mToonAtlasSize:2048,
        // mToonAtlasSizeTransp:2048,
        // stdAtlasSize:2048,
        // stdAtlasSizeTransp:2048,
        // exportStdAtlas:false,
        scale:this.exportScale||1,
        vrmMeta:this.vrmMeta
      }
    }

    getGroupModelTraits(){
      return this.modelTraits;
    }

    getInitialTraits(){
      return this.getRandomTraits(this.initialTraits);
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
      return selectedOptions;
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
          cullingDistance,
          cullingLayer,
          collection
        } = options;
        this.manifestData = manifestData;
        // add is removable?
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
          colorCollection,
          fullDirectory,
          fullThumbnail,
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
          this.fullDirectory = traitGroup.manifestData.getTraitsDirectory() + directory;
        }
      }
      
      this.name = name;
      this.thumbnail = thumbnail;
      this.fullThumbnail = fullThumbnail || traitGroup.manifestData.getTraitsDirectory() + thumbnail;

      this.cullHiddenMeshes = cullingDistance;
      this.cullingLayer = cullingLayer;
      this.type = type;

      this.targetTextureCollection = textureCollection ? traitGroup.manifestData.getTextureGroup(textureCollection) : null;
      this.targetColorCollection = colorCollection ? traitGroup.manifestData.getColorGroup(colorCollection) : null;

      if (this.targetTextureCollection)
        console.log(this.targetTextureCollection);
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
      this.fullThumbnail = traitGroup.manifestData.getTraitsDirectory() + thumbnail;
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
