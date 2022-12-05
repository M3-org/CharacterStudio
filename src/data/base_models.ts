export default [
  {
    "id": "1",
    "name": "Female",
    "file": "./3d/models/drophunter_female.vrm",
    "thumbnail": "./3d/icons/female-body-1.png",
    "format": "vrm",
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
    "traitsDirectory": "https://memelotsqui.github.io/loot-assets/drophunter_female/",
    "thumbnailsDirectory": "https://memelotsqui.github.io/loot-assets/drophunter_female/",
    "traitsJsonPath": "https://memelotsqui.github.io/loot-assets/drophunter_female/loot.json",
    "animationPath": "./3d/animations/idle_female.fbx",
    "traitIconsDirectory": "./3d/icons/",
    "selectionTraits": [{
      "name": "color",
      "id":1,
      "icon": "skin-color.png",
      "type": "color",
      "icon-gradient": "color-gradient.svg",
      "buttonName": "Skin Color",
      "cameraTarget":{
        "distance": 2,
        "height": 1
      },
      "subTrait":[
      {
        "name": "Eye Color",
        "type": "color",
        "cameraTarget":{
          "distance": 0.7,
          "height": 1.55
        },
        "bodyTargets": [
          "Headbaked_2"
        ]
      }]
    },
    {
      "name": "eyeColor",
      "icon": "skin-color.png",
      "type": "texture",
      "target": "head_geobaked(copy)",
      "icon-gradient": "color-gradient.svg",
      "id":6,
      "cameraTarget":{
        "distance": 0.7,
        "height": 1.55
      }
    },
    {
      "name": "head",
      "icon": "hairStyle.png",
      "type": "mesh",
      "id":2,
      "icon-gradient": "head-gradient.svg",
      "cameraTarget":{
        "distance": 0.7,
        "height": 1.55
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
        "distance": 2,
        "height": 0.9
      }
    },
    {
      "name": "legs",
      "icon": "legs.png",
      "type": "mesh",
      "icon-gradient": "chest-gradient.svg",
      "id":4,
      "cameraTarget":{
        "distance": 1.3,
        "height": 0.75
      }
    },
    {
      "name": "foot",
      "icon": "shoes.png",
      "type": "mesh",
      "icon-gradient": "foot-gradient.svg",
      "id":5,
      "cameraTarget":{
        "distance": 1,
        "height": 0.22
      }
    }
  ]
  }
  ,
  {
    "id": "2",
    "name": "Male",
    "file": "./3d/models/m_drophunter_v1.vrm",
    "thumbnail": "./3d/icons/male-body-1.png",
    "format": "vrm",
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
    "traitsDirectory": "https://memelotsqui.github.io/loot-assets/drophunter/male/",
    "thumbnailsDirectory": "https://memelotsqui.github.io/loot-assets/drophunter/male/",
    "traitsJsonPath": "https://memelotsqui.github.io/loot-assets/drophunter/male/loot.json",
    "animationPath": "./3d/animations/idle_male.fbx",
    "traitIconsDirectory": "./3d/icons/",
    "selectionTraits": [{
      "name": "color",
      "id":1,
      "icon": "skin-color.png",
      "type": "color",
      "icon-gradient": "color-gradient.svg",
      "buttonName": "Skin Color",
      "cameraTarget":{
        "distance": 1.5,
        "height": 0.85
      },
      "subTrait":[
      {
        "name": "Eye Color",
        "type": "color",
        "cameraTarget":{
          "distance": 0.5,
          "height": 1.5
        },
      }]
    },{
      "name": "head",
      "icon": "hairStyle.png",
      "type": "mesh",
      "id":2,
      "icon-gradient": "head-gradient.svg",
      "cameraTarget":{
        "distance": 0.5,
        "height": 1.5
      }
    },{
      "name": "chest",
      "icon": "torso.png",
      "icon-gradient": "chest-gradient.svg",
      "type": "mesh",
      "cameraTarget":{
        "distance": 1.3,
        "height": 0.9
      }
    },{
      "name": "accessories",
      "icon": "accessories.png",
      "type": "mesh",
      "id":3,
      "icon-gradient": "accessories-gradient.svg",
      "cameraTarget":{
        "distance": 1.5,
        "height": 0.85
      }
    },{
      "name": "legs",
      "icon": "legs.png",
      "type": "mesh",
      "icon-gradient": "chest-gradient.svg",
      "id":4,
      "cameraTarget":{
        "distance": 1.1,
        "height": 0.55
      }
    },{
      "name": "foot",
      "icon": "shoes.png",
      "type": "mesh",
      "icon-gradient": "foot-gradient.svg",
      "id":5,
      "cameraTarget":{
        "distance": 0.8,
        "height": 0.32
      },
      "eye": {
        "distance": 0.3,
        "height": 1.5
      }
    }]
  } 
  ,
  {
    "id": "3",
    "name": "Female",
    "file": "./3d/models/f_neurohacker_v1.vrm",
    "thumbnail": "./3d/icons/female-body-1.png",
    "format": "vgitrm",
    "bodyTargets": [
        "Body_Female",
        "Head_femalebaked"
    ],
    "EyeTargets": [
        "Head_femalebaked_3"
    ],
    "traitsDirectory": "https://memelotsqui.github.io/loot-assets/neurohacker/female/",
    "thumbnailsDirectory": "https://memelotsqui.github.io/loot-assets/neurohacker/female/",
    "traitsJsonPath": "https://memelotsqui.github.io/loot-assets/neurohacker/female/loot.json",
    "animationPath": "./3d/animations/idle_sword.fbx",
    "traitIconsDirectory": "./3d/icons/",
    "selectionTraits": [{
      "name": "color",
      "id":1,
      "icon": "skin-color.png",
      "type": "color",
      "icon-gradient": "color-gradient.svg",
      "buttonName": "Skin Color",
      "cameraTarget":{
        "distance": 1.5,
        "height": 0.9
      },
      "subTrait":[
      {
        "name": "Eye Color",
        "type": "color",
        "cameraTarget":{
          "distance": 0.5,
          "height": 1.55
        },
        "bodyTargets": [
          "Eye"
        ]
      }]
    },{
      "name": "head",
      "icon": "hairStyle.png",
      "type": "mesh",
      "id":2,
      "icon-gradient": "head-gradient.svg",
      "cameraTarget":{
        "distance": 0.5,
        "height": 1.55
      }
    },{
      "name": "chest",
      "icon": "torso.png",
      "icon-gradient": "chest-gradient.svg",
      "type": "mesh",
      "cameraTarget":{
        "distance": 1.4,
        "height": 0.9
      }
    },{
      "name": "accessories",
      "icon": "accessories.png",
      "type": "mesh",
      "id":3,
      "icon-gradient": "accessories-gradient.svg",
      "cameraTarget":{
        "distance": 1.5,
        "height": 0.9
      }
    },{
      "name": "legs",
      "icon": "legs.png",
      "type": "mesh",
      "icon-gradient": "chest-gradient.svg",
      "id":4,
      "cameraTarget":{
        "distance": 1.1,
        "height": 0.6
      }
    },{
      "name": "foot",
      "icon": "shoes.png",
      "type": "mesh",
      "icon-gradient": "foot-gradient.svg",
      "id":5,
      "cameraTarget":{
        "distance": 0.8,
        "height": 0.32
      },
      "eye": {
        "distance": 0.3,
        "height": 1.5
      }
    }]
    },
    {
    "id": "4",
    "name": "Male",
    "file": "./3d/models/m_neurohacker_v1.vrm",
    "thumbnail": "./3d/icons/male-body-1.png",
    "format": "vrm",
    "bodyTargets": [
        "Body",
        "Face_Malebaked"
    ],
    "EyeTargets": [
        "Face_Malebaked_2"
    ],
    "traitsDirectory": "https://memelotsqui.github.io/loot-assets/neurohacker/male/",
    "thumbnailsDirectory": "https://memelotsqui.github.io/loot-assets/neurohacker/male/",
    "traitsJsonPath": "https://memelotsqui.github.io/loot-assets/neurohacker/male/loot.json",
    "animationPath": "./3d/animations/idle_sword.fbx",
    "traitIconsDirectory": "./3d/icons/",
    "selectionTraits": [{
      "name": "color",
      "id":1,
      "icon": "skin-color.png",
      "type": "color",
      "icon-gradient": "color-gradient.svg",
      "buttonName": "Skin Color",
      "cameraTarget":{
        "distance": 1.4,
        "height": 0.8
      },
      "subTrait":[
      {
        "name": "Eye Color",
        "type": "color",
        "cameraTarget":{
          "distance": 0.5,
          "height": 1.45
        },
        "bodyTargets": [
          "Eye"
        ]
      }]
    },{
      "name": "head",
      "icon": "hairStyle.png",
      "type": "mesh",
      "id":2,
      "icon-gradient": "head-gradient.svg",
      "cameraTarget":{
        "distance": 0.5,
        "height": 1.45
      }
    },{
      "name": "chest",
      "icon": "torso.png",
      "icon-gradient": "chest-gradient.svg",
      "type": "mesh",
      "cameraTarget":{
        "distance": 1.3,
        "height": 0.9
      }
    },{
      "name": "accessories",
      "icon": "accessories.png",
      "type": "mesh",
      "id":3,
      "icon-gradient": "accessories-gradient.svg",
      "cameraTarget":{
        "distance": 1.4,
        "height": 0.8
      }
    },{
      "name": "legs",
      "icon": "legs.png",
      "type": "mesh",
      "icon-gradient": "chest-gradient.svg",
      "id":4,
      "cameraTarget":{
        "distance": 1.1,
        "height": 0.55
      }
    },{
      "name": "foot",
      "icon": "shoes.png",
      "type": "mesh",
      "icon-gradient": "foot-gradient.svg",
      "id":5,
      "cameraTarget":{
        "distance": 0.8,
        "height": 0.32
      },
      "eye": {
        "distance": 0.3,
        "height": 1.5
      }
    }]
  }  
]