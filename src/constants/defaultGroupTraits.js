export const defaultGroupTrait = 
    {
        trait:"DEFAULT",
        name:"DEFAULT",
        cullingLayer: -1,
        cullingDistance:[0.3,0.01],
        cameraTarget:{
            distance:3.0,
            height:0.8
        }
    }


export const defaultGroupTraits = [
    {
        trait:"BODY",
        name:"BODY",
        cullingLayer: 0,
        cullingDistance:[0.3,0.01],
        cameraTarget:{
            distance:3.0,
            height:0.8
        }
    },
    {
        trait:"TOP",
        name:"TOP",
        cullingLayer: 2,
        cullingDistance:[0.3,0.01],
        cameraTarget:{
            distance:2.0,
            height:1.0
        }
    },
    {
        trait:"BOTTOM",
        name:"BOTTOM",
        cullingLayer: 1,
        cullingDistance:[0.3,0.01],
        cameraTarget:{
            distance:2.0,
            height:0.3
        }
    },
    {
        trait:"HAIR",
        name:"HAIR",
        cullingLayer: -1,
        cullingDistance:[0.3,0.01],
        cameraTarget:{
            distance:2.0,
            height:1.2
        }
    },
    {
        trait:"SHOES",
        name:"SHOES",
        cullingLayer: -1,
        cullingDistance:[0.3,0.01],
        cameraTarget:{
            distance:2.0,
            height:0.2
        }
    },
    {
        trait:"GLOVES",
        name:"GLOVES",
        cullingLayer: -1,
        cullingDistance:[0.3,0.01],
        cameraTarget:{
            distance:2.0,
            height:0.7
        }
    },
    {
        trait:"GLASSES",
        name:"GLASSES",
        cullingLayer: -1,
        cullingDistance:[0.3,0.01],
        cameraTarget:{
            distance:2.0,
            height:1.2
        }
    },
    {
        trait:"HATS",
        name:"HATS",
        cullingLayer: -1,
        cullingDistance:[0.3,0.01],
        cameraTarget:{
            distance:2.0,
            height:1.4
        }
    }
]

