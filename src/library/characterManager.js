import * as THREE from "three"
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader"
import { AnimationManager } from "./animationManager"
import { ScreenshotManager } from "./screenshotManager";
import { BlinkManager } from "./blinkManager";
import { EmotionManager } from "./EmotionManager";
import { VRMLoaderPlugin, VRMSpringBoneCollider } from "@pixiv/three-vrm";
import { getAsArray, disposeVRM, renameVRMBones, addModelData } from "./utils";
import { downloadGLB, downloadVRMWithAvatar } from "../library/download-utils"
import { getNodesWithColliders, saveVRMCollidersToUserData, renameMorphTargets} from "./load-utils";
import { cullHiddenMeshes, setTextureToChildMeshes, addChildAtFirst } from "./utils";
import { LipSync } from "./lipsync";
import { LookAtManager } from "./lookatManager";
import OverlayedTextureManager from "./OverlayTextureManager";
import { ManifestDataManager } from "./manifestDataManager";
import { WalletCollections } from "./walletCollections";
import { buySolanaPurchasableAssets } from "./mint-utils"
import { OwnedNFTTraitIDs } from "./ownedNFTTraitIDs";

//import { Connection, PublicKey, Transaction, SystemProgram } from "@solana/web3.js";


const mouse = new THREE.Vector2();
const raycaster = new THREE.Raycaster();
const localVector3 = new THREE.Vector3(); 


/**
 * CharacterManager is a class that manages 3D character models, their traits, animations, and interactions.
 * It handles loading, displaying, and manipulating character models with various features like
 * animation, emotion, blinking, and look-at behavior.
 * 
 * @class CharacterManager
 */
export class CharacterManager {
  /**
   * @type {EmotionManager}
   */
  emotionManager = null;
  /**
   * @type {AnimationManager}
   */
  animationManager = null;
  /**
   * @type {BlinkManager}
   */
  blinkManager
  /**
   * @type {ScreenshotManager}
   */
  screenshotManager
    constructor(options){
      this._start(options);
    }
    
    /**
     * Initializes the character manager with the provided options.
     * @private
     * @param {Object} options - Configuration options
     */
    async _start(options){
      const{
        parentModel = null,
        renderCamera = null,
        manifestURL = null,
        manifestIdentifier = null
      }= options;

     
      // console.log(Connection);
      // console.log(PublicKey);
      // console.log(Transaction);
      // console.log(SystemProgram);
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
      this.overlayedTextureManager = new OverlayedTextureManager(this)
      this.blinkManager = new BlinkManager(0.1, 0.1, 0.5, 5)
      this.emotionManager = new EmotionManager();
      this.walletCollections = new WalletCollections();

      this.rootModel.add(this.characterModel)
      this.renderCamera = renderCamera;

      this.manifestDataManager = new ManifestDataManager();
      if (manifestURL){
        this.manifestDataManager.loadManifest(manifestURL,manifestIdentifier).then(()=>{
          this.animationManager.setScale(this.manifestDataManager.getDisplayScale());
        })
       
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

    /**
     * Toggles whether spring bone animations are paused.
     * This is useful when taking screenshots or calculating bone offsets.
     * @param {boolean} x - true to pause, false to unpause
     */
    togglePauseSpringBoneAnimation(x){
      for(const [_,trait] of Object.entries(this.avatar)){
        if(trait.vrm.springBoneManager){
            trait.vrm.springBoneManager.paused =x
        }
      }
    }

    /**
     * Updates the character's state based on elapsed time.
     * @param {number} deltaTime - Time elapsed since last update
     */
    update(deltaTime){
      if (this.lookAtManager != null){
        this.lookAtManager.update();
      }
      if(this.avatar){
        for (const prop in this.avatar){
          if (this.avatar[prop]?.vrm != null){
            if(this.avatar[prop].vrm.springBoneManager?.paused){
              return
            }
            this.avatar[prop].vrm.springBoneManager?.update(deltaTime);
          }
        }
      }
    }
    unlockManifestByIndex(index, testWallet = null){
      console.log(index);
      return this.manifestDataManager.unlockManifestByIndex(index, testWallet);
    }
    unlockManifestByIdentifier(identifier, testWallet = null){
      return this.manifestDataManager.unlockManifestByIdentifier(identifier, testWallet);
    }
    isManifestByIndexLocked(index){
      return this.manifestDataManager.isManifestByIndexNFTLocked(index);
    }
    isManifestByIdentifierLocked(identifier){
      return this.manifestDataManager.isManifestByIdentifierNFTLocked(identifier);
    }
    getLoadedLockedManifests(isLocked){
      return this.manifestDataManager.getLoadedLockedManifests(isLocked);
    }
    getLoadedManifests(){
      return this.manifestDataManager.getLoadedManifests();
    }

    /**
     * Adds look-at mouse behavior to the character.
     * @param {number} screenPrecentage - Percentage of screen to consider for look-at behavior
     * @param {string} canvasID - ID of the canvas element
     * @param {THREE.Camera} camera - Camera used for look-at calculations
     * @param {boolean} [enable=true] - Whether to enable the behavior immediately
     */
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
    /**
     * Saves a portrait screenshot of the character.
     * @param {string} name - Name for the screenshot file
     * @param {number} width - Width of the screenshot
     * @param {number} height - Height of the screenshot
     * @param {number} [distance=1] - Distance from character for the screenshot
     * @param {number} [headHeightOffset=0] - Vertical offset for the head position
     */
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
    /**
     * Removes the current character and all its traits.
     */
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
      this.manifestDataManager.clearManifests();
      if (this.animationManager)
        this.animationManager.clearCurrentAnimations();
    }
    /**
     * Checks if downloading is supported.
     * @returns {boolean} Whether downloading is supported
     */
    canDownload(){
      return this.manifestDataManager.canDownload();
    }
    /**
     * Downloads the VRM file with the given name and export options.
     * @param {string} name - Name for the downloaded file
     * @param {Object} [exportOptions=null] - Additional export options
     * @returns {Promise<void>} Promise that resolves when download is complete
     */
    downloadVRM(name, exportOptions = null) {
      return new Promise(async (resolve, reject) => {
        if (this.canDownload()) {
          try {
            // Set default export options if not provided
            exportOptions = exportOptions || {};
            const manifestOptions = this.manifestDataManager.getExportOptions();
            console.log(manifestOptions);
            const finalOptions = { ...manifestOptions, ...exportOptions };
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
        const finalOptions = {...this.manifestDataManager.getExportOptions(), ...exportOptions};
        downloadGLB(this.characterModel, name, finalOptions);
      }
      else{
        console.error("Download not supported");
      }
    }
    /**
     * Gets the current avatar selection.
     * @returns {Object} Object containing selected traits and their IDs
     */
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
    /**
     * Gets the bone and triangle count of the current character.
     * @returns {Object} Object containing triangle and bone counts
     */
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

    /**
     * Gets all group traits from the manifest.
     * @returns {Array} Array of group traits
     */
    getGroupTraits(){
      return this.manifestDataManager.getGroupModelTraits();
    }
      /**
     * Gets blend shape group traits for a specific trait.
     * @param {string} traitGroupId - ID of the trait group
     * @param {string} traitId - ID of the trait
     * @param {string} identifier - Identifier of target manifest
     * @returns {Array} Array of blend shape traits
     */
    getBlendShapeGroupTraits(traitGroupId, traitId, identifier){
      this.manifestDataManager.getGroupBlendShapeTraits(traitGroupId, traitId, identifier);
    }
    /**
     * Checks if any manifest has NFT lock.
     * @returns {boolean} Whether any manifest has NFT lock
     */
    hasManifestWithNFTLock(){
      return this.manifestDataManager.hasManifestWithNFTLock();
    }
    /**
     * Gets the current character model.
     * @returns {THREE.Object3D} Current character model
     */
    getCurrentCharacterModel(){
      return this.characterModel;
    }
    /**
     * Checks if a trait group is required.
     * @param {string} groupTraitID - ID of the trait group
     * @returns {boolean} Whether the trait group is required
     */
    isTraitGroupRequired(groupTraitID) {
      return this.manifestDataManager.isTraitGroupRequired(groupTraitID);
    }
    
    /**
     * Gets all traits for a specific group trait.
     * @param {string} groupTraitID - ID of the trait group
     * @param {string} identifier - Identifier of target manifest
     * @returns {Array} Array of traits for the specified group
     */
    getTraits(groupTraitID, identifier){
      return this.manifestDataManager.getModelTraits(groupTraitID, identifier);
    }

    /**
     * Gets the current trait ID for a group.
     * @param {string} groupTraitID - ID of the trait group
     * @returns {string} Current trait ID
     */
    getCurrentTraitID(groupTraitID){
      return this.avatar[groupTraitID]?.traitInfo?.id;
    }
    /**
     * Gets the current trait data for a group.
     * @param {string} groupTraitID - ID of the trait group
     * @returns {Object} Current trait data
     */
    getCurrentTraitData(groupTraitID){
      return this.avatar[groupTraitID]?.traitInfo;
    }
    /**
     * Gets the current blend shape trait data for a group.
     * @param {string} groupTraitID - ID of the trait group
     * @returns {Object} Current blend shape trait data
     */
    getCurrentBlendShapeTraitData(groupTraitID){
      return this.avatar[groupTraitID]?.blendShapeTraitsInfo||{};
    }
    /**
     * Gets the current trait VRM for a group.
     * @param {string} groupTraitID - ID of the trait group
     * @returns {Object} Current trait VRM
     */
    getCurrentTraitVRM(groupTraitID){
      return this.avatar[groupTraitID]?.vrm;
    }
    /**
     * Sets the parent model for the character.
     * @param {THREE.Object3D} model - Parent model to set
     */
    setParentModel(model){
      model.add(this.rootModel);
      this.parentModel = model;
      if (this.screenshotManager)
        this.screenshotManager.setScene(this.parentModel);
    }
    /**
     * Sets the render camera for the character.
     * @param {THREE.Camera} camera - Camera to set
     */
    setRenderCamera(camera){
      this.renderCamera = camera;
    }

    
    /**
     * Loads random traits based on manifest data.
     * @returns {Promise<void>} Promise that resolves when traits are loaded
     */
    loadRandomTraits() {
      return new Promise(async (resolve, reject) => {
        if (this.manifestDataManager.hasExistingManifest()) {
          const randomTraits = this.manifestDataManager.getRandomTraits();
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
     * Loads a random trait from a specific group.
     * @param {string} groupTraitID - ID of the trait group
     * @returns {Promise<void>} Promise that resolves when trait is loaded
     */
    loadRandomTrait(groupTraitID) {
      return new Promise(async (resolve, reject) => {
        if (this.manifestDataManager.hasExistingManifest()) {
          const randomTrait = this.manifestDataManager.getRandomTrait(groupTraitID);
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
     * @param {string} url - URL of the NFT
     * @param {string} [identifier=null] - Identifier for the manifest
     * @param {boolean} [fullAvatarReplace=true] - Whether to replace all existing traits
     * @param {Array<string>} [ignoreGroupTraits=null] - Trait groups to ignore
     * @returns {Promise<void>} Promise that resolves when traits are loaded
     */
    loadTraitsFromNFT(url, identifier = null, fullAvatarReplace = true, ignoreGroupTraits = null) {
      // XXX should identifier be taken from nft group or passed by user?
      return new Promise(async (resolve, reject) => {
        try {
          // Check if manifest data is available
          if (this.manifestDataManager.hasExistingManifest()) {
            // Retrieve traits from the NFT using the manifest data
            const traits = await this.manifestDataManager.getNFTraitOptionsFromURL(url, ignoreGroupTraits, identifier);

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
     * Loads traits from an NFT object.
     * @param {Object} NFTObject - NFT object containing trait information
     * @param {string} [identifier=null] - Identifier for the manifest
     * @param {boolean} [fullAvatarReplace=true] - Whether to replace all existing traits
     * @param {Array<string>} [ignoreGroupTraits=null] - Trait groups to ignore
     * @returns {Promise<void>} Promise that resolves when traits are loaded
     */
    loadTraitsFromNFTObject(NFTObject, identifier = null, fullAvatarReplace = true, ignoreGroupTraits = null) {
      // XXX should identifier be taken from nft group or passed by user?
      return new Promise(async (resolve, reject) => {
        // Check if manifest data is available
        if (this.manifestDataManager.hasExistingManifest()) {
          try {
            // Retrieve traits from the NFT object using manifest data
            const traits = this.manifestDataManager.getNFTraitOptionsFromObject(NFTObject, ignoreGroupTraits, identifier);

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
     * @returns {Promise<void>} Promise that resolves when traits are loaded
     */
    loadInitialTraits() {
      return new Promise(async(resolve, reject) => {
        // Check if manifest data is available
        if (this.manifestDataManager.hasExistingManifest()) {
          // Load initial traits using the _loadTraits method
          await this._loadTraits(this.manifestDataManager.getInitialTraits());

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
     * @returns {Promise<void>} Promise that resolves when traits are loaded
     */
    loadAllTraits() {
      return new Promise(async(resolve, reject) => {
        // Check if manifest data is available
        if (this.manifestDataManager.hasExistingManifest()) {
          // Load initial traits using the _loadTraits method
          await this._loadTraits(this.manifestDataManager.getSelectionForAllTraits());

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
     * Loads and activates a blend shape trait.
     * @param {string} traitGroupID - ID of the trait group
     * @param {string} blendshapeGroupId - ID of the blend shape group
     * @param {string|null} blendshapeTraitId - ID of the blend shape trait
     */
    loadBlendShapeTrait(traitGroupID, blendshapeGroupId, blendshapeTraitId){
      const currentTrait = this.avatar[traitGroupID];
      if(!currentTrait){
        console.warn(`Trait with name: ${traitGroupID} was not found or not selected.`)
        return;
      }
      if(!this.manifestDataManager.hasExistingManifest()){
        console.warn("No manifest data was loaded.")
        return;
      }

      try{
        this._loadBlendShapeTrait(traitGroupID, blendshapeGroupId, blendshapeTraitId);
      }catch{ 
        console.error("Error loading blendshape trait "+traitGroupID, blendshapeGroupId, blendshapeTraitId);
      }
    }
    /**
     * Removes a blend shape trait.
     * @param {string} groupTraitID - ID of the trait group
     * @param {string} blendShapeGroupId - ID of the blend shape group
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
     * Checks if a trait is allowed based on restrictions.
     * @private
     * @param {string} traitGroupID - ID of the trait group
     * @param {string} traitID - ID of the trait
     * @returns {Array<Object>} Array of rule results
     */
    _getTraitAllowedRules(traitGroupID,traitID){
    const isAllowAggregated = []
      for( const trait in this.avatar){
        const object = this.avatar[trait];
        const isAllowed = object.traitInfo.traitGroup.restrictions?.isReverseAllowed(object.traitInfo.type,traitGroupID,object.traitInfo.id,traitID)
        if(isAllowed && !isAllowed?.allowed){
          isAllowAggregated.push(isAllowed)
        }
      }
      return isAllowAggregated.length? isAllowAggregated:[{allowed:true,blocking:{}}]
    }

    /**
     * Checks Blendshape restrictions;
     * @private
     * @param {} groupTraitID 
     */
    _checkBlendshapeRestrictions(groupTraitID){
      for( const trait in this.avatar){
        if (this.manifestDataManager.isGroupTraitRestrictedInAnyManifest(trait, groupTraitID)){
          console.warn(`Trait with name: Blendshapes of ${trait} is not allowed to be loaded with ${groupTraitID}`)
          this.removeBlendShapeTrait(trait,null)
        }
      }
    }

    /**
     * Checks and removes blocking traits before loading a new trait.
     * @private
     * @param {string} groupTraitID - ID of the trait group
     * @param {string} traitID - ID of the trait
     */
    _checkRestrictionsBeforeLoad(groupTraitID,traitID){
      const isAllowed = this._getTraitAllowedRules(groupTraitID,traitID)
      if(isAllowed[0].allowed){
        // check if blendshape restrictions are met
        this._checkBlendshapeRestrictions(groupTraitID)
        return
      }
      for(const rule of isAllowed){
        if(rule.blocking.blockingTrait){
          /**
           * We have a trait blocking, remove it;
           */
          this.removeTrait(rule.blocking.blockingTrait);
        }
         if(rule.blocking.blockingItemId){
          /**
           * We have a specific item ID blocking, remove it;
           */
          const trait = this.manifestDataManager.getTraitOptionById(rule.blocking.blockingItemId);
          if(trait){
            this.removeTrait(trait.traitGroup.trait);
          }
        }
         if (rule.blocking.blockingType){
          /*
          * We have a specific type blocking, remove it;
          */
          const traits = this.manifestDataManager.getTraitOptionsByType(rule.blocking.blockingType);
          if(traits.length){
            for(const prop in this.avatar){
              if(this.avatar[prop].traitInfo.type == rule.blocking.blockingType){
                this.removeTrait(prop);
              }
            }
          }
        }
      }
    }

    /**
     * Loads a specific trait based on group and trait IDs.
     * @param {string} groupTraitID - ID of the trait group
     * @param {string} traitID - ID of the trait
     * @param {string} identifierID - Identifier for the manifest
     * @param {boolean} [soloView=false] - Whether to display only the new trait
     * @returns {Promise<void>} Promise that resolves when trait is loaded
     */
    loadTrait(groupTraitID, traitID, identifierID, soloView = false) {
      return new Promise(async (resolve, reject) => {
        // Check if manifest data is available
        if (this.manifestDataManager.hasExistingManifest()) {
          try {
            // Retrieve the selected trait using manifest data
            const selectedTrait = this.manifestDataManager.getTraitOption(groupTraitID, traitID, identifierID);
            this._checkRestrictionsBeforeLoad(groupTraitID,traitID)
            console.log(selectedTrait);
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
     * @param {string} groupTraitID - ID of the trait group
     * @param {string} url - URL of the custom trait
     * @returns {Promise<void>} Promise that resolves when trait is loaded
     */
    loadCustomTrait(groupTraitID, url) {
      return new Promise(async (resolve, reject) => {
        // Check if manifest data is available
        if (this.manifestDataManager.hasExistingManifest()) {
          try {
            // Retrieve the selected custom trait using manifest data
            const selectedTrait = this.manifestDataManager.getCustomTraitOption(groupTraitID, url);
            console.log(selectedTrait);
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
     * Loads a custom texture for a trait group.
     * @param {string} groupTraitID - ID of the trait group
     * @param {string} url - URL of the custom texture
     * @returns {Promise<void>} Promise that resolves when texture is loaded
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
     * Sets the color of a trait group.
     * @param {string} groupTraitID - ID of the trait group
     * @param {string} hexColor - Hexadecimal color value
     * @throws {Error} If the trait group is not found
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


    /**
     * Removes a trait from the character.
     * @param {string} groupTraitID - ID of the trait group
     * @param {boolean} [forceRemove=false] - Whether to force removal of required traits
     */
    removeTrait(groupTraitID, forceRemove = false){
      if (this.isTraitGroupRequired(groupTraitID) && !forceRemove){
        console.warn(`No trait with name: ${ groupTraitID } is not removable.`)
        return;
      }

      if (this.manifestDataManager.containsModelGroupWithID(groupTraitID)){
        const itemData = new LoadedData({traitGroupID:groupTraitID, traitModel:null})
        this._addLoadedData(itemData);
        cullHiddenMeshes(this.avatar);
      }
      else{
        console.warn(`No trait with name: ${ groupTraitID } was found.`)
      }
    }
    /**
     * Updates culling of hidden meshes.
     */
    updateCullHiddenMeshes(){
      cullHiddenMeshes(this.avatar);
    }
    /**
     * Loads the optimizer manifest.
     */
    loadOptimizerManifest(){
      this.manifestDataManager.setCustomManifest();
    }

    /**
     * Sets the manifest for the character.
     * @param {Object} manifest - Manifest object
     * @param {string} identifier - Identifier for the manifest
     */
    setManifest(manifest, identifier){
      this.manifestDataManager.setManifest(manifest, identifier);
    }
    loadManifest(url, identifier){
      return this.manifestDataManager.loadManifest(url, identifier);
    }
    /**
     * Gets the current optimizer character model.
     * @returns {Object} Current optimizer character model
     */
    getCurrentOptimizerCharacterModel(){
      return this.avatar["CUSTOM"]?.vrm;
    }

    /**
     * Loads an optimized character from a URL.
     * @param {string} url - URL of the optimized character
     * @returns {Promise<void>} Promise that resolves when character is loaded
     */
    loadOptimizerCharacter(url) {
      return this.loadCustomTrait("CUSTOM", url);
    }
    
    /**
     * Displays only the target trait and removes all others.
     * @param {string|Array<string>} groupTraitID - ID(s) of the trait(s) to display
     */
    async soloTargetGroupTrait(groupTraitID){
      const groupTraitIDArray = getAsArray(groupTraitID) 
      const options = [];
      for (const trait in this.avatar){
        if (groupTraitIDArray.includes(trait)){
          options.push(this.manifestDataManager.getTraitOption(trait, this.avatar[trait].traitInfo.id));
        }
      }
      await this._loadTraits(options,true);
    }

    /**
     * Stores the current avatar for later loading.
     */
    storeCurrentAvatar(){
      this.storedAvatar = {...this.avatar}
    }
    /**
     * Loads a previously stored avatar.
     */
    async loadStoredAvatar(){
      const options = [];
      for (const trait in this.storedAvatar){
        options.push(this.manifestDataManager.getTraitOption(trait, this.storedAvatar[trait].traitInfo.id));
        // TO DO, ALSO GET COLOR TRAITS AND TEXTURE TRAITS
      }
      this._loadTraits(options,true);
    }

    /**
     * Loads traits from the provided options.
     * @private
     * @param {Array} options - Array of trait options to load
     * @param {boolean} [fullAvatarReplace=false] - Whether to replace all existing traits
     */
    async _loadTraits(options, fullAvatarReplace = false){
      console.log("loaded traits:", options)
      await this.traitLoadManager.loadTraitOptions(getAsArray(options)).then(loadedData=>{
        if (fullAvatarReplace){
          // add null loaded options to existingt traits to remove them;
          const groupTraits = this.getGroupTraits();
          groupTraits.forEach((trait) => {
            const coincidence = loadedData.some((option) => option.traitModel?.traitGroup.trait === trait.trait);
            if (!coincidence) {
              if (this.avatar[trait.trait] != null){
                loadedData.push(new LoadedData({collectionID:trait.collectionID, traitGroupID:trait.trait, traitModel:null}));
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
     * Loads a blend shape trait.
     * @private
     * @param {string} traitGroupID - ID of the trait group
     * @param {string} blendshapeGroupId - ID of the blend shape group
     * @param {string|null} blendshapeTraitId - ID of the blend shape trait
     */
    async _loadBlendShapeTrait(traitGroupID, blendshapeGroupId, blendshapeTraitId){
      const currentTrait = this.avatar[traitGroupID];
      if(!currentTrait){
        console.warn(`Trait with name: ${traitGroupID} was not found or not selected.`)
        return;
      }
      if(!currentTrait.blendShapeTraitsInfo){
        currentTrait.blendShapeTraitsInfo = {};
      }

      if(!blendshapeGroupId){
        for(const k in currentTrait.blendShapeTraitsInfo){
          // Deactivate the current blendshape trait
          this.toggleBinaryBlendShape(currentTrait.model, currentTrait.blendShapeTraitsInfo[k], false);
        }
        return
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
     * Toggles a binary blend shape on a model.
     * @private
     * @param {THREE.Object3D} model - Model to modify
     * @param {Object} blendshape - Blend shape to toggle
     * @param {boolean} enable - Whether to enable or disable the blend shape
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

    /**
     * Gets the current total price of all locked and purchasable traits.
     * @returns {number} Total price
     */
    getCurrentTotalPrice(){
      const avatar = this.avatar;
      let price = 0;
      for (const trait in avatar){
        const traitInfo = avatar[trait].traitInfo;
        if (traitInfo.locked === true && traitInfo.purchasable === true && traitInfo._purchased === false){
          price += traitInfo.price;
        }
      }
      return price;
    }
    /**
     * Gets the main price currency.
     * @returns {string} Main currency
     */
    getMainPriceCurrency(){
      return this.manifestDataManager.getMainCurrency();
    }

    /**
     * Unlocks a manifest by index.
     * @param {number} index - Index of the manifest to unlock
     * @param {Object} [testWallet=null] - Test wallet to use
     * @returns {Promise<void>} Promise that resolves when manifest is unlocked
     */
    unlockManifestByIndex(index, testWallet = null){
      console.log(index);
      return this.manifestDataManager.unlockManifestByIndex(index, testWallet);
    }
    /**
     * Purchases assets from the current avatar.
     * @returns {Promise<void>} Promise that resolves when purchase is complete
     */
    purchaseAssetsFromAvatar(){
      console.warn("TODO!! STILL NEEDS TO DETECT DIFFERENT COLLECTIONS!!")
      const assets = this.getPurchaseTraitsArray();
      const purchaseIDs = [];
      assets.forEach(asset => {
        purchaseIDs.push(asset._id);
      }); 


      return new Promise((resolve, reject) => {
        this.manifestDataManager.mainManifestData.purchaseTraits(purchaseIDs).then(()=>{
          this.manifestDataManager.mainManifestData.unlockPurchasedAssetsWithWallet().then(()=>{
            resolve();
          }).catch(e=>{
            console.error(e)
            reject();
          })
        }).catch(e=>{
          console.error(e)
          reject();
        })
      });
    }
    /**
     * Gets an array of purchasable traits.
     * @returns {Array} Array of purchasable traits
     */
    getPurchaseTraitsArray(){
      const avatar = this.avatar;
      const purchaseAssetsList = [];
      for (const trait in avatar){
        const traitInfo = avatar[trait].traitInfo;
        if (traitInfo.locked === true && traitInfo.purchasable === true && traitInfo._purchased === false){
          purchaseAssetsList.push(traitInfo);
        }
      }
      console.log(purchaseAssetsList);
      return purchaseAssetsList;
    }

    /**
     * Sets up the animation manager.
     * @private
     * @param {Array} paths - Array of animation paths
     * @param {string} baseLocation - Base location for animations
     * @param {number} scale - Scale for animations
     */
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

    /**
     * Gets a portrait screenshot texture.
     * @private
     * @param {boolean} getBlob - Whether to get the screenshot as a blob
     * @param {Object} options - Screenshot options
     * @returns {Object} Screenshot texture or blob
     */
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

    /**
     * Sets up wireframe material for a mesh.
     * @private
     * @param {THREE.Mesh} mesh - Mesh to set up
     */
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
    /**
     * Sets up the VRM model basic setup.
     * @private
     * @param {Object} m - VRM model
     * @param {string} collectionID - Collection ID
     * @param {Object} item - Item data
     * @param {string} traitID - Trait ID
     * @param {Array} textures - Array of textures
     * @param {Array} colors - Array of colors
     * @returns {Object} Set up VRM model
     */
    _VRMBaseSetup(m, collectionID, item, traitID, textures, colors){
      let vrm = m.userData.vrm;
      if (m.userData.vrm == null){
        console.error("No valid VRM was provided for " + traitID + " trait, skipping file.")
        return null;
      }

      addModelData(vrm, {isVRM0:vrm.meta?.metaVersion === '0'})

      if (this.manifestDataManager.isColliderRequired(traitID)){
        saveVRMCollidersToUserData(m);
      }
      
      // apply colliders to the spring manager
      this._applySpringBoneColliders(vrm);
      
      renameVRMBones(vrm);

      renameMorphTargets(m);

      /**
       * unregister the Blendshapes from the manifest -if any.
       * This is to avoid BlendshapeTraits being affected by the vrm.ExpressionManager
       */
      this._unregisterMorphTargetsFromManifest(vrm, collectionID);
      
      if (this.manifestDataManager.isLipsyncTrait(traitID, collectionID))
        this.lipSync = new LipSync(vrm);


      this._modelBaseSetup(vrm, collectionID, item, traitID, textures, colors);

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
     * Applies spring bone colliders to a VRM model.
     * @private
     * @param {Object} vrm - VRM model
     */
     _applySpringBoneColliders(vrm) {
      /**
       * method to add collider groups to the joints of the new VRM
       * @param {import('@pixiv/three-vrm').VRMSpringBoneColliderGroup[]} colliderGroups
       */
      function addToJoints(colliderGroups) {
        vrm.springBoneManager.joints.forEach((joint) => {
          for (const group of colliderGroups) {
  
            const joinGroup = joint.colliderGroups.find((cg)=>cg.name == group.name) 
            if(joinGroup){
              if(group.colliders.length != joinGroup.colliders.length){
                const newColliders = group.colliders.filter((c)=>!joinGroup.colliders.find((cc)=>cc.name == c.name))
                joinGroup.colliders.push(...newColliders)
              }
            }else{
              joint.colliderGroups.push(group)
            }
          }
        })
      }
  
      const getColliders = ()=>{
        const colliderGroups = [] 
        Object.entries(this.avatar).map(([_, entry]) => {
          // get nodes with colliders
          const nodes = getNodesWithColliders(entry.vrm)
          if (nodes.length === 0) return
  
          // For each node with colliders info
          nodes.forEach((node) => {
  
            if (!vrm.springBoneManager) {
              return
            }
  
            const colliderGroup = {
              colliders: [],
              name: node.name,
            }
            // Only direct children
            for (const child of node.children) {
              if (child instanceof VRMSpringBoneCollider) {
                if (colliderGroup.colliders.indexOf(child) === -1) {
                  colliderGroup.colliders.push(child)
                }
              }
            }
            if (colliderGroup.colliders.length) {
              const groupExists= colliderGroups.find((cg)=>cg.name == colliderGroup.name)
              if(groupExists && groupExists.colliders.length != colliderGroup.colliders.length){
                // Get the different colliders
                const newColliders = colliderGroup.colliders.filter((c)=>!groupExists.colliders.find((cg)=>cg.name == c.name))
                groupExists.colliders.push(...newColliders)
              }else if (!groupExists){
                colliderGroups.push(colliderGroup)
              }
            }
          })
        })
        return colliderGroups
      }
  
      const groups = getColliders()
      addToJoints(groups)
    }
  
    /**
     * Unregisters morph targets from the manifest.
     * @private
     * @param {Object} vrm - VRM model
     * @param {string} identifier - Manifest identifier
     */
    _unregisterMorphTargetsFromManifest(vrm, identifier){
      const manifestBlendShapes = this.manifestDataManager.getAllBlendShapeTraits(identifier)
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

    /**
     * Sets up the base model.
     * @private
     * @param {Object} model - Model to set up
     * @param {string} collectionID - Collection ID
     * @param {Object} item - Item data
     * @param {string} traitID - Trait ID
     * @param {Array} textures - Array of textures
     * @param {Array} colors - Array of colors
     */
    _modelBaseSetup(model, collectionID, item, traitID, textures, colors){

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

      const defaultValues = this.manifestDataManager.getDefaultValues();

      const traitGroup = this.manifestDataManager.getModelGroup(traitID, collectionID);
      // culling layers setup section
      addModelData(model, {
        cullingLayer: 
          item.cullingLayer != null ? item.cullingLayer: 
          traitGroup?.cullingLayer != null ? traitGroup?.cullingLayer: 
          defaultValues.defaultCullingLayer != null?defaultValues.defaultCullingLayer: -1,
        cullingDistance: 
          item.cullingDistance != null ? item.cullingDistance: 
          traitGroup?.cullingDistance != null ? traitGroup?.cullingDistance:
          defaultValues.defaultCullingDistance != null ? defaultValues.defaultCullingDistance: null,
        maxCullingDistance:
          item.maxCullingDistance != null ? item.maxCullingDistance: 
          traitGroup?.maxCullingDistance != null ? traitGroup?.maxCullingDistance:
          defaultValues.maxCullingDistance != null ? defaultValues.maxCullingDistance: Infinity,
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
    /**
     * Applies managers to a VRM model.
     * @private
     * @param {Object} vrm - VRM model
     */
    _applyManagers(vrm){
  
        this.blinkManager.addVRM(vrm)
        this.emotionManager.addVRM(vrm)

        if (this.lookAtManager)
          this.lookAtManager.addVRM(vrm);

        // Animate this VRM 
        if (this.animationManager)
          this.animationManager.addVRM(vrm)
    }
    /**
     * Displays a model.
     * @private
     * @param {Object} model - Model to display
     */
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
    /**
     * Positions a model.
     * @private
     * @param {Object} model - Model to position
     */
    _positionModel(model){
      const scale = this.manifestDataManager.getDisplayScale();
        model.scene.scale.set(scale,scale,scale);

      // Move depending on manifest definition
      // const offset = templateInfo.offset;
      // if (offset != null)
      //   model.scene.position.set(offset[0],offset[1],offset[2]);
    }

    /**
     * Disposes of a trait.
     * @private
     * @param {Object} vrm - VRM model to dispose
     */
    _disposeTrait(vrm){
      this.blinkManager.removeVRM(vrm)
      this.emotionManager.removeVRM(vrm)
      
      if (this.lookAtManager)
        this.lookAtManager.removeVRM(vrm);

      // Animate this VRM 
      if (this.animationManager)
        this.animationManager.removeVRM(vrm)
      disposeVRM(vrm)
    }


    /**
     * Adds loaded data to the character.
     * @private
     * @param {Object} itemData - Data to add
     */
    _addLoadedData(itemData){
      const {
          collectionID,
          traitGroupID,
          traitModel,
          textureTrait,
          colorTrait,
          models,
          textures,
          colors,
      } = itemData;

      // user selected to remove trait
      if (traitModel == null){
          if ( this.avatar[traitGroupID] && this.avatar[traitGroupID].vrm ){
              // just dispose for now
              this._disposeTrait(this.avatar[traitGroupID].vrm)
              
              delete this.avatar[traitGroupID]
              // XXX restore effects without setTimeout
          }
          return;
      }

      let vrm = null;

      models.map((m)=>{
          if (m != null)
            vrm = this._VRMBaseSetup(m, collectionID, traitModel, traitGroupID, textures, colors);

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

      if(this.overlayedTextureManager){
        if(traitModel.targetDecalCollection){
          this.overlayedTextureManager.setTargetVRM(vrm, traitModel.decalMeshNameTargets)
        }
      }
      
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
                  collectionID: option?.traitModel.collectionID,
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
            collectionID,
            traitGroupID,
            traitModel,
            textureTrait,
            colorTrait,
            models,
            textures,
            colors
        } = data;

        this.collectionID = collectionID;

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