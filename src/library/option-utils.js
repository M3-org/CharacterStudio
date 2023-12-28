import * as THREE from "three"
import { getAsArray } from "./utils"

export function getRandomizedTemplateOptions(template) {
  return getMultipleRandomTraits(getInitialTraits(template),template);
}

export function getInitialTraits(template){

  return[
    ...new Set([
      ...getAsArray(template.requiredTraits),
      ...getAsArray(template.randomTraits),
    ]),
  ]
}

export function getMultipleRandomTraits(traitNames, template) {
  const resultTraitOptions = []

  traitNames.map((traitName) => {
    const traitFound = template.traits.find(
      (trait) => trait.trait === traitName,
    )
    if (traitFound) {
      const options = getTraitOptions(traitFound, template)
      if (options?.length > 0)
        resultTraitOptions.push(
          options[Math.floor(Math.random() * options.length)],
        )
    }
  })
  return resultTraitOptions
}
export const getOptionsFromAvatarData = (avatarData, manifest) =>{
  const filteredTemplates = manifest.filter(temps=> temps.id === avatarData.class)
  if (filteredTemplates.length > 0){
    const template = filteredTemplates[0]
    const opts = [];
    for (const prop in avatarData){
      const foundTraits = template.traits.filter(t=>t.trait=== prop)
        if (foundTraits.length > 0){
          const trait = foundTraits[0]
          if (avatarData[prop].traitInfo?.id != null){
            opts.push({
              item:avatarData[prop].traitInfo,
              textureTrait: avatarData[prop].textureInfo,
              colorTrait: avatarData[prop].colorInfo,
              trait:trait
            })
          }
          else{
            opts.push({
              item:null,
              trait:trait
            })
          }
        }
    }
    return opts
  }
  return null;
}

export const getClassOptions = (manifest) => {
  const options = []
  manifest.map((character, index) => {
    options.push(getClassOption("class_" + index, character.thumbnail, index))
  })
  return options
}


export function getTraitOptions(trait, template) {
  const traitOptions = []
  const thumbnailBaseDir = (template.assetsLocation || "") + template.thumbnailsDirectory
  trait.collection.map((item, index) => {
    const textureTraits = template?.textureCollections?.find(
      (texture) => texture.trait === item.textureCollection,
    )
    const colorTraits = template?.colorCollections?.find(
      (color) => color.trait === item.colorCollection,
    )

    // if no there is no collection defined for textures and colors, just grab the base option
    if (textureTraits == null && colorTraits == null) {
      const key = trait.name + "_" + index
      traitOptions.push(
        getOption(key, trait, item, thumbnailBaseDir + item.thumbnail),
      )
    }

    // in case we find collections of subtraits, add them as menu items
    if (textureTraits?.collection.length > 0) {
      textureTraits.collection.map((textureTrait, txtrIndex) => {
        const key = trait.name + "_" + index + "_txt" + txtrIndex
        const thumbnail = getThumbnail(item, textureTrait, txtrIndex)
        traitOptions.push(
          getOption(
            key,
            trait,
            item,
            thumbnailBaseDir + thumbnail,
            null,
            textureTrait,
          ),
        )
      })
    }
    if (colorTraits?.collection.length > 0) {
      colorTraits.collection.map((colorTrait, colIndex) => {
        const key = trait.name + "_" + index + "_col" + colIndex
        const thumbnail = getThumbnail(item, colorTrait, colIndex)
        traitOptions.push(
          getOption(
            key,
            trait,
            item,
            thumbnailBaseDir + thumbnail,
            getHSL(colorTrait.value[0]),
            null,
            colorTrait,
          ),
        )
      })
    }
  })
  return traitOptions
}

function getOption(
  key,
  trait,
  item,
  icon,
  iconHSL = null,
  textureTrait = null,
  colorTrait = null,
) {
  return {
    key,
    trait,
    item,
    icon,
    iconHSL,
    textureTrait,
    colorTrait,
  }
}
function getHSL (hex){ // getHSV
  /* note: 
    Web standards need HSV instead of HSL, so in fact this function return **HSV**, but to compatible with old codes, still named getHSL.
    Codes from: https://stackoverflow.com/a/8023734/3596736
    Related infos:
    https://www.rapidtables.com/convert/color/rgb-to-hsv.html
    https://www.rapidtables.com/convert/color/rgb-to-hsl.html
    https://github.com/mrdoob/three.js/pull/3109
    https://gist.github.com/xpansive/1337890#file-index-js
  */
  const color = new THREE.Color(hex)
  const hsl = { h: 0, s: 0, l: 0 }
  let rabs, gabs, babs, rr, gg, bb, h, s, v, diff, diffc;
  rabs = color.r;
  gabs = color.g;
  babs = color.b;
  v = Math.max(rabs, gabs, babs),
  diff = v - Math.min(rabs, gabs, babs);
  diffc = c => (v - c) / 6 / diff + 1 / 2;
  if (diff == 0) {
      h = s = 0;
  } else {
      s = diff / v;
      rr = diffc(rabs);
      gg = diffc(gabs);
      bb = diffc(babs);

      if (rabs === v) {
          h = bb - gg;
      } else if (gabs === v) {
          h = (1 / 3) + rr - bb;
      } else if (babs === v) {
          h = (2 / 3) + gg - rr;
      }
      if (h < 0) {
          h += 1;
      }else if (h > 1) {
          h -= 1;
      }
  }
  hsl.h = h;
  hsl.s = s;
  hsl.l = v;
  return hsl
}

function getClassOption (key, icon, avatarIndex){
  return {
    key,
    icon,
    avatarIndex,
  }
}

function getThumbnail (item, subtrait, index) {
  // thumbnail override is the most important, check if its defined
  if (item.thumbnailOverrides)
    if (item.thumbnailOverrides[index]) return item.thumbnailOverrides[index]

  // if not, check if its defined in the subtrait (texture collection or color collection) or just grab the base thumbnail from the item
  return subtrait.thumbnail || item.thumbnail
}
