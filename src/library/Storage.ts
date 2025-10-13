/**
 * Implementation of the Storage interface
 * https://github.com/soulofmischief/proxy.js/blob/master/Storage.js
 */

export class Storage<T extends Partial<Record<string, any>> = any> {
  private data: T = {} as T;

  constructor() {
    if (typeof localStorage !== 'undefined') {
      Object.keys(localStorage).forEach((key: string) => {
        this.setItem(key, localStorage[key], false);
      });
    }
  }

  key(index: number): string | null {
    const keys = Object.keys(this.data);
    return keys[index] || null;
  }

  getItem(key: keyof T): T[keyof T] | null {
    const value = this.data[key] as string;
    if (!value) {
      return null;
    }
    
    try {
      return JSON.parse(value);
    } catch (e) {
      // not json, return as string
      return value  as  T[keyof T]
    }
  }

  setItem(key: keyof T, val: T[keyof T], setLocal: boolean = true): string {
    const stVal: string = typeof val === 'string' ? val : JSON.stringify(val);
    
    if (setLocal && typeof localStorage !== 'undefined') {
      localStorage.setItem(String(key), stVal);
    }
    
    (this.data as any)[key] = stVal;
    return stVal as string;
  }

  removeItem(key: keyof T): void {
    delete this.data[key];
  }

  clear(): void {
    this.data = {} as T;
  }

  get length(): number {
    return Object.keys(this.data).length;
  }
}