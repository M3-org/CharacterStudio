import React, { Fragment, useEffect, useContext } from "react"

import * as THREE from "three"
import gsap from "gsap"
import useSound from "use-sound"
import optionClick from "../../public/sound/option_click.wav"
import shuffle from "../../public/ui/traits/shuffle.svg"
import { AudioContext } from "../context/AudioContext"
import { SceneContext } from "../context/SceneContext"
import { getAsArray } from "../library/utils"

import styles from "./Editor.module.css"
import Selector from "./Selector"
import { AnimationManager } from "../library/animationManager"
import { TokenBox } from "./token-box/TokenBox"


export default function Editor({manifest, templateInfo, animationManager, blinkManager, effectManager, fetchNewModel}) {
  const {currentTraitName, setCurrentTraitName, setCurrentOptions, setSelectedOptions, setRemoveOption, controls, loadUserSelection} = useContext(SceneContext);

  /*const fetchNewModel = (index) =>{
    async function fetchAnimation(templateInfo){
        // create an animation manager for all the traits that will be loaded
        const newAnimationManager = new AnimationManager(templateInfo.offset)
        await newAnimationManager.loadAnimations(templateInfo.animationPath)
        return newAnimationManager
    }
    return new Promise( (resolve) =>  {
      asyncResolve()
      async function asyncResolve() {
        setTemplateInfo(manifest[index])
        const animManager = await fetchAnimation(manifest[index])
        setAnimationManager(animManager)
        setTimeout(()=>{
          resolve (manifest[index])
        }, 2000)
      }
    })
  }*/
  
  const { isMute } = useContext(AudioContext)

  const [cameraFocused, setCameraFocused] = React.useState(false)

  const [play] = useSound(optionClick, { volume: 1.0 })
  // options are selected by random or start
  //useEffect(() => {

      // setSelectedOptions(
      //   loadUserSelection(templateInfo.name) ||
      //   getMultipleRandomTraits(getInitialTraits()))
      
  //}, [templateInfo])

  const getInitialTraits=(template)=>{
    if (template == null)
      template = templateInfo
    return[
      ...new Set([
        ...getAsArray(template.requiredTraits),
        ...getAsArray(template.randomTraits),
      ]),
    ]
  }

  const selectOption = (option) => {
    !isMute && play()
    if (option.name === currentTraitName) {
      if (cameraFocused) {
        moveCamera(option.cameraTarget)
        setCameraFocused(false)
      } else {
        moveCamera({ height: 0.8, distance: 3.2 })
        setCameraFocused(true)
      }
      setCurrentTraitName(null)
      return
    }

    setRemoveOption(
      getAsArray(templateInfo.requiredTraits).indexOf(option.name) === -1,
    )
    moveCamera(option.cameraTarget)
    setCurrentOptions(getTraitOptions(option))
    setCurrentTraitName(option.name)
  }
  const selectClassOption = () => {
    setRemoveOption(false)
    setCurrentOptions(getClassOptions())
    setCurrentTraitName("_class")
  }
  const randomizeCurrentCharacter = () => {

    setSelectedOptions(
      getMultipleRandomTraits(getInitialTraits())
    )
  }

  const resetCurrentCharacter = () =>{
    setSelectedOptions(
      loadUserSelection(templateInfo.name)
    )
  }

  const getMultipleRandomTraits = (traitNames, customTemplateInfo = null) => {
    const resultTraitOptions = []

    const template = customTemplateInfo || templateInfo
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
  const selectClass = (ind) => {
    console.log("class sel")
    fetchNewModel(ind).then((template) => {
      // remove randomness here
      // setSelectedOptions (getMultipleRandomTraits(getInitialTraits(template),template))
    })
  }
  const getClassOptions = () => {
    const options = []
    manifest.map((character, index) => {
      options.push(getClassOption("class_" + index, character.thumbnail, index))
    })
    return options
  }
  const getTraitOptions = (trait, customTemplateInfo = null) => {
    const template = customTemplateInfo || templateInfo
    const traitOptions = []
    const thumbnailBaseDir = template.thumbnailsDirectory
    trait.collection.map((item, index) => {
      const textureTraits = template.textureCollections.find(
        (texture) => texture.trait === item.textureCollection,
      )
      const colorTraits = template.colorCollections.find(
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
          // icons in color should be colored to avoid creating an icon per model
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

  // gets where to get the thumbnail
  const getThumbnail = (item, subtrait, index) => {
    // thumbnail override is the most important, check if its defined
    if (item.thumbnailOverrides)
      if (item.thumbnailOverrides[index]) return item.thumbnailOverrides[index]

    // if not, check if its defined in the subtrait (texture collection or color collection) or just grab the base thumbnail from the item
    return subtrait.thumbnail || item.thumbnail
  }

  const getHSL = (hex) => {
    const color = new THREE.Color(hex)
    const hsl = { h: 0, s: 0, l: 0 }
    color.getHSL(hsl)
    return hsl
  }

  const getOption = (
    key,
    trait,
    item,
    icon,
    iconHSL = null,
    textureTrait = null,
    colorTrait = null,
  ) => {
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
  const getClassOption = (key, icon, avatarIndex) => {
    return {
      key,
      icon,
      avatarIndex,
    }
  }

  const moveCamera = (value) => {
    if (!controls) return
    gsap.to(controls.target, {
      y: value.height,
      x: 0,
      z: 0,
      duration: 1,
    })

    gsap
      .fromTo(
        controls,
        {
          maxDistance: controls.getDistance(),
          minDistance: controls.getDistance(),
          minPolarAngle: controls.getPolarAngle(),
          maxPolarAngle: controls.getPolarAngle(),
          minAzimuthAngle: controls.getAzimuthalAngle(),
          maxAzimuthAngle: controls.getAzimuthalAngle(),
        },
        {
          maxDistance: value.distance,
          minDistance: value.distance,
          minPolarAngle: Math.PI / 2 - 0.11,
          maxPolarAngle: Math.PI / 2 - 0.11,
          minAzimuthAngle: -0.78,
          maxAzimuthAngle: -0.78,
          duration: 1,
        },
      )
      .then(() => {
        controls.minPolarAngle = 0
        controls.maxPolarAngle = 3.1415
        controls.minDistance = 0.5
        controls.maxDistance = 5
        controls.minAzimuthAngle = Infinity
        controls.maxAzimuthAngle = Infinity
      })
  }

  function MenuTitle(props) {
    return (
      props.title && (
        <div className={styles["mainTitleWrap"]}>
          <div className={styles["topLine"]} />
          <div className={styles["mainTitle"]}>{props.title}</div>
        </div>
      )
    )
  }
  return (
    <Fragment>
      <div className={styles["SideMenu"]}>
        <MenuTitle title={"Appearance"} />
        <div className={styles["bottomLine"]} />
        <div className={styles["scrollContainer"]}>
          <div className={styles["selector-container"]}>
            <div key={"class-selection"} className={styles["selectorButton"]}>
              <TokenBox
                size={56}
                resolution={2048}
                numFrames={128}
                icon={shuffle}
                rarity={currentTraitName !== "_class" ? "none" : "mythic"}
                onClick={() => {
                  !isMute && play()
                  selectClassOption()
                }}
              />
            </div>
            {templateInfo.traits &&
              templateInfo.traits.map((item, index) => (
                <div key={index} className={styles["selectorButton"]}>
                  <TokenBox
                    size={56}
                    resolution={2048}
                    numFrames={128}
                    icon={templateInfo.traitIconsDirectorySvg + item.iconSvg}
                    rarity={currentTraitName !== item.name ? "none" : "mythic"}
                    onClick={() => {
                      selectOption(item)
                    }}
                  />
                </div>
              ))}
          </div>
        </div>
      </div>
      <Selector animationManager={animationManager} templateInfo={templateInfo} blinkManager = {blinkManager} effectManager = {effectManager} selectClass = {selectClass}/>
    </Fragment>
  )
}
