import create from 'zustand';

const useMuteStore = create((set) => ({
    isMute: true,
    setMute: (value) => set((state) => ({
        isMute: value
    }))
}))

const useRotateStore = create((set) => ({
    isRotate: true,
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
        body:{},
        chest:{},
        head:{},
        neck:{},
        hand:{},
        ring:{},
        waist:{},
        weapon:{},
        legs:{},
        foot:{},
        accessories:{},
        eyeColor:{}
    },
    setAvatar: (value) => set((state) => ({
        avatar: value
    }))
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
    category: "color",
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
    useModel
};