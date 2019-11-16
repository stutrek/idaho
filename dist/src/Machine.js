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
    var Machine = (function () {
        function Machine(State, parent) {
            this.State = State;
            this.parent = parent;
            this.histories = new Map();
            this.effectClearers = [];
            var emitter = new events_1.EventEmitter();
            this.on = emitter.on.bind(emitter);
            this.off = emitter.off.bind(emitter);
            this.emit = emitter.emit.bind(emitter);
            if (State === undefined && this.initialState !== undefined) {
                this.transition(this.initialState);
            }
            else if (State !== undefined) {
                this.transition(State);
            }
            else {
                throw new Error('Machine needs either a state passed it on an initialState');
            }
        }
        Machine.prototype.setData = function (newData) {
            this.data = __assign(__assign({}, this.data), newData);
            this.emit('data-change', this.data);
        };
        Machine.prototype.transition = function (NextState) {
            var _this = this;
            for (var _i = 0, _a = this.effectClearers; _i < _a.length; _i++) {
                var clearer = _a[_i];
                if (clearer) {
                    clearer();
                }
            }
            if (this.histories.has(NextState)) {
                var history_1 = this.histories.get(NextState);
                this.current = history_1;
            }
            else {
                this.current = new NextState(this);
            }
            if (this.current.effects) {
                this.effectClearers = this.current.effects.map(function (effect) { return effect(_this); });
            }
            else {
                this.effectClearers = [];
            }
            this.emit('transition', this);
            if (this.parent) {
                this.parent.receiveChildTransition(this);
            }
        };
        Machine.prototype.receiveChildTransition = function (machine) {
            this.emit('child-transition', machine);
            if (this.parent) {
                this.parent.receiveChildTransition(machine);
            }
        };
        return Machine;
    }());
    exports.Machine = Machine;
});
//# sourceMappingURL=Machine.js.map