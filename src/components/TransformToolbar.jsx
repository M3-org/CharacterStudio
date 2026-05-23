import React from 'react'
import styles from './TransformToolbar.module.css'
import { SceneContext } from '../context/SceneContext'

export default function TransformToolbar(){
  const {
    transformMode,
    setTransformMode,
    transformSnap,
    setTransformSnap,
    transformTarget,
    detachTransformTarget,
    applyTranslateDelta,
    applyRotateDelta,
    applyScaleDelta,
  } = React.useContext(SceneContext)

  const [plane, setPlane] = React.useState('XY') // for translate only

  const onSnapChange = (key) => (e) => {
    const v = Number(e.target.value)
    setTransformSnap({ ...transformSnap, [key]: isNaN(v) ? 0 : v })
  }

  if (!transformTarget) return null

  const stepValue = transformMode === 'translate' ? transformSnap.t : transformMode === 'rotate' ? transformSnap.r : transformSnap.s
  const setStepValue = (v) => {
    const num = Number(v)
    if (isNaN(num)) return
    if (transformMode === 'translate') setTransformSnap({ ...transformSnap, t: num })
    else if (transformMode === 'rotate') setTransformSnap({ ...transformSnap, r: num })
    else setTransformSnap({ ...transformSnap, s: num })
  }

  const onArrow = (dir) => () => {
    if (transformMode === 'translate'){
      const s = transformSnap.t
      if (plane === 'XY'){
        if (dir==='up') return applyTranslateDelta(0, s, 0)
        if (dir==='down') return applyTranslateDelta(0, -s, 0)
      } else {
        if (dir==='up') return applyTranslateDelta(0, 0, s)
        if (dir==='down') return applyTranslateDelta(0, 0, -s)
      }
      if (dir==='left') return applyTranslateDelta(-s, 0, 0)
      if (dir==='right') return applyTranslateDelta(s, 0, 0)
    }
    if (transformMode === 'rotate'){
      const r = transformSnap.r
      if (dir==='up') return applyRotateDelta(r, 0, 0)
      if (dir==='down') return applyRotateDelta(-r, 0, 0)
      if (dir==='left') return applyRotateDelta(0, -r, 0)
      if (dir==='right') return applyRotateDelta(0, r, 0)
    }
    if (transformMode === 'scale'){
      const s = transformSnap.s
      const d = (dir==='up' || dir==='right') ? s : -s
      return applyScaleDelta(d, d, d)
    }
  }

  return (
    <div className={styles.toolbar}>
      <div className={styles.seg}>
        <button className={`${styles.segBtn} ${transformMode==='translate'?styles.active:''}`} onClick={()=>setTransformMode('translate')}>T</button>
        <button className={`${styles.segBtn} ${transformMode==='rotate'?styles.active:''}`} onClick={()=>setTransformMode('rotate')}>R</button>
        <button className={`${styles.segBtn} ${transformMode==='scale'?styles.active:''}`} onClick={()=>setTransformMode('scale')}>S</button>
      </div>
      {transformMode==='translate' && (
        <div className={styles.seg}>
          <button className={`${styles.segBtn} ${plane==='XY'?styles.active:''}`} onClick={()=>setPlane('XY')}>XY</button>
          <button className={`${styles.segBtn} ${plane==='XZ'?styles.active:''}`} onClick={()=>setPlane('XZ')}>XZ</button>
        </div>
      )}
      <div className={styles.dpad}>
        <button className={styles.arrow} aria-label="up" onClick={onArrow('up')}>↑</button>
        <div className={styles.row}>
          <button className={styles.arrow} aria-label="left" onClick={onArrow('left')}>←</button>
          <button className={styles.center} aria-label="center" onClick={()=>{}}></button>
          <button className={styles.arrow} aria-label="right" onClick={onArrow('right')}>→</button>
        </div>
        <button className={styles.arrow} aria-label="down" onClick={onArrow('down')}>↓</button>
      </div>
      <div className={styles.compact}>
        <label className={styles.label}>Step</label>
        <input className={styles.inputSmall} type="number" step={transformMode==='rotate'?1:0.01} value={stepValue} onChange={(e)=>setStepValue(e.target.value)} />
        <button className={styles.btn} onClick={detachTransformTarget}>Done</button>
      </div>
    </div>
  )
}


