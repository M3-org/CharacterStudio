import React from 'react'
import styles from './TransformInspector.module.css'
import { SceneContext } from '../context/SceneContext'

export default function TransformInspector(){
  const {
    transformTarget,
    applyTranslateDelta,
    applyRotateDelta,
    applyScaleDelta,
    getBoneNames,
    reparentToBone,
    getAttachedBoneName,
    copyTransform,
    pasteTransform,
    resetToBoneOrigin,
  } = React.useContext(SceneContext)

  const [bone, setBone] = React.useState('')
  const bones = getBoneNames()
  const [clipboard, setClipboard] = React.useState(null)
  const deg = 180/Math.PI
  const [pos, setPos] = React.useState({x:0,y:0,z:0})
  const [rot, setRot] = React.useState({x:0,y:0,z:0}) // degrees
  const [scl, setScl] = React.useState({x:1,y:1,z:1})
  const [u, setU] = React.useState(1)

  React.useEffect(()=>{
    if (bones && bones.length && !bone) setBone(bones.includes('head')?'head':bones[0])
  }, [bones])

  React.useEffect(()=>{
    if (!transformTarget) return
    const p = transformTarget.position
    const r = transformTarget.rotation
    const s = transformTarget.scale
    setPos({x:p.x,y:p.y,z:p.z})
    setRot({x:r.x*deg,y:r.y*deg,z:r.z*deg})
    setScl({x:s.x,y:s.y,z:s.z})
    setU((s.x + s.y + s.z)/3)
  }, [transformTarget])

  if (!transformTarget) return null

  return (
    <div className={styles.panel}>
      <div className={styles.header}>Trait Position</div>
      <div className={styles.row}>
        <label>X position</label>
        <input type="range" min={-0.5} max={0.5} step={0.001} value={pos.x} onChange={(e)=>{ const v = Number(e.target.value); applyTranslateDelta(v-pos.x,0,0); setPos(prev=>({...prev,x:v})) }} />
        <input className={styles.num} type="number" step={0.001} value={pos.x} onChange={(e)=>{ const v=Number(e.target.value); applyTranslateDelta(v-pos.x,0,0); setPos(prev=>({...prev,x:v})) }} />
      </div>
      <div className={styles.row}>
        <label>Y position</label>
        <input type="range" min={-0.5} max={0.5} step={0.001} value={pos.y} onChange={(e)=>{ const v = Number(e.target.value); applyTranslateDelta(0,v-pos.y,0); setPos(prev=>({...prev,y:v})) }} />
        <input className={styles.num} type="number" step={0.001} value={pos.y} onChange={(e)=>{ const v=Number(e.target.value); applyTranslateDelta(0,v-pos.y,0); setPos(prev=>({...prev,y:v})) }} />
      </div>
      <div className={styles.row}>
        <label>Z position</label>
        <input type="range" min={-0.5} max={0.5} step={0.001} value={pos.z} onChange={(e)=>{ const v = Number(e.target.value); applyTranslateDelta(0,0,v-pos.z); setPos(prev=>({...prev,z:v})) }} />
        <input className={styles.num} type="number" step={0.001} value={pos.z} onChange={(e)=>{ const v=Number(e.target.value); applyTranslateDelta(0,0,v-pos.z); setPos(prev=>({...prev,z:v})) }} />
      </div>

      <div className={styles.header}>Trait Rotation</div>
      <div className={styles.row}>
        <label>Pitch (X)</label>
        <input type="range" min={-90} max={90} step={0.5} value={rot.x} onChange={(e)=>{ const v=Number(e.target.value); applyRotateDelta(v-rot.x,0,0); setRot(prev=>({...prev,x:v})) }} />
        <input className={styles.num} type="number" step={0.5} value={rot.x} onChange={(e)=>{ const v=Number(e.target.value); applyRotateDelta(v-rot.x,0,0); setRot(prev=>({...prev,x:v})) }} />
      </div>
      <div className={styles.row}>
        <label>Yaw (Y)</label>
        <input type="range" min={-180} max={180} step={0.5} value={rot.y} onChange={(e)=>{ const v=Number(e.target.value); applyRotateDelta(0,v-rot.y,0); setRot(prev=>({...prev,y:v})) }} />
        <input className={styles.num} type="number" step={0.5} value={rot.y} onChange={(e)=>{ const v=Number(e.target.value); applyRotateDelta(0,v-rot.y,0); setRot(prev=>({...prev,y:v})) }} />
      </div>
      <div className={styles.row}>
        <label>Roll (Z)</label>
        <input type="range" min={-90} max={90} step={0.5} value={rot.z} onChange={(e)=>{ const v=Number(e.target.value); applyRotateDelta(0,0,v-rot.z); setRot(prev=>({...prev,z:v})) }} />
        <input className={styles.num} type="number" step={0.5} value={rot.z} onChange={(e)=>{ const v=Number(e.target.value); applyRotateDelta(0,0,v-rot.z); setRot(prev=>(({...prev,z:v})) ) }} />
      </div>

      <div className={styles.header}>Trait Scale</div>
      <div className={styles.row}>
        <label>Uniform</label>
        <input type="range" min={0.1} max={3} step={0.01} value={u} onChange={(e)=>{ const v=Number(e.target.value); const dx=v-scl.x; const dy=v-scl.y; const dz=v-scl.z; applyScaleDelta(dx,dy,dz); setScl({x:v,y:v,z:v}); setU(v); }} />
        <input className={styles.num} type="number" step={0.01} value={u} onChange={(e)=>{ const v=Number(e.target.value); const dx=v-scl.x; const dy=v-scl.y; const dz=v-scl.z; applyScaleDelta(dx,dy,dz); setScl({x:v,y:v,z:v}); setU(v); }} />
      </div>
      <div className={styles.row}>
        <label>X Scale</label>
        <input type="range" min={0.1} max={3} step={0.01} value={scl.x} onChange={(e)=>{ const v=Number(e.target.value); applyScaleDelta(v-scl.x,0,0); setScl(prev=>({...prev,x:v})); setU((v+scl.y+scl.z)/3); }} />
        <input className={styles.num} type="number" step={0.01} value={scl.x} onChange={(e)=>{ const v=Number(e.target.value); applyScaleDelta(v-scl.x,0,0); setScl(prev=>({...prev,x:v})); setU((v+scl.y+scl.z)/3); }} />
      </div>
      <div className={styles.row}>
        <label>Y Scale</label>
        <input type="range" min={0.1} max={3} step={0.01} value={scl.y} onChange={(e)=>{ const v=Number(e.target.value); applyScaleDelta(0,v-scl.y,0); setScl(prev=>({...prev,y:v})); setU((scl.x+v+scl.z)/3); }} />
        <input className={styles.num} type="number" step={0.01} value={scl.y} onChange={(e)=>{ const v=Number(e.target.value); applyScaleDelta(0,v-scl.y,0); setScl(prev=>({...prev,y:v})); setU((scl.x+v+scl.z)/3); }} />
      </div>
      <div className={styles.row}>
        <label>Z Scale</label>
        <input type="range" min={0.1} max={3} step={0.01} value={scl.z} onChange={(e)=>{ const v=Number(e.target.value); applyScaleDelta(0,0,v-scl.z); setScl(prev=>({...prev,z:v})); setU((scl.x+scl.y+v)/3); }} />
        <input className={styles.num} type="number" step={0.01} value={scl.z} onChange={(e)=>{ const v=Number(e.target.value); applyScaleDelta(0,0,v-scl.z); setScl(prev=>({...prev,z:v})); setU((scl.x+scl.y+v)/3); }} />
      </div>

      <div className={styles.header}>Attach To Bone</div>
      <div className={styles.row}>
        <select className={styles.select} value={bone || getAttachedBoneName() || ''} onChange={(e)=>setBone(e.target.value)}>
          {bones.map((b)=>(<option key={b} value={b}>{b}</option>))}
        </select>
        <button className={styles.btn} onClick={()=>reparentToBone(bone)}>Reattach</button>
      </div>

      <div className={styles.header}>Utilities</div>
      <div className={styles.row}>
        <button className={styles.btn} onClick={()=>{ setClipboard(copyTransform()) }}>Copy</button>
        <button className={styles.btn} onClick={()=>pasteTransform(clipboard)} disabled={!clipboard}>Paste</button>
        <button className={styles.btn} onClick={resetToBoneOrigin}>Reset</button>
      </div>
    </div>
  )
}


