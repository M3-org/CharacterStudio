import { createState, useState } from '@speigg/hookstate'
import { getMyDIP721Tokens } from '../functions/DIP721'

//State
const state = createState({
  coinData: [] as Array<any>,
  data: [],
  user: [] as Array<any>,
  type: [] as Array<any>,
  isLoading: false,
  isLoadingtransfer: false
})

export const accessInventoryState = () => state
export const useInventoryState = () => useState(state) as any as typeof state as unknown as typeof state

//Service
export const InventoryService = {
  fetchInventoryList: async () => {
    try {
      const myNFTs = await getMyDIP721Tokens();
      return myNFTs;
    } catch (err) {
      console.error(err, 'error')
    } finally {
    }
  },
}