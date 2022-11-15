import create from 'zustand';

const useMuteStore = create((set) => ({
    isMute: true,
    setMute: (value) => set((state) => ({
        isMute: value
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

export {
    useMuteStore,
    useModelingStore,
};