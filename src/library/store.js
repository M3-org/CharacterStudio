import { Storage } from './Storage.js'

let storeObject = new Storage();

// Storage API
const localStorageAdapter = object => ({
  get( target, name ) {
    return object.getItem( String( name ))
  },

  set( target, name, value ) {
    object.setItem( String( name ), value )
    return true
  },
})

// Use Storage API adapter
const store = ( object = storeObject ) => {
  return new Proxy({}, localStorageAdapter( object ))
}

export const local = store();