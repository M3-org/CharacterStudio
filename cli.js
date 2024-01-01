#!/usr/bin/env node

import fs from "fs/promises";
import {program} from "commander";
import { JSDOM } from "jsdom";
import path from "path";

import { fileURLToPath } from 'url';
import * as THREE from 'three';
import { createCanvas } from "canvas";
import glContext from "gl";

// const globalObject = typeof window !== 'undefined' ? window : typeof self !== 'undefined' ? self : global;
// globalObject.Buffer = globalObject.Buffer || require('buffer').Buffer;

async function setup() {


  const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>',{
    pretendToBeVisual: true,
  });

  global.document = dom.window.document;
  global.window = dom.window;
  global.navigator = dom.window.navigator;

  //const canvasGL = createCanvas(window.innerWidth, window.innerHeight);
  //canvasGL.addEventListener = function(event, func, bind_) {}; // mock function to avoid errors inside THREE.WebGlRenderer()
  //console.log(canvasGL);
  const renderer = new THREE.WebGLRenderer( { context: glContext(1, 1), antialias: true });
  renderer.setSize(800,600)
  
  global.window.renderer = renderer;
  
  //const renderer = new WebGLRenderer({ canvas: dom.window.document.createElement("canvas") });
  //renderer.setSize(800, 600);

  const { CharacterManager } = await import("./src/library/characterManager.js");

  //const characterManager = await new CharacterManager({manifestURL:"../public/character-assets/anata/manifest.json"});
  const scene = new THREE.Scene()
  const sceneElements = new THREE.Object3D();
  scene.add(sceneElements);

  const characterManager = await new CharacterManager({parentModel: scene, createAnimationManager : false});
  //console.log(characterManager.loadManifest());

  const __filename = fileURLToPath(import.meta.url);

  const manifestRelativePath = "./public/character-assets/anata/manifest.json";
  const testNFTRelativePath = "./134_attributes.json";
  const manifestPath = path.resolve(process.cwd(), manifestRelativePath);
  const NFTObjectPath = path.resolve(process.cwd(), testNFTRelativePath);

  // Verify if the file exists
  try {
    await fs.access(manifestPath, fs.constants.R_OK);
    console.log(`Manifest file exists at: ${manifestPath}`);
  } catch (err) {
    console.error(`Error accessing manifest file: ${err.message}`);
    process.exit(1);
  }
  console.log(NFTObjectPath);
  // Read the manifest file content using fs
  const manifestContent = await fs.readFile(manifestPath, 'utf-8');
  const nftContent = await fs.readFile(NFTObjectPath, 'utf-8');
  

  // Parse the JSON content of the manifest file
  const manifestObject = JSON.parse(manifestContent);

  const newPath = path.resolve(process.cwd(), "./public/" + manifestObject.assetsLocation)
  manifestObject.assetsLocation = newPath;

  console.log(manifestObject.assetsLocation);
  const nftObject = JSON.parse(nftContent);
 
  // characterManager.loadTrait("BODY", "Masculine")
  // characterManager.loadRandomTrait("CLOTHING")
  // characterManager.loadRandomTraits()
    
  await characterManager.setManifestObject(manifestObject);
  //console.log(characterManager.manifest)
  await characterManager.loadTraitsFromNFTObject(nftObject, true, null, true);
  console.log(characterManager.avatar)

  program
  .version('1.0.0')
  .description('Simple CLI to create a text file')
  .option('-f, --filename <filename>', 'Specify the filename')
  .option('-c, --content <content>', 'Specify the content for the file');

  program.parse(process.argv);

  const opts = program.opts()




  //console.log(program);

  console.log('Filename:', opts.filename);
  console.log('Content:', opts.content);

  

  if (!opts.filename || !opts.content) {
    console.error('Both filename and content are required.');
    process.exit(1);
  }

  const { filename, content } = opts;

  fs.writeFile(filename, content, (err) => {
    if (err) {
      console.error(`Error creating file: ${err.message}`);
      process.exit(1);
    }
    console.log(`File '${filename}' created successfully.`);
  });
}

setup().catch(error => {
  console.error('Error during setup:', error);
  process.exit(1); // Terminate the process if there's an error
});

