import * as THREE from "three"
import { GLTF, GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader"
import { AnimationManager } from "./animationManager"
import { ScreenshotManager } from "./screenshotManager";
import { BlinkManager } from "./blinkManager";
import { EmotionManager } from "./EmotionManager";
import { MToonMaterial, VRM, VRMLoaderPlugin, VRMSpringBoneCollider, VRMSpringBoneColliderGroup } from "@pixiv/three-vrm";
import { getAsArray, disposeVRM, renameVRMBones, addModelData } from "./utils";
import { downloadGLB, downloadVRMWithAvatar } from "./download-utils"
import { getNodesWithColliders, saveVRMCollidersToUserData, renameMorphTargets} from "./load-utils";
import { cullHiddenMeshes, setTextureToChildMeshes, addChildAtFirst } from "./utils";
import { LipSync } from "./lipsync";
import { LookAtManager } from "./lookatManager";
import OverlayedTextureManager from "./OverlayTextureManager";
import { ManifestDataManager } from "./manifestDataManager";
import { WalletCollections } from "./walletCollections";
import { buySolanaPurchasableAssets } from "./mint-utils"
import { OwnedNFTTraitIDs } from "./ownedNFTTraitIDs";
import { BlendShapeTrait, CharacterManifestData, ColorTrait, DecalTrait, DownloadOptionsManifest, manifestJson, ModelTrait, SelectedOption, TextureTrait, TraitModelsGroup } from "./CharacterManifestData";

//import { Connection, PublicKey, Transaction, SystemProgram } from "@solana/web3.js";


const mouse = new THREE.Vector2();
const raycaster = new THREE.Raycaster();
const localVector3 = new THREE.Vector3(); 
export type CharacterManagerOptions= {
  parentModel:THREE.Object3D|THREE.Scene,
  renderCamera:THREE.Camera,
  manifestURL?:string
  manifestIdentifier?:string
}
export type avatarData = {
  traitInfo: ModelTrait,
  blendShapeTraitsInfo:Record<string,BlendShapeTrait>,
  textureInfo?: TextureTrait,
  colorInfo?: ColorTrait,
  decalInfo?: DecalTrait[],
  name: string,
  model: THREE.Group,
  vrm: VRM
}

/**
 * CharacterManager is a class that manages 3D character models, their traits, animations, and interactions.
 * It handles loading, displaying, and manipulating character models with various features like
 * animation, emotion, blinking, and look-at behavior.
 * 
 * @class CharacterManager
 */
export class CharacterManager {
  manifest:any
  manifestData: CharacterManifestData = null!;
  emotionManager:EmotionManager = null!
  avatar:Record<string,avatarData> = {};// Holds information of traits within the avatar
  storedAvatar:Record<string,avatarData> = {};// Holds information of an avatar previously stored
  rootModel:THREE.Object3D = null!;
  characterModel:THREE.Object3D = null!;
  parentModel:THREE.Scene = null!;
  lipSync:LipSync = null!;
  lookAtManager:LookAtManager = null!;
  animationManager:AnimationManager = null!;
  overlayedTextureManager:OverlayedTextureManager = null!;
  screenshotManager:ScreenshotManager = null!;
  blinkManager:BlinkManager = null!;
  renderCamera:THREE.Camera = null!;

  traitLoadManager:TraitLoadingManager = null!;
  vrmHelperRoot:THREE.Group = null!;
  walletCollections?:WalletCollections = null!;
  manifestDataManager:ManifestDataManager = null!;


  constructor(options:CharacterManagerOptions){
    this._start(options);
  }
  
  async _start(options:CharacterManagerOptions){
      const{
        parentModel,
        renderCamera,
        manifestURL,
        manifestIdentifier
      }= options;

     
      // console.log(Connection);
      // console.log(PublicKey);
      // console.log(Transaction);
      // console.log(SystemProgram);
      // data that is needed, but not required to be downloaded
      this.rootModel = new THREE.Object3D();
      // all data that will be downloaded
      this.characterModel = new THREE.Object3D();

      this.parentModel = parentModel! as any;
      if (parentModel){
        parentModel.add(this.rootModel);
      }
      this.lipSync = null!;

      this.lookAtManager = null!;
      this.animationManager = new AnimationManager();
		this.screenshotManager = new ScreenshotManager(
			this,
			(parentModel || this.rootModel) as THREE.Scene,
		)
      this.overlayedTextureManager = new OverlayedTextureManager(this)
      this.blinkManager = new BlinkManager(0.1, 0.1, 0.5, 5)
      this.emotionManager = new EmotionManager();
      this.walletCollections = new WalletCollections();

      this.rootModel.add(this.characterModel)
      this.renderCamera = renderCamera!;

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
    togglePauseSpringBoneAnimation(x:boolean){
      for(const [_,trait] of Object.entries(this.avatar)){
        if(trait.vrm.springBoneManager){
          //@ts-expect-error paused is defined
            trait.vrm.springBoneManager.paused =x
        }
      }
    }

    /**
     * Updates the character's state based on elapsed time.
     * @param {number} deltaTime - Time elapsed since last update
     */
    update(deltaTime:number){
      if (this.lookAtManager != null){
        this.lookAtManager.update();
      }
      if(this.avatar){
        for (const prop in this.avatar){
          if (this.avatar[prop]?.vrm != null){
            //@ts-expect-error paused is defined
            if(this.avatar[prop].vrm.springBoneManager?.paused){
              return
            }
            this.avatar[prop].vrm.springBoneManager?.update(deltaTime);
          }
        }
      }
    }
    unlockManifestByIndex(index:number, testWallet?:string){
      return this.manifestDataManager.unlockManifestByIndex(index, testWallet);
    }
    unlockManifestByIdentifier(identifier:string, testWallet?:string){
      return this.manifestDataManager.unlockManifestByIdentifier(identifier, testWallet);
    }
    isManifestByIndexLocked(index:number){
      return this.manifestDataManager.isManifestByIndexNFTLocked(index);
    }
    isManifestByIdentifierLocked(identifier:string){
      return this.manifestDataManager.isManifestByIdentifierNFTLocked(identifier);
    }
    getLoadedLockedManifests(isLocked:boolean){
      return this.manifestDataManager.getLoadedLockedManifests(isLocked);
    }
    getLoadedManifests(){
      return this.manifestDataManager.getLoadedManifests();
    }

    /**
     * Adds look-at mouse behavior to the character.
     */
    addLookAtMouse(screenPrecentage:number, canvasID:string, camera:THREE.Camera){
      this.lookAtManager = new LookAtManager(screenPrecentage, canvasID, camera);
      this.lookAtManager.enabled = true;
      for (const prop in this.avatar){
        if (this.avatar[prop]?.vrm != null){
          this.lookAtManager.addVRM(this.avatar[prop].vrm)
        }
      }
      //this.toggleCharacterLookAtMouse(enable)
    }
    toggleCharacterLookAtMouse(enable:boolean){
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
    savePortraitScreenshot(name:string, width:number, height:number, distance:number = 1, headHeightOffset:number = 0){
      this.blinkManager.enableScreenshot();

      this.characterModel.traverse(o => {
        if ('isSkinnedMesh' in o && o.isSkinnedMesh) {
          const headBone = (o as THREE.SkinnedMesh).skeleton.bones.filter(bone => bone.name === 'head')[0];
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
    cameraRaycastCulling(mouseX:number, mouseY:number, removeFace = true){
      if (!this.renderCamera){
        console.warn("No camera was set in character manager. Please call setRenderCamera(camera) before calling this function")
        return;
      }
      // #region restore/remove existing faces logic
      const setOriginalInidicesAndColliders = () => {
        this.characterModel.traverse((child)=>{
          if ((child as THREE.Mesh).isMesh) {
            if (child.userData.origIndexBuffer){
              child.userData.clippedIndexGeometry = (child as THREE.Mesh).geometry.index?.clone();
              (child as THREE.Mesh).geometry.setIndex(child.userData.origIndexBuffer);
            }
          }
        })
      }

      const restoreCullIndicesAndColliders = () => {
        this.characterModel.traverse((child)=>{
          if ((child as THREE.Mesh).isMesh) {
            if (child.userData.origIndexBuffer){
              (child as THREE.Mesh).geometry.setIndex(child.userData.clippedIndexGeometry);
            }
          }
        })
      }

      const checkIndicesIndex = (array:ArrayLike<number>, indices:ArrayLike<number>) =>{
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
  
      const updateCullIndices = (intersection:THREE.Intersection, removeFace=false) => {
        const intersectedObject = intersection.object;
        const face = intersection.face;
        if(!face){
          return;
        }
        const newIndices = [face.a,face.b,face.c];
        const clipIndices = intersectedObject.userData?.clippedIndexGeometry?.array as ArrayLike<number>;
  
        
  
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
    downloadVRM(name:string, exportOptions:Partial<DownloadOptionsManifest>|null = null,) {
      return new Promise(async (resolve, reject) => {
        if (this.canDownload()) {
          try {
            // Set default export options if not provided
            exportOptions = exportOptions || {};
            const manifestOptions = this.manifestDataManager.getExportOptions();
            console.log(manifestOptions);
            const finalOptions = { ...manifestOptions, ...exportOptions };
            finalOptions.screenshot = this._getPortaitScreenshotTexture(false, finalOptions) as Record<string,any>;

            // Log the final export options
            console.log(finalOptions);

            // Call the downloadVRMWithAvatar function with the required parameters
            await downloadVRMWithAvatar(this.characterModel, this.avatar, name, finalOptions);

            resolve(undefined);
          } catch (error:any) {
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
    downloadGLB(name:string, exportOptions:Partial<DownloadOptionsManifest>|null = null){
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
      const result:Record<string,{name:string,id:string}> = {};
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
          if ((child as any).isMesh){
            indexCount+= (child as THREE.Mesh).geometry.index?.array.length||0;
          }
          if ((child as any).isSkinnedMesh){
            (child as THREE.SkinnedMesh).skeleton.bones.forEach(bone => {
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
    getBlendShapeGroupTraits(traitGroupId:string, traitId:string, identifier?:string){
      return this.manifestDataManager.getBlendShapeGroupTraits(traitGroupId, traitId, identifier);
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
    isTraitGroupRequired(groupTraitID:string) {
      return this.manifestDataManager.isTraitGroupRequired(groupTraitID);
    }
    
    /**
     * Gets all traits for a specific group trait.
     * @param {string} groupTraitID - ID of the trait group
     * @param {string} identifier - Identifier of target manifest
     * @returns {Array} Array of traits for the specified group
     */
    getTraits(groupTraitID:string, identifier?:string){
      return this.manifestDataManager.getModelTraits(groupTraitID, identifier);
    }

    /**
     * Gets the current trait ID for a group.
     * @param {string} groupTraitID - ID of the trait group
     * @returns {string} Current trait ID
     */
    getCurrentTraitID(groupTraitID:string){
      return this.avatar[groupTraitID]?.traitInfo?.id;
    }
    /**
     * Gets the current trait data for a group.
     * @param {string} groupTraitID - ID of the trait group
     * @returns {Object} Current trait data
     */
    getCurrentTraitData(groupTraitID:string){
      return this.avatar[groupTraitID]?.traitInfo;
    }
    /**
     * Gets the current blend shape trait data for a group.
     * @param {string} groupTraitID - ID of the trait group
     * @returns {Object} Current blend shape trait data
     */
    getCurrentBlendShapeTraitData(groupTraitID:string){
      return this.avatar[groupTraitID]?.blendShapeTraitsInfo||{};
    }
    /**
     * Gets the current trait VRM for a group.
     * @param {string} groupTraitID - ID of the trait group
     * @returns {Object} Current trait VRM
     */
    getCurrentTraitVRM(groupTraitID:string){
      return this.avatar[groupTraitID]?.vrm;
    }
    /**
     * Sets the parent model for the character.
     */
    setParentModel(model:THREE.Scene){
      model.add(this.rootModel);
      this.parentModel = model;
      if (this.screenshotManager)
        this.screenshotManager.setScene(this.parentModel);
    }
    /**
     * Sets the render camera for the character.
     */
    setRenderCamera(camera:THREE.Camera){
      this.renderCamera = camera;
    }

    
    /**
     * Loads random traits based on manifest data.
     */
    loadRandomTraits() {
      return new Promise(async (resolve, reject) => {
        if (this.manifestDataManager.hasExistingManifest()) {
          const randomTraits = this.manifestDataManager.getRandomTraits();
          await this._loadTraits(randomTraits);
          resolve(true); // Resolve the promise with the result
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
    loadRandomTrait(groupTraitID: string) {
      return new Promise(async (resolve, reject) => {
        if (this.manifestDataManager.hasExistingManifest()) {
          const randomTrait = this.manifestDataManager.getRandomTrait(groupTraitID);
          if(randomTrait){
            await this._loadTraits(getAsArray(randomTrait));
          }
          resolve(true); // Resolve the promise with the result
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
     * @param {string} [collectionIdentifier=undefined] - Identifier for the manifest
     * @param {boolean} [fullAvatarReplace=true] - Whether to replace all existing traits
     * @param {Array<string>} [ignoreGroupTraits=[]] - Trait groups to ignore
     * @returns {Promise<void>} Promise that resolves when traits are loaded
     */
    loadTraitsFromNFT(url:string, collectionIdentifier = undefined, fullAvatarReplace = true, ignoreGroupTraits = []) {
      // XXX should identifier be taken from nft group or passed by user?
      return new Promise(async (resolve, reject) => {
        try {
          // Check if manifest data is available
          if (this.manifestDataManager.hasExistingManifest()) {
            // Retrieve traits from the NFT using the manifest data
            const traits = await this.manifestDataManager.getNFTraitOptionsFromURL(url, ignoreGroupTraits, collectionIdentifier);

            // Load traits using the _loadTraits method
            await this._loadTraits(traits || [], fullAvatarReplace);

            // Resolve the Promise (without a value, as you mentioned it's not needed)
            resolve(true);
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
     * @param {string} [collectionIdentifier=undefined] - Identifier for the manifest
     * @param {boolean} [fullAvatarReplace=true] - Whether to replace all existing traits
     * @param {Array<string>} [ignoreGroupTraits=null] - Trait groups to ignore
     * @returns {Promise<void>} Promise that resolves when traits are loaded
     */
    loadTraitsFromNFTObject(NFTObject:Record<string,any>, collectionIdentifier = undefined, fullAvatarReplace = true, ignoreGroupTraits = []) {
      // XXX should identifier be taken from nft group or passed by user?
      return new Promise(async (resolve, reject) => {
        // Check if manifest data is available
        if (this.manifestDataManager.hasExistingManifest()) {
          try {
            // Retrieve traits from the NFT object using manifest data
            const traits = this.manifestDataManager.getNFTraitOptionsFromObject(NFTObject, ignoreGroupTraits, collectionIdentifier);

            // Load traits into the avatar using the _loadTraits method
            await this._loadTraits(traits || [], fullAvatarReplace);

            resolve(true);
          } catch (error:any) {
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
    loadInitialTraits(): Promise<void> {
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
     * @returns Promise that resolves when traits are loaded
     */
    loadAllTraits() {
      return new Promise(async(resolve, reject) => {
        // Check if manifest data is available
        if (this.manifestDataManager.hasExistingManifest()) {
          // Load initial traits using the _loadTraits method
          await this._loadTraits(this.manifestDataManager.getSelectionForAllTraits());

          resolve(true);
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
    loadBlendShapeTrait(traitGroupID:string, blendshapeGroupId:string,blendshapeTraitId:string|null){
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
     */
    removeBlendShapeTrait(groupTraitID:string, blendShapeGroupId:string|null){
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
    _getTraitAllowedRules(traitGroupID:string,traitID:string){
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
     */
    private _checkBlendshapeRestrictions(groupTraitID:string){
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
    _checkRestrictionsBeforeLoad(groupTraitID:string,traitID:string){
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
     * @param {string} collectionIdentifier - Identifier for the manifest
     * @param {boolean} [soloView=false] - Whether to display only the new trait
     * @returns {Promise<void>} Promise that resolves when trait is loaded
     */
    loadTrait(groupTraitID:string, traitID:string, collectionIdentifier?:string, soloView = false) {
      return new Promise(async (resolve, reject) => {
        // Check if manifest data is available
        if (this.manifestDataManager.hasExistingManifest()) {
          try {
            // Retrieve the selected trait using manifest data
            const selectedTrait = this.manifestDataManager.getTraitOption(groupTraitID, traitID, collectionIdentifier);
            this._checkRestrictionsBeforeLoad(groupTraitID,traitID)
            console.log(selectedTrait);
            // If the trait is found, load it into the avatar using the _loadTraits method
            if (selectedTrait) {
              await this._loadTraits(getAsArray(selectedTrait),soloView);
              resolve(true);
            }
          } catch (error:any) {
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
    loadCustomTrait(groupTraitID:string, url:string) {
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
              resolve(true);
            }

          } catch (error:any) {
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
    loadCustomTexture(groupTraitID:string, url:string) {
      return new Promise(async (resolve, reject) => {
        const model = this.avatar[groupTraitID]?.model;

        if (model) {
          // Set the texture to child meshes of the model
          await setTextureToChildMeshes(model, url);

          // Resolve the Promise (without a value, as you mentioned it's not needed)
          resolve(true);
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
    setTraitColor(groupTraitID:string, hexColor:string) {
      const model = this.avatar[groupTraitID]?.model;
      if (model) {
        try {
          // Convert hexadecimal color to THREE.Color
          const color = new THREE.Color(hexColor);

          // Set the color to child meshes of the model
          model.traverse((_mesh) => {
            let mesh = _mesh as THREE.Mesh
            if (mesh.isMesh) {
              if ((mesh.material as THREE.MeshStandardMaterial).type === "MeshStandardMaterial") {
                if (Array.isArray(mesh.material)) {
                  mesh.material.forEach((mat) => {
                    (mat as THREE.MeshStandardMaterial).color = color;
                    //mat.emissive = color;
                  });
                } else {
                  (mesh.material as THREE.MeshStandardMaterial).color = color;
                  //mesh.material.emissive = color;
                }
              } else {
                if (Array.isArray(mesh.material)) {
                  (mesh.material[0] as THREE.ShaderMaterial).uniforms.litFactor.value = color;
                  (mesh.material[0] as THREE.ShaderMaterial).uniforms.shadeColorFactor.value = new THREE.Color(
                    color.r * 0.8,
                    color.g * 0.8,
                    color.b * 0.8
                  );
                } else {
                  (mesh.material as THREE.ShaderMaterial).uniforms.litFactor.value = color;
                  (mesh.material as THREE.ShaderMaterial).uniforms.shadeColorFactor.value = new THREE.Color(
                    color.r * 0.8,
                    color.g * 0.8,
                    color.b * 0.8
                  );
                }
              }
            }
          });
        } catch (error:any) {
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
    removeTrait(groupTraitID:string, forceRemove = false){
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
     * @param {string|undefined} identifier - Identifier for the manifest
     */
    setManifest(manifest: manifestJson, identifier?: string){
      return this.manifestDataManager.setManifest(manifest, identifier);
    }
    loadManifest(url:string, identifier?:string){
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
    loadOptimizerCharacter(url:string) {
      return this.loadCustomTrait("CUSTOM", url);
    }
    
    /**
     * Displays only the target trait and removes all others.
     * @param {string|Array<string>} groupTraitID - ID(s) of the trait(s) to display
     */
    async soloTargetGroupTrait(groupTraitID:string | string[]){
      const groupTraitIDArray = getAsArray(groupTraitID) 
      const options:SelectedOption[] = [];
      for (const trait in this.avatar){
        if (groupTraitIDArray.includes(trait)){
          const option = this.manifestDataManager.getTraitOption(trait, this.avatar[trait].traitInfo.id)
          if(option){
            options.push(option);
          }
          options.push();
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
      const options:SelectedOption[] = [];
      for (const trait in this.storedAvatar){
        const option = this.manifestDataManager.getTraitOption(trait, this.storedAvatar[trait].traitInfo.id)
        if(option){
          options.push(option);
        }
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
    async _loadTraits(options:SelectedOption[], fullAvatarReplace = false){
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
    */
       private async _loadBlendShapeTrait(traitGroupID:string, blendshapeGroupId:string|null,blendshapeTraitId:string|null){
      const currentTrait = this.avatar[traitGroupID];
      if(!currentTrait){
        console.warn(`Trait with name: ${traitGroupID} was not found or not selected.`)
        return;
      }
      const group = this.manifestData.getAllBlendShapeTraitGroups().find((t)=>t.trait === blendshapeGroupId);
      const copiedBlendshapes = group?.copyTo || {}
      const allTraits = []

      Array.from(Object.keys(copiedBlendshapes)).forEach((traitGroupId_)=>{
        const other = this.avatar[traitGroupId_]
        if(!other) return
        if(!copiedBlendshapes[traitGroupId_].includes(other.traitInfo.id)){
          return
        }
        if(!other.blendShapeTraitsInfo){
          other.blendShapeTraitsInfo = {}
        }
        allTraits.push(other)
      })

      allTraits.push(currentTrait)

      if(!currentTrait.blendShapeTraitsInfo){
        currentTrait.blendShapeTraitsInfo = {};
      }

      if(!blendshapeGroupId){
        allTraits.forEach((_trait)=>{
          for(const k in _trait.blendShapeTraitsInfo){
            // Deactivate the current blendshape trait
            this.toggleBinaryBlendShape(_trait.model, _trait.blendShapeTraitsInfo[k], false);
          }
        })
        return
      }


      // Deactivate the current blendshape trait
      allTraits.forEach((_trait)=>{
        if(_trait.blendShapeTraitsInfo[blendshapeGroupId]){
          this.toggleBinaryBlendShape(_trait.model, _trait.blendShapeTraitsInfo[blendshapeGroupId], false);
        }
      })
  


      if(blendshapeTraitId == null){
        allTraits.forEach((_trait)=>{
          // Deactivated the blendshape trait; dont do anything else
          delete this.avatar[_trait.traitInfo.traitGroup.trait].blendShapeTraitsInfo[blendshapeGroupId]
        })
        return
      }

      // Activate all blendshapes
      allTraits.forEach((_trait)=>{
        const blendShape = _trait.traitInfo.getBlendShape(blendshapeGroupId, blendshapeTraitId);
        if(!blendShape){
          console.warn(`Blendshape with name: ${blendshapeTraitId} was not found. on ${_trait.traitInfo.name}(id:${_trait.traitInfo.id})`)
          return;
        }
  
        // Apply blendshape to the model
        this.toggleBinaryBlendShape(_trait.model, blendShape, true);
  
        this.avatar[_trait.traitInfo.traitGroup.trait].blendShapeTraitsInfo[blendShape.getGroupId()] = blendShape;
      })
    }
    /**
     * Toggles a binary blend shape on a model.
     * @private
    * */
    private toggleBinaryBlendShape = (model:THREE.Object3D,blendshape:BlendShapeTrait |{blendshapeId:string},enable:boolean)=>{
      model.traverse((child)=>{
        if((child as any).isMesh || (child as any).isSkinnedMesh){
          const mesh = child as THREE.Mesh;
          if(!mesh.morphTargetDictionary || !mesh.morphTargetInfluences) return
          const blendShapeIndex = mesh.morphTargetDictionary[blendshape.blendshapeId];
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
        if (traitInfo.locked === true && traitInfo.purchasable === true ){
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
     * Purchases assets from the current avatar.
     * @returns {Promise<void>} Promise that resolves when purchase is complete
     */
    purchaseAssetsFromAvatar():Promise<void>{
      console.warn("TODO!! STILL NEEDS TO DETECT DIFFERENT COLLECTIONS!!")
      const assets = this.getPurchaseTraitsArray();
      const purchaseTraits:Record<string,string[]> = {};
      assets.forEach((asset) => {
        if (!purchaseTraits[asset.traitGroup.trait])
          purchaseTraits[asset.traitGroup.trait] =[];
        purchaseTraits[asset.traitGroup.trait].push(asset.id)
      }); 

      const purchaseObjectDefinition = new OwnedNFTTraitIDs({ownedTraits:purchaseTraits},null)
      console.log(purchaseObjectDefinition);
      return new Promise((resolve, reject) => {
        const {
          depositAddress,
          merkleTreeAddress,
          collectionName,
          
        } = this.manifestDataManager.getMainSolanaPurchaseAssetsDefinition();
        buySolanaPurchasableAssets(
          depositAddress,
          merkleTreeAddress,
          collectionName,
          this.getCurrentTotalPrice(),
          purchaseObjectDefinition
        )
          .then(()=>{
            console.log("enters");
            this.manifestDataManager.unlockMainPurchasedAssets(purchaseObjectDefinition);
            resolve();
          })
          .catch(e=>{
            console.error(e)
            reject();
          })
      });
      // return promise
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
        if (traitInfo.locked === true && traitInfo.purchasable === true ){
          purchaseAssetsList.push(traitInfo);
        }
      }
      return purchaseAssetsList;
    }

    /**
     * Sets up the animation manager.
     * @private
     * @param {Array} paths - Array of animation paths
     * @param {string} baseLocation - Base location for animations
     * @param {number} scale - Scale for animations
     */
    private async _animationManagerSetup(
      paths: string | string[],
      baseLocation: string,
      scale: number,
    ) {
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
      */
    _getPortaitScreenshotTexture(getBlob:boolean, options:Pick<DownloadOptionsManifest,'screenshotBackground'|'screenshotFOV'|'screenshotFaceDistance'|'screenshotFaceOffset'|'screenshotResolution'>){
      this.blinkManager.enableScreenshot();

      this.characterModel.traverse(o => {
        if ('isSkinnedMesh' in o && o.isSkinnedMesh) {
          const headBone = (o as THREE.SkinnedMesh).skeleton.bones.filter(bone => bone.name === 'head')[0];
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
      const width = screenshotResolution![0];
      const height = screenshotResolution![1];

      localVector3.x += screenshotFaceOffset![0];
      localVector3.y += screenshotFaceOffset![1];
      localVector3.z += screenshotFaceOffset![2];
      
      this.screenshotManager.setBackground(screenshotBackground!);
      this.screenshotManager.cameraFrameManager.setCamera(localVector3, screenshotFaceDistance!, screenshotFOV);
      const screenshot = getBlob ? 
        this.screenshotManager.getScreenshotBlob(width, height):
        this.screenshotManager.getScreenshotTexture(width, height);

        
      this.blinkManager.disableScreenshot();
      return screenshot;
    }
    /**
     * Sets up wireframe material for a mesh.
     */
    _setupWireframeMaterial(mesh:THREE.Mesh){
      // Set Wireframe material with random colors for each material the object has
      (mesh as any).origMat = mesh.material;

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


      (mesh as any).setDebugMode = (debug:boolean) => { 
        if (debug){
          if ('length' in mesh.material && mesh.material.length){
            mesh.material[0] = debugMat;
            mesh.material[1] = debugMat;
          }
          else{
            mesh.material = debugMat;
          }
        }
        else{
          //@ts-ignore
          mesh.material = mesh.origMat;
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
     * @param {Object} item - Item data
     * @param {string} traitID - Trait ID
     * @param {Array} textures - Array of textures
     * @param {Array} colors - Array of colors
     * @param {string|undefined} collectionIdentifier - Collection ID
     * @returns {Object} Set up VRM model
     */
    _VRMBaseSetup(m:GLTF, item:ModelTrait, traitID:string, textures:THREE.Texture[], colors:THREE.Color[], collectionIdentifier?:string,){
      let vrm = m.userData.vrm as VRM;
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
      //this._unregisterMorphTargetsFromManifest(vrm, collectionID);
      
      if (this.manifestDataManager.isLipsyncTrait(traitID, collectionIdentifier))
        this.lipSync = new LipSync(vrm);


      this._modelBaseSetup(vrm, item, traitID, textures, colors, collectionIdentifier);

      // Rotate model 180 degrees

      
      if (vrm.meta?.metaVersion === '0'){
        if (vrm.humanoid.humanBones.hips.node.parent == vrm.scene){
          const dummyRotate = new THREE.Object3D();
          dummyRotate.name = "newRootNode";
          addChildAtFirst(vrm.scene, dummyRotate)
          dummyRotate.add(vrm.humanoid.humanBones.hips.node);
        }
        vrm.humanoid.humanBones.hips.node.parent?.rotateY(3.14159);
        //VRMUtils.rotateVRM0( vrm );
        

        vrm.scene.traverse((child) => {
          if ('isSkinnedMesh' in child && child.isSkinnedMesh) {
            for (let i =0; i < (child as THREE.SkinnedMesh).skeleton.bones.length;i++){
              (child as THREE.SkinnedMesh).skeleton.bones[i].userData.vrm0RestPosition = { ... (child as THREE.SkinnedMesh).skeleton.bones[i].position }
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
     _applySpringBoneColliders(vrm:VRM){
      /**
       * method to add collider groups to the joints of the new VRM
       */
      function addToJoints(colliderGroups: VRMSpringBoneColliderGroup[]) {
        vrm.springBoneManager!.joints.forEach((joint) => {
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
        const colliderGroups:VRMSpringBoneColliderGroup[] = [] 
        Object.entries(this.avatar).map(([_, entry]) => {
          // get nodes with colliders
          const nodes = getNodesWithColliders(entry.vrm)
          if (nodes.length === 0) return

          // For each node with colliders info
          nodes.forEach((node) => {

            if (!vrm.springBoneManager) {
              return
            }

            const colliderGroup: VRMSpringBoneColliderGroup = {
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
    private _unregisterMorphTargetsFromManifest(vrm:VRM){
      const manifestBlendShapes = this.manifestData.getAllBlendShapeTraits()
      const expressions = vrm.expressionManager?.expressions
      if(manifestBlendShapes.length == 0) return
      if(!expressions) return
      const expressionToRemove = []
      for(const expression of expressions){
        if(manifestBlendShapes.map((b)=>b.blendshapeId).includes(expression.expressionName)){
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
     * @param {string|undefined} collectionIdentifier - Collection ID
     * @param {Object} item - Item data
     * @param {string} traitID - Trait ID
     * @param {Array} textures - Array of textures
     * @param {Array} colors - Array of colors
     */
     _modelBaseSetup(model:VRM, item:ModelTrait, traitID:string, textures:THREE.Texture[], colors:THREE.Color[], collectionIdentifier?:string){

      const meshTargets:(THREE.Mesh|THREE.SkinnedMesh)[] = [];
      const cullingIgnore = getAsArray(item.cullingIgnore)
      const cullingMeshes:THREE.Mesh[] = [];


      // Mesh target setup section
      // XXX Separate from this part
      if (item.meshTargets){
        getAsArray(item.meshTargets).map((target) => {
          const mesh = model.scene.getObjectByName ( target ) as THREE.Mesh
          if (mesh?.isMesh) meshTargets.push(mesh);
        })
      }

      model.scene.traverse((child) => {
        const isMesh = ((child as THREE.Mesh).isMesh || (child as THREE.SkinnedMesh).isSkinnedMesh)
        // mesh target setup secondary swection
        if ((!item.meshTargets || item.meshTargets?.length==0) && isMesh) meshTargets.push(child as THREE.Mesh|THREE.SkinnedMesh);

        // basic setup
        child.frustumCulled = false
        if (isMesh) {

          // XXX Setup MToonMaterial for shader

          this._setupWireframeMaterial(child as THREE.Mesh);

          // if (child.material.length){
          //   effectManager.setCustomShader(child.material[0]);
          //   effectManager.setCustomShader(child.material[1]);
          // }
          // else{
          //   effectManager.setCustomShader(child.material);
          // }

          // if a mesh is found in name to be ignored, dont add it to target cull meshes
          if (cullingIgnore.indexOf(child.name) === -1)
            cullingMeshes.push(child as THREE.Mesh)
          
        }
      })

      const defaultValues = this.manifestDataManager.getDefaultValues();

      const traitGroup = this.manifestDataManager.getModelGroup(traitID, collectionIdentifier) as TraitModelsGroup;
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
          //@dev note: maxCullingDistance is not used for now
        // maxCullingDistance:
        //   item.maxCullingDistance != null ? item.maxCullingDistance: 
        //   trait.maxCullingDistance != null ? trait.maxCullingDistance:
        //   templateInfo.maxCullingDistance != null ? templateInfo.maxCullingDistance: Infinity,
        cullingMeshes
      })  

      // once the setup is done, assign texture to meshes
      meshTargets.map((mesh, index)=>{
          
        
        if (textures){
          const txt = textures[index] || textures[0]
          if (txt != null){

            // mesh.material can be an array (two MToonMaterials)
            getAsArray(mesh.material).map((mat) => {
              updateMaterialTexture(mat as THREE.MeshStandardMaterial || MToonMaterial, txt)
            })
          }
        }
        if (colors){
          const col = colors[index] || colors[0]
          if (col != null){
            let m = mesh.material as THREE.ShaderMaterial | THREE.ShaderMaterial[]
            if (Array.isArray(m)) {
              m[0].uniforms.litFactor.value = col
              m[0].uniforms.shadeColorFactor.value = new THREE.Color( col.r*0.8, col.g*0.8, col.b*0.8 )
            } else {
              m.uniforms.litFactor.value = col
              m.uniforms.shadeColorFactor.value = new THREE.Color( col.r*0.8, col.g*0.8, col.b*0.8 )
            }
          }
        }
      })
    }
    /**
     * Applies managers to a VRM model.
     * @private
     * @param {Object} vrm - VRM model
     */
    _applyManagers(vrm:VRM){
  
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
    _displayModel(model: VRM){
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
    _positionModel(model: VRM){
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
    _disposeTrait(vrm: VRM){
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
    _addLoadedData(itemData: LoadedData){
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

    let vrm:VRM = null!;

      models.map((m)=>{
          if (m != null)
            vrm = this._VRMBaseSetup(m, traitModel, traitGroupID, textures, colors, collectionID) as VRM;

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
    loadPercentager:number;
    loadingManager:THREE.LoadingManager;
    gltfLoader:GLTFLoader;
    textureLoader:THREE.TextureLoader;
    isLoading:boolean;
    constructor( characterManager?:CharacterManager){
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
    setLoadPercentage(value:number){
        this.loadPercentager = value;
    }


    // options as SelectedOptions class
    // Loads an array of trait options and returns a promise that resolves as an array of Loaded Data
    loadTraitOptions(options:SelectedOption[]) {
        return new Promise<LoadedData[]>((resolve) => {
            this.isLoading = true;
            const resultData:LoadedData[] = [];
    
            const promises = options.map(async (option, index) => {
                if (option == null) {
                    resultData[index] = null!;
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
                              },undefined,(err)=>{
                                console.error("error loading texture: ", err)
                                resolve(null);
                              })
                          })
                  )
                );
                const models = loadedModels.filter((model) => model !== null) as GLTF[]
    
                const loadedColors = getAsArray(option?.traitColor?.value).map((colorValue) => new THREE.Color(colorValue));
                resultData[index] = new LoadedData({
                  collectionID: option?.traitModel.collectionID,
                  traitGroupID: option?.traitModel.traitGroup.trait,
                  traitModel: option?.traitModel,
                  textureTrait: option?.traitTexture||undefined,
                  colorTrait: option?.traitColor||undefined,
                  models,
                  textures: loadedTextures.filter((model) => model !== null) as THREE.Texture[],
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
    collectionID?:string;
    traitGroupID:string;
    traitModel:ModelTrait|null;
    textureTrait?:TextureTrait;
    colorTrait?:ColorTrait;
    models:GLTF[];
    textures:THREE.Texture[];
    colors:THREE.Color[];


    constructor(data:{
      collectionID?: string,
      traitGroupID: string,
      traitModel: ModelTrait|null,
      textureTrait?: TextureTrait,
      colorTrait?: ColorTrait,
      models?: GLTF[],
      textures?: THREE.Texture[],
      colors?: THREE.Color[]
      ,
  }){
        const {
          traitGroupID,
          traitModel,
          textureTrait,
          colorTrait,
          models,
          textures,
          colors,
          collectionID,
        } = data;

        // Option base data
        this.traitGroupID = traitGroupID;
        this.traitModel = traitModel;
        this.textureTrait = textureTrait;
        this.colorTrait = colorTrait;

        this.collectionID = collectionID;

        // Option loaded data
        this.models = models||[];
        this.textures = textures||[];
        this.colors = colors||[];
    }
}


/**
 * 
 * @param {THREE.MeshStandardMaterial|MToonMaterial} mat 
 * @param {THREE.Texture} txt 
 * @returns 
 */
function updateMaterialTexture(mat: THREE.MeshStandardMaterial | MToonMaterial, txt: THREE.Texture) {
  if(mat.type === "Shadermaterial" && !(mat as MToonMaterial).isMToonMaterial){
    console.warn("XXX set material texture to shader material", mat)
    return 
  }
  mat.map = txt
  mat.needsUpdate = true;
}