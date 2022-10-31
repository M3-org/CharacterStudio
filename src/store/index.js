import create from 'zustand';

const useMuteStore = create((set) => ({
    isMute: true,
    setMute: (value) => set((state) => ({
        isMute: value
    }))
}))

export {
    useMuteStore
};