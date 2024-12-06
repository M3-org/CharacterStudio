export class OwnedTraitIDs{
    constructor(metadataNft, dataSource){
        this.ownedTraits = {};
        this.ownedIDs = [];
        if (dataSource == null || dataSource == "attributes"){
            // get data from "attributes"
            
            metadataNft.forEach(nft => {
                console.log(nft);
                nft.attributes.forEach(attr => {
                    this.addOwnedTrait(attr.trait_type, attr.value);
                });
            });
          }
          else if (dataSource = "image"){
            metadataNft.forEach(nft => {
              const decodedSVG = atob(nft.image.split(",")[1]);
              const parser = new DOMParser();
              const svgDoc = parser.parseFromString(decodedSVG, "image/svg+xml");
              const texts = [...svgDoc.querySelectorAll("text")].map(text => text.textContent);
              texts.forEach(text => {
                this.addOwnedID(text);
              });
            });
          }
    }
    
    addOwnedID(traitID){
        if (!this.ownedIDs.includes(traitID))
            this.ownedIDs.push(traitID);
    }
    addOwnedTrait(traitName, traitID){
        if (this.ownedTraits[traitName] == null)
            this.ownedTraits[traitName] = []
        if (!this.ownedTraits[traitName].includes(traitID))
            this.ownedTraits[traitName].push(traitID);
    }
    getOwnedTraitIDs(traitName){
        return [...(this.ownedTraits[traitName]||[]), ...this.ownedIDs]
    }
    ownTraits(){
        return (Object.keys(this.ownedTraits).length > 0 || this.ownedIDs.length > 0)
    }
}