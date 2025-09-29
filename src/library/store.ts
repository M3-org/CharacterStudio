import { Storage } from './Storage'

let storeObject = new Storage<LocalStoreType>();

export type LocalStoreType = {
  "mergeOptions_sel_option": number;
  "mergeOptions_atlas_mtoon_size": number;
  "mergeOptions_atlas_mtoon_transp_size": number;
  "mergeOptions_atlas_std_size": number;
  "merge_options_ktx_compression": boolean;
  "mergeOptions_two_sided_mat": boolean;
  "mergeOptions_atlas_std_transp_size": number;

  "mergeOptions_download_vrm_preview": boolean;
  "mergeOptions_download_vrm": boolean;
  "mergeOptions_download_lora": boolean;
  "mergeOptions_download_sprites": boolean;

  "mergeOptions_drop_download": boolean;
  "mergeOptions_create_atlas": boolean;
}
// Storage API
const localStorageAdapter = (object: Storage<LocalStoreType>) => ({
  get( name: keyof LocalStoreType ) {
    return object.getItem( name )
  },

  set( name: keyof LocalStoreType, value: any ) {
    object.setItem( name, value )
    return true
  },
})

// Use Storage API adapter
const store = ( object = storeObject ) => {
  return new Proxy({}, localStorageAdapter( object ) as any) as Partial<LocalStoreType>
}

export const local = store();
