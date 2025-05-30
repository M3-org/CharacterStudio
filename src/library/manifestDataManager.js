import { CharacterManifestData } from "./CharacterManifestData";
import { getAsArray } from "./utils";

export class ManifestDataManager{
    constructor(){
      this.mainManifestData = null;
      this.manifestDataCollection = [];
      this.manifestDataByIdentifier = {};
      this.defaultValues = {
        defaultCullingLayer:-1,
        defaultCullingDistance:null,
        maxCullingDistance:Infinity
      };
      
    }
    getLoadedLockedManifests(isLocked){
      return this.manifestDataCollection.filter((manifestData)=>manifestData.locked == isLocked);
    }
    getMainCurrency(){
      return this.mainManifestData.getCurrency();
    }

    getLoadedManifests(){
      return this.manifestDataCollection;
    }

    getLoadedManifestByIdentifier(identifier){
      return this.manifestDataByIdentifier[identifier];
    }
    getLoadedManifestByIndex(index){
      return this.manifestDataCollection[index];
    }

    
    unlockManifestByIndex(index, testWallet = null){
      const manifestData = this.manifestDataCollection[index];
      if (manifestData != null)
        return manifestData.unlockWalletOwnedTraits(testWallet);
      else{
        console.error(`No manifest with index ${index} was found.`)
        return Promise.reject();
      }
    }
    unlockManifestByIdentifier(identifier, testWallet = null){
      const manifestData = this.manifestDataByIdentifier[identifier];
      if (manifestData != null)
        return manifestData.unlockWalletOwnedTraits(testWallet);
      else{
        console.error(`No manifest with identifier ${identifier} was found.`)
        return Promise.reject();
      }
        
    }

    isManifestByIndexNFTLocked(index){
      return  this.manifestDataCollection[index]?.isNFTLocked(testWallet);
    }
    isManifestByIdentifierNFTLocked(identifier){
      return  this.manifestDataByIdentifier[identifier]?.isNFTLocked(testWallet);
    }
    
    clearManifests(){
        this.mainManifestData = null;
        this.manifestDataCollection = [];
        this.manifestDataByIdentifier = {};
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
    
    isGroupTraitRestrictedInAnyManifest(trait, groupTraitID){
      for (const manifestData of this.manifestDataCollection){
        const p = manifestData.manifestRestrictions.restrictionMaps[trait]?.isReverseBlendsh
      }
    }


    setCustomManifest(){
      const manifest = {colliderTraits:["CUSTOM"],traits:[{name:"Custom", trait:"CUSTOM", collection:[]}]};
      this.setManifestDefaultValues(manifest);
      this.mainManifestData = new CharacterManifestData(manifest, "_custom");
      this.manifestDataCollection.push(this.mainManifestData);
      this.manifestDataByIdentifier["_custom"] = this.mainManifestData;
    }
    /**
       * Loads the manifest data for the character.
       *
       * @param {string} url - The URL of the manifest.
       * @param {string} identifier - An ID to later get loaded manifest
       * @returns {Promise<void>} A Promise that resolves when the manifest is successfully loaded,
       *                         or rejects with an error message if loading fails.
       */
    loadManifest(url, identifier) {
      if (identifier == null)
        identifier = "main";
      if (this.manifestDataByIdentifier[identifier] != null){
        console.log(`Manifest with ID ${identifier} has been already loaded.`)
        return Promise.reject(new Error(`Manifest with ID ${identifier} has been already loaded.`));
      }
      
      // remove in case character was loaded
      return new Promise((resolve, reject) => {
        try {
          // Fetch the manifest data asynchronously
          this._fetchManifest(url).then(manifest=>{
            this.setManifest(manifest, identifier).then(()=>{
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
    /**
       * Sets an existing manifest data for the character.
       *
       * @param {object} manifest - The loaded mmanifest object.
       * @param {object} identifier - An ID to later get loaded manifest.
       * @returns {Promise<void>} A Promise that resolves when the manifest is successfully loaded,
       *                         or rejects with an error message if loading fails.
       */
    setManifest(manifest, identifier){
      if (identifier == null)
        identifier = "main";

      if (this.manifestDataByIdentifier[identifier] != null){
        console.log(`Manifest with ID ${identifier} has been already loaded.`)
        return Promise.reject(new Error(`Manifest with ID ${identifier} has been already loaded.`));
      }
      return new Promise(async (resolve, reject) => {
        try{
          if (manifest) {
            // Create a CharacterManifestData instance based on the fetched manifest
            const manifestData = new CharacterManifestData(manifest, identifier);
  
            if (this.mainManifestData == null){
              this.mainManifestData = manifestData;
              this.setManifestDefaultValues(manifestData);
            }
            this.manifestDataCollection.push(manifestData);
            this.manifestDataByIdentifier[identifier] = manifestData;
          
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

    getTraitOption(groupTraitID, traitID, optionalIdentifier){
      // Get from specified ID manifestData
      if (optionalIdentifier != null){
        const manifestData = this.manifestDataByIdentifier[optionalIdentifier];
        if (manifestData != null){
          return manifestData.getTraitOption(groupTraitID, traitID);
        }
        else{
          console.warn(`No manifest data with name ${optionalIdentifier} was found.`)
          return null;
        }
      }
      // Get from all manifestData, the first found
      else{
        let traitOption = null;
        this.manifestDataCollection.forEach(manifestData => {
          if (traitOption == null)
            traitOption = manifestData.getTraitOption(groupTraitID, traitID);
        });
        return traitOption;
      }
    }
  
    getTraitOptionById(traitID, optionalIdentifier){
      if (optionalIdentifier != null){
        const manifestData = this.manifestDataByIdentifier[optionalIdentifier];
        if (manifestData != null){
          return manifestData[identifier]?.getTraitOptionById(traitID);
        }
        else{
          console.warn(`No manifest data with name ${optionalIdentifier} was found.`)
          return null;
        }
      }
      else{
        traitOption = null
        this.manifestDataCollection.forEach(manifestData => {
          if (traitOption == null)
            traitOption = manifestData.getTraitOptionById(traitID);
        });
        return traitOption;
      }
    }

    getTraitOptionsByType(traitType, optionalIdentifier){
      if (optionalIdentifier != null){
        const manifestData = this.manifestDataByIdentifier[optionalIdentifier];
        if (manifestData != null){
          return manifestData.getTraitOptionsByType(traitType);
        }
        else{
          console.warn(`No manifest data with name ${optionalIdentifier} was found.`)
          return null;
        }
      }
      else{
        const fullCollection = [];
        this.manifestDataCollection.forEach(manifestData => {
          fullCollection.push(...getAsArray(manifestData.getTraitOptionsByType(traitType)));
        });
        return fullCollection;
      }
    }
  
    getAllBlendShapeTraits(optionalIdentifier){
      if (optionalIdentifier != null){
        const manifestData = this.manifestDataByIdentifier[optionalIdentifier];
        if (manifestData != null){
          return manifestData.getAllBlendShapeTraits();
        }
        else{
          console.warn(`No manifest data with name ${optionalIdentifier} was found.`)
          return null;
        }
      }
      else{
        const allBlendshapes = [];
        this.manifestDataCollection.forEach(manifestData => {
          allBlendshapes.push(...getAsArray(manifestData.getAllBlendShapeTraits()))
        });
        return allBlendshapes;
      }
    }
  
    isColliderRequired(traitID){
      let result = false;
      this.manifestDataCollection.forEach(manifestData => {
        if (manifestData.isColliderRequired(traitID))
          result = true;
      });
      return result;
    }

    isLipsyncTrait(traitID, identifier){
      if (identifier == null){
        console.log(`Identifier was not provided. Using main manifest`)
      }
      const manifestData = identifier == null ? this.mainManifestData : this.manifestDataByIdentifier[identifier];
      if (manifestData != null){
        return manifestData.isLipsyncTrait(traitID);
      }
      else{
        return false;
      }
    }
  
    getCustomTraitOption(groupTraitID, url){
      return this.mainManifestData.getCustomTraitOption(groupTraitID, url);
    }
  
    getNFTraitOptionsFromURL(url, ignoreGroupTraits, identifier){
      if (identifier == null){
        console.log(`Identifier was not provided. Using main manifest`)
      }

      const manifestData = identifier == null ? this.mainManifestData : this.manifestDataByIdentifier[identifier];
      if (manifestData == null){
        console.log(`No manifest with identifier: ${identifier}  was previously loaded.`)
        return Promise.resolve();
      }
      else{
        return new Promise(async (resolve) => {
          try{
            const traits = await manifestData(url, ignoreGroupTraits);
            resolve(traits);
          }
          catch{
            console.log("an error ocurred while trying to load:", url);
            resolve(null);
          }
        });
        }
    }
    getNFTraitOptionsFromObject(NFTObject, ignoreGroupTraits, identifier){
      if (identifier == null){
        console.log(`Identifier was not provided. Using main manifest`)
      }
      const manifestData = identifier == null ? this.mainManifestData : this.manifestDataByIdentifier[identifier];

      return manifestData?.getNFTraitOptionsFromObject(NFTObject, ignoreGroupTraits);
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
  
    // returns the full group of the manifest with chosen identifier
    getModelGroup(groupTraitID, identifier){
      if (identifier == null){
        console.log(`Identifier was not provided. Using main manifest`)
      }
      const manifestData = identifier == null ? this.mainManifestData : this.manifestDataByIdentifier[identifier];
      
      return manifestData.getModelGroup(groupTraitID);
    }
  
    // only for the main manifest
    isTraitGroupRequired(groupTraitID){
      let result = false;
      const groupTrait = this.mainManifestData.getModelGroup(groupTraitID);

      if (groupTrait?.isRequired) {
        result = true;
      }
  
      return result;
    }
  
    getModelTraits(groupTraitID, optionalIdentifier){
      if (optionalIdentifier != null){
        const manifestData = this.manifestDataByIdentifier[optionalIdentifier];
        if (manifestData != null){
          return manifestData.getModelTraits(traitType);
        }
        else{
          console.warn(`No manifest data with name ${optionalIdentifier} was found.`)
          return null;
        }
      }
      else{
        const result = [];
        for (const identifier in this.manifestDataByIdentifier){
          const manifestData = this.manifestDataByIdentifier[identifier];
          result.push(...getAsArray(manifestData.getModelTraits(groupTraitID)))
        }
        return result;
      }
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
    getSelectionForAllTraits(){
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
  
    // returns traitGroups, does not combine collections
    getGroupModelTraits(nonRepeatingGroups = true, optionalIdentifier = null){
      
      if (optionalIdentifier != null){
        const manifestData = this.manifestDataByIdentifier[optionalIdentifier];
        if (manifestData != null){
          return manifestData.getGroupModelTraits();
        }
        else{
          console.warn(`No manifest data with name ${optionalIdentifier} was found.`)
          return [];
        }
      }
      else{
        if (nonRepeatingGroups == true){
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
        else{
          const resultArray = []
          this.manifestDataCollection.forEach(manifestData => {
            resultArray.push(getAsArray(...manifestData.getGroupModelTraits()));
          });
          return resultArray;
        }
      }
    }
  

    isManifestNFTLocked(identifier){
      if (identifier == null){
        console.log(`Identifier was not provided. Using main manifest`)
      }

      const manifestData = identifier == null ? this.mainManifestData : this.manifestDataByIdentifier[identifier];
      if (manifestData != null){
        return manifestData.isNFTLocked();
      }
      else 
        return false;
    }
    hasManifestWithNFTLock(){
      let result = false;
      this.manifestDataCollection.forEach(manifestData => {
        if (manifestData.isNFTLocked()){
          result = true;
        }
      });
      return result;
    }
  
    getBlendShapeGroupTraits(traitGroupId, traitId, identifier){
      if (identifier == null){
        console.log(`Identifier was not provided. Using main manifest`)
      }
      const manifestData = identifier == null ? this.mainManifestData : this.manifestDataByIdentifier[identifier];

      return getAsArray(manifestData?.getModelTrait(traitGroupId, traitId)?.getGroupBlendShapeTraits());
    }
  
    getExportOptions(){
      // get it only from the main manifest, not the additionally loaded.
      return this.mainManifestData.getExportOptions();
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
  }