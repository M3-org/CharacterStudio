// returns a promise with all the nft metadata converted to character studio array data
import { getTraitOption } from "./option-utils";

export function getDataArrayFromNFTMetadata (files, templateInfo){
    const filesArray = Array.from(files);
    const jsonDataArray = [];
    const processFile = (file) => {
      return new Promise((resolve, reject) => {
        if (file && file.name.toLowerCase().endsWith('.json')) {
          const reader = new FileReader();
          const thumbLocation = `${templateInfo.assetsLocation}/anata/_thumbnails/t_${file.name.split('_')[0]}.jpg`;
          const jsonName = file.name.split('.')[0];

          reader.onload = function (e) {
            try {
              const jsonContent = JSON.parse(e.target.result);
              const options = [];
              const jsonAttributes = jsonContent.attributes.map((attribute) => (
                { trait: attribute.trait_type, id: attribute.value }
                )).filter((item) => item.trait !== "TYPE" && 
                                    item.trait !== "BRACE" &&
                                    item.trait !== "SET" &&
                                    item.trait !== "SPECIAL_OTHER" );

              jsonContent.attributes.forEach((attribute) => {
                  options.push(getTraitOption(attribute.value, attribute.trait_type, templateInfo));
              });

              const filteredOptions = options.filter((element) => element !== null);

              templateInfo.traits.forEach((trait) => {
                const coincidence = filteredOptions.some((option) => option.trait.trait === trait.trait);
                if (!coincidence) {
                  filteredOptions.push({ item: null, trait: trait });
                }
              });

              const jsonSelection = { name: jsonName, thumb: thumbLocation, attributes: jsonAttributes, options: filteredOptions };
              jsonDataArray.push(jsonSelection);

              resolve(); // Resolve the promise when processing is complete
            } catch (error) {
              console.error("Error parsing the JSON file:", error);
              reject(error);
            }
          };

          reader.readAsText(file);
        }
      });
    };

    // Use Promise.all to wait for all promises to resolve
    return Promise.all(filesArray.map(processFile))
    .then(() => jsonDataArray); // Return jsonDataArray after all promises are resolved
}