// import { AuthService, useAuthState } from '@xrengine/client-core/src/user/services/AuthService'
import InventoryContent from './InventoryContent'
import styles from '../../styles/ui.module.scss'

export const Inventory = (): any => {
  return (
    <div className={styles.menuPanel}>
        <InventoryContent />
    </div>
  )
}

export default Inventory
