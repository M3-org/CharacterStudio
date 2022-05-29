import axios from "axios";
import bones from "../library/bones.json";
import templates from "../data/base_models.json";
import modelTraits from '../data/model_traits.json';
export const apiService = {
    fetchBones,
    filterElements,
    fetchTemplate,
    fetchTemplates,
    saveFileToPinata,
    saveMetaDataToPinata,
    fetchTraitsByCategory
};
const BASE_URI_DEV = "http://localhost:8081";
const BASE_URI_PROD = "http://34.214.42.55:8081";
async function fetchTraitsByCategory(name) {
    const filtered = modelTraits.filter((trait) => trait.trait === name);
    return filtered[0];
}
async function fetchTemplate(id) {
    const filtered = templates.filter((templates) => templates.id === id);
    return filtered[0];
}
async function fetchTemplates() {
    const response = await axios.get("/templates/templates.json");
    return response;
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
async function saveFileToPinata(fileData) {
    console.log("fileData saveFileToPinata =>", fileData);
    const response = await axios.post(`${BASE_URI_PROD}/pinata-upload`, fileData, {
        headers: {
            "Content-Type": "multipart/form-data",
        },
    });
    return response.data;
}
async function saveMetaDataToPinata(metadata) {
    const response = await axios.post(`${BASE_URI_PROD}/save-metadata`, {
        ...metadata,
    });
    return response.data;
}
