"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NoFileOptions = exports.Outputs = exports.Inputs = void 0;
var Inputs;
(function (Inputs) {
    Inputs["Name"] = "name";
    Inputs["Path"] = "path";
})(Inputs = exports.Inputs || (exports.Inputs = {}));
var Outputs;
(function (Outputs) {
    Outputs["VersionName"] = "version-name";
    Outputs["VersionCode"] = "version-code";
})(Outputs = exports.Outputs || (exports.Outputs = {}));
var NoFileOptions;
(function (NoFileOptions) {
    /**
     * Default. Output a warning but do not fail the action
     */
    NoFileOptions["warn"] = "warn";
    /**
     * Fail the action with an error message
     */
    NoFileOptions["error"] = "error";
    /**
     * Do not output any warnings or errors, the action does not fail
     */
    NoFileOptions["ignore"] = "ignore";
})(NoFileOptions = exports.NoFileOptions || (exports.NoFileOptions = {}));
