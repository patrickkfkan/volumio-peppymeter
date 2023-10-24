"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.fifoExists = exports.dirExists = exports.fileExists = exports.listDirectories = void 0;
const fs_1 = __importDefault(require("fs"));
const promises_1 = __importDefault(require("fs/promises"));
// https://bobbyhadz.com/blog/list-all-directories-in-directory-in-node-js
async function listDirectories(path) {
    const directories = (await promises_1.default.readdir(path, { withFileTypes: true }))
        .filter((dirent) => dirent.isDirectory())
        .map((dir) => dir.name);
    return directories;
}
exports.listDirectories = listDirectories;
function fileExists(path) {
    try {
        return fs_1.default.existsSync(path) && fs_1.default.lstatSync(path).isFile();
    }
    catch (error) {
        return false;
    }
}
exports.fileExists = fileExists;
function dirExists(path) {
    try {
        return fs_1.default.existsSync(path) && fs_1.default.lstatSync(path).isDirectory();
    }
    catch (error) {
        return false;
    }
}
exports.dirExists = dirExists;
function fifoExists(path) {
    try {
        return fs_1.default.existsSync(path) && fs_1.default.lstatSync(path).isFIFO();
    }
    catch (error) {
        return false;
    }
}
exports.fifoExists = fifoExists;
//# sourceMappingURL=System.js.map