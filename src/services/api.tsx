import axios from "axios";

import bones from "../library/bones.json";
import templates from "../data/base_models.json"

export const apiService = {
  fetchBones,
  filterElements,
  fetchTemplate,
  fetchTemplates,
  saveFileToPinata,
  saveMetaDataToPinata
};

const BASE_URI_DEV = "http://localhost:8081";
const BASE_URI_PROD = "http://34.214.42.55:8081";

async function fetchTemplate(id: any) {
  const filtered = templates.filter((templates: any) => templates.id === id);
  return filtered[0];
}

async function fetchTemplates() {
  const response = await axios.get("/templates/templates.json");
  return response;
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

async function saveFileToPinata(fileData: any) {
  console.log("fileData saveFileToPinata =>",fileData)
  const response = await axios.post(
    `${BASE_URI_PROD}/pinata-upload`,
    fileData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );
  return response.data;
}

async function saveMetaDataToPinata(metadata: any) {
  const response = await axios.post(`${BASE_URI_PROD}/save-metadata`, {
    ...metadata,
  });
  return response.data;
}
