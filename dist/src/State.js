var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "events"], factory);
    }
})(function (require, exports) {
    "use strict";
    exports.__esModule = true;
    var events_1 = require("events");
    var State = (function () {
        function State(machine) {
            this.machine = machine;
            var emitter = new events_1.EventEmitter();
            this.on = emitter.on.bind(emitter);
            this.off = emitter.off.bind(emitter);
            this.emit = emitter.emit.bind(emitter);
        }
        State.prototype.setData = function (newData) {
            var _this = this;
            if (!this.nextData) {
                this.nextData = newData;
                Promise.resolve().then(function () {
                    _this.data = __assign(__assign({}, _this.data), _this.nextData);
                    _this.nextData = undefined;
                    _this.emit('change', _this.data);
                });
            }
            else {
                this.nextData = __assign(__assign({}, this.nextData), newData);
            }
        };
        return State;
    }());
    exports.State = State;
});
//# sourceMappingURL=State.js.map