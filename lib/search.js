"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.findFilesToUpload = void 0;
const glob = __importStar(require("@actions/glob"));
const path = __importStar(require("path"));
const core_1 = require("@actions/core");
const fs_1 = require("fs");
const path_1 = require("path");
const util_1 = require("util");
const stats = (0, util_1.promisify)(fs_1.stat);
function getDefaultGlobOptions() {
    return {
        followSymbolicLinks: true,
        implicitDescendants: true,
        omitBrokenSymbolicLinks: true
    };
}
/**
 * If multiple paths are specific, the least common ancestor (LCA) of the search paths is used as
 * the delimiter to control the directory structure for the artifact. This function returns the LCA
 * when given an array of search paths
 *
 * Example 1: The patterns `/foo/` and `/bar/` returns `/`
 *
 * Example 2: The patterns `~/foo/bar/*` and `~/foo/voo/two/*` and `~/foo/mo/` returns `~/foo`
 */
function getMultiPathLCA(searchPaths) {
    if (searchPaths.length < 2) {
        throw new Error('At least two search paths must be provided');
    }
    const commonPaths = new Array();
    const splitPaths = new Array();
    let smallestPathLength = Number.MAX_SAFE_INTEGER;
    // split each of the search paths using the platform specific separator
    for (const searchPath of searchPaths) {
        (0, core_1.debug)(`Using search path ${searchPath}`);
        const splitSearchPath = path.normalize(searchPath).split(path.sep);
        // keep track of the smallest path length so that we don't accidentally later go out of bounds
        smallestPathLength = Math.min(smallestPathLength, splitSearchPath.length);
        splitPaths.push(splitSearchPath);
    }
    // on Unix-like file systems, the file separator exists at the beginning of the file path, make sure to preserve it
    if (searchPaths[0].startsWith(path.sep)) {
        commonPaths.push(path.sep);
    }
    let splitIndex = 0;
    // function to check if the paths are the same at a specific index
    function isPathTheSame() {
        const compare = splitPaths[0][splitIndex];
        for (let i = 1; i < splitPaths.length; i++) {
            if (compare !== splitPaths[i][splitIndex]) {
                // a non-common index has been reached
                return false;
            }
        }
        return true;
    }
    // loop over all the search paths until there is a non-common ancestor or we go out of bounds
    while (splitIndex < smallestPathLength) {
        if (!isPathTheSame()) {
            break;
        }
        // if all are the same, add to the end result & increment the index
        commonPaths.push(splitPaths[0][splitIndex]);
        splitIndex++;
    }
    return path.join(...commonPaths);
}
function findFilesToUpload(searchPath, globOptions) {
    return __awaiter(this, void 0, void 0, function* () {
        const searchResults = [];
        const globber = yield glob.create(searchPath, globOptions || getDefaultGlobOptions());
        const rawSearchResults = yield globber.glob();
        /*
          Files are saved with case insensitivity. Uploading both a.txt and A.txt will files to be overwritten
          Detect any files that could be overwritten for user awareness
        */
        const set = new Set();
        /*
          Directories will be rejected if attempted to be uploaded. This includes just empty
          directories so filter any directories out from the raw search results
        */
        for (const searchResult of rawSearchResults) {
            const fileStats = yield stats(searchResult);
            // isDirectory() returns false for symlinks if using fs.lstat(), make sure to use fs.stat() instead
            if (!fileStats.isDirectory()) {
                (0, core_1.debug)(`File:${searchResult} was found using the provided searchPath`);
                searchResults.push(searchResult);
                // detect any files that would be overwritten because of case insensitivity
                if (set.has(searchResult.toLowerCase())) {
                    (0, core_1.info)(`Uploads are case insensitive: ${searchResult} was detected that it will be overwritten by another file with the same path`);
                }
                else {
                    set.add(searchResult.toLowerCase());
                }
            }
            else {
                (0, core_1.debug)(`Removing ${searchResult} from rawSearchResults because it is a directory`);
            }
        }
        // Calculate the root directory for the artifact using the search paths that were utilized
        const searchPaths = globber.getSearchPaths();
        if (searchPaths.length > 1) {
            (0, core_1.info)(`Multiple search paths detected. Calculating the least common ancestor of all paths`);
            const lcaSearchPath = getMultiPathLCA(searchPaths);
            (0, core_1.info)(`The least common ancestor is ${lcaSearchPath}. This will be the root directory of the artifact`);
            return {
                file: searchResults[0],
                rootDirectory: lcaSearchPath
            };
        }
        /*
          Special case for a single file artifact that is uploaded without a directory or wildcard pattern. The directory structure is
          not preserved and the root directory will be the single files parent directory
        */
        if (searchResults.length === 1 && searchPaths[0] === searchResults[0]) {
            return {
                file: searchResults[0],
                rootDirectory: (0, path_1.dirname)(searchResults[0])
            };
        }
        return {
            file: '',
            rootDirectory: searchPaths[0]
        };
    });
}
exports.findFilesToUpload = findFilesToUpload;
