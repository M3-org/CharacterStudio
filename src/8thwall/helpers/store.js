import { createRef } from 'react'
import create from 'zustand'

const useStore = create(() => {
  return {
    dom: createRef(null),
    surface: createRef(null),
    setPos: false,
    setScale: 1,
    idActive: 0,
    startCameraPPAnim: false,
    time: 0,
    isShooting: false,
    mousePos: {
      x: 0.5,
      y: 0.5,
    },
  }
})
export const mutationScale = {}
export const { getState, setState } = useStore

export default useStore
