import axios from "axios";

import bones from "../library/bones";
import { loadAnimation } from "../library/animations/animation"
import { time } from "console";
//import templates from "../data/base_models";

const pinataApiKey = '09ec28cb59953c34c4ca';
const pinataSecretApiKey = '3ec2a1aef028a02b46f17168ed3d37aebd1e2e88d635030cac0b8cf7fe552c11';

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
    "foot"
  ]
  return categoryList;
} 

async function fetchTraitsByCategory(name: any) {
  const filtered = modelTraits.filter((trait: any) => trait.trait === name);
  return filtered[0];
}

async function fetchTemplate(template:any,id: any) {
  //console.log(template.indexOf(id));
  const filtered = template.filter((templates: any) => templates.id === id);
  if (fetchedTemplate != id) {
    if (filtered[0] && filtered[0].traitsJsonPath) await fetchTraits(filtered[0].traitsJsonPath)
    if (filtered[0] && filtered[0].animationPath) await loadAnimation(filtered[0].animationPath)
  }
  fetchedTemplate = id
  return filtered[0];
}


async function fetchTraits(path: any) {
  modelTraits = await (await fetch(path)).json()
}

async function fetchBones() {
  return bones;
}

async function filterElements(search: any, elements: any, category: any) {
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

async function saveFileToPinata(fileData: any, fileName: any) {

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

async function saveMetaDataToPinata(metadata: any) {
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