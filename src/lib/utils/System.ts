import fs from 'fs';
import fsPromises from 'fs/promises';

// https://bobbyhadz.com/blog/list-all-directories-in-directory-in-node-js
export async function listDirectories(path: string) {
  const directories = (await fsPromises.readdir(path, {withFileTypes: true}))
    .filter((dirent) => dirent.isDirectory())
    .map((dir) => dir.name);

  return directories;
}

export function fileExists(path: string) {
  try {
    return fs.existsSync(path) && fs.lstatSync(path).isFile();
  }
  catch (error) {
    return false;
  }
}

export function dirExists(path: string) {
  try {
    return fs.existsSync(path) && fs.lstatSync(path).isDirectory();
  }
  catch (error) {
    return false;
  }
}

export function fifoExists(path: string) {
  try {
    return fs.existsSync(path) && fs.lstatSync(path).isFIFO();
  }
  catch (error) {
    return false;
  }
}
