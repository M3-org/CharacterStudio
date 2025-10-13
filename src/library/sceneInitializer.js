import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import TransformControlHelper from "./transformControlHelper";
import { CharacterManager } from "./characterManager";

import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader';

export function sceneInitializer(canvasId) {
    const scene = new THREE.Scene()

    
    new RGBELoader().load("./hdr/studio_small_09_2k.hdr", (hdr_) => {
        hdr_.mapping = THREE.EquirectangularReflectionMapping;
        hdr_.colorSpace = THREE.LinearSRGBColorSpace
        scene.environment = hdr_;
    })
    scene.environmentIntensity = 0.5

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);

    // rotate the directional light to be a key light
    directionalLight.position.set(0, 1, 1);
    scene.add(directionalLight);

    const sceneElements = new THREE.Object3D();
    scene.add(sceneElements);

    const camera = new THREE.PerspectiveCamera(
        30,
        window.innerWidth / window.innerHeight,
        0.1,
        1000
    );
    camera.position.set(0, 1.3, 2);


    const characterManager = new CharacterManager({parentModel: scene, createAnimationManager : true, renderCamera:camera})
    characterManager.addLookAtMouse(80,canvasId, camera, true);

   
    //"editor-scene"
    const canvasRef = document.getElementById(canvasId);
    const renderer = new THREE.WebGLRenderer({
        canvas: canvasRef,
        antialias: true,
        alpha: true,
        preserveDrawingBuffer: true,
    });

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.minDistance = 1;
    controls.maxDistance = 4;
    const transformControls = new TransformControlHelper(camera,controls, renderer.domElement);
    characterManager.addBonePicker(canvasId);
    characterManager.bonePicker.setTransformControls(transformControls);
    console.log("transformControls", transformControls)
    // Add gizmo to scene to render handles
    scene.add(transformControls.transform);


    controls.maxPolarAngle = Math.PI / 2;
    controls.enablePan = true;
    controls.target = new THREE.Vector3(0, 1, 0);
    controls.enableDamping = true;
    controls.dampingFactor = 0.1;

    const minPan = new THREE.Vector3(-0.5, 0, -0.5);
    const maxPan = new THREE.Vector3(0.5, 1.7, 0.5);

    const handleResize = () => {
        renderer.setSize(window.innerWidth, window.innerHeight);
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
    };

    window.addEventListener("resize", handleResize);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.outputColorSpace = THREE.SRGBColorSpace;

    const clock = new THREE.Clock();
    const ensureGizmoTarget = () => {
        if (characterManager.getLastAttachedObject){
            const target = characterManager.getLastAttachedObject();
            if (target && transformControls.object !== target) {
                transformControls.attachToTransformControls(target);
            }
        }
    }
    const animate = () => {
        requestAnimationFrame(animate);
        const delta = clock.getDelta();
        controls.target.clamp(minPan, maxPan);
        controls?.update();
        ensureGizmoTarget();
        characterManager.update(delta);
        renderer.render(scene, camera);
    };


    animate();


    async function fetchScene() {
        // // load environment
        // const modelPath = "./3d/Platform.glb"
      
        // const loader = new GLTFLoader()
        // // load the modelPath
        // const gltf = await loader.loadAsync(modelPath)
        // sceneElements.add(gltf.scene);
    }
    fetchScene();

    return {
        scene,
        camera,
        controls,
        characterManager,
        transformControls,
        sceneElements,
        clock
    };
}

