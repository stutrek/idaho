(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "./src/State", "./src/Machine", "./src/HookMachine", "./src/hooks/classes"], factory);
    }
})(function (require, exports) {
    "use strict";
    function __export(m) {
        for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
    }
    exports.__esModule = true;
    __export(require("./src/State"));
    __export(require("./src/Machine"));
    __export(require("./src/HookMachine"));
    __export(require("./src/hooks/classes"));
});
//# sourceMappingURL=index.js.map