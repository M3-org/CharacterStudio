// THIS IS A TEMPORARY SOLUTION BEFORE WE HAVE AN API ENDPOINT
// THe Data is just fetched from local json files.

import axios from "axios";

// IMPORT LOCAL DATA FOR TESTING
import BaseCategories from "../../data/base/categories.json";
import TemplateCategories from "../../data/template/categories.json";
import bones from "../../library/bones.json";

export const apiService = {
  fetchCaterories,
  fetchBones,
  filterElements,
  fetchTemplate,
  fetchTemplates
};

async function fetchCaterories(editor: any) {
  if (editor && editor === "base") {
    return BaseCategories;
  } else if (editor && editor === "template") {
    return TemplateCategories;
  }
}

async function fetchTemplate(id: any) {
  const response = await axios.get("/api/templates/templates.json");
  const filtered = response.data.filter((templates: any) => templates.id === id);
  return filtered[0];
}

async function fetchTemplates() {
  const response = await axios.get("/api/templates/templates.json");
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
