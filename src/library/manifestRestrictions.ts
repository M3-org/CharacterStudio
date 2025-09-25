import { CharacterManifestData, ModelTrait, TraitModelsGroup } from "./CharacterManifestData";
import { getAsArray } from "./utils";


export class ManifestRestrictions {

    traitRestrictions: Record<string, {
        restrictedTraits: string[];
        restrictedTypes: string[];
        restrictedBlendshapes: string[];
    }>;

    restrictionMaps: Record<string, TraitRestriction> = {};

    /**
     * restrictions for specific trait items
     * example: { 'hat-blue-02': ['pants-blue-01', 'hat-blue-03'] }
     */
    itemRestrictions: Map<string, Set<string>> = new Map()
    
    constructor(public manifestData: CharacterManifestData) {

        this.traitRestrictions = manifestData.traitRestrictions || {}
        this._validateTraitRestrictions();

    }

    _init(){
        this._setupSpecificItemRestrictions()
        this.logRules()
    }

    logRules = () => {
        for(const r in this.restrictionMaps){
            const restriction = this.restrictionMaps[r]
            restriction.restrictedTraits.size && console.log(`Trait: ${restriction.group.trait} is restrciting ${Array.from(restriction.restrictedTraits.values()).join(', ')}`)
            restriction.restrictedTypes.size && console.log(`Trait: ${restriction.group.trait} also restricts types ${Array.from(restriction.restrictedTypes.values()).join(', ')}`)
            restriction.restrictedBlendshapes.size && console.log(`Trait: ${restriction.group.trait} has blendshape restrictions on trait ${Array.from(restriction.restrictedBlendshapes.values()).join(', ')}`)
        }
        this.itemRestrictions.forEach((v,k)=>{
            console.log(`Item: ${k} is restricting ${Array.from(v.values()).join(', ')}`)
        })
    }

    private _setupSpecificItemRestrictions = () => {
        const all = this.manifestData.getAllTraitOptions()
        all.forEach((c)=>{
            this.itemRestrictions.set(c.id, new Set<string>())
        })

        for(const modelTrait of all){
            if(!modelTrait._restrictedItems || modelTrait._restrictedItems.length == 0) {
                continue;
            }
            const restrictedSpecificIds = new Set<string>()


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

    createTraitRestriction = (group: TraitModelsGroup) => {
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
     */
    getForbiddenTraits = (traitGroups: string[]) => {
        const disallowedTraits =new Set<string>()
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
     */
    getForbiddenTypes = (traitGroups: string[]) => {
        const disallowedTypes =new Set<string>()
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
    private _validateTraitRestrictions = () => {
        const traitRes: Record<string, {
            restrictedTraits: string[];
            restrictedTypes: string[];
            restrictedBlendshapes: string[];
        }> = {}
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
                }).filter((t) => !!t) as string[];
                traitRes[prop].restrictedTypes = getAsArray(this.traitRestrictions[prop].restrictedTypes).filter((t) => !!t);
                traitRes[prop].restrictedBlendshapes = getAsArray(this.traitRestrictions[prop].restrictedBlendshapes).filter((t) => !!t);
            }
        }
        this.traitRestrictions = traitRes
    }
}

export class TraitRestriction {
    group: TraitModelsGroup;
    restrictedTraits: Set<string>
    restrictedTypes: Set<string>
    restrictedBlendshapes: Set<string>

    constructor(public manifestRestrictions: ManifestRestrictions, group: TraitModelsGroup) {
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
     */
    isTraitAllowed = (traitId: string): boolean => {
        return !this.restrictedTraits.has(traitId);
    }

    isBlendshapeOfTraitAllowed = (traitId: string): boolean => {
        return !this.restrictedBlendshapes.has(traitId);
    }

    /**
     * Check whether the type is permitted for this trait restriction
     * true if the type is not in the restrictedTypes list
     */
    isTypeAllowed = (typeName: string): boolean => {
        return !this.restrictedTypes.has(typeName);
    }
    /**
     * Check whether this trait restriction is allowed by target trait
     */
    isReverseTraitAllowed = (targetTrait: string): {allowed:boolean,blockingTrait?:string} => {
        const restriction = this.manifestRestrictions.restrictionMaps[targetTrait];
        if (restriction) {
            const isAllowed = restriction.isTraitAllowed(this.traitId)
            return {allowed:isAllowed, blockingTrait: isAllowed?undefined:this.traitId};
        }

        return {allowed:true, blockingTrait: undefined};
    }

    /**
     * Check whether this trait restriction is allowed by target trait
     */
    isReverseBlendshapeTraitAllowed = (targetTrait: string): {allowed:boolean,blockingTrait?:string} => {
        const restriction = this.manifestRestrictions.restrictionMaps[targetTrait];
        if (restriction) {
            const isAllowed = restriction.isBlendshapeOfTraitAllowed(this.traitId)
            return {allowed:isAllowed, blockingTrait: isAllowed?undefined:this.traitId};
        }

        return {allowed:true, blockingTrait: undefined};
    }

    /**
     * Check whether the type from this restriction is allowed by target trait
     */
    isReverseTypeAllowed = (sourceType:string,targetTrait: string): {allowed:boolean,blockingType?:string} => {
        if(!sourceType) return {allowed:true};
        const restriction = this.manifestRestrictions.restrictionMaps[targetTrait];
        if (restriction) {
            const isAllowed = restriction.isTypeAllowed(sourceType)
            return {allowed:isAllowed, blockingType: isAllowed?undefined:this.traitId};
        }

        return {allowed:true}
    }

    isItemAllowed = (sourceItemId:string, targetItemId: string): boolean => {
        if(!sourceItemId) return true;
        const list = this.manifestRestrictions.itemRestrictions.get(sourceItemId)
        if (list) {
            return !list.has(targetItemId)
        }

        return true
    }

    isReverseItemAllowed = (sourceItemId:string, targetItemId: string): {allowed:boolean, blockingItemId?:string} => {
        if(!sourceItemId) return {allowed:true, blockingItemId:undefined};
        const list = this.manifestRestrictions.itemRestrictions.get(targetItemId)
        if (list) {
            const isAllowed = !list.has(sourceItemId)
            return {allowed:isAllowed, blockingItemId: isAllowed?undefined:sourceItemId}
        }

        return {allowed:true, blockingItemId:undefined}
    }

    isReverseAllowed = (sourceType:string,targetTrait: string,sourceItemId:string,targetItemId:string): {allowed:boolean, blocking:{
        blockingTrait?:string,
        blockingType?:string,
        blockingItemId?:string
    }} => {

        const isReverseTraitAllowed = this.isReverseTraitAllowed(targetTrait)
        const isReverseTypeAllowed = this.isReverseTypeAllowed(sourceType,targetTrait)
        const isReverseItemAllowed = this.isReverseItemAllowed(sourceItemId,targetItemId)

        return {allowed:isReverseTraitAllowed.allowed && isReverseTypeAllowed.allowed && isReverseItemAllowed.allowed, blocking: {
            blockingTrait:isReverseTraitAllowed.blockingTrait,
            blockingType:isReverseTypeAllowed.blockingType,
            blockingItemId:isReverseItemAllowed.blockingItemId
        }}
    }
}