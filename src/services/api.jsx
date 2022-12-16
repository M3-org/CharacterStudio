import axios from "axios";

import bones from "../library/bones";
//import templates from "../data/base_models";

const pinataApiKey = '05efa6dda750457f9c78';
const pinataSecretApiKey = 'f2b51a2d960d6c2ab02163cd57979fe4e47b6287f048ae47ff8967f27623308b';

// PINATA_API_KEY=4327cb1d2291c81e79ca
// PINATA_SECRET_API_KEY=0a9c01fcafd1db1266325f52be4d135f0f578bd8d13b486d4bffbc2fb4325dcd
export const apiService = {
  fetchBones,
  filterElements,
  fetchTemplate,
  fetchTraitsByCategory,
  fetchCategoryList,
  saveFileToPinata,
  saveMetaDataToPinata,
};

let modelTraits = []
let fetchedTemplate

function fetchCategoryList () { //need to update 
  const categoryList = [
    "chest",
    "head",
    "neck",
    "legs",
    "feet"
  ]
  return categoryList;
} 

async function fetchTraitsByCategory(name) {
  const filtered = modelTraits.filter((trait) => trait.trait === name);
  return filtered[0];
}

async function fetchTemplate(template,id) {
  //console.log(template.indexOf(id));
  const filtered = template.filter((templates) => templates.id === id);
  if (fetchedTemplate != id) {
    if (filtered[0] && filtered[0].traitsJsonPath) await fetchTraits(filtered[0].traitsJsonPath)
  }
  fetchedTemplate = id
  return filtered[0];
}


async function fetchTraits(path) {
  modelTraits = await (await fetch(path)).json()
}

async function fetchBones() {
  return bones;
}

async function filterElements(search, elements, category) {
  if (elements && elements.length && category) {
    const value = search;
    const val = value.toString().toLowerCase();
    const valueArray = val.split(" ");

    if (value) {
      const filteredElementsData = elements.filter((item) => {
        return valueArray.every((eachKey) => {
          if (!eachKey.length) {
            return true;
          }
          return item.name.toString().toLowerCase().includes(eachKey);
        });
      });
      return {
        data: filteredElementsData,
      };
    }
  }
}

async function saveFileToPinata(fileData, fileName) {

  const url = `https://api.pinata.cloud/pinning/pinFileToIPFS`;
  let data = new FormData();
  data.append("file", fileData, fileName);
  let resultOfUpload = await axios.post(url, data, {
      maxContentLength: "Infinity", //this is needed to prevent axios from erroring out with large files
      maxBodyLength: "Infinity", //this is needed to prevent axios from erroring out with large files
      headers: {
        "Content-Type": `multipart/form-data; boundary=${data._boundary}`,
        pinata_api_key: pinataApiKey,
        pinata_secret_api_key: pinataSecretApiKey,
      },
    });
    return resultOfUpload.data;
}

async function saveMetaDataToPinata(metadata) {
  // const response = await axios.post(`${BASE_URI_PROD}/save-metadata`, {
  //   ...metadata,
  // });
  // return response.data;
  const url = `https://api.pinata.cloud/pinning/pinJSONToIPFS`;
  let resultOfUpload = await axios
    .post(url, metadata, {
      headers: {
        pinata_api_key: pinataApiKey,
        pinata_secret_api_key: pinataSecretApiKey,
      },
    })
  return resultOfUpload.data;
}