import axios from "axios";

import bones from "../library/bones.json";
import templates from "../data/base_models.json";
import modelTraits from '../data/model_traits.json';

export const apiService = {
  fetchBones,
  filterElements,
  fetchTemplate,
  fetchTraitsByCategory
};

const BASE_URI_PROD = "http://34.214.42.55:8081";

async function fetchTraitsByCategory(name: any) {
  const filtered = modelTraits.filter((trait: any) => trait.trait === name);
  return filtered[0];
}

async function fetchTemplate(id: any) {
  const filtered = templates.filter((templates: any) => templates.id === id);
  return filtered[0];
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