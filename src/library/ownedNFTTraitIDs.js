/**
 * Represents owned traits and IDs extracted from NFT metadata.
 */
export class OwnedNFTTraitIDs {
    /**
     * Initializes an instance of the OwnedTraitIDs class.
     * 
     * @param {Array<Object>} metadataNft - Array of NFT metadata objects.
     * @param {string|null} dataSource - The source of the data (`"attributes"` or `"image"`).
     */
    constructor(metadataNft, dataSource) {
        /**
         * @type {Object<string, Array<string>>}
         * Object mapping trait names to arrays of trait IDs.
         */
        this.ownedTraits = {};

        /**
         * @type {Array<string>}
         * Array of IDs extracted from the data source.
         */
        this.ownedIDs = [];
        console.log("eee");
        console.log(metadataNft)
        switch (dataSource){
            case "name":
                metadataNft.forEach(nft => {
                    console.log(nft);
                    this.addOwnedID(nft.name);
                });
                break;
            case "attributes":
                metadataNft.forEach(nft => {
                    nft.attributes.forEach(attr => {
                        this.addOwnedTrait(attr.trait_type, attr.value);
                    });
                });
                break;
            case "image":
                metadataNft.forEach(nft => {
                    const decodedSVG = atob(nft.image.split(",")[1]);
                    const parser = new DOMParser();
                    const svgDoc = parser.parseFromString(decodedSVG, "image/svg+xml");
                    const texts = [...svgDoc.querySelectorAll("text")].map(text => text.textContent);
                    texts.forEach(text => {
                        this.addOwnedID(text);
                    });
                });
                break;
            default:
                console.log("unkkown data source",dataSource)
                break;
        }
    }

    /**
     * Adds an ID to the owned IDs list.
     * 
     * @param {string} traitID - The ID to add.
     */
    addOwnedID(traitID) {
        if (!this.ownedIDs.includes(traitID)) {
            this.ownedIDs.push(traitID);
        }
    }

    /**
     * Adds a trait and its ID to the owned traits object.
     * 
     * @param {string} traitName - The name of the trait.
     * @param {string} traitID - The ID of the trait.
     */
    addOwnedTrait(traitName, traitID) {
        if (this.ownedTraits[traitName] == null) {
            this.ownedTraits[traitName] = [];
        }
        if (!this.ownedTraits[traitName].includes(traitID)) {
            this.ownedTraits[traitName].push(traitID);
        }
    }

    /**
     * Retrieves all IDs associated with a specific trait name.
     * 
     * @param {string} traitName - The name of the trait to retrieve IDs for.
     * @returns {Array<string>} An array of trait IDs.
     */
    getOwnedTraitIDs(traitName) {
        return [...(this.ownedTraits[traitName] || []), ...this.ownedIDs];
    }

    /**
     * Checks if any traits or IDs are owned.
     * 
     * @returns {boolean} `true` if there are owned traits or IDs, otherwise `false`.
     */
    ownTraits() {
        return (Object.keys(this.ownedTraits).length > 0 || this.ownedIDs.length > 0);
    }
}