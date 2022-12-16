export default [
  {
    "id": "0",
    "name": "Drophunter",
    "file": "./3d/models/drophunter.vrm",
    "thumbnail": "./3d/icons/female-body-1.png",
    "format": "vrm",
    "offset":[0,-0.18,0],
    "bodyTargets": [
      "Body",
      "Headbaked"
    ],
    "cullingModel":[
      "body_geo"
    ],
    "EyeTargets": [
        "Headbaked_2",
        "Headbaked_1",
    ],
    "traitsDirectory": "https://webaverse-studios.github.io/character-assets/drophunter/",
    "thumbnailsDirectory": "https://webaverse-studios.github.io/character-assets/drophunter/",
    "traitsJsonPath": "https://webaverse-studios.github.io/character-assets/drophunter/loot.json",
    "animationPath": "./3d/animations/idle_drophunter.fbx",
    "traitIconsDirectory": "./3d/icons/",
    "typeRestrictions":{
        "pants" : ["boots"]
    },
    "selectionTraits": [
      {
        "name": "skin",
        "icon": "skin-color.png",
        "type": "texture",
        "target": ["body_geo", "head_geobaked(copy)_1"],
        "icon-gradient": "color-gradient.svg",
        "cameraTarget":{
          "distance": 3.4,
          "height": 0.8
        }
      },
    {
      "name": "eyes",
      "icon": "eye.png",
      "type": "texture",
      "target": "head_geobaked(copy)",
      "icon-gradient": "eye.svg",
      "cameraTarget":{
        "distance": 0.75,
        "height": 1.35
      }
    },
    {
      "name": "head",
      "icon": "hairStyle.png",
      "type": "mesh",
      "icon-gradient": "hairStyle.svg",
      "cameraTarget":{
        "distance": 0.75,
        "height": 1.35
      }
    },
    {
      "name": "outer",
      "restrictedTypes": ["hoodie", "solo"],
      "icon": "jacket.png",
      "icon-gradient": "jacket.svg",
      "type": "mesh",
      "cameraTarget":{
        "distance": 1.5,
        "height": 1
      }
    },
    {
      "name": "chest",
      "icon": "torso.png",
      "icon-gradient": "chest-gradient.svg",
      "type": "mesh",
      "cameraTarget":{
        "distance": 1.5,
        "height": 1
      }
    },
    {
      "name": "accessories",
      "icon": "accessories.png",
      "type": "mesh",
      "id":3,
      "icon-gradient": "accessories-gradient.svg",
      "cameraTarget":{
        "distance": 3.4,
        "height": 0.8
      }
    },
    {
      "name": "legs",
      "icon": "legs.png",
      "type": "mesh",
      "icon-gradient": "chest-gradient.svg",
      "id":4,
      "cameraTarget":{
        "distance": 2,
        "height": 0.5
      }
    },
    {
      "name": "feet",
      "icon": "shoes.png",
      "type": "mesh",
      "icon-gradient": "foot-gradient.svg",
      "id":5,
      "cameraTarget":{
          "distance": 1.3,
          "height": 0.2
      }
    }
  ]
  },
  {
    "id": "1",
    "name": "Neurohacker",
    "file": "./3d/models/neurohacker.vrm",
    "thumbnail": "./3d/icons/male-body-1.png",
    "format": "vrm",
    "offset":[0,-0.14,0],
    "bodyTargets": [
      "Body",
      "Head002"
    ],
    "cullingModel":[
      "Body"
    ],
    "EyeTargets": [
      "Head006"
    ],
    "traitsDirectory": "https://webaverse-studios.github.io/character-assets/neurohacker/",
    "thumbnailsDirectory": "https://webaverse-studios.github.io/character-assets/neurohacker/",
    "traitsJsonPath": "https://webaverse-studios.github.io/character-assets/neurohacker/loot.json",
    "animationPath": "./3d/animations/idle_neurohacker.fbx",
    "traitIconsDirectory": "./3d/icons/",
    "selectionTraits": [
    {
      "name": "skin",
      "icon": "skin-color.png",
      "type": "texture",
      "target": ["Body", "Headbaked(copy)"],
      "icon-gradient": "color-gradient.svg",
      "cameraTarget":{
        "distance": 3.4,
        "height": 0.8
      }
    },
    {
      "name": "eyes",
      "icon": "eye.png",
      "type": "texture",
      "target": "Headbaked(copy)_1",
      "icon-gradient": "eye.svg",
      "cameraTarget":{
        "distance": 1.2,
        "height": 1.35
      }
    },{
      "name": "head",
      "icon": "hairStyle.png",
      "type": "mesh",
      "icon-gradient": "head-gradient.svg",
      "cameraTarget":{
        "distance": 1.2,
        "height": 1.35
      }
    },
    {
      "name": "outer",
      "restrictedTypes": ["hoodie", "solo"],
      "icon": "jacket.png",
      "icon-gradient": "jacket.svg",
      "type": "mesh",
      "cameraTarget":{
        "distance": 1.5,
        "height": 1
      }
    },{
      "name": "chest",
      "icon": "torso.png",
      "icon-gradient": "chest-gradient.svg",
      "type": "mesh",
      "cameraTarget":{
        "distance": 1.5,
        "height": 1
      }
    },{
      "name": "accessories",
      "icon": "accessories.png",
      "type": "mesh",
      "id":3,
      "icon-gradient": "accessories-gradient.svg",
      "cameraTarget":{
        "distance": 3.4,
        "height": 0.8
      }
    },{
      "name": "legs",
      "icon": "legs.png",
      "type": "mesh",
      "icon-gradient": "chest-gradient.svg",
      "id":4,
      "cameraTarget":{
        "distance": 2,
        "height": 0.5
      }
    },{
      "name": "feet",
      "icon": "shoes.png",
      "type": "mesh",
      "icon-gradient": "foot-gradient.svg",
      "id":5,
      "cameraTarget":{
        "distance": 1.3,
        "height": 0.2
      },
    }]
  }  
]