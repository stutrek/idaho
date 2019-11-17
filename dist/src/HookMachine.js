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
    var shallowCompare = function (obj1, obj2) {
        return Object.keys(obj1).length === Object.keys(obj2).length &&
            Object.keys(obj1).every(function (key) { return obj1[key] === obj2[key]; });
    };
    var StateHook = (function () {
        function StateHook(refreshMachine, value) {
            var _this = this;
            this.refreshMachine = refreshMachine;
            this.value = value;
            this.setValue = function (newVal) {
                _this.value = newVal;
                _this.refreshMachine();
            };
            this.handleCall = function () { return [_this.value, _this.setValue]; };
        }
        return StateHook;
    }());
    var EffectHook = (function () {
        function EffectHook(refreshMachine, effect, guards) {
            var _this = this;
            this.refreshMachine = refreshMachine;
            this.guards = guards;
            this.remove = function () {
                if (_this.cleanup !== undefined) {
                    _this.cleanup();
                }
            };
            this.cleanup = effect();
        }
        EffectHook.prototype.handleCall = function (effect, guards) {
            if (this.guards.length !== guards.length) {
                this.remove();
                this.cleanup = effect();
                this.guards = guards;
            }
            for (var i = 0; i < guards.length; i++) {
                if (Object.is(guards[i], this.guards[i]) === false) {
                    this.remove();
                    this.cleanup = effect();
                    this.guards = guards;
                    break;
                }
            }
        };
        return EffectHook;
    }());
    var machineHooksStack = [];
    var getCurrentHookState = function () { return machineHooksStack[machineHooksStack.length - 1]; };
    var incrementCurrentHook = function () {
        var machineHook = getCurrentHookState();
        machineHook.index += 1;
    };
    exports.useState = function (defaultValue) {
        if (getCurrentHookState() === undefined) {
            throw new Error('There was no hook state, this indicates a problem in Idaho.');
        }
        var _a = getCurrentHookState(), items = _a.items, index = _a.index, refreshMachine = _a.refreshMachine;
        incrementCurrentHook();
        if (items.length <= index) {
            items[index] = new StateHook(refreshMachine, defaultValue);
        }
        var hook = items[index];
        return hook.handleCall();
    };
    exports.useEffect = function (effect, guards) {
        if (getCurrentHookState() === undefined) {
            throw new Error('There was no hook state, this indicates a problem in Idaho.');
        }
        var _a = getCurrentHookState(), items = _a.items, index = _a.index, refreshMachine = _a.refreshMachine;
        incrementCurrentHook();
        if (items.length <= index) {
            items[index] = new EffectHook(refreshMachine, effect, guards);
        }
        else {
            var hook = items[index];
            hook.handleCall(effect, guards);
        }
    };
    var HookMachine = (function () {
        function HookMachine(states, initialState, data) {
            var _this = this;
            this.states = states;
            this.data = data;
            this.runState = function (state) {
                _this.hooksState.index = 0;
                machineHooksStack.push(_this.hooksState);
                var updated = _this.states[state](_this.transition, _this.data);
                machineHooksStack.pop();
                return updated;
            };
            this.transition = function (nextState) {
                if (nextState === void 0) { nextState = _this.current.name; }
                if (nextState !== _this.current.name) {
                    for (var _i = 0, _a = _this.hooksState.items; _i < _a.length; _i++) {
                        var remove = _a[_i].remove;
                        if (remove !== undefined) {
                            remove();
                        }
                    }
                    _this.hooksState.items.length = 0;
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
            this.hooksState = {
                items: [],
                index: 0,
                refreshMachine: function () { return _this.transition(); }
            };
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