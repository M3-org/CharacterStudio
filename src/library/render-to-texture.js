// Render to texture
import { rgbToHex } from "@mui/material";
import { createImageData } from "canvas";
import * as THREE from "three";

let container;

let cameraRTT, sceneRTT; //rtTexture;
let material, quad, renderer;

let rtTexture;

function initialize(width = 1024, height = 1024){
    container = document.createElement("div");

    sceneRTT  = new THREE.Scene();

    cameraRTT  = new THREE.OrthographicCamera(-width/2,width/2, height/2,-height/2, -10000,10000);
    cameraRTT.position.z  = 100;

    sceneRTT.add(cameraRTT);

    // no light, make shader lit

    rtTexture = new THREE.WebGLRenderTarget( width, height );

    material = new THREE.MeshBasicMaterial({
        side:THREE.DoubleSide,
        transparent:true,
        opacity: 1,
        color:new THREE.Color(1,1,1),
    });

    const plane = new THREE.PlaneGeometry(width, height);
    quad = new THREE.Mesh(plane, material);
    sceneRTT.add(quad);

    renderer = new THREE.WebGLRenderer();
    renderer.setPixelRatio( 1 );
    renderer.setSize( width, height );
    renderer.setClearColor( new THREE.Color(1,1,1), 1 );
    renderer.autoClear = false;

    container.appendChild(renderer.domElement);
}

function SetContainerSize(width,height){
    if (container == null)
        initialize(width, height);
    else{
        cameraRTT.left = -width/2;
        cameraRTT.right = width/2;
        cameraRTT.top = height/2;
        cameraRTT.bottom = - height/2;

        const plane = new THREE.PlaneGeometry(width, height);
        quad = new THREE.Mesh(plane, material);

        rtTexture.width = width;
        rtTexture.height = height;

        renderer.setSize( width, height );
    }
}

export function RenderTexture (texture, multiplyColor, clearColor, width, height){

    SetContainerSize(width,height);
    
    material.map = texture;
    material.color = multiplyColor.clone();
    renderer.setClearColor( clearColor.clone(), 1 );

    renderer.setRenderTarget( rtTexture );
    renderer.clear();
    renderer.render( sceneRTT, cameraRTT );
    
    return rtTexture;
}

export function RenderTextureImageData(texture, multiplyColor, clearColor, width, height){
    const rt = RenderTexture(texture, multiplyColor, clearColor, width, height);

    let buffer = new Uint8ClampedArray( rt.width * rt.height * 4 )
    renderer.readRenderTargetPixels(rt,0,0,width,height,buffer );
    const imgData = new ImageData(buffer,width, height)

    return imgData;
}

function Clear(){
    //clear container
}
