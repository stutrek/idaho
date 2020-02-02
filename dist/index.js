(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "./src/Machine", "./src/ControlObject", "./src/hooks/index", "./src/hooks/classes"], factory);
    }
})(function (require, exports) {
    "use strict";
    function __export(m) {
        for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
    }
    exports.__esModule = true;
    __export(require("./src/Machine"));
    __export(require("./src/ControlObject"));
    __export(require("./src/hooks/index"));
    __export(require("./src/hooks/classes"));
});
//# sourceMappingURL=index.js.map