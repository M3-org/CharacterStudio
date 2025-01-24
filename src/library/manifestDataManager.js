

import { CharacterManifestData } from "./CharacterManifestData";

export class ManifestDataManager{
    constructor(){
      this.mainManifestData = null;
      this.manifestDataCollection = [];
      this.defaultValues = {
        defaultCullingLayer:-1,
        defaultCullingDistance:null,
        maxCullingDistance:Infinity
      };
    }
    
    clearManifests(){
        this.mainManifestData = null;
        this.manifestDataCollection = [];
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
      return new Promise((resolve, reject) => {
        try {
          // Fetch the manifest data asynchronously
          this._fetchManifest(url).then(manifest=>{
            this.setManifest(manifest).then(()=>{
              resolve();
            })
          })
        } catch (error) {
          // Handle any errors that occurred during the asynchronous operations
          console.error("Error loading manifest:", error.message);
          reject(new Error("Failed to load the manifest."));
        }
      });
    }
    getDisplayScale(){
      if (this.mainManifestData == null){
        console.warn("no manifest loaded, returning display scale of 1");
        return 1;
      }
      return this.mainManifestData.displayScale;
    }
  
    getDefaultValues(){
      return this.defaultValues;
    }
    setManifestDefaultValues(manifest){
      this.defaultValues = {
        defaultCullingLayer:manifest.defaultCullingLayer != null ? manifest.defaultCullingLayer : -1,
        defaultCullingDistance:manifest.defaultCullingDistance != null ? manifest.defaultCullingDistance : null,
        maxCullingDistance:manifest.maxCullingDistance != null ? manifest.maxCullingDistance : Infinity
      };
    }
  
    setCustomManifest(){
      const manifest = {colliderTraits:["CUSTOM"],traits:[{name:"Custom", trait:"CUSTOM", collection:[]}]};
      this.mainManifestData = new CharacterManifestData(manifest);
    }
  
  
    /**
       * Sets an existing manifest data for the character.
       *
       * @param {object} manifest - The loaded mmanifest object.
       * @returns {Promise<void>} A Promise that resolves when the manifest is successfully loaded,
       *                         or rejects with an error message if loading fails.
       */
    setManifest(manifest){
      // XXX move this to character manager
      //this.removeCurrentCharacter();
      return new Promise(async (resolve, reject) => {
        try{
          // XXX do we need to save manifest?
          // this.manifest = manifest;
          if (manifest) {
            // Create a CharacterManifestData instance based on the fetched manifest
            const manifestData = new CharacterManifestData(manifest);
  
            if (this.mainManifestData == null){
              this.mainManifestData = manifestData;
              this.setManifestDefaultValues(manifestData);
            }
            this.manifestDataCollection.push(manifestData);
            // If an animation manager is available, set it up
            // XXX
            // if (this.animationManager) {
            //   try{
            //     await this._animationManagerSetup(
            //       this.manifest.animationPath,
            //       this.manifest.assetsLocation,
            //       this.manifestData.displayScale
            //     );
            //   }
            //   catch(err){
            //     console.error("Error loading animations: " + err)
            //   }
            // }
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
  
    hasExistingManifest(){
      if (this.mainManifestData != null)
        return true;
      else
        return false;
    }
  
    // XXX should be able to load even if it has different ids, maybe when loading a manifest file, we should also send an identifier
    getTraitOption(groupTraitID, traitID){
      let traitOption = null;
      this.manifestDataCollection.forEach(manifestData => {
        if (traitOption == null)
          traitOption = manifestData.getTraitOption(groupTraitID, traitID);
      });
      return traitOption;
    }
  
    // XXX we also need to send as parameter an identifier to the manifest data to know were the id comes from
    getTraitOptionById(traitID){
      traitOption = null
      this.manifestDataCollection.forEach(manifestData => {
        if (traitOption == null)
          traitOption = manifestData.getTraitOptionById(traitID);
      });
      return traitOption;
    }
  
    getTraitOptionsByType(traitType){
      const fullCollection = [];
      this.manifestDataCollection.forEach(manifestData => {
        const traitTypeCollection = manifestData.getTraitOptionsByType(traitType);
        if (traitTypeCollection.length){
          fullCollection.concat(fullCollection);
        }
      });
      return fullCollection;
    }
  
    getAllBlendShapeTraits(){
      const allBlendshapes = [];
      this.manifestDataCollection.forEach(manifestData => {
        const blendshapeCollection = manifestData.getAllBlendShapeTraits();
        if (blendshapeCollection.length){
          // XXX check if working correctly
          console.log(blendshapeCollection);
          allBlendshapes.concat(blendshapeCollection);
        }
      });
      return allBlendshapes;
    }
  
    // XXX check: we should verify within the manifest, if it should save or not the colliders
    isColliderRequired(traitID){
      let result = false;
      this.manifestDataCollection.forEach(manifestData => {
        if (manifestData.isColliderRequired(traitID))
          result = true;
      });
      return result;
    }
    // XXX check: we should verify within the manifest, if it should use lipSync
    isLipsyncTrait(traitID){
      let result = false;
      this.manifestDataCollection.forEach(manifestData => {
        if (manifestData.isLipsyncTrait(traitID))
          result = true;
      });
      return result;
    }
  
    getCustomTraitOption(groupTraitID, url){
      this.mainManifestData.getCustomTraitOption(groupTraitID, url);
    }
  
    // XXX currently only gets it from first loaded manifest Data
    getNFTraitOptionsFromURL(url, ignoreGroupTraits){
      return new Promise(async (resolve, reject) => {
        try{
          const traits = await this.mainManifestData.getNFTraitOptionsFromURL(url, ignoreGroupTraits);
          resolve(traits);
        }
        catch{
          console.log("an error ocurred while trying to load:", url);
          resolve(null);
        }
      });
    }
  
  
    getNFTraitOptionsFromObject(NFTObject, ignoreGroupTraits){
      return this.mainManifestData.getNFTraitOptionsFromObject(NFTObject, ignoreGroupTraits);
    }
  
  
  
    canDownload(){
      let result = true;
      this.manifestDataCollection.forEach(manifestData => {
        if (manifestData.canDownload == false){
          result = false;
        }
      });
      return result;
    }
    containsModelGroupWithID(groupTraitID){
      let result = false;
      this.manifestDataCollection.forEach(manifestData => {
        if (manifestData.getModelGroup(groupTraitID) != null){
          result = true
        }
      });
      return result;
    }
  
    // XXX also check by separated ids
    // returns the full group of tha main loaded manifest
    getModelGroup(groupTraitID){
      return this.mainManifestData.getModelGroup(groupTraitID);
    }
  
    isTraitGroupRequired(groupTraitID){
      let result = false;
      const groupTrait = this.mainManifestData.getModelGroup(groupTraitID);
  
      // Check if the trait group exists and is marked as required
      if (groupTrait?.isRequired) {
        result = true;
      }
  
      return result;
    }
  
    // returns only the traits from target group
    getModelTraits(groupTraitID){
      if (this.mainManifestData == null){
        console.warn("No manifest file has been loaded, please load it before trait models.")
        return null;
      }
      /// XXX add a identifier to the ids so that they cannot be duplicated
      const resultArray = [];
      this.manifestDataCollection.forEach(manifestData => {
        const traitCollection = manifestData.getModelTraits(groupTraitID);
        if (traitCollection)
          resultArray.push(...traitCollection);
      });
      return resultArray;
    }
    getRandomTrait(groupTraitID){
      // get random trait from all loaded manifest data
      const randomTraits = [];
      this.manifestDataCollection.forEach(manifestData => {
        const trait = manifestData.getRandomTrait(groupTraitID);
        if (trait != null){
          randomTraits.push(trait);
        }
      });
      return randomTraits.length > 0 ? 
        randomTraits[Math.floor(Math.random() * randomTraits.length)] : 
        null;
    }
    getRandomTraits(optionalGroupTraitIDs){
      const selectedOptionsObject = {}
      this.manifestDataCollection.forEach(manifestData => {
        
        const searchArray = optionalGroupTraitIDs || manifestData.randomTraits;
        searchArray.forEach(groupTraitID => {
          const traitSelectedOption = this.getRandomTrait(groupTraitID);
          if (traitSelectedOption){
            //selectedOptions.push(traitSelectedOption)
            if ( selectedOptionsObject[groupTraitID] != null && (Math.random() < 0.5)){
              selectedOptionsObject[groupTraitID] = traitSelectedOption;
            }
            else{
              selectedOptionsObject[groupTraitID] = traitSelectedOption;
            }
          }
        });
      });
     
      const selectedOptionsArray = Object.values(selectedOptionsObject);
      console.log("loaded random traits:", selectedOptionsArray)
      return this._filterTraitOptions(selectedOptionsArray);
  
    }
  
    getInitialTraits(){
      return this.mainManifestData.getInitialTraits();
    }
    getAllTraits(){
      const selectedOptionsObject = {}
      this.manifestDataCollection.forEach(manifestData => {
        
        const searchArray = manifestData.allTraits;
        searchArray.forEach(groupTraitID => {
          const traitSelectedOption = this.getRandomTrait(groupTraitID);
          if (traitSelectedOption){
            //selectedOptions.push(traitSelectedOption)
            if ( selectedOptionsObject[groupTraitID] != null && (Math.random() < 0.5)){
              selectedOptionsObject[groupTraitID] = traitSelectedOption;
            }
            else{
              selectedOptionsObject[groupTraitID] = traitSelectedOption;
            }
          }
        });
      });
     
      const selectedOptionsArray = Object.values(selectedOptionsObject);
      console.log("loaded all traits:", selectedOptionsArray)
      return this._filterTraitOptions(selectedOptionsArray);
    }
  
    // filtering will only work now when multiple options are selected
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
  
    // returns non repeating groups (does not combine collections)
    getGroupModelTraits(){
      /// XXX should we add an identifier to group traits? currently if they share the same id there will be conflicts
      const mergedTraitModelGroups = {};
  
      this.manifestDataCollection.forEach(manifestData => {
        manifestData.getGroupModelTraits().forEach(group => {
          if (!mergedTraitModelGroups[group.trait]) {
            mergedTraitModelGroups[group.trait] = group;
          }
        });
      });
  
      // Convert the merged result object back into an array
      const resultArray = Object.values(mergedTraitModelGroups);
      return resultArray;
    }
  
    isNFTLocked(){
      let result = false;
      this.manifestDataCollection.forEach(manifestData => {
        if (manifestData.isNFTLocked()){
          result = true;
        }
      });
      return result;
    }
  
    getBlendShapeGroupTraits(traitGroupId, traitId){
      /// XXX should we also include blendshapes from aother manifests?
      console.log("getting only main manifest blendshapes")
      if (this.mainManifestData){
        return this.mainManifestData.getModelTrait(traitGroupId, traitId)?.getGroupBlendShapeTraits()
      }else {
        return []
      }
    }
  
    getExportOptions(){
      // get it only from the main manifest, not the additionally loaded.
      this.mainManifestData.getExportOptions();
    }
  
    _fetchManifest(location) {
      return new Promise((resolve,reject)=>{
        fetch(location)
          .then(response=>{
            response.json().then((data)=>{
              resolve(data);
            })
            .catch(err=>{
              console.error("Unable to convert manifest to json data: " + err);
              reject();
            })
          })
          .catch(err=>{
            console.error("Unable to fetch manifesta: " + err);
            reject()
          })
      })
    }
    // XXX remove 
    // /**
    //  * Loads manifest data and appends it to the current manifest
    //  *
    //  * @param {string} url - The URL of the manifest.
    //  * @returns {Promise<void>} A Promise that resolves when the manifest is successfully loaded,
    //  *                         or rejects with an error message if loading fails.
    //  */
    // loadAppendManifest(url, replaceExisting){
    //   // remove in case character was loaded
    //   return new Promise((resolve, reject) => {
    //     try {
    //       // Fetch the manifest data asynchronously
    //       this._fetchManifest(url).then(manifest=>{
    //         this.appendManifest(manifest, replaceExisting).then(()=>{
    //           resolve();
    //         })
    //       })
    //     } catch (error) {
    //       // Handle any errors that occurred during the asynchronous operations
    //       console.error("Error loading manifest:", error.message);
    //       reject(new Error("Failed to load the manifest."));
    //     }
    //   });
    // }
  
  
    // XXX remove
    // /**
    //    * Appends an existing manifest data to the current loaded manifest.
    //    *
    //    * @param {object} manifest - The loaded mmanifest object.
    //    * @param {boolean} replaceExisting - Should existing IDs be reaplced with the new manifest?
    //    * @returns {Promise<void>} A Promise that resolves when the manifest is successfully loaded,
    //    *                         or rejects with an error message if loading fails.
    //    */
    // appendManifest(manifest, replaceExisting){
    //   return new Promise(async (resolve, reject) => {
    //     try{
    //       if (replaceExisting)
    //         this.manifest = {...(this.manifest || {}), manifest};
    //       else
    //         this.manifest = {manifest, ...(this.manifest || {})};
  
    //       // Create a CharacterManifestData instance based on the fetched manifest
    //       const manifestData = new CharacterManifestData(manifest);
    //       this.manifestData.appendManifestData(manifestData);
  
    //       // Resolve the Promise (without a value, as you mentioned it's not needed)
    //       resolve();
  
    //     } catch (error) {
    //       // Handle any errors that occurred during the asynchronous operations
    //       console.error("Error setting manifest:", error.message);
    //       reject(new Error("Failed to set the manifest."));
    //     }
    //   })
    // }
  }