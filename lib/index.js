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
const core = __importStar(require("@actions/core"));
const search_1 = require("./search");
const input_helper_1 = require("./input-helper");
const constants_1 = require("./constants");
function run() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const inputs = (0, input_helper_1.getInputs)();
            const searchResult = yield (0, search_1.findFilesToUpload)(inputs.searchPath);
            if (searchResult.file.length > 1) {
                const apk_reader = require('node-apk-parser');
                const reader = apk_reader.readFile(searchResult.file);
                const manifest = reader.readManifestSync();
                console.log(`version name = ${manifest.versionName}`);
                console.log(`version code = ${manifest.versionCode}`);
                core.setOutput(constants_1.Outputs.VersionName, manifest.versionName);
                core.setOutput(constants_1.Outputs.VersionCode, manifest.versionCode);
            }
            else {
                throw new Error("apk file not found in mentioned path");
            }
        }
        catch (error) {
            if (error instanceof Error)
                core.setFailed(error.message);
        }
    });
}
run();
