(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "events", "./hooks", "./hooks/classes", "./hooks"], factory);
    }
})(function (require, exports) {
    "use strict";
    exports.__esModule = true;
    var events_1 = require("events");
    var hooks_1 = require("./hooks");
    var classes_1 = require("./hooks/classes");
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
            this.resolve = function () { return undefined; };
            this.reject = function () { return undefined; };
            this.runState = function (state) {
                if (typeof _this.states[state] !== 'function') {
                    throw new Error("Could not transition to unknown state " + state + ".");
                }
                _this.hooksState.index = 0;
                var updated;
                try {
                    hooks_1.machineHooksStack.push(_this.hooksState);
                    updated = _this.states[state](_this.transition, _this.data);
                    hooks_1.machineHooksStack.pop();
                }
                catch (e) {
                    hooks_1.machineHooksStack.pop();
                    if (e instanceof classes_1.Guard && e.nextState in _this.states) {
                        return _this.runState(e.nextState);
                    }
                    throw e;
                }
                return { finalState: state, updated: updated };
            };
            this.transition = function (nextState) {
                if (nextState === void 0) { nextState = _this.current.name; }
                if (nextState !== _this.current.name) {
                    for (var _i = 0, _a = _this.hooksState.items; _i < _a.length; _i++) {
                        var _b = _a[_i], remove = _b.remove, dependencies = _b.dependencies;
                        if (remove !== undefined) {
                            remove();
                            if (_this.hooksState.useHistory && dependencies !== undefined) {
                                dependencies.length = 0;
                                dependencies.push({});
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
                var _c = _this.runState(nextState), finalState = _c.finalState, updated = _c.updated;
                var stateChanged = finalState !== _this.current.name;
                var dataChanged = shallowCompare(updated, _this.current.data) === false;
                if (stateChanged || dataChanged) {
                    _this.current = {
                        name: finalState,
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
                if (updated instanceof classes_1.Final) {
                    _this.resolve(updated.data);
                }
            };
            this.hooksState = new hooks_1.MachineHooksState(this.transition);
            var internalPromise = new Promise(function (resolve, reject) {
                _this.resolve = resolve;
                _this.reject = reject;
            });
            this.then = internalPromise.then.bind(internalPromise);
            this["catch"] = internalPromise["catch"].bind(internalPromise);
            this["finally"] = internalPromise["finally"].bind(internalPromise);
            var emitter = new events_1.EventEmitter();
            this.on = emitter.on.bind(emitter);
            this.off = emitter.off.bind(emitter);
            this.emit = emitter.emit.bind(emitter);
            var initial = this.runState(initialState);
            this.currentName = initial.finalState;
            this.current = initial.updated;
        }
        return HookMachine;
    }());
    exports.HookMachine = HookMachine;
});
//# sourceMappingURL=HookMachine.js.map