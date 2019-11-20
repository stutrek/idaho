(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports"], factory);
    }
})(function (require, exports) {
    "use strict";
    exports.__esModule = true;
    var Guard = (function () {
        function Guard(nextState) {
            this.nextState = nextState;
        }
        return Guard;
    }());
    exports.Guard = Guard;
    var Final = (function () {
        function Final(data) {
            this.data = data;
        }
        return Final;
    }());
    exports.Final = Final;
});
//# sourceMappingURL=classes.js.map