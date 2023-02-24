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
export function store( object = storeObject ) {
    console.log(object)
  return new Proxy({}, localStorageAdapter( object ))
}