import styles from "../../pages/Appearance.module.css";
import { TokenBox } from '../token-box';

const DecalItem = ({active,src,select}:{
    active:boolean,
    src:string|null|undefined,
    select:()=>void
})=>{
  
    return (
      <div
        className={`${styles["selectorButton"]}`}
        onClick={select}
      >
        <TokenBox
          size={56}
          icon={src||''}
          rarity={active ? "mythic" : "none"}      
        />
      </div>
    )
  }

export default DecalItem;