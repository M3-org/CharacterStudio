import { describe, it, expect } from 'vitest';
import { getFileNameWithoutExtension, getAsArray } from './utils.js';

describe('getFileNameWithoutExtension', () => {
  it('should return the file name from a simple file name', () => {
    expect(getFileNameWithoutExtension('image.png')).toBe('image');
  });

  it('should return the file name from a path', () => {
    expect(getFileNameWithoutExtension('path/to/file.jpg')).toBe('file');
  });

  it('should handle multiple dots in the file name', () => {
    expect(getFileNameWithoutExtension('archive.tar.gz')).toBe('archive.tar');
  });

  it('should handle file names with no extension', () => {
    expect(getFileNameWithoutExtension('myfile')).toBe('myfile');
  });

  it('should handle file names with a leading dot', () => {
    // Based on the current implementation read, this test case might fail.
    // The current implementation: filePath.replace(/^.*[\\/]/, '').split('.').slice(0, -1).join('.');
    // For '.configfile', split('.') is ['', 'configfile'], slice(0,-1) is [''], join('.') is ''
    // The test asks for '.configfile'
    expect(getFileNameWithoutExtension('.configfile')).toBe('.configfile');
  });

  it('should handle an empty string', () => {
    expect(getFileNameWithoutExtension('')).toBe('');
  });

  it('should handle file names with spaces', () => {
    expect(getFileNameWithoutExtension('my file.name.ext')).toBe('my file.name');
  });

  it('should handle file names with multiple dots and spaces', () => {
    expect(getFileNameWithoutExtension('my project.archive.tar.gz')).toBe('my project.archive.tar');
  });

  it('should handle paths with spaces and multiple dots', () => {
    expect(getFileNameWithoutExtension('path with spaces/to/my project.archive.tar.gz')).toBe('my project.archive.tar');
  });
});

describe('getAsArray', () => {
  it('should return an empty array for null input', () => {
    expect(getAsArray(null)).toEqual([]);
  });

  it('should return an empty array for undefined input', () => {
    expect(getAsArray(undefined)).toEqual([]);
  });

  it('should return the same array if input is an empty array', () => {
    expect(getAsArray([])).toEqual([]);
  });

  it('should return the same array if input is a non-empty array', () => {
    expect(getAsArray([1, 2])).toEqual([1, 2]);
  });

  it('should return an array with the single number value', () => {
    expect(getAsArray(1)).toEqual([1]);
  });

  it('should return an array with the single string value', () => {
    expect(getAsArray('hello')).toEqual(['hello']);
  });

  it('should return an array with the object', () => {
    const obj = { a: 1 };
    expect(getAsArray(obj)).toEqual([obj]);
  });
});
