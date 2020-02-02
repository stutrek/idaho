var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
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
    var Control = (function () {
        function Control(machine) {
            var _this = this;
            this.machine = machine;
            this.isActive = true;
            this.transition = function (nextState) {
                var _a;
                var args = [];
                for (var _i = 1; _i < arguments.length; _i++) {
                    args[_i - 1] = arguments[_i];
                }
                if (_this.isActive === false) {
                    throw new Error('Tried to transition from a state that Idaho has already exited. This is a noop, but could indicate a bug.');
                }
                _this.isActive = false;
                (_a = _this.machine).transition.apply(_a, __spreadArrays([nextState], args));
            };
            this.data = machine.data;
            this.setData = function (data) {
                if (_this.isActive === false) {
                    throw new Error('Tried to transition from a state that Idaho has already exited. This is a noop, but could indicate a bug.');
                }
                machine.setData(data);
            };
            this.previousState = machine.state;
            this.previousStateName = machine.stateName;
        }
        return Control;
    }());
    exports.Control = Control;
});
//# sourceMappingURL=ControlObject.js.map