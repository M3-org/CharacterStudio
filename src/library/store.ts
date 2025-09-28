import { Storage } from './Storage'

let storeObject = new Storage();

// Storage API
const localStorageAdapter = (object: Storage) => ({
  get( name: string ) {
    return object.getItem( String( name ))
  },

  set( name: string, value: any ) {
    object.setItem( String( name ), value )
    return true
  },
})

// Use Storage API adapter
const store = ( object = storeObject ) => {
  return new Proxy({}, localStorageAdapter( object ) as any)
}

export const local = store();