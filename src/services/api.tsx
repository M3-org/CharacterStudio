import bones from "../library/bones";
import { loadAnimation } from "../library/animations/animation"
import templates from "../data/base_models";

export const apiService = {
  fetchBones,
  filterElements,
  fetchTemplate,
  fetchTraitsByCategory
};

let modelTraits = []
let fetchedTemplate

async function fetchTraitsByCategory(name: any) {
  const filtered = modelTraits.filter((trait: any) => trait.trait === name);
  return filtered[0];
}

async function fetchTemplate(id: any) {
  const filtered = templates.filter((templates: any) => templates.id === id);
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