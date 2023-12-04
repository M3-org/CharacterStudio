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



    setParentModel(model){
        this.parentModel = model;
    }

    async loadRandomTraits(){
      console.log("get random");
      console.log();
      if (this.manifestData){
        this.loadTraits(this.manifestData.getRandomTraits());
      }
      else{
        console.error ("No manifest was loaded, random traits cannot be loaded.")
      }
    }

    async loadTraits(options){
      console.log(options)
      this.traitLoadManager.loadTraitOptions(this.manifestData.getTraitsDirectory(), getAsArray(options)).then(loadedData=>{
        console.log("loaded", loadedData);
          loadedData.forEach(itemData => {
              this._addLoadedData(itemData)
          });
          cullHiddenMeshes(this.avatar);
      })
     
    }
    async loadManifest(url, options){
      const {
        createAnimationManager = false
      } = options

      this.manifest = await this.fetchManifest(url)
      
      if (this.manifest){
        this.manifestData = new ManifestData(this.manifest);
        console.log(this.manifestData);
        this.traitLoadManager.setBaseDirectory((this.manifest.assetsLocation || "") + (this.manifest.traitsDirectory || ""));
        this.animationManager = createAnimationManager ?  await this._createAnimationManager() : null;
      }
    }


    async _createAnimationManager(){

      const animationManager = new AnimationManager(this.manifest.offset)
      const animationPaths = getAsArray(this.manifest.animationPath);
      animationManager.storeAnimationPaths(animationPaths, this.manifest.assetsLocation || "");
      await animationManager.loadAnimation(animationPaths, animationPaths[0].endsWith('.fbx'), this.manifest.assetsLocation || "")
      return animationManager
    }

    async fetchManifest(location) {
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
          item,
          trait,
          textureTrait,
          colorTrait,
          models,
          textures,
          colors
      } = itemData;
      console.log(itemData);
      const traitName = trait.name;

      // user selected to remove trait
      if (item == null){
          if ( this.avatar[traitName] && this.avatar[traitName].vrm ){
              // just dispose for now
              disposeVRM(avatar[traitData.name].vrm)
              // XXX restore effects without setTimeout
          }
          return;
      }

      let vrm = null;

      models.map((m)=>{
          
          // basic vrm setup (only if model is vrm)
          // send textures and colors
          vrm = this._VRMBaseSetup(m, item, trait, textures, colors);

          this._applyManagers(vrm)
    
          // Scale depending on manifest definition
          this._positionModel(vrm)

            
      })

      // If there was a previous loaded model, remove it (maybe also remove loaded textures?)
      if (this.avatar[traitName] && this.avatar[traitName].vrm) {
        disposeVRM(this.avatar[traitName].vrm)
        // XXX restore effects
      }
    
      this._displayModel(vrm)
        

      // and then add the new avatar data
      // to do, we are now able to load multiple vrm models per options, set the options to include vrm arrays
      this.avatar[traitName] = {
        traitInfo: item,
        textureInfo: textureTrait,
        colorInfo: colorTrait,
        name: item.name,
        model: vrm && vrm.scene,
        vrm: vrm
      }
      console.log(this.avatar)
    }



    getJsonTraits(){

    }
    loadCustom(url){

    }



    // should be called within manifestData, as it is the one that holds this information

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
            //const baseDir = this.manifestData.getTraitsDirectory();
    
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
                    item: option?.traitModel,
                    trait: option?.traitModel.traitGroup,
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
            item,
            trait,
            textureTrait,
            colorTrait,
            models,
            textures,
            colors
        } = data;

        // Option base data
        this.item = item;
        this.trait = trait;
        this.textureTrait = textureTrait;
        this.colorTrait = colorTrait;

        // Option loaded data
        this.models = models;
        this.textures = textures;
        this.colors = colors;
    }
}


class SelectedOption{
  constructor(traitModel,traitTexture, traitColor){
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

      this.traits = [];
      this.traitsMap = null;
      this.createModelTraits(traits);
      
      //console.log(this.getTrait("BODY", "Feminine"))
      console.log(this.traitsMap);
      console.log(this.colorTraitsMap);
      console.log(this.textureTraitsMap);
    }

    getRandomTraits(optionalGroupTraitIDs){
      console.log("get random")
      const selectedOptions = []
      const searchArray = optionalGroupTraitIDs || this.randomTraits;
      searchArray.forEach(groupTraitID => {
        const trait = this.getRandomTrait(groupTraitID);
        if (trait){
          const traitTexture = trait.targetTextureCollection?.getRandomTrait();
          const traitColor = trait.targetColorCollection?.getRandomTrait();
          selectedOptions.push(new SelectedOption(trait,traitTexture, traitColor));
        }
      });
      console.log(selectedOptions);
      return selectedOptions;
    }

    getRandomTrait(groupTraitID){
      const traitModelsGroup = this.getTraitGroup(groupTraitID);
      if (traitModelsGroup){
        return traitModelsGroup.getRandomTrait();
      }
      else{
        console.warn("No trait group with name " + groupTraitID + " was found.")
        return null;
      }
    }

    // model traits
    getTrait(groupTraitID, traitID){
      return this.getTraitGroup(groupTraitID)?.getTrait(traitID);
    }
    getTraitGroup(groupTraitID){
      return this.traitsMap.get(groupTraitID);
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
      return (this.assetsLocation || "") + (this.traitsDirectory || "");
    }
    getThumbnailsDirectory(){
      return (this.assetsLocation || "") + (this.thumbnailsDirectory || "");
    }
    getTraitIconsDirectorySvg(){
      return (this.assetsLocation || "") + (this.traitIconsDirectorySvg || "");
    }




    // Given an array of traits, saves an array of TraitModels
    createModelTraits(modelTraits, replaceExisting = false){
      if (replaceExisting) this.traits = [];

      getAsArray(modelTraits).forEach(traitObject => {
        this.traits.push(new TraitModelsGroup(this, traitObject))
      });

      this.traitsMap = new Map(this.traits.map(item => [item.trait, item]));
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
          iconSVG,
          cameraTarget = { distance:3 , height:1 },
          cullingDistance,
          cullingLayer,
          collection
        } = options;
        this.manifestData = manifestData;
        
        this.trait = trait;
        this.name = name;
        this.iconSVG = iconSVG;
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
      this.name = name;
      this.thumbnail = thumbnail;

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
      this.name = name;
      this.thumbnail = thumbnail;
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
