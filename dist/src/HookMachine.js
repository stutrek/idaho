(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "events", "./hooks", "./hooks"], factory);
    }
})(function (require, exports) {
    "use strict";
    exports.__esModule = true;
    var events_1 = require("events");
    var hooks_1 = require("./hooks");
    var hooks_2 = require("./hooks");
    exports.useState = hooks_2.useState;
    exports.useEffect = hooks_2.useEffect;
    exports.useMemo = hooks_2.useMemo;
    exports.useHistory = hooks_2.useHistory;
    var shallowCompare = function (obj1, obj2) {
        return Object.keys(obj1).length === Object.keys(obj2).length &&
            Object.keys(obj1).every(function (key) { return obj1[key] === obj2[key]; });
    };
    var HookMachine = (function () {
        function HookMachine(states, initialState, data) {
            var _this = this;
            this.states = states;
            this.data = data;
            this.histories = new Map();
            this.runState = function (state) {
                _this.hooksState.index = 0;
                hooks_1.machineHooksStack.push(_this.hooksState);
                var updated = _this.states[state](_this.transition, _this.data);
                hooks_1.machineHooksStack.pop();
                return updated;
            };
            this.transition = function (nextState) {
                if (nextState === void 0) { nextState = _this.current.name; }
                if (nextState !== _this.current.name) {
                    for (var _i = 0, _a = _this.hooksState.items; _i < _a.length; _i++) {
                        var _b = _a[_i], remove = _b.remove, guards = _b.guards;
                        if (remove !== undefined) {
                            remove();
                            if (_this.hooksState.useHistory && guards !== undefined) {
                                guards.length = 0;
                                guards.push({});
                            }
                        }
                    }
                    if (_this.hooksState.useHistory) {
                        _this.histories.set(_this.current.name, _this.hooksState);
                    }
                    if (_this.histories.has(nextState)) {
                        _this.hooksState = _this.histories.get(nextState);
                    }
                    else {
                        _this.hooksState = new hooks_1.MachineHooksState(_this.transition);
                    }
                }
                var updated = _this.runState(nextState);
                var stateChanged = nextState !== _this.current.name;
                var dataChanged = shallowCompare(updated, _this.current.data) === false;
                if (stateChanged || dataChanged) {
                    _this.current = {
                        name: nextState,
                        data: updated
                    };
                }
                if (stateChanged) {
                    _this.emit('statechange', _this.current);
                }
                if (dataChanged) {
                    _this.emit('datachange', _this.current);
                }
                if (stateChanged || dataChanged) {
                    _this.emit('change', _this.current);
                }
            };
            this.hooksState = new hooks_1.MachineHooksState(this.transition);
            var emitter = new events_1.EventEmitter();
            this.on = emitter.on.bind(emitter);
            this.off = emitter.off.bind(emitter);
            this.emit = emitter.emit.bind(emitter);
            this.current = {
                name: initialState,
                data: this.runState(initialState)
            };
        }
        return HookMachine;
    }());
    exports.HookMachine = HookMachine;
});
//# sourceMappingURL=HookMachine.js.map