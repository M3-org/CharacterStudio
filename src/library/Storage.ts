/**
 * Implementation of the Storage interface
 * https://github.com/soulofmischief/proxy.js/blob/master/Storage.js
 */

export class Storage {
  private data: { [key: string]: string } = {};

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

  getItem(key: string): any {
    const value = this.data[key];
    if (value === undefined) {
      return null;
    }
    
    try {
      return JSON.parse(value);
    } catch (e) {
      // not json, return as string
      return value;
    }
  }

  setItem(key: string, val: any, setLocal: boolean = true): string {
    const stVal: string = typeof val === 'string' ? val : JSON.stringify(val);
    
    if (setLocal && typeof localStorage !== 'undefined') {
      localStorage.setItem(key, stVal);
    }
    
    this.data[key] = stVal;
    return stVal;
  }

  removeItem(key: string): void {
    delete this.data[key];
  }

  clear(): void {
    this.data = {};
  }

  get length(): number {
    return Object.keys(this.data).length;
  }
}