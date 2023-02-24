/**
 * Implementation of the Storage interface
 * https://github.com/soulofmischief/proxy.js/blob/master/Storage.js
 */
 export function Storage() {

    if (localStorage){
        Object.keys(localStorage).map((key)=>{
            this.setItem(key, localStorage[key], false)
        })
    }

    Object.defineProperty( this, 'length', {
      get: function() {
        return Object.keys( this ).length
      },
      enumerable: false
    })
  }
  
  Storage.prototype.key = function( index ) {
    return Object.keys( this )[index]
  }
  
  Storage.prototype.getItem = function( key ) {
    try {
        return JSON.parse(this[key]);
    } catch (e) {
        // not json
    }
    return this[key]
  }
  
  Storage.prototype.setItem = function( key, val, setLocal = true ) {
    const stVal = typeof val === 'string' ? val:JSON.stringify( val );
    if (setLocal)
        localStorage.setItem(key,stVal)
    return this[key] = stVal;
  }
  
  Storage.prototype.removeItem = function( key ) {
    delete this[key]
  }
  
  Storage.prototype.clear = function() {
    Object.keys( this ).forEach( key => delete this[key])
  }