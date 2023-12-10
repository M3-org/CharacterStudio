import * as THREE from "three"
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader"
import { AnimationManager } from "./animationManager"
import { VRMLoaderPlugin, VRMUtils } from "@pixiv/three-vrm";
import { getAsArray, disposeVRM, renameVRMBones, addModelData } from "./utils";
import { saveVRMCollidersToUserData } from "./load-utils";
import { cullHiddenMeshes } from "./utils";

export class CharacterManager {
    constructor(options){
      this._start(options);
    }

    async _start(options){
      const{
        parentModel = null,
        createAnimationManager = false,
        manifestURL = null,
      }= options;

      this.parentModel = parentModel;
      
      if (manifestURL)
        this.manifest = await this.loadManifest(manifestURL, options)

      this.manifestData = null;
      this.avatar = {};   // Holds information of traits within the avatar
      this.traitLoadManager = new TraitLoadingManager();
    }



    getGroupTraits(){
      if (this.manifestData){
        return this.manifestData.getGroupModelTraits();
      }
    }

    // returns wether or not the trait group can be removed
    isTraitGroupRequired(groupTraitID){
      const groupTrait = this.manifestData.getModelTraits(groupTraitID)
      if (groupTrait?.isRequired){
        return true;
      }
      return false;
    }
    
    // manifest data requests
    getTraits(groupTraitID){
      if (this.manifestData){
        return this.manifestData.getModelTraits(groupTraitID);
      }
      else{
        console.warn("No manifest file has been loaded, please load it before trait models.")
        return null;
      }
    }

    // maybe load and return an array with all the icons?

    setParentModel(model){
        this.parentModel = model;
    }

    async loadRandomTraits(){
      console.log("get random");
      if (this.manifestData){
        this._loadTraits(this.manifestData.getRandomTraits());
      }
      else{
        console.error ("No manifest was loaded, random traits cannot be loaded.")
      }
    }

    async loadTrait(groupTraitID, traitID){
      const selectedTrait = this.manifestData.getTrait(groupTraitID, traitID);
      if (selectedTrait)
        this._loadTraits(getAsArray(selectedTrait));
    }

    removeTrait(groupTraitID, forceRemove = false){
      if (this.isTraitGroupRequired(groupTraitID) && !forceRemove){
        console.warn(`No trait with name: ${ groupTraitID } is not removable.`)
        return;
      }

      const groupTrait = this.manifestData.getModelGroup(groupTraitID);
      
      if (groupTrait){
        const itemData = new LoadedData({traitGroup:groupTrait, traitModel:null})
        this._addLoadedData(itemData);
        cullHiddenMeshes(this.avatar);
      }
      else{
        console.warn(`No trait with name: ${ groupTraitID } was found.`)
      }
    }

    async loadCustom(url){

    }
    async loadManifest(url, options){
      const {
        createAnimationManager = false
      } = options

      this.manifest = await this._fetchManifest(url)
      
      if (this.manifest){
        this.manifestData = new ManifestData(this.manifest);
        console.log(this.manifestData);
        this.traitLoadManager.setBaseDirectory((this.manifest.assetsLocation || "") + (this.manifest.traitsDirectory || ""));
        this.animationManager = createAnimationManager ?  await this._createAnimationManager() : null;
      }
    }
    // 
    async _loadTraits(options){
      console.log(options)
      this.traitLoadManager.loadTraitOptions(this.manifestData.getTraitsDirectory(), getAsArray(options)).then(loadedData=>{
        console.log("loaded", loadedData);
          loadedData.forEach(itemData => {
              this._addLoadedData(itemData)
          });
          cullHiddenMeshes(this.avatar);
      })
     
    }



    async _createAnimationManager(){

      const animationManager = new AnimationManager(this.manifest.offset)
      const animationPaths = getAsArray(this.manifest.animationPath);
      animationManager.storeAnimationPaths(animationPaths, this.manifest.assetsLocation || "");
      await animationManager.loadAnimation(animationPaths, animationPaths[0].endsWith('.fbx'), this.manifest.assetsLocation || "")
      return animationManager
    }

    async _fetchManifest(location) {
        const response = await fetch(location)
        const data = await response.json()
        return data
    }
    _setupWireframeMaterial(mesh){
      // Set Wireframe material with random colors for each material the object has
      mesh.origMat = mesh.material;

      const getRandomColor = ()  => {
        const minRGBValue = 0.1; // Minimum RGB value to ensure colorful colors
        const r = minRGBValue + Math.random() * (1 - minRGBValue);
        const g = minRGBValue + Math.random() * (1 - minRGBValue);
        const b = minRGBValue + Math.random() * (1 - minRGBValue);
        return new THREE.Color(r, g, b);
      }

      const debugMat = new THREE.MeshBasicMaterial( {
                    color: getRandomColor(),
                    wireframe: true,
        wireframeLinewidth:0.2
                } );

      const origMat = mesh.material;
      mesh.setDebugMode = (debug) => { 
        if (debug){
          if (mesh.material.length){
            mesh.material[0] = debugMat;
            mesh.material[1] = debugMat;
          }
          else{
            mesh.material = debugMat;
          }
        }
        else{
          mesh.material = origMat;
        }
      }

      // if (debugMode){
      //   mesh.setDebugMode(true);
      // }
      
    }

    _VRMBaseSetup(m, item, trait, textures, colors){
      let vrm = m.userData.vrm;
      // XXX now we are saving for all cases
      saveVRMCollidersToUserData(m);
      renameVRMBones(vrm);

      this._modelBaseSetup(vrm, item, trait, textures, colors);

      // Rotate model 180 degrees
      if (vrm.meta?.metaVersion === '0'){
        vrm.scene.traverse((child) => {
          if (child.isSkinnedMesh) {
          
              VRMUtils.rotateVRM0( vrm );
              console.log("Loaded VRM0 file ", vrm);
              for (let i =0; i < child.skeleton.bones.length;i++){
                child.skeleton.bones[i].userData.vrm0RestPosition = { ... child.skeleton.bones[i].position }
              }
              child.userData.isVRM0 = true;
          }
        })
      }

      return vrm;
    }

    _modelBaseSetup(model, item, trait, textures, colors){

      const meshTargets = [];
      const cullingIgnore = getAsArray(item.cullingIgnore)
      const cullingMeshes = [];

      // Mesh target setup section
      // XXX Separate from this part
      if (item.meshTargets){
        getAsArray(item.meshTargets).map((target) => {
          const mesh = model.scene.getObjectByName ( target )
          if (mesh?.isMesh) meshTargets.push(mesh);
        })
      }

      model.scene.traverse((child) => {
        
        // mesh target setup secondary swection
        if (!item.meshTargets && child.isMesh) meshTargets.push(child);

        // basic setup
        child.frustumCulled = false
        if (child.isMesh) {

          // XXX Setup MToonMaterial for shader

          this._setupWireframeMaterial(child);

          // if (child.material.length){
          //   effectManager.setCustomShader(child.material[0]);
          //   effectManager.setCustomShader(child.material[1]);
          // }
          // else{
          //   effectManager.setCustomShader(child.material);
          // }

          // if a mesh is found in name to be ignored, dont add it to target cull meshes
          if (cullingIgnore.indexOf(child.name) === -1)
            cullingMeshes.push(child)
          
        }
      })

      const templateInfo = this.manifest;
      // culling layers setup section
      addModelData(model, {
        cullingLayer: 
          item.cullingLayer != null ? item.cullingLayer: 
          trait.cullingLayer != null ? trait.cullingLayer: 
          templateInfo.defaultCullingLayer != null?templateInfo.defaultCullingLayer: -1,
        cullingDistance: 
          item.cullingDistance != null ? item.cullingDistance: 
          trait.cullingDistance != null ? trait.cullingDistance:
          templateInfo.defaultCullingDistance != null ? templateInfo.defaultCullingDistance: null,
        maxCullingDistance:
          item.maxCullingDistance != null ? item.maxCullingDistance: 
          trait.maxCullingDistance != null ? trait.maxCullingDistance:
          templateInfo.maxCullingDistance != null ? templateInfo.maxCullingDistance: Infinity,
        cullingMeshes
      })  

      // once the setup is done, assign texture to meshes
      meshTargets.map((mesh, index)=>{
          
        if (textures){
          const txt = textures[index] || textures[0]
          if (txt != null){
            //const mat = mesh.material.length ? mesh.material[0] : 
            mesh.material[0].map = txt
            mesh.material[0].shadeMultiplyTexture = txt
          }
        }
        if (colors){
          const col = colors[index] || colors[0]
          if (col != null){
            mesh.material[0].uniforms.litFactor.value = col
            mesh.material[0].uniforms.shadeColorFactor.value = new THREE.Color( col.r*0.8, col.g*0.8, col.b*0.8 )
          }
        }
      })
    }

    _applyManagers(vrm){
      const templateInfo = this.manifest;
        // Assign LipsSync to manifest defined VRMs
        // if (getAsArray(templateInfo.lipSyncTraits).indexOf(traitData.trait) !== -1)
        //   setLipSync(new LipSync(vrm));
  
        // // Assign Blinker traits to manifest defined VRMs
        // if (getAsArray(templateInfo.blinkerTraits).indexOf(traitData.trait) !== -1)
        //   blinkManager.addBlinker(vrm)
  
        // // Add to look at manager
        // lookatManager.addVRM(vrm)

        // Animate this VRM 
        if (this.animationManager)
          this.animationManager.startAnimation(vrm)
    }

    _displayModel(model){
      if(model) {
        // call transition
        const m = model.scene;
        //m.visible = false;
        // add the now model to the current scene
        
        this.parentModel.add(m)
        //animationManager.update(); // note: update animation to prevent some frames of T pose at start.


        // setTimeout(() => {
        //   // update the joint rotation of the new trait
        //   const event = new Event('mousemove');
        //   event.x = mousePosition.x;
        //   event.y = mousePosition.y;
        //   window.dispatchEvent(event);

        //   m.visible = true;

        //   // play transition effect
        //   if (effectManager.getTransitionEffect('switch_item')) {
        //     effectManager.playSwitchItemEffect();
        //     // !isMute && playSound('switchItem');
        //   }
        //   else {
        //     effectManager.playFadeInEffect();
        //   } 
        // }, effectManager.transitionTime)
      }
    }

    _positionModel(model){
      const templateInfo = this.manifest;
      const scale = templateInfo.exportScale || 1;
        model.scene.scale.set(scale,scale,scale);

      // Move depending on manifest definition
      // const offset = templateInfo.offset;
      // if (offset != null)
      //   model.scene.position.set(offset[0],offset[1],offset[2]);
    }

    _addLoadedData(itemData){
      const {
          traitGroup,
          traitModel,
          textureTrait,
          colorTrait,
          models,
          textures,
          colors
      } = itemData;
      console.log(itemData);
      const traitGroupName = traitGroup.name;

      // user selected to remove trait
      if (traitModel == null){
          if ( this.avatar[traitGroupName] && this.avatar[traitGroupName].vrm ){
              // just dispose for now
              disposeVRM(this.avatar[traitGroupName].vrm)
              this.avatar[traitGroupName] = {}
              // XXX restore effects without setTimeout
          }
          console.log(this.avatar)
          return;
      }

      let vrm = null;

      models.map((m)=>{
          
          // basic vrm setup (only if model is vrm)
          // send textures and colors
          vrm = this._VRMBaseSetup(m, traitModel, traitGroup, textures, colors);

          this._applyManagers(vrm)
    
          // Scale depending on manifest definition
          this._positionModel(vrm)

            
      })

      // If there was a previous loaded model, remove it (maybe also remove loaded textures?)
      if (this.avatar[traitGroupName] && this.avatar[traitGroupName].vrm) {
        disposeVRM(this.avatar[traitGroupName].vrm)
        // XXX restore effects
      }
    
      this._displayModel(vrm)
        

      // and then add the new avatar data
      // to do, we are now able to load multiple vrm models per options, set the options to include vrm arrays
      this.avatar[traitGroupName] = {
        traitInfo: traitModel,
        textureInfo: textureTrait,
        colorInfo: colorTrait,
        name: traitModel.name,
        model: vrm && vrm.scene,
        vrm: vrm
      }
      console.log(this.avatar)
    }

   
}

// Class to load traits
class TraitLoadingManager{
    constructor(){
        // Main loading manager
        const loadingManager = new THREE.LoadingManager();
        loadingManager.onProgress = (url, loaded, total) => {
            this.setLoadPercentage(Math.round(loaded / total * 100));
        };

        // Models Loader
        const gltfLoader = new GLTFLoader(loadingManager);
        gltfLoader.crossOrigin = 'anonymous';
        gltfLoader.register((parser) => {
            // return new VRMLoaderPlugin(parser, {autoUpdateHumanBones: true, helperRoot:vrmHelperRoot})
            // const springBoneLoader = new VRMSpringBoneLoaderPlugin(parser);
            // return new VRMLoaderPlugin(parser, {autoUpdateHumanBones: true, springBonePlugin:springBoneLoader})
            return new VRMLoaderPlugin(parser, {autoUpdateHumanBones: true})
        })
      
        // Texture Loader
        const textureLoader = new THREE.TextureLoader(loadingManager);

        this.baseDirectory = "";
        this.loadPercentager = 0;
        this.loadingManager = loadingManager;
        this.gltfLoader = gltfLoader;
        this.textureLoader = textureLoader;

        this.isLoading = false;
    }
    setLoadPercentage(value){
        this.loadPercentager = value;
    }
    setBaseDirectory(directory){
        this.baseDirectory = directory;
    }


    // options as SelectedOptions class
    // Loads an array of trait options and returns a promise that resolves as an array of Loaded Data
    loadTraitOptions(baseDirectory, options) {
        return new Promise((resolve) => {
            this.isLoading = true;
            const resultData = [];
    
            const promises = options.map(async (option, index) => {
                if (option == null) {
                    resultData[index] = null;
                    return;
                }
                console.log(option)
                //console.log(option.directory);

                const loadedModels = await Promise.all(
                    getAsArray(option?.traitModel?.directory).map(async (modelDir) => {
                        try {
                            return await this.gltfLoader.loadAsync(baseDirectory + modelDir);
                        } catch (error) {
                            console.error(`Error loading model ${modelDir}:`, error);
                            return null;
                        }
                    })
                );
    
                const loadedTextures = await Promise.all(
                  getAsArray(option?.traitTexture?.directory).map(
                      (textureDir) =>
                          new Promise((resolve) => {
                              this.textureLoader.load(baseDirectory + textureDir, (txt) => {
                                  txt.flipY = false;
                                  resolve(txt);
                              });
                          })
                  )
                );
    
                const loadedColors = getAsArray(option?.traitColor?.value).map((colorValue) => new THREE.Color(colorValue));
    
                resultData[index] = new LoadedData({
                    traitGroup: option?.traitModel.traitGroup,
                    traitModel: option?.traitModel,
                    textureTrait: option?.traitTexture,
                    colorTrait: option?.traitColor,
                    models: loadedModels,
                    textures: loadedTextures,
                    colors: loadedColors,
                });
            });
    
            Promise.all(promises)
                .then(() => {
                    this.setLoadPercentage(100); // Set progress to 100% once all assets are loaded
                    resolve(resultData);
                    this.isLoading = false;
                })
                .catch((error) => {
                    console.error('An error occurred:', error);
                    resolve(resultData);
                    this.isLoading = false;
                });
        });
    }
}
class LoadedData{
    constructor(data){
        const {
            traitGroup,
            traitModel,
            textureTrait,
            colorTrait,
            models,
            textures,
            colors
        } = data;

        // Option base data
        this.traitGroup = traitGroup;
        this.traitModel = traitModel;
        this.textureTrait = textureTrait;
        this.colorTrait = colorTrait;

        // Option loaded data
        this.models = models;
        this.textures = textures;
        this.colors = colors;
    }
}


class SelectedOption{
  constructor(traitModel, traitTexture, traitColor){
    this.traitModel = traitModel;
    this.traitTexture = traitTexture;
    this.traitColor = traitColor;
  }
}

// Extract to a new file
class ManifestData{
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
      this.exportScale = exportScale;
      this.animationPath = getAsArray(animationPath);
      this.requiredTraits = getAsArray(requiredTraits);
      this.randomTraits = getAsArray(randomTraits);
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
      
      console.log(this.modelTraitsMap);
      console.log(this.colorTraitsMap);
      console.log(this.textureTraitsMap);
    }

    getGroupModelTraits(){
      return this.modelTraits;
    }

    getRandomTraits(optionalGroupTraitIDs){
      console.log("get random")
      const selectedOptions = []
      const searchArray = optionalGroupTraitIDs || this.randomTraits;
      searchArray.forEach(groupTraitID => {
        const traitSelectedOption = this.getRandomTrait(groupTraitID);
        if (traitSelectedOption)
          selectedOptions.push(traitSelectedOption)
      });
      console.log(selectedOptions);
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

    getTrait(groupTraitID, traitID){
      const trait = this.getModelTrait(groupTraitID, traitID);
      if (trait){
        const traitTexture = trait.targetTextureCollection?.getRandomTrait();
        const traitColor = trait.targetColorCollection?.getRandomTrait();
        return new SelectedOption(trait,traitTexture, traitColor);
      }
      return null;
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

    // textures
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
          colorCollection
      }= options;
      this.traitGroup = traitGroup;

      this.id = id;
      this.directory = directory;
      this.fullDirectory = traitGroup.manifestData.getTraitsDirectory() + directory
      this.name = name;
      this.thumbnail = thumbnail;
      this.fullThumbnail = traitGroup.manifestData.getTraitsDirectory() + thumbnail;

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
          name,
          thumbnail,
      }= options;
      this.traitGroup = traitGroup;

      this.id = id;
      this.directory = directory;
      this.fullDirectory = traitGroup.manifestData.getTraitsDirectory() + directory;

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


// ths one will be removed
class TraitOption{
  constructor(options){
      const {
          key = 'default',
          icon = 'defaultIcon',
          iconHSL = 'defaultIconHSL',
          colorTrait = null,
          textureTrait = null,
          item = null
      } = options;

      this.key = key;
      this.colorTrait = colorTrait;
      this.textureTrait = textureTrait;
      this.icon = icon;
      this.iconHSL = iconHSL;
      this.item = item;
  }
}


 // should be called within manifestData, as it is the one that holds this information

//  const getRestrictions = () => {

//     const traitRestrictions = templateInfo.traitRestrictions // can be null
//     const typeRestrictions = {};

//     for (const prop in traitRestrictions){

//       // create the counter restrcitions traits
//       getAsArray(traitRestrictions[prop].restrictedTraits).map((traitName)=>{

//         // check if the trait restrictions exists for the other trait, if not add it
//         if (traitRestrictions[traitName] == null) traitRestrictions[traitName] = {}
//         // make sure to have an array setup, if there is none, create a new empty one
//         if (traitRestrictions[traitName].restrictedTraits == null) traitRestrictions[traitName].restrictedTraits = []

//         // finally merge existing and new restrictions
//         traitRestrictions[traitName].restrictedTraits = [...new Set([
//           ...traitRestrictions[traitName].restrictedTraits ,
//           ...[prop]])]  // make sure to add prop as restriction
//       })

//       // do the same for the types
//       getAsArray(traitRestrictions[prop].restrictedTypes).map((typeName)=>{
//         //notice were adding the new data to typeRestrictions and not trait
//         if (typeRestrictions[typeName] == null) typeRestrictions[typeName] = {}
//         //create the restricted trait in this type
//         if (typeRestrictions[typeName].restrictedTraits == null) typeRestrictions[typeName].restrictedTraits = []

//         typeRestrictions[typeName].restrictedTraits = [...new Set([
//           ...typeRestrictions[typeName].restrictedTraits ,
//           ...[prop]])]  // make sure to add prop as restriction
//       })
//     }

//     // now merge defined type to type restrictions
//     for (const prop in templateInfo.typeRestrictions){
//       // check if it already exsits
//       if (typeRestrictions[prop] == null) typeRestrictions[prop] = {}
//       if (typeRestrictions[prop].restrictedTypes == null) typeRestrictions[prop].restrictedTypes = []
//       typeRestrictions[prop].restrictedTypes = [...new Set([
//         ...typeRestrictions[prop].restrictedTypes ,
//         ...getAsArray(templateInfo.typeRestrictions[prop])])]  

//       // now that we have setup the type restrictions, lets counter create for the other traits
//       getAsArray(templateInfo.typeRestrictions[prop]).map((typeName)=>{
//         // prop = boots
//         // typeName = pants
//         if (typeRestrictions[typeName] == null) typeRestrictions[typeName] = {}
//         if (typeRestrictions[typeName].restrictedTypes == null) typeRestrictions[typeName].restrictedTypes =[]
//         typeRestrictions[typeName].restrictedTypes = [...new Set([
//           ...typeRestrictions[typeName].restrictedTypes ,
//           ...[prop]])]  // make sure to add prop as restriction
//       })
//     }

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
    // _loadOptions(options, filterRestrictions = true, useTemplateBaseDirectory = true, saveUserSel = true){

    //     // XXX I think this part was used to know which trait was selected
    //     // for (const option of options) {
    //     //   updateCurrentTraitMap(option.trait.trait, option.key)
    //     // }
    
    //     if (filterRestrictions)
    //       options = _filterRestrictedOptions(options);
    
    //     //save selection to local storage
    //     // if (saveUserSel)
    //     //   saveUserSelection(options)
    
    //     // validate if there is at least a non null option
    //     let nullOptions = true;
    //     options.map((option)=>{
    //       if(option.item != null)
    //         nullOptions = false;
    //     })
    //     if (nullOptions === true){
    //       return new Promise((resolve) => {
    //         resolve(options)
    //       });
    //     }
    
    //     setIsLoading(true);
    
    //     //create the manager for all the options
    //     const loadingManager = new THREE.LoadingManager()
    
    //     //create a gltf loader for the 3d models
    //     const gltfLoader = new GLTFLoader(loadingManager)
    //     gltfLoader.crossOrigin = 'anonymous';
    
    //     gltfLoader.register((parser) => {
    //       //return new VRMLoaderPlugin(parser, {autoUpdateHumanBones: true, helperRoot:vrmHelperRoot})
    
    //       // const springBoneLoader = new VRMSpringBoneLoaderPlugin(parser);
    //       // return new VRMLoaderPlugin(parser, {autoUpdateHumanBones: true, springBonePlugin:springBoneLoader})
    
    //       return new VRMLoaderPlugin(parser, {autoUpdateHumanBones: true})
    //     })
    
    //     // and a texture loaders for all the textures
    //     const textureLoader = new THREE.TextureLoader(loadingManager)
    //     loadingManager.onProgress = function(url, loaded, total){
    //       setLoadPercentage(Math.round(loaded/total * 100 ))
    //     }
    //     // return a promise, resolve = once everything is loaded
    //     return new Promise((resolve) => {
    
    //       // resultData will hold all the results in the array that was given this function
    //       const resultData = [];
    //       loadingManager.onLoad = function (){
    //         setLoadPercentage(0)
    //         resolve(resultData);
    //         setIsLoading(false)
    //       };
    //       loadingManager.onError = function (url){
    //         console.log("currentTraits", resultData);
    //         console.warn("error loading " + url)
    //       }
    //       loadingManager.onProgress = function(url, loaded, total){
    //         setLoadPercentage(Math.round(loaded/total * 100 ))
    //       }
          
          
    //       const baseDir = useTemplateBaseDirectory ? (templateInfo.assetsLocation || "") + templateInfo.traitsDirectory : "";
    //       // load necesary assets for the options
    //       options.map((option, index)=>{
    //         if (option.selected){
    //           setSelectValue(option.key)
    //         }
    //         if (option == null){
    //           resultData[index] = null;
    //           return;
    //         }
    //         // load model trait
    //         const loadedModels = [];
    //         const models = getAsArray(option?.item?.directory);
    //         try {
    //           models.forEach(async (modelDir, i) => {
    //             try {
    //               const mod = await gltfLoader.loadAsync(baseDir + modelDir);
    //               loadedModels[i] = mod;
    //             } catch (error) {
    //               console.error(`Error loading model ${modelDir}:`, error);
    //               options.splice(index, 1);
    //               resultData.splice(index, 1);
    //             }
    //           });
    //         } catch (error) {
    //           console.error('An error occurred:', error);
    //           //remove option
    //         }
            
    //         // load texture trait
    //         const loadedTextures = [];
    //         getAsArray(option?.textureTrait?.directory).map((textureDir, i)=>{
    //           textureLoader.load(baseDir + textureDir,(txt)=>{
    //             txt.flipY = false;
    //             loadedTextures[i] = (txt)
    //           })
    //         })
    
    //         // and just create colors
    //         const loadedColors = [];
    //         getAsArray(option?.colorTrait?.value).map((colorValue, i)=>{
    //           loadedColors[i] = new THREE.Color(colorValue);
    //         })
    //         resultData[index] = {
    //           item:option?.item,
    //           trait:option?.trait,
    //           textureTrait:option?.textureTrait,
    //           colorTrait:option?.colorTrait,
    //           models:loadedModels,          
    //           textures:loadedTextures, 
    //           colors:loadedColors      
    //         }
    //       })
    //     });
    // }