import { TransformControls } from "three/examples/jsm/controls/TransformControls";


export default class TransformControlHelper {
    /**
     * @type {TransformControls} transformControls
     */
    transformControls
    /**
     * OrbitControls instance to disable when dragging
     */
    controls

    /**
     * @type {THREE.Camera} camera
     */
    camera
    /**
     * @type {HTMLElement} domElement
     */
    domElement
    
    /**
     * 
     * @param {OrbitControls} controls 
     * @param {THREE.Camera} camera 
     * @param {HTMLCanvasElement} domElement 
     */
    constructor(controls, camera, domElement) {
        this.controls = controls;
        this.camera = camera;
        this.domElement = domElement;

        this.transformControls = new TransformControls(camera, domElement);
        this.transformControls.enabled = true;
        this.transformControls.setSpace('local');
        this.transformControls.setSize(2.0);
        this.transformControls.setMode('translate');
        this.transformControls.addEventListener('dragging-changed', function (event) {
            controls.enabled = !event.value;
        });
    }

    get transform (){
        return this.transformControls;
    }

    get object(){
        return this.transformControls.object;
    }

    attachToTransformControls = (object3d) => {
        this.transformControls.detach();
        if (object3d && object3d.isObject3D) {
            this.transformControls.attach(object3d);
            this.transformControls.visible = true;
        }
    }
    
    detachTransformControls = () => {
        if (this.transformControls.object){
            const axes = this.transformControls.object.getObjectByName('__gizmoAxes');
            if (axes && axes.parent) axes.parent.remove(axes);
        }
        this.transformControls.detach();
        this.transformControls.visible = false;
    };



    
}