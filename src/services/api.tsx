import axios from "axios";

import bones from "../library/bones.json";

export const apiService = {
  fetchBones,
  filterElements,
  fetchTemplate,
  fetchTemplates
};


async function fetchTemplate(id: any) {
  const response = await axios.get("/templates/templates.json");
  const filtered = response.data.filter((templates: any) => templates.id === id);
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
