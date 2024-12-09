import { getAsArray } from "./utils";

/**
 * @typedef {import('./CharacterManifestData').CharacterManifestData} CharacterManifestData
 * @typedef {import('./CharacterManifestData').ModelTrait} ModelTrait
 * @typedef {import('./CharacterManifestData').TraitModelsGroup} TraitModelsGroup
 * */

export class ManifestRestrictions {

    /**
     * @type {Record<string, {
     *  restrictedTraits: string[];
     *   restrictedTypes: string[];
     *   restrictedBlendshapes: string[];
     * }>;}
     */
    traitRestrictions

    /**
     * @type {Record<string, TraitRestriction>}
     */
    restrictionMaps = {};

    /**
     * restrictions for specific trait items
     * example: { 'hat-blue-02': ['pants-blue-01', 'hat-blue-03'] }
     * @type {Map<string, Set<string>>}
     */
    itemRestrictions = new Map()

    /**
     * @type {CharacterManifestData}
     */
    manifestData
    
    constructor( manifestData) {
        this.manifestData = manifestData;
        this.traitRestrictions = manifestData.traitRestrictions || {}
        this._validateTraitRestrictions();

    }

    _init(){
        this._setupSpecificItemRestrictions()
        this.logRules()
    }


    logRules = () => {
        const log = []
        for(const r in this.restrictionMaps){
            const restriction = this.restrictionMaps[r]
            restriction.restrictedTraits.size && console.log(`Trait: ${restriction.group.trait} is restrciting ${Array.from(restriction.restrictedTraits.values()).join(', ')}`)
            restriction.restrictedTypes.size && console.log(`Trait: ${restriction.group.trait} also restricts types ${Array.from(restriction.restrictedTypes.values()).join(', ')}`)
            restriction.restrictedBlendshapes.size && console.log(`Trait: ${restriction.group.trait} has blendshape restrictions on trait ${Array.from(restriction.restrictedBlendshapes.values()).join(', ')}`)
        }
        this.itemRestrictions.forEach((v,k)=>{
            log.push(`Item ${k} is restricting item ${Array.from(v.values()).join(', ')}`)
        })
        console.log(log.join('\n'))
    }

    /**
     * @private
     * Setup specific item restrictions
     */ 
    _setupSpecificItemRestrictions = () => {
        const all = this.manifestData.getAllTraitOptions()
        all.forEach((c)=>{
            this.itemRestrictions.set(c.id, new Set())
        })

        for(const modelTrait of all){
            if(!modelTrait._restrictedItems || modelTrait._restrictedItems.length == 0) {
                continue;
            }
            const restrictedSpecificIds = new Set()


            /**
             * If item A has [B,C], then add B,C
             */
            for(const itemId of modelTrait._restrictedItems) {
                const itemData = all.find((d) => d.id == itemId)
                if(!itemData) {
                    console.warn(`[${modelTrait.traitGroup.trait}] Restricted item ${itemId} not found`)
                    continue;
                }
                restrictedSpecificIds.add(itemId)
            }
            this.itemRestrictions.set(modelTrait.id, restrictedSpecificIds)
            
                
            /**
             * Go over itemRestrictions and add the other item that is restricting the current trait
             * if D has [A,B], then add D to the restrictedTraits list of A,B
             */
            if(restrictedSpecificIds.size > 0) {

                for(const item of restrictedSpecificIds){
                    const r = this.itemRestrictions.get(item)
                    if(!r) continue;
                    if(!r.has(modelTrait.id)){
                        r.add(modelTrait.id)
                    }
                }
            }
        }

        this.itemRestrictions.forEach((v,k)=>{
            if(v.size == 0) {
                this.itemRestrictions.delete(k)
            }
        })

    }

    /**
     * 
     * @param {TraitModelsGroup} group 
     */
    createTraitRestriction = (group) => {
        if (this.restrictionMaps[group.trait]) {
            return this.restrictionMaps[group.trait];
        }
        const restriction = new TraitRestriction(this, group);
        group.restrictions = restriction;

        this.restrictionMaps[group.trait] = restriction;
    
        return restriction
    }

    /**
     * Given a list of traits, get the traits that are forbidden given the restrictions
     * @param {string[]} traitGroups
     */
    getForbiddenTraits = (traitGroups) => {
        const disallowedTraits =new Set()
        for(const traitId in this.restrictionMaps) {
            if(!traitGroups.includes(traitId)) {
                continue
            }
        
            const restriction = this.restrictionMaps[traitId];
            for(const trait of restriction.restrictedTraits) {
                disallowedTraits.add(trait)
            }
        }
        return Array.from(disallowedTraits.values())
    }

    /**
     * Given a list of traits, get the types that are forbidden given the restrictions
     * @param {string[]} traitGroups
     */
    getForbiddenTypes = (traitGroups) => {
        const disallowedTypes =new Set()
        for(const traitId in this.restrictionMaps) {
            if(!traitGroups.includes(traitId)) {
                continue
            }
        
            const restriction = this.restrictionMaps[traitId];
            for(const trait of restriction.restrictedTraits) {
                disallowedTypes.add(trait)
            }
        }
        return Array.from(disallowedTypes.values())
    }
    /**
     * @private
     * Validate trait restrictions
     */
     _validateTraitRestrictions = () => {
        /**
         * @type {Record<string, {
         *   restrictedTraits: string[];
         *   restrictedTypes: string[];
         * restrictedBlendshapes: string[];
         *}>}
         */
        const traitRes = {}
        if (this.traitRestrictions) {
            for (const prop in this.traitRestrictions) {
                if (traitRes[prop] == null) {
                    traitRes[prop] = { restrictedTraits: [], restrictedTypes: [], restrictedBlendshapes: [] }
                }
                traitRes[prop].restrictedTraits = getAsArray(this.traitRestrictions[prop].restrictedTraits).map((t)=>{
                    if(!this.manifestData.requiredTraits.includes(t)){
                        console.warn(`A required trait cannot be a restricted trait. This is because trait A can remove required trait B when A is selected.`)
                        return t
                    }else{
                        return null
                    }
                }).filter((t) => !!t)
                traitRes[prop].restrictedTypes = getAsArray(this.traitRestrictions[prop].restrictedTypes).filter((t) => !!t);
                traitRes[prop].restrictedBlendshapes = getAsArray(this.traitRestrictions[prop].restrictedBlendshapes).filter((t) => !!t);
            }
        }
        this.traitRestrictions = traitRes
    }
}


/**
 * @typedef {Object} TraitRestrictionResult
 * @property {boolean} allowed
 * @property {string} blockingTrait
 */
/**
 * @typedef {Object} TypeRestrictionResult
 * @property {boolean} allowed
 * @property {string} blockingType
 */
/**
 * @typedef {Object} blockingObject
 * @property {string} blockingTrait
 * @property {string} blockingType
 * @property {string} blockingItemId
 */
/**
 * @typedef {Object} ItemRestrictionResult
 * @property {boolean} allowed
 * @property {blockingObject} blocking
 */

export class TraitRestriction {
    /**
     * @type {TraitModelsGroup}
     */
    group;
    /**
     * @type {Set}
     */
    restrictedTraits
    /**
     * @type {Set}
     */
    restrictedTypes

    /**
     * @type {Set}
     */
    restrictedBlendshapes

    /**
     * 
     * @param {ManifestRestrictions} manifestRestrictions 
     * @param {TraitModelsGroup} group 
     */
    constructor(manifestRestrictions, group) {
        this.manifestRestrictions = manifestRestrictions;
        this.group = group;

        this.restrictedTraits = new Set(this.manifestRestrictions.traitRestrictions[group.trait]?.restrictedTraits || []);
        this.restrictedTypes = new Set(this.manifestRestrictions.traitRestrictions[group.trait]?.restrictedTypes || []);
        this.restrictedBlendshapes = new Set(this.manifestRestrictions.traitRestrictions[group.trait]?.restrictedBlendshapes || []);

        /**
         * Check if the current trait is restricting another trait, if so add the current trait to the restrictedTraits list of the other trait
         * Note that this works only because we are iterating over the traitRestrictions objects one at a time.
         */
        for(const traitKey in this.manifestRestrictions.traitRestrictions) {
            if(traitKey == group.trait) {
                continue;
            }
            const otherTraitRestriction = this.manifestRestrictions.traitRestrictions[traitKey]
            /**
             * If the current trait is restricting another trait, then add current trait to the restrictedTraits list of other key
             */
            for(const traitId of this.restrictedTraits) {
                const objectFromMap =this.manifestRestrictions.restrictionMaps[traitId]
                if(objectFromMap){
                    if(!objectFromMap.restrictedTraits.has(group.trait)) {
                        objectFromMap.restrictedTraits.add(traitKey);
                    }
                }
            }
            /**
             * If the current trait is restricted by another trait, then add the current trait to the restrictedTraits list
             */
            if(otherTraitRestriction.restrictedTraits.includes(group.trait) && !this.restrictedTraits.has(traitKey)) {
                this.restrictedTraits.add(traitKey);
            }
        }
    }

    get manifestData(){
        return this.manifestRestrictions.manifestData;
    }
    
    get traitId() {
        return this.group.trait;
    }
    /**
     * Check whether the trait ID is permitted for this trait restriction
     * true if the trait is not in the restrictedTraits list
     * @type {string} traitId
     * @returns {boolean}
     */
    isTraitAllowed = (traitId) => {
        return !this.restrictedTraits.has(traitId);
    }
    /**
     * Check whether the type is permitted for this trait restriction
     * true if the type is not in the restrictedTypes list
     * @type {string} typeName
     * @returns {boolean}
     */
    isTypeAllowed = (typeName) => {
        return !this.restrictedTypes.has(typeName);
    }
    /**
     * Check whether this trait restriction is allowed by target trait
     * @param {string} targetTrait
     * @returns {TraitRestrictionResult}
     */
    isReverseTraitAllowed = (targetTrait) => {
        const restriction = this.manifestRestrictions.restrictionMaps[targetTrait];
        if (restriction) {
            const isAllowed = restriction.isTraitAllowed(this.traitId)
            return {allowed:isAllowed, blockingTrait: isAllowed?undefined:this.traitId};
        }

        return {allowed:true, blockingTrait: undefined};
    }
    /**
     * Check whether the type from this restriction is allowed by target trait
     * @param {string} sourceType
     * @param {string} targetTrait
     * @returns {TypeRestrictionResult}
     */
    isReverseTypeAllowed = (sourceType,targetTrait) => {
        if(!sourceType) return {allowed:true};
        const restriction = this.manifestRestrictions.restrictionMaps[targetTrait];
        if (restriction) {
            const isAllowed = restriction.isTypeAllowed(sourceType)
            return {allowed:isAllowed, blockingType: isAllowed?undefined:this.traitId};
        }

        return {allowed:true}
    }
    /**
     * Check whether the soruceItem allows the targetItem
     * @param {string} sourceItemId
     * @param {string} targetItemId
     * @returns {boolean}
     */
    isItemAllowed = (sourceItemId, targetItemId) => {
        if(!sourceItemId) return true;
        const list = this.manifestRestrictions.itemRestrictions.get(sourceItemId)
        if (list) {
            return !list.has(targetItemId)
        }

        return true
    }

    /**
     * 
     * @param {string} sourceItemId 
     * @param {string} targetItemId 
     * @returns {ItemRestrictionResult}
     */ 
    isReverseItemAllowed = (sourceItemId, targetItemId) => {
        if(!sourceItemId) return {allowed:true, blockingItemId:undefined};
        const list = this.manifestRestrictions.itemRestrictions.get(targetItemId)
        if (list) {
            const isAllowed = !list.has(sourceItemId)
            return {allowed:isAllowed, blockingItemId: isAllowed?undefined:sourceItemId}
        }

        return {allowed:true, blockingItemId:undefined}
    }
    /**
     * 
     * @param {string} sourceType 
     * @param {string} targetTrait 
     * @param {string} sourceItemId 
     * @param {string} targetItemId 
     * @returns {ItemRestrictionResult}
     */
    isReverseAllowed = (sourceType,targetTrait,sourceItemId,targetItemId) => {

        const isReverseTraitAllowed = this.isReverseTraitAllowed(targetTrait)
        const isReverseTypeAllowed = this.isReverseTypeAllowed(sourceType,targetTrait)
        const isReverseItemAllowed = this.isReverseItemAllowed(sourceItemId,targetItemId)

        return {allowed:isReverseTraitAllowed.allowed && isReverseTypeAllowed.allowed && isReverseItemAllowed.allowed, blocking: {
            blockingTrait:isReverseTraitAllowed.blockingTrait,
            blockingType:isReverseTypeAllowed.blockingType,
            blockingItemId:isReverseItemAllowed.blockingItemId
        }}
    }

    /**
     * 
     * @param {string} traitId 
     * @returns 
     */
    isBlendshapeOfTraitAllowed = (traitId) => {
        return !this.restrictedBlendshapes.has(traitId);
    }
    
    /**
     * Check whether this trait restriction is allowed by target trait
     * @param {string} targetTrait
     * @returns {TraitRestrictionResult}
     */
    isReverseBlendshapeTraitAllowed = (targetTrait) => {
        const restriction = this.manifestRestrictions.restrictionMaps[targetTrait];
        if (restriction) {
            const isAllowed = restriction.isBlendshapeOfTraitAllowed(this.traitId)
            return {allowed:isAllowed, blockingTrait: isAllowed?undefined:this.traitId};
        }

        return {allowed:true, blockingTrait: undefined};
    }
}