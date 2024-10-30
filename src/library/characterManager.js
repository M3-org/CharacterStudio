import * as THREE from "three"
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader"
import { AnimationManager } from "./animationManager"
import { ScreenshotManager } from "./screenshotManager";
import { BlinkManager } from "./blinkManager";
import { VRMLoaderPlugin } from "@pixiv/three-vrm";
import { getAsArray, disposeVRM, renameVRMBones, addModelData } from "./utils";
import { downloadGLB, downloadVRMWithAvatar } from "../library/download-utils"
import { saveVRMCollidersToUserData, renameMorphTargets} from "./load-utils";
import { cullHiddenMeshes, setTextureToChildMeshes, addChildAtFirst } from "./utils";
import { LipSync } from "./lipsync";
import { LookAtManager } from "./lookatManager";
import { CharacterManifestData } from "./CharacterManifestData";

const mouse = new THREE.Vector2();
const raycaster = new THREE.Raycaster();
const localVector3 = new THREE.Vector3(); 

export class CharacterManager {
    constructor(options){
      this._start(options);
    }
    
    async _start(options){
      const{
        parentModel = null,
        renderCamera = null,
        manifestURL = null
      }= options;

     

      // data that is needed, but not required to be downloaded
      this.rootModel = new THREE.Object3D();
      // all data that will be downloaded
      this.characterModel = new THREE.Object3D();

      this.parentModel = parentModel;
      if (parentModel){
        parentModel.add(this.rootModel);
      }
      this.lipSync = null;

      this.lookAtManager = null;
      this.animationManager = new AnimationManager();
      this.screenshotManager = new ScreenshotManager(this, parentModel || this.rootModel);
      this.blinkManager = new BlinkManager(0.1, 0.1, 0.5, 5)
      

      this.rootModel.add(this.characterModel)
      this.renderCamera = renderCamera;

      this.manifestData = null;
      this.manifest = null
      if (manifestURL){
         this.loadManifest(manifestURL)
         this.animationManager.setScale(this.manifestData.displayScale)
      }
      
      this.avatar = {};       // Holds information of traits within the avatar
      this.storedAvatar = {}; // Holds information of an avatar previously stored
      this.traitLoadManager = new TraitLoadingManager();

      // XXX actually use the vrm helper
      const helperRoot = new THREE.Group();
      helperRoot.renderOrder = 10000;
      this.rootModel.add(helperRoot)
      this.vrmHelperRoot = helperRoot;

      
    }

    update(){
      if (this.lookAtManager != null){
        this.lookAtManager.update();
      }
    }

    addLookAtMouse(screenPrecentage, canvasID, camera, enable = true){
      this.lookAtManager = new LookAtManager(screenPrecentage, canvasID, camera);
      this.lookAtManager.enabled = true;
      for (const prop in this.avatar){
        if (this.avatar[prop]?.vrm != null){
          this.lookAtManager.addVRM(this.avatar[prop].vrm)
        }
      }
      //this.toggleCharacterLookAtMouse(enable)
    }
    toggleCharacterLookAtMouse(enable){
      if (this.lookAtManager != null){
        this.lookAtManager.setActive(enable);
        if (this.animationManager){
          this.animationManager.enableMouseLook(enable);
        }
      }
      else{
        console.warn("toggleCharacterLookAtMouse() was called, but no lookAtManager exist. Make sure to set it up first with addLookArMous()")
      }
    }
    savePortraitScreenshot(name, width, height, distance = 1, headHeightOffset = 0){
      this.blinkManager.enableScreenshot();

      this.characterModel.traverse(o => {
        if (o.isSkinnedMesh) {
          const headBone = o.skeleton.bones.filter(bone => bone.name === 'head')[0];
          headBone.getWorldPosition(localVector3);
        }
      });
      localVector3.z += 0.3;
      localVector3.y += headHeightOffset;
      this.screenshotManager.cameraFrameManager.setCamera(localVector3, distance);
      this.screenshotManager.saveScreenshot(name, width,height);

      this.blinkManager.disableScreenshot();
    }

    // XXX just call raycast culling without sneding mouse position?
    cameraRaycastCulling(mouseX, mouseY, removeFace = true){
      if (this.renderCamera == null){
        console.warn("No camera was set in character manager. Please call setRenderCamera(camera) before calling this function")
        return;
      }
      // #region restore/remove existing faces logic
      const setOriginalInidicesAndColliders = () => {
        this.characterModel.traverse((child)=>{
          if (child.isMesh) {
            if (child.userData.origIndexBuffer){
              child.userData.clippedIndexGeometry = child.geometry.index.clone();
              child.geometry.setIndex(child.userData.origIndexBuffer);
            }
          }
        })
      }

      const restoreCullIndicesAndColliders = () => {
        this.characterModel.traverse((child)=>{
          if (child.isMesh) {
            if (child.userData.origIndexBuffer){
              child.geometry.setIndex(child.userData.clippedIndexGeometry);
            }
          }
        })
      }

      const checkIndicesIndex = (array, indices) =>{
        for (let i =0; i < array.length; i+=3){
          if (indices[0] != array[i]){
            continue
          }
          if (indices[1] != array[i+1]){
            continue
          }
          if (indices[2] != array[i+2]){
            continue
          }
          return i;
        }
        return -1;
      }
  
      const updateCullIndices = (intersection, removeFace) => {
        const intersectedObject = intersection.object;
        const face = intersection.face;
        const newIndices = [face.a,face.b,face.c];
        const clipIndices = intersectedObject.userData?.clippedIndexGeometry?.array
  
        
  
        if (clipIndices != null){
          const hitIndex = checkIndicesIndex(clipIndices,newIndices)
          const uint32ArrayAsArray = Array.from(clipIndices);
          if (hitIndex == -1 && !removeFace){
            const mergedIndices = [...uint32ArrayAsArray, ...newIndices];
            intersectedObject.userData.clippedIndexGeometry =  new THREE.BufferAttribute(new Uint32Array(mergedIndices),1,false);
          }
          if (hitIndex != 1 && removeFace){
            uint32ArrayAsArray.splice(hitIndex, 3);
            intersectedObject.userData.clippedIndexGeometry = new THREE.BufferAttribute(new Uint32Array(uint32ArrayAsArray), 1, false);
          }
        }
      }
      // #endregion

      mouse.x = mouseX;
      mouse.y = mouseY;

      setOriginalInidicesAndColliders();
      raycaster.setFromCamera(mouse, this.renderCamera);
      const intersects = raycaster.intersectObjects(this.characterModel.children)
      if (intersects.length > 0) {
        const intersection = intersects[0];
        updateCullIndices(intersection, removeFace)
      }
      restoreCullIndicesAndColliders();
    }
    removeCurrentCharacter(){
      const clearTraitData = []
      for (const prop in this.avatar){
        
        clearTraitData.push(new LoadedData({traitGroupID:prop, traitModel:null}))
      }
      clearTraitData.forEach(itemData => {
        this._addLoadedData(itemData)
      });
      this.avatar = {};
    }
    removeCurrentManifest(){
      this.removeCurrentCharacter();
      this.manifest = null;
      this.manifestData = null;
      if (this.animationManager)
        this.animationManager.clearCurrentAnimations();
    }
    canDownload(){
      return this.manifestData?.canDownload || true;
    }
    /**
     * Downloads the VRM file with the given name and export options.
     *
     * @param {string} name - The name of the VRM file to be downloaded.
     * @param {Object} exportOptions - Additional export options (optional).
     * @returns {Promise<void>} A Promise that resolves when the VRM file is successfully downloaded,
     *                         or rejects with an error message if download is not supported.
     */
    downloadVRM(name, exportOptions = null) {
      return new Promise(async (resolve, reject) => {
        if (this.canDownload()) {
          try {
            // Set default export options if not provided
            exportOptions = exportOptions || {};
            const manifestOptions = this.manifestData.getExportOptions();
            const finalOptions = { ...manifestOptions, ...exportOptions };
            finalOptions.isVrm0 = true; // currently vrm1 not supported
            finalOptions.screenshot = this._getPortaitScreenshotTexture(false, finalOptions);

            // Log the final export options
            console.log(finalOptions);

            // Call the downloadVRMWithAvatar function with the required parameters
            await downloadVRMWithAvatar(this.characterModel, this.avatar, name, finalOptions);

            resolve();
          } catch (error) {
            // Handle any errors that occurred during the download process
            console.error("Error downloading VRM:", error.message);
            reject(new Error("Failed to download VRM."));
          }
        } else {
          // Download not supported, log an error and reject the Promise
          const errorMessage = "Download not supported.";
          console.error(errorMessage);
          reject(new Error(errorMessage));
        }
      });
    }
    downloadGLB(name, exportOptions = null){
      console.log("XXX fix glb downloader");
      if (this.canDownload()){
        exportOptions = exportOptions || {}
        const finalOptions = {...this.manifestData.getExportOptions(), ...exportOptions};
        downloadGLB(this.characterModel, name, finalOptions);
      }
      else{
        console.error("Download not supported");
      }
    }
    getAvatarSelection(){
      var result = {};
      for (const prop in this.avatar) {
        result[prop] = {
          name:this.avatar[prop].name,
          id:this.avatar[prop].traitInfo?.id
        }
      }
      return result; 
    }
    getBoneTriangleCount(){
      let indexCount = 0;
      let boneSet  = new Set();
      for (const prop in this.avatar) {
        this.avatar[prop].model.traverse((child)=>{
          if (child.isMesh){
            indexCount+= child.geometry.index.array.length;
          }
          if (child.isSkinnedMesh){
            child.skeleton.bones.forEach(bone => {
              boneSet.add(bone.name); // Add bone name to the Set
            });
          }
        })
      }
      return {
        triangles:indexCount/3,
        bones:boneSet.size
      }
    }
    getGroupTraits(){
      if (this.manifestData){
        return this.manifestData.getGroupModelTraits();
      }
    }
      /**
     * Same as getGroupTraits() but for Blendshapes
     * @param {string} traitGroupId - The ID of the trait group.
     * @param {string} traitId - The ID of the trait.
     * @returns {Array} Array of blendshape traits
     */
    getBlendShapeGroupTraits(traitGroupId, traitId){
      if (this.manifestData){
        return this.manifestData.getModelTrait(traitGroupId, traitId)?.getGroupBlendShapeTraits()
      }else {
        return []
      }
    }
    getCurrentCharacterModel(){
      return this.characterModel;
    }
    /**
     * Checks if a trait group is marked as required in the manifest data.
     *
     * @param {string} groupTraitID - The ID of the trait group.
     * @returns {boolean} Returns true if the trait group is marked as required, otherwise false.
     */
    isTraitGroupRequired(groupTraitID) {
      // Retrieve the trait group from the manifest data based on the provided ID
      const groupTrait = this.manifestData.getModelGroup(groupTraitID);

      // Check if the trait group exists and is marked as required
      if (groupTrait?.isRequired) {
        return true;
      }

      // The trait group is either not found or not marked as required
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
    getCurrentTraitID(groupTraitID){
      return this.avatar[groupTraitID]?.traitInfo?.id;
    }
    getCurrentTraitData(groupTraitID){
      return this.avatar[groupTraitID]?.traitInfo;
    }
    /**
     * @param {string} groupTraitID 
     * @returns {Object} Returns the current blendshape trait info for the specified group trait ID.
     */
    getCurrentBlendShapeTraitData(groupTraitID){
      return this.avatar[groupTraitID]?.blendShapeTraitsInfo||{};
    }
    getCurrentTraitVRM(groupTraitID){
      return this.avatar[groupTraitID]?.vrm;
    }
    setParentModel(model){
      model.add(this.rootModel);
      this.parentModel = model;
      if (this.screenshotManager)
        this.screenshotManager.setScene(this.parentModel);
    }
    setRenderCamera(camera){
      this.renderCamera = camera;
    }

    
    /**
     * Loads random traits based on manifest data.
     * If manifest data is available, retrieves random traits,
     * If manifest data is not available, logs an error and rejects the Promise.
     *
     * @returns {Promise<void>} A Promise that resolves with an array of random traits
     *                           if successful, or rejects with an error message if not.
     */
    loadRandomTraits() {
      return new Promise(async (resolve, reject) => {
        if (this.manifestData) {
          const randomTraits = this.manifestData.getRandomTraits();
          await this._loadTraits(randomTraits);
          resolve(); // Resolve the promise with the result
        } else {
          const errorMessage = "No manifest was loaded, random traits cannot be loaded.";
          console.error(errorMessage);
          reject(new Error(errorMessage)); // Reject the promise with an error
        }
      });
    }
    /**
     * Loads a random trait from provided group trait ID.
     * If manifest data is available, retrieves random traits,
     * If manifest data is not available, logs an error and rejects the Promise.
     * @param {string} groupTraitID - The ID of the trait group.
     * @returns {Promise<void>} A Promise that resolves with a random trait from chosen group trait ID
     *                           if successful, or rejects with an error message if not.
     */
    loadRandomTrait(groupTraitID) {
      return new Promise(async (resolve, reject) => {
        if (this.manifestData) {
          const randomTrait = this.manifestData.getRandomTrait(groupTraitID);
          await this._loadTraits(getAsArray(randomTrait));
          resolve(); // Resolve the promise with the result
        } else {
          const errorMessage = "No manifest was loaded, random traits cannot be loaded.";
          console.error(errorMessage);
          reject(new Error(errorMessage)); // Reject the promise with an error
        }
      });
    }

    /**
     * Loads traits from an NFT using the specified URL.
     *
     * @param {string} url - The URL of the NFT to retrieve traits from.
     * @param {boolean} [fullAvatarReplace=true] - Flag indicating whether to fully replace existing traits.
     * @param {Array<string>} [ignoreGroupTraits=null] - An optional array of trait groups to ignore.
     * @returns {Promise<void>} A Promise that resolves if successful,
     *                         or rejects with an error message if not.
     */
    loadTraitsFromNFT(url, fullAvatarReplace = true, ignoreGroupTraits = null) {
      return new Promise(async (resolve, reject) => {
        try {
          // Check if manifest data is available
          if (this.manifestData) {
            // Retrieve traits from the NFT using the manifest data
            const traits = this.manifestData.getNFTraitOptionsFromURL(url, ignoreGroupTraits);

            // Load traits using the _loadTraits method
            await this._loadTraits(traits, fullAvatarReplace);

            // Resolve the Promise (without a value, as you mentioned it's not needed)
            resolve();
          } else {
            // Manifest data is not available, log an error and reject the Promise
            const errorMessage = "No manifest was loaded, NFT traits cannot be loaded.";
            console.error(errorMessage);
            reject(new Error(errorMessage));
          }
        } catch (error) {
          // Handle any asynchronous errors during trait retrieval or loading
          reject(error);
        }
      });
    }

    /**
     * Loads traits from an NFT object metadata into the avatar.
     *
     * @param {Object} NFTObject - The NFT object containing traits information.
     * @param {boolean} fullAvatarReplace - Indicates whether to replace all avatar traits.
     * @param {Array} ignoreGroupTraits - An optional array of trait groups to ignore.
     * @returns {Promise<void>} A Promise that resolves if successful,
     *                         or rejects with an error message if not.
     */
    loadTraitsFromNFTObject(NFTObject, fullAvatarReplace = true, ignoreGroupTraits = null) {
      return new Promise(async (resolve, reject) => {
        // Check if manifest data is available
        if (this.manifestData) {
          try {
            // Retrieve traits from the NFT object using manifest data
            const traits = this.manifestData.getNFTraitOptionsFromObject(NFTObject, ignoreGroupTraits);

            // Load traits into the avatar using the _loadTraits method
            await this._loadTraits(traits, fullAvatarReplace);

            resolve();
          } catch (error) {
            // Reject the Promise with an error message if there's an error during trait retrieval
            console.error("Error loading traits from NFT object:", error.message);
            reject(new Error("Failed to load traits from NFT object."));
          }
        } else {
          // Manifest data is not available, log an error and reject the Promise
          const errorMessage = "No manifest was loaded, NFT traits cannot be loaded.";
          console.error(errorMessage);
          reject(new Error(errorMessage));
        }
      });
    }

    /**
     * Loads initial traits based on manifest data.
     *
     * @returns {Promise<void>} A Promise that resolves if successful,
     *                         or rejects with an error message if not.
     */
    loadInitialTraits() {
      return new Promise(async(resolve, reject) => {
        // Check if manifest data is available
        if (this.manifestData) {
          // Load initial traits using the _loadTraits method
          await this._loadTraits(this.manifestData.getInitialTraits());

          resolve();
        } else {
          // Manifest data is not available, log an error and reject the Promise
          const errorMessage = "No manifest was loaded, initial traits cannot be loaded.";
          console.error(errorMessage);
          reject(new Error(errorMessage));
        }
      });
    }

    /**
     * Loads all traits based on manifest data.
     *
     * @returns {Promise<void>} A Promise that resolves if successful,
     *                         or rejects with an error message if not.
     */
    loadAllTraits() {
      console.log("load all")
      return new Promise(async(resolve, reject) => {
        // Check if manifest data is available
        if (this.manifestData) {
          // Load initial traits using the _loadTraits method
          await this._loadTraits(this.manifestData.getAllTraits());

          resolve();
        } else {
          // Manifest data is not available, log an error and reject the Promise
          const errorMessage = "No manifest was loaded, initial traits cannot be loaded.";
          console.error(errorMessage);
          reject(new Error(errorMessage));
        }
      });
    }
    /**
     * Load and activate blendshape trait
     * @param {string} traitGroupID 
     * @param {string} blendshapeGroupId 
     * @param {string|null} blendshapeTraitId 
     * @returns 
     */
    loadBlendShapeTrait(traitGroupID, blendshapeGroupId,blendshapeTraitId){
      const currentTrait = this.avatar[traitGroupID];
      if(!currentTrait){
        console.warn(`Trait with name: ${traitGroupID} was not found or not selected.`)
        return;
      }
      if(!this.manifestData){
        console.warn("No manifest data was found.")
        return;
      }

      try{
        this._loadBlendShapeTrait(traitGroupID, blendshapeGroupId, blendshapeTraitId);
      }catch{ 
        console.error("Error loading blendshape trait "+traitGroupID, blendshapeGroupId, blendshapeTraitId);
      }
    }
    /**
     * remove blendshape trait
     * @param {string} traitGroupID 
     * @param {string} blendshapeGroupId 
     * @returns 
     */
    removeBlendShapeTrait(groupTraitID, blendShapeGroupId){
      const currentTrait = this.avatar[groupTraitID];
      if (currentTrait){
        this._loadBlendShapeTrait(groupTraitID,blendShapeGroupId,null);
      }
      else{
        console.warn(`No trait with name: ${ groupTraitID } was found.`)
      }
    }
    /**
     * Loads a specific trait based on group and trait IDs.
     *
     * @param {string} groupTraitID - The ID of the trait group.
     * @param {string} traitID - The ID of the specific trait.
     * @param {boolean} soloView - Should character display only new loaded trait?.
     * @returns {Promise<void>} A Promise that resolves if successful,
     *                         or rejects with an error message if not.
     */
    loadTrait(groupTraitID, traitID, soloView = false) {
      return new Promise(async (resolve, reject) => {
        // Check if manifest data is available
        if (this.manifestData) {
          try {
            // Retrieve the selected trait using manifest data
            const selectedTrait = this.manifestData.getTraitOption(groupTraitID, traitID);

            // If the trait is found, load it into the avatar using the _loadTraits method
            if (selectedTrait) {
              await this._loadTraits(getAsArray(selectedTrait),soloView);
              resolve();
            }
          } catch (error) {
            // Reject the Promise with an error message if there's an error during trait retrieval
            console.error("Error loading specific trait:", error.message);
            reject(new Error("Failed to load specific trait."));
          }
        } else {
          // Manifest data is not available, log an error and reject the Promise
          const errorMessage = "No manifest was loaded, specific trait cannot be loaded.";
          console.error(errorMessage);
          reject(new Error(errorMessage));
        }
      });
    }

    /**
     * Loads a custom trait based on group and URL.
     *
     * @param {string} groupTraitID - The ID of the trait group.
     * @param {string} url - The URL associated with the custom trait.
     * @returns {Promise<void>} A Promise that resolves if successful,
     *                         or rejects with an error message if not.
     */
    loadCustomTrait(groupTraitID, url) {
      return new Promise(async (resolve, reject) => {
        // Check if manifest data is available
        if (this.manifestData) {
          try {
            // Retrieve the selected custom trait using manifest data
            const selectedTrait = this.manifestData.getCustomTraitOption(groupTraitID, url);

            // If the custom trait is found, load it into the avatar using the _loadTraits method
            if (selectedTrait) {
              await this._loadTraits(getAsArray(selectedTrait));
              resolve();
            }

          } catch (error) {
            // Reject the Promise with an error message if there's an error during custom trait retrieval
            console.error("Error loading custom trait:", error.message);
            reject(new Error("Failed to load custom trait."));
          }
        } else {
          // Manifest data is not available, log an error and reject the Promise
          const errorMessage = "No manifest was loaded, custom trait cannot be loaded.";
          console.error(errorMessage);
          reject(new Error(errorMessage));
        }
      });
    }

    /**
     * Loads a custom texture to the specified group trait's model.
     *
     * @param {string} groupTraitID - The ID of the group trait.
     * @param {string} url - The URL of the custom texture.
     * @returns {Promise<void>} A Promise that resolves when the texture is successfully loaded,
     *                         or rejects with an error message if the group trait is not found.
     */
    loadCustomTexture(groupTraitID, url) {
      return new Promise(async (resolve, reject) => {
        const model = this.avatar[groupTraitID]?.model;

        if (model) {
          // Set the texture to child meshes of the model
          await setTextureToChildMeshes(model, url);

          // Resolve the Promise (without a value, as you mentioned it's not needed)
          resolve();
        } else {
          // Group trait not found, log a warning and reject the Promise
          const errorMessage = "No Group Trait with name " + groupTraitID + " was found.";
          console.warn(errorMessage);
          reject(new Error(errorMessage));
        }
      });
    }

    /**
     * Sets the color of a specified group trait's model.
     *
     * @param {string} groupTraitID - The ID of the group trait.
     * @param {string} hexColor - The hexadecimal color value to set for the group trait's model.
     * @throws {Error} If the group trait is not found or an error occurs during color setting.
     */
    setTraitColor(groupTraitID, hexColor) {
      const model = this.avatar[groupTraitID]?.model;
      if (model) {
        try {
          // Convert hexadecimal color to THREE.Color
          const color = new THREE.Color(hexColor);

          // Set the color to child meshes of the model
          model.traverse((mesh) => {
            if (mesh.isMesh) {
              if (mesh.material.type === "MeshStandardMaterial") {
                if (Array.isArray(mesh.material)) {
                  mesh.material.forEach((mat) => {
                    mat.color = color;
                    //mat.emissive = color;
                  });
                } else {
                  mesh.material.color = color;
                  //mesh.material.emissive = color;
                }
              } else {
                mesh.material[0].uniforms.litFactor.value = color;
                mesh.material[0].uniforms.shadeColorFactor.value = new THREE.Color(
                  color.r * 0.8,
                  color.g * 0.8,
                  color.b * 0.8
                );
              }
            }
          });
        } catch (error) {
          console.error("Error setting trait color:", error.message);
          throw new Error("Failed to set trait color.");
        }
      } else {
        // Group trait not found, log a warning and throw an error
        const errorMessage = "No Group Trait with name " + groupTraitID + " was found.";
        console.warn(errorMessage);
        throw new Error(errorMessage);
      }
    }


    removeTrait(groupTraitID, forceRemove = false){
      if (this.isTraitGroupRequired(groupTraitID) && !forceRemove){
        console.warn(`No trait with name: ${ groupTraitID } is not removable.`)
        return;
      }

      const groupTrait = this.manifestData.getModelGroup(groupTraitID);
      if (groupTrait){
        const itemData = new LoadedData({traitGroupID:groupTraitID, traitModel:null})
        this._addLoadedData(itemData);
        cullHiddenMeshes(this.avatar);
      }
      else{
        console.warn(`No trait with name: ${ groupTraitID } was found.`)
      }
    }
    updateCullHiddenMeshes(){
      cullHiddenMeshes(this.avatar);
    }
    loadOptimizerManifest(){
      this.manifest = {colliderTraits:["CUSTOM"],traits:[{name:"Custom", trait:"CUSTOM", collection:[]}]};
      this.manifestData = new CharacterManifestData(this.manifest);
    }
    getCurrentOptimizerCharacterModel(){
      return this.avatar["CUSTOM"]?.vrm;
    }

    /**
     * Loads an optimized character based on a custom trait URL.
     *
     * @param {string} url - The URL associated with the custom trait.
     * @returns {Promise<void>} A Promise that resolves if successful,
     *                         or rejects with an error message if not.
     */
    loadOptimizerCharacter(url) {
      return this.loadCustomTrait("CUSTOM", url);
    }

    /**
     * Sets an existing manifest data for the character.
     *
     * @param {object} manifest - The loaded mmanifest object.
     * @returns {Promise<void>} A Promise that resolves when the manifest is successfully loaded,
     *                         or rejects with an error message if loading fails.
     */
    setManifest(manifest){
      this.removeCurrentCharacter();
      return new Promise(async (resolve, reject) => {
        try{
          // remove in case character was loaded
          this.manifest = manifest;
          if (this.manifest) {
            // Create a CharacterManifestData instance based on the fetched manifest
            this.manifestData = new CharacterManifestData(this.manifest);

            // If an animation manager is available, set it up
            if (this.animationManager) {
              try{
                await this._animationManagerSetup(
                  this.manifest.animationPath,
                  this.manifest.assetsLocation,
                  this.manifestData.displayScale
                );
              }
              catch(err){
                console.error("Error loading animations: " + err)
              }
            }

            // Resolve the Promise (without a value, as you mentioned it's not needed)
            resolve();
          } else {
            // The manifest could not be fetched, reject the Promise with an error message
            const errorMessage = "Failed to fetch or parse the manifest.";
            console.error(errorMessage);
            reject(new Error(errorMessage));
          }
        } catch (error) {
          // Handle any errors that occurred during the asynchronous operations
          console.error("Error setting manifest:", error.message);
          reject(new Error("Failed to set the manifest."));
        }
      })
    }

    appendManifest(manifest, replaceExisting){
      return new Promise(async (resolve, reject) => {
        try{
          if (replaceExisting)
            this.manifest = {...(this.manifest || {}), manifest};
          else
            this.manifest = {manifest, ...(this.manifest || {})};

          // Create a CharacterManifestData instance based on the fetched manifest
          const manifestData = new CharacterManifestData(manifest);
          this.manifestData.appendManifestData(manifestData);

          // Resolve the Promise (without a value, as you mentioned it's not needed)
          resolve();

        } catch (error) {
          // Handle any errors that occurred during the asynchronous operations
          console.error("Error setting manifest:", error.message);
          reject(new Error("Failed to set the manifest."));
        }
      })
    }

    /**
     * Loads the manifest data for the character.
     *
     * @param {string} url - The URL of the manifest.
     * @returns {Promise<void>} A Promise that resolves when the manifest is successfully loaded,
     *                         or rejects with an error message if loading fails.
     */
    loadManifest(url) {
      // remove in case character was loaded
      return new Promise(async (resolve, reject) => {
        try {
          // Fetch the manifest data asynchronously
          const manifest = await this._fetchManifest(url);

          this.setManifest(manifest).then(()=>{
            resolve();
          })

        } catch (error) {
          // Handle any errors that occurred during the asynchronous operations
          console.error("Error loading manifest:", error.message);
          reject(new Error("Failed to load the manifest."));
        }
      });
    }

    /**
     * Loads manifest data and appends it to the current manifest
     *
     * @param {string} url - The URL of the manifest.
     * @returns {Promise<void>} A Promise that resolves when the manifest is successfully loaded,
     *                         or rejects with an error message if loading fails.
     */
    loadAppendManifest(url, replaceExisting){
      // remove in case character was loaded
      return new Promise(async (resolve, reject) => {
        try {
          // Fetch the manifest data asynchronously
          const manifest = await this._fetchManifest(url);

          this.appendManifest(manifest, replaceExisting).then(()=>{
            resolve();
          })

        } catch (error) {
          // Handle any errors that occurred during the asynchronous operations
          console.error("Error loading manifest:", error.message);
          reject(new Error("Failed to load the manifest."));
        }
      });
    }
    /**
     * Displays only target trait, and removes all others
     *
     * @param {string} groupTraitID - The name of the trait that will be solo, (accepts also an array of traits)
     */
    async soloTargetGroupTrait(groupTraitID){
      const groupTraitIDArray = getAsArray(groupTraitID) 
      const options = [];
      for (const trait in this.avatar){
        if (groupTraitIDArray.includes(trait)){
          options.push(this.manifestData.getTraitOption(trait, this.avatar[trait].traitInfo.id));
        }
      }
      await this._loadTraits(options,true);
    }

    /**
     * Stores the current selected avatar for later loading
     *
     */
    storeCurrentAvatar(){
      this.storedAvatar = {...this.avatar}
    }
    /**
     * Loads a previously stored avatar
     *
     */
    async loadStoredAvatar(){
      const options = [];
      for (const trait in this.storedAvatar){
        options.push(this.manifestData.getTraitOption(trait, this.storedAvatar[trait].traitInfo.id));
        // TO DO, ALSO GET COLOR TRAITS AND TEXTURE TRAITS
      }
      console.log(options);
      this._loadTraits(options,true);
      //const selectedTrait = this.manifestData.getTraitOption(groupTraitID, traitID);
    }

    async _loadTraits(options, fullAvatarReplace = false){
      console.log("laoded traits:", options)
      await this.traitLoadManager.loadTraitOptions(getAsArray(options)).then(loadedData=>{
        if (fullAvatarReplace){
          // add null loaded options to existingt traits to remove them;
          const groupTraits = this.getGroupTraits();
          groupTraits.forEach((trait) => {
            const coincidence = loadedData.some((option) => option.traitModel?.traitGroup.trait === trait.trait);
            if (!coincidence) {
              if (this.avatar[trait.trait] != null){
                loadedData.push(new LoadedData({traitGroupID:trait.trait, traitModel:null}));
              }
            }
          });
        }
        
        loadedData.forEach(itemData => {
            this._addLoadedData(itemData)
        });
        cullHiddenMeshes(this.avatar);
      })
    }

    /**
     * 
     * @param {string} traitGroupID 
     * @param {string} blendshapeGroupId 
     * @param {string|null} blendshapeTraitId 
     * @returns 
     */
    async _loadBlendShapeTrait(traitGroupID, blendshapeGroupId,blendshapeTraitId){
      const currentTrait = this.avatar[traitGroupID];
      if(!currentTrait){
        console.warn(`Trait with name: ${traitGroupID} was not found or not selected.`)
        return;
      }
      if(!currentTrait.blendShapeTraitsInfo){
        currentTrait.blendShapeTraitsInfo = {};
      }
      if(currentTrait.blendShapeTraitsInfo[blendshapeGroupId]){
        // Deactivate the current blendshape trait
        this.toggleBinaryBlendShape(currentTrait.model, currentTrait.blendShapeTraitsInfo[blendshapeGroupId], false);
      }
      if(blendshapeTraitId == null){
        // Deactivated the blendshape trait; dont do anything else
        delete this.avatar[traitGroupID].blendShapeTraitsInfo[blendshapeGroupId]
        return
      }

      const blendShape = currentTrait.traitInfo.getBlendShape(blendshapeGroupId, blendshapeTraitId);
      if(!blendShape){
        console.warn(`Blendshape with name: ${blendshapeTraitId} was not found.`)
        return;
      }

      // Apply blendshape to the model
      this.toggleBinaryBlendShape(currentTrait.model, blendShape, true);

      this.avatar[traitGroupID].blendShapeTraitsInfo[blendShape.getGroupId()] = blendShape;

    }
    /**
     * 
     * @param {THREE.Object3D} model 
     * @param {BlendShapeTrait} blendshape 
     * @param {boolean} enable 
     */
    toggleBinaryBlendShape = (model,blendshape,enable)=>{
      model.traverse((child)=>{
        if(child.isMesh || child.isSkinnedMesh){

          const mesh = child;
          if(!mesh.morphTargetDictionary || !mesh.morphTargetInfluences) return
          const blendShapeIndex = mesh.morphTargetDictionary[blendshape.id];
          if (blendShapeIndex != undefined){
            mesh.morphTargetInfluences[blendShapeIndex] = enable?1:0;
          }
        }
      })

    }

    async _animationManagerSetup(paths, baseLocation, scale){
      const animationPaths = getAsArray(paths);
      if (this.animationManager){
        this.animationManager.setScale(scale);
        if (paths.length > 0){
          this.animationManager.storeAnimationPaths(animationPaths, baseLocation || "");
          await this.animationManager.loadAnimation(animationPaths,false, 0, animationPaths[0].endsWith('.fbx'), baseLocation || "")
        }
      }
    }

    // XXX check if we can move this code only to manifestData
    async _fetchManifest(location) {
        const response = await fetch(location)
        const data = await response.json()
        return data
    }

    _getPortaitScreenshotTexture(getBlob, options){
      this.blinkManager.enableScreenshot();

      this.characterModel.traverse(o => {
        if (o.isSkinnedMesh) {
          const headBone = o.skeleton.bones.filter(bone => bone.name === 'head')[0];
          headBone.getWorldPosition(localVector3);
        }
      });
      // XXX save variables in manifest to store face distance and field of view.

      // pose the character
      const {
        screenshotResolution,
        screenshotFaceDistance,
        screenshotFaceOffset,
        screenshotBackground,
        screenshotFOV,
      } = options
      const width = screenshotResolution[0];
      const height = screenshotResolution[1];

      localVector3.x += screenshotFaceOffset[0];
      localVector3.y += screenshotFaceOffset[1];
      localVector3.z += screenshotFaceOffset[2];
      
      this.screenshotManager.setBackground(screenshotBackground);
      this.screenshotManager.cameraFrameManager.setCamera(localVector3, screenshotFaceDistance, screenshotFOV);
      const screenshot = getBlob ? 
        this.screenshotManager.getScreenshotBlob(width, height):
        this.screenshotManager.getScreenshotTexture(width, height);

        
      this.blinkManager.disableScreenshot();
      return screenshot;
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
    _VRMBaseSetup(m, item, traitID, textures, colors){
      let vrm = m.userData.vrm;
      if (m.userData.vrm == null){
        console.error("No valid VRM was provided for " + traitID + " trait, skipping file.")
        return null;
      }

      addModelData(vrm, {isVRM0:vrm.meta?.metaVersion === '0'})

      if (this.manifestData.isColliderRequired(traitID))
        saveVRMCollidersToUserData(m);
      
      renameVRMBones(vrm);

      renameMorphTargets(m);

      /**
       * unregister the Blendshapes from the manifest -if any.
       * This is to avoid BlendshapeTraits being affected by the vrm.ExpressionManager
       */
      this._unregisterMorphTargetsFromManifest(vrm);
      
      if (this.manifestData.isLipsyncTrait(traitID))
        this.lipSync = new LipSync(vrm);


      this._modelBaseSetup(vrm, item, traitID, textures, colors);

      // Rotate model 180 degrees

      
      if (vrm.meta?.metaVersion === '0'){
        if (vrm.humanoid.humanBones.hips.node.parent == vrm.scene){
          const dummyRotate = new THREE.Object3D();
          dummyRotate.name = "newRootNode";
          addChildAtFirst(vrm.scene, dummyRotate)
          dummyRotate.add(vrm.humanoid.humanBones.hips.node);
        }
        vrm.humanoid.humanBones.hips.node.parent.rotateY(3.14159);
        //VRMUtils.rotateVRM0( vrm );
        

        vrm.scene.traverse((child) => {
          if (child.isSkinnedMesh) {
            for (let i =0; i < child.skeleton.bones.length;i++){
              child.skeleton.bones[i].userData.vrm0RestPosition = { ... child.skeleton.bones[i].position }
            }
            child.userData.isVRM0 = true;
          }
        })
        console.log("Loaded VRM0 file ", vrm);
      }
      else{
        console.log("Loaded VRM1 file ", vrm);
      }

      return vrm;
    }

    /**
     * 
     * @param {import("@pixiv/three-vrm").VRM} vrm 
     * @returns 
     */
    _unregisterMorphTargetsFromManifest(vrm){
      const manifestBlendShapes = this.manifestData.getAllBlendShapeTraits()
      const expressions = vrm.expressionManager?.expressions
      if(manifestBlendShapes.length == 0) return
      if(!expressions) return
      const expressionToRemove = []
      for(const expression of expressions){
        if(manifestBlendShapes.map((b)=>b.id).includes(expression.expressionName)){
          expressionToRemove.push(expression)
        }
      }

      for(const expression of expressionToRemove){
        vrm.expressionManager.unregisterExpression(expression)
      }
    }

    _modelBaseSetup(model, item, traitID, textures, colors){

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

      const trait = this.manifestData.getModelGroup(traitID);
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

            // mesh.material can be an array (two MToonMaterials)
            getAsArray(mesh.material).map((mat) => {
              updateMaterialTexture(mat, txt)
            })
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
  
        this.blinkManager.addVRM(vrm)

        if (this.lookAtManager)
          this.lookAtManager.addVRM(vrm);

        // Animate this VRM 
        if (this.animationManager)
          this.animationManager.addVRM(vrm)
    }
    _displayModel(model){
      if(model) {
        // call transition
        const m = model.scene;
        //m.visible = false;
        // add the now model to the current scene
        
        this.characterModel.attach(m)
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
      const scale = this.manifestData.displayScale;
        model.scene.scale.set(scale,scale,scale);

      // Move depending on manifest definition
      // const offset = templateInfo.offset;
      // if (offset != null)
      //   model.scene.position.set(offset[0],offset[1],offset[2]);
    }

    _disposeTrait(vrm){
      this.blinkManager.removeVRM(vrm)

      if (this.lookAtManager)
        this.lookAtManager.removeVRM(vrm);

      // Animate this VRM 
      if (this.animationManager)
        this.animationManager.removeVRM(vrm)
      disposeVRM(vrm)
    }


    _addLoadedData(itemData){
      const {
          traitGroupID,
          traitModel,
          textureTrait,
          colorTrait,
          models,
          textures,
          colors
      } = itemData;

      // user selected to remove trait
      if (traitModel == null){
          if ( this.avatar[traitGroupID] && this.avatar[traitGroupID].vrm ){
              // just dispose for now
              this._disposeTrait(this.avatar[traitGroupID].vrm)
              
              this.avatar[traitGroupID] = {}
              // XXX restore effects without setTimeout
          }
          return;
      }

      let vrm = null;

      models.map((m)=>{
          if (m != null)
            vrm = this._VRMBaseSetup(m, traitModel, traitGroupID, textures, colors);

      })

      // do nothing, an error happened
      if (vrm == null)
        return;

      // If there was a previous loaded model, remove it (maybe also remove loaded textures?)
      if (this.avatar[traitGroupID] && this.avatar[traitGroupID].vrm) {
        this._disposeTrait(this.avatar[traitGroupID].vrm)
        // XXX restore effects
      }

      this._positionModel(vrm)
    
      this._displayModel(vrm)
        
      this._applyManagers(vrm)
      
      console.log(this.characterModel)
      // and then add the new avatar data
      // to do, we are now able to load multiple vrm models per options, set the options to include vrm arrays
      this.avatar[traitGroupID] = {
        traitInfo: traitModel,
        blendShapeTraitsInfo:{},
        textureInfo: textureTrait,
        colorInfo: colorTrait,
        name: traitModel.name,
        model: vrm && vrm.scene,
        vrm: vrm
      }
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

        this.loadPercentager = 0;
        this.loadingManager = loadingManager;
        this.gltfLoader = gltfLoader;
        this.textureLoader = textureLoader;

        this.isLoading = false;
    }
    setLoadPercentage(value){
        this.loadPercentager = value;
    }


    // options as SelectedOptions class
    // Loads an array of trait options and returns a promise that resolves as an array of Loaded Data
    loadTraitOptions(options) {
        return new Promise((resolve) => {
            this.isLoading = true;
            const resultData = [];
    
            const promises = options.map(async (option, index) => {
                if (option == null) {
                    resultData[index] = null;
                    return;
                }
                
                const loadedModels = await Promise.all(
                    getAsArray(option?.traitModel?.fullDirectory).map(async (modelDir) => {
                        try {
                            return await this.gltfLoader.loadAsync(modelDir)
                        } catch (error) {
                            console.error(`Error loading modelsss ${modelDir}:`, error);
                            return null;
                        }
                    })
                );
    
                const loadedTextures = await Promise.all(
                  getAsArray(option?.traitTexture?.fullDirectory).map(
                      (textureDir) =>
                          new Promise((resolve) => {
                              this.textureLoader.load(textureDir, (txt) => {
                                  txt.flipY = false;
                                  txt.colorSpace = THREE.SRGBColorSpace;
                                  resolve(txt);
                              },null,(err)=>{
                                console.error("error loading texture: ", err)
                                resolve(null);
                              })
                          })
                  )
                );
    
                const loadedColors = getAsArray(option?.traitColor?.value).map((colorValue) => new THREE.Color(colorValue));
                resultData[index] = new LoadedData({
                    traitGroupID: option?.traitModel.traitGroup.trait,
                    traitModel: option?.traitModel,
                    textureTrait: option?.traitTexture,
                    colorTrait: option?.traitColor,
                    models: loadedModels,
                    textures: loadedTextures,
                    colors: loadedColors,
                });
            });
            Promise.allSettled(promises)
                .then(() => {
                    this.setLoadPercentage(100); // Set progress to 100% once all assets are loaded
                    resolve(resultData);
                    this.isLoading = false;
                })
                .catch((error) => {
                  this.setLoadPercentage(100);
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
            traitGroupID,
            traitModel,
            textureTrait,
            colorTrait,
            models,
            textures,
            colors
        } = data;

        // Option base data
        this.traitGroupID = traitGroupID;
        this.traitModel = traitModel;
        this.textureTrait = textureTrait;
        this.colorTrait = colorTrait;

        // Option loaded data
        this.models = models;
        this.textures = textures;
        this.colors = colors;
    }
}


/**
 * 
 * @param {THREE.MeshStandardMaterial|MToonMaterial} mat 
 * @param {THREE.Texture} txt 
 * @returns 
 */
function updateMaterialTexture(mat,txt){
  if(mat.type === "Shadermaterial" && !mat.isMToonMaterial){
    console.warn("XXX set material texture to shader material", mat)
    return 
  }
  mat.map = txt
  mat.needsUpdate = true;
}