import * as THREE from "three"
window.THREE = THREE

export const arScenePipelineModule = (scene) => {
  const raycaster = new THREE.Raycaster()
  const tapPosition = new THREE.Vector2()

  let surface  // Transparent surface for raycasting for object placement.

  // Populates some object into an XR scene and sets the initial camera position. The scene and
  // camera come from xr3js, and are only available in the camera loop lifecycle onStart() or later.
  const initXrScene = ({ scene, camera }) => {
    surface = new THREE.Mesh(
      new THREE.PlaneGeometry( 100, 100, 1, 1 ),
      new THREE.MeshBasicMaterial({
        color: 0xffff00,
        transparent: true,
        opacity: 0.0,
        side: THREE.DoubleSide
      })
    )

    surface.rotateX(-Math.PI / 2)
    surface.position.set(0, 0, 0)
    scene.add(surface)

    // Set the initial camera position relative to the scene we just laid out. This must be at a
    // height greater than y=0.
    camera.position.set(0, 1, -1)
  }

  const placeObjectTouchHandler = (e) => {
    const XR8 = window.XR8
    // Call XrController.recenter() when the canvas is tapped with two fingers. This resets the
    // AR camera to the position specified by XrController.updateCameraProjectionMatrix() above.
    if (e.touches.length == 2) {
      XR8.XrController.recenter()
    }

    if (e.touches.length > 2) {
      return
    }

    // If the canvas is tapped with one finger and hits the "surface", spawn an object.
    const {camera} = XR8.Threejs.xrScene()

    // calculate tap position in normalized device coordinates (-1 to +1) for both components.
    tapPosition.x = (e.touches[0].clientX / window.innerWidth) * 2 - 1
    tapPosition.y = - (e.touches[0].clientY / window.innerHeight) * 2 + 1

    // Update the picking ray with the camera and tap position.
    raycaster.setFromCamera(tapPosition, camera)

    // Raycast against the "surface" object.
    const intersects = raycaster.intersectObject(surface)

    if (intersects.length == 1 && intersects[0].object == surface) {
      console.log('placing object', intersects[0].point.x, intersects[0].point.z)
      scene.position.set(intersects[0].point.x, 0, intersects[0].point.z);
    } else {
      console.log('no intersection')
    }
  }

  return {
    // Pipeline modules need a name. It can be whatever you want but must be unique within your app.
    name: 'ar',

    // onStart is called once when the camera feed begins. In this case, we need to wait for the
    // XR8.Threejs scene to be ready before we can access it to add content. It was created in
    // XR8.Threejs.pipelineModule()'s onStart method.
    onStart: ({canvas}) => {
      const XR8 = window.XR8
      const {scene: stage, camera} = XR8.Threejs.xrScene()  // Get the 3js sceen from xr3js.
      stage.add(scene);
      initXrScene({ scene: stage, camera }) // Add objects to the scene and set starting camera position.

      canvas.addEventListener('touchstart', placeObjectTouchHandler, true)  // Add touch listener.

      // Sync the xr controller's 6DoF position and camera paremeters with our scene.
      XR8.XrController.updateCameraProjectionMatrix({
        origin: camera.position,
        facing: camera.quaternion,
      })
    },
  }
}

export const startAR = async (scene) => {
  // fetch XR8 libraries lazily
  if(!window.XR8) {
    console.warn("8thwall not found")
    return;
  }

  window.XR8?.XrController.configure({scale: 'absolute'})

  window.XR8?.addCameraPipelineModules([  // Add camera pipeline modules.
    // Existing pipeline modules.
    window.XR8.GlTextureRenderer.pipelineModule(),      // Draws the camera feed.
    customThreejsPipelineModule(),                // Creates a ThreeJS AR Scene.
    window.XR8.XrController.pipelineModule(),           // Enables SLAM tracking.
    window.XRExtras.FullWindowCanvas.pipelineModule(),  // Modifies the canvas to fill the window.
    // Custom pipeline modules.
    arScenePipelineModule(scene),
  ])
  
  // Open the camera and start running the camera run loop.
  window.XR8?.run({canvas: document.getElementById('editor-scene'), allowedDevices: 'any'})
  if(!window.XR8) {
    console.log('xr8 not loaded')
  }
}

const customThreejsPipelineModule = () => {
  let scene3
  let engaged = false

  const engage = ({canvas, canvasWidth, canvasHeight, GLctx}) => {
    if (engaged) {
      return
    }
    const scene = new window.THREE.Scene()
    const camera = new window.THREE.PerspectiveCamera(
      60.0, /* initial field of view; will get set based on device info later. */
      canvasWidth / canvasHeight,
      0.01,
      1000.0,
    )
    scene.add(camera)

    const renderer = new window.THREE.WebGLRenderer({
      canvas,
      context: GLctx,
      alpha: false,
      antialias: true,
    })
    renderer.autoClear = false
    renderer.setSize(canvasWidth, canvasHeight)
    renderer.outputEncoding = window.THREE.sRGBEncoding

    scene3 = {scene, camera, renderer}
    engaged = true
  }
  window.XR8.Threejs = {
    name: 'customthreejs',
    onStart: (args) => engage(args),
    onAttach: (args) => engage(args),
    onDetach: () => { engaged = false },
    onUpdate: ({processCpuResult}) => {
      const realitySource = processCpuResult.reality || processCpuResult.facecontroller ||
        processCpuResult.layerscontroller
      if (!realitySource) {
        return
      }

      const {rotation, position, intrinsics} = realitySource
      const {camera} = scene3

      if(intrinsics) {
        for (let i = 0; i < 16; i++) {
          camera.projectionMatrix.elements[i] = intrinsics[i]
        }
      }

      // Fix for broken raycasting in r103 and higher. Related to:
      //   https://github.com/mrdoob/three.js/pull/15996
      // Note: camera.projectionMatrixInverse wasn't introduced until r96 so check before setting
      // the inverse
      if (camera.projectionMatrixInverse) {
        if (camera.projectionMatrixInverse.invert) {
          // THREE 123 preferred version
          camera.projectionMatrixInverse.copy(camera.projectionMatrix).invert()
        } else {
          // Backwards compatible version
          camera.projectionMatrixInverse.getInverse(camera.projectionMatrix)
        }
      }

      if (rotation) {
        camera.setRotationFromQuaternion(rotation)
      }
      if (position) {
        camera.position.set(position.x, position.y, position.z)
      }
    },
    onCanvasSizeChange: ({canvasWidth, canvasHeight}) => {
      if (!engaged) {
        return
      }
      const {renderer} = scene3
      renderer.setSize(canvasWidth, canvasHeight)
    },
    onRender: () => {
      const {scene, renderer, camera} = scene3
      renderer.clearDepth()
      renderer.render(scene, camera)
    },
    // Get a handle to the xr scene, camera and renderer. Returns:
    // {
    //   scene: The Threejs scene.
    //   camera: The Threejs main camera.
    //   renderer: The Threejs renderer.
    // }
    xrScene: () => {
      return scene3
    },
  }

  return window.XR8.Threejs
}