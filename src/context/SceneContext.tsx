import  { createContext, useEffect, useState } from "react"
import { Camera, Object3D, Scene } from "three"
import gsap from "gsap"
import { sceneInitializer } from "../library/sceneInitializer"
import { LoraDataGenerator } from "../library/loraDataGenerator"
import { SpriteAtlasGenerator } from "../library/spriteAtlasGenerator"
import { ThumbnailGenerator } from "../library/thumbnailsGenerator"
import { GlobalManifestJson, manifestJson } from "@/library/CharacterManifestData"
import { CharacterManager } from "@/library/characterManager"
import OverlayedTextureManager from "@/library/OverlayTextureManager"
import { AnimationManager } from "@/library/animationManager"
import { LookAtManager } from "@/library/lookatManager"
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls"

export type SceneContextType = {
  manifest: GlobalManifestJson,
  setManifest: (manifest:GlobalManifestJson) => void,
  scene: Scene,
  decalManager: OverlayedTextureManager,
  characterManager: CharacterManager,
  thumbnailsGenerator: ThumbnailGenerator,
  loraDataGenerator: LoraDataGenerator,
  spriteAtlasGenerator: SpriteAtlasGenerator,
  showEnvironmentModels: (display:boolean) => void,
  debugMode: boolean,
  toggleDebugMode: (isDebug?:boolean) => void,
  animationManager: AnimationManager,
  lookAtManager: LookAtManager,
  camera: Camera,
  moveCamera: (value:{
    // left half center
    targetX?: number,
    targetY?: number,
    targetZ?: number,
    distance?: number,
  }) => void,
  controls: OrbitControls,
  sceneElements: Object3D,
}

export const SceneContext = createContext({
  manifest: null!,
  setManifest: (manifest:GlobalManifestJson) => {},
  scene: null!,
  characterManager: null!,
  decalManager: null!,
  spriteAtlasGenerator: null!,
  loraDataGenerator: null!,
  thumbnailsGenerator: null!,
  showEnvironmentModels: (display:boolean) => {},
  debugMode: false,
  toggleDebugMode: (isDebug?:boolean) => {},
  animationManager: null!,
  lookAtManager: null!,
  camera: null!,
  moveCamera: (value:{
    // left half center
    targetX?: number,
    targetY?: number,
    targetZ?: number,
    distance?: number,
  }) => {},
  controls: null!,
  sceneElements: null!,
} as SceneContextType)

export const SceneProvider = ({children}:{children?:React.ReactNode}) => {
  const [characterManager, setCharacterManager] = useState<CharacterManager>(null!)
  const [spriteAtlasGenerator, setSpriteAtlasGenerator] = useState<SpriteAtlasGenerator>(null!)
  const [thumbnailsGenerator, setThumbnailsGenerator] = useState<ThumbnailGenerator>(null!)
  const [decalManager, setDecalManager] = useState<OverlayedTextureManager>(null!)
  const [loraDataGenerator, setLoraDataGenerator] = useState<LoraDataGenerator>(null!)
  const [sceneElements, setSceneElements] = useState<Object3D>(null!)
  const [animationManager, setAnimationManager] = useState<AnimationManager>(null!)
  const [lookAtManager, setLookAtManager] = useState<LookAtManager>(null!)
  const [scene, setScene] = useState<Scene>(null!)
  const [camera, setCamera] = useState<Camera>(null!)
  const [controls, setControls] = useState<OrbitControls>(null!)

  const [manifest, setManifest] = useState<GlobalManifestJson>(null!)
  const [debugMode, setDebugMode] = useState(false);

  let loaded = false
  let [isLoaded, setIsLoaded] = useState(false)
  useEffect(()=>{
    // hacky prevention of double render
    if (loaded || isLoaded) return
    setIsLoaded(true)
    loaded = true;

    const {
      scene,
      camera,
      controls,
      characterManager,
      sceneElements
    } = sceneInitializer("editor-scene");
    setCamera(camera);
    setScene(scene);
    setCharacterManager(characterManager);
    setSceneElements(sceneElements);
    setAnimationManager(characterManager.animationManager)
    setLookAtManager(characterManager.lookAtManager)
    setDecalManager(characterManager.overlayedTextureManager)
    setControls(controls);
    setLoraDataGenerator(new LoraDataGenerator(characterManager))
    setSpriteAtlasGenerator(new SpriteAtlasGenerator(characterManager))
    setThumbnailsGenerator(new ThumbnailGenerator(characterManager))
  },[])


  const toggleDebugMode = (isDebug?: boolean) => {
    if (isDebug == null)
      isDebug = !debugMode;

    setDebugMode(isDebug);
    scene.traverse((child) => {
      if ('isMesh' in child && child.isMesh) {
        if ((child as any).setDebugMode){
          (child as any).setDebugMode(isDebug);
        }
      }
    });
  }
  useEffect(() => {
    if (manifest != null){
      if (manifest.defaultAnimations){
        const locationArray = manifest.defaultAnimations.map(animation => animation.location);
        animationManager.storeDefaultAnimationPaths(locationArray, "");
      }
    }
  }, [manifest])

  const showEnvironmentModels = (display?: boolean) => {

    if (display){
        scene.add(sceneElements);
    }
    else{
        scene.remove(sceneElements);
    }

  }

  const moveCamera = (value:{
    // left half center
    targetX?: number,
    targetY?: number,
    targetZ?: number,
    distance?: number,
  }) => {
    if (!controls) return
    gsap.to(controls.target, {
      x: value.targetX ?? 0,
      y: value.targetY ?? 0,
      z: value.targetZ ?? 0,
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
        controls.maxDistance = 10
        controls.minAzimuthAngle = Infinity
        controls.maxAzimuthAngle = Infinity
      })
  }

  return (
    <SceneContext.Provider
      value={{
        manifest,
        setManifest,
        scene,
        decalManager,
        characterManager,
        loraDataGenerator,
        spriteAtlasGenerator,
        thumbnailsGenerator,
        showEnvironmentModels,
        debugMode,
        toggleDebugMode,
        animationManager,
        lookAtManager,
        camera,
        moveCamera,
        controls,
        sceneElements,
      }}
    >
      {children}
    </SceneContext.Provider>
  )
}
