
import create from 'zustand';

const useMuteStore = create((set) => ({
    isMute: true,
    setMute: (value) => set((state) => ({
        isMute: value
    }))
}))

const useRotateStore = create((set) => ({
    isRotate: false,
    setRotate: (value) => set((state) => ({
        isRotate: value
    }))
}))

const useColorStatus = create((set) => ({
    colorStatus: '',
    setColorStatus: (value) => set((state) => ({
        colorStatus: value
    }))
}))

const useHideStore = create((set) => ({
    ishidden: true,
    sethidden: (value) => set((state) => ({
        ishidden: value
    }))
}))

const useModelingStore = create((set) => ({
    isModeling: new Array(4),
    isComplete: new Array(4),
    setModeling: (order, percent) => set((state) => {
        let isModeling = [...state.isModeling];
        isModeling[order] = percent;
        return {
            isModeling
        }
    }),
    formatModeling: () => set((state) => ({
        isModeling: new Array(4)
    })),
    setComplete: (order, value) => set((state) => {
        let isComplete = [...state.isComplete];
        isComplete[order] = value;
        return {
            isComplete
        }
    }),
    formatComplete: () => set((state) => ({
        isComplete: new Array(4)
    })),
}))

const useDefaultTemplates = create((set) => ({
    defaultTemplates: "",
    setDefaultTemplates: (value) => set((state) => ({
        defaultTemplates: value
    }))
}))

const useRandomFlag = create((set) => ({
    randomFlag: -1,
    setRandomFlag: (value) => set((state) => ({
        randomFlag: value
    }))
}))

const useAvatar = create((set) => ({
    avatar:  {
        skin:{},
        body:{},
        chest:{},
        head:{},
        neck:{},
        hand:{},
        ring:{},
        waist:{},
        weapon:{},
        legs:{},
        feet:{},
        accessories:{},
        eyes:{},
        outer:{},
        solo:{}
    },
    setAvatar: (value) => {
        set((state) => ({
            avatar: value
        }))
    }
}))

const useLoadedTraits = create((set) => ({
    loadedTraits: false,
    setLoadedTraits: (value) => set((state) => ({
        loadedTraits: value
    }))
}))

const useEnd = create((set) => ({
    end: false,
    setEnd: (value) => set((state) => ({
        end: value
    }))
}))

const useSetTemplate = create((set) => ({
    template: 1,
    setTemplate: (value) => set((state) => ({
        template: value
    }))
}))

const useScene = create((set) => ({
    scene: {},
    setScene: (value) => set((state) => ({
        scene: value
    }))
}))

const useCategory = create((set) => ({
    category: "skin",
    setCategory: (value) => set((state) => ({
        category: value
    }))
}))


const useTemplateInfo = create((set) => ({
    templateInfo: { file: null, format: null, bodyTargets:null },
    setTemplateInfo: (value) => set((state) => ({
        templateInfo: value
    }))
}))

const useModel = create((set) => ({
    model: {},
    setModel: (value) => set((state) => ({
        model: value
    }))
}))

const useControls = create((set) => ({
    controls: {},
    setControls: (value) => set((state) => ({
        controls: value
    })),
}))

const useCamera = create((set) => ({
    camera: {},
    setCamera: (value) => set((state) => ({
        camera: value
    }))
}))

const useConfirmWindow = create((set) => ({
    confirmWindow: false,
    setConfirmWindow: (value) => set((state) => ({
        confirmWindow: value
    }))
}))

const useMintLoading = create((set) => ({
    mintLoading: false,
    setMintLoading: (value) => set((state) => ({
        mintLoading: value
    }))
}))

const useMintStatus = create((set) => ({
    mintStatus: "Please connect your wallet.",
    mintCost: 0.1,
    setMintStatus: (value) => set((state) => ({
        mintStatus: value
    })),
    setMintCost: (value) => set((state) => ({
        mintCost: value
    }))
}))

const useLoading = create((set) => ({
    loading: false,
    setLoading: (value) => set((state) => ({
        loading: value
    }))
}))

const useModelClass = create((set) => ({
    modelClass: 0,
    setModelClass: (value) => set((state) => ({
        modelClass: value
    }))
}))

const usePreModelClass = create((set) => ({
    preModelClass: 0,
    setPreModelClass: (value) => set((state) => ({
        preModelClass: value
    }))
}))


const useMintDone = create((set) => ({
    mintDone: false,
    setMintDone: (value) => set((state) => ({
        mintDone: value
    }))
}))

export {
    useMuteStore,
    useModelingStore,
    useRotateStore,
    useHideStore,
    useColorStatus,
    useDefaultTemplates,
    useRandomFlag,
    useAvatar,
    useLoadedTraits,
    useEnd,
    useSetTemplate,
    useScene,
    useCategory,
    useTemplateInfo,
    useModel,
    useCamera,
    useControls,
    useConfirmWindow,
    useMintLoading,
    useMintStatus,
    useLoading,
    useModelClass,
    usePreModelClass,
    useMintDone
};