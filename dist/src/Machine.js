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
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
import { EventEmitter } from 'events';
import { machineHooksStack, MachineHooksState } from './hooks';
import { Final } from './hooks/classes';
import { Control } from './ControlObject';
var Machine = (function () {
    function Machine(states, initialState, data) {
        var _this = this;
        this.states = states;
        this.data = data;
        this.stateArgs = [];
        this.isTransitioning = false;
        this.histories = new Map();
        this.resolve = function () { return undefined; };
        this.reject = function () { return undefined; };
        this.resolved = false;
        this.rejected = false;
        this.runState = function (state, control, args) {
            if (args === void 0) { args = undefined; }
            if (_this.rejected || _this.resolved) {
                return;
            }
            _this.hooksState.index = 0;
            var updated;
            try {
                machineHooksStack.push(_this.hooksState);
                updated = state.apply(void 0, __spreadArrays([control], args));
                machineHooksStack.pop();
            }
            catch (e) {
                _this.rejected = true;
                _this.reject(e);
                throw e;
            }
            return updated;
        };
        this.transition = function (nextStateName) {
            var args = [];
            for (var _i = 1; _i < arguments.length; _i++) {
                args[_i - 1] = arguments[_i];
            }
            if (_this.rejected || _this.resolved) {
                return;
            }
            _this.isTransitioning = true;
            var isStateChange = nextStateName !== _this.stateName;
            _this.stateArgs = args;
            var stateData = _this.data;
            var control = new Control(_this, nextStateName);
            if (isStateChange) {
                for (var _a = 0, _b = _this.hooksState.items; _a < _b.length; _a++) {
                    var _c = _b[_a], remove = _c.remove, dependencies = _c.dependencies;
                    if (remove !== undefined) {
                        remove();
                        if (_this.hooksState.useHistory && dependencies !== undefined) {
                            dependencies.length = 0;
                            dependencies.push({});
                        }
                    }
                }
                if (_this.hooksState.useHistory) {
                    _this.histories.set(_this.stateName, _this.hooksState);
                }
                if (_this.histories.has(nextStateName)) {
                    _this.hooksState = _this.histories.get(nextStateName);
                }
                else {
                    _this.hooksState = new MachineHooksState(function () {
                        _this.state = _this.runState(_this.states[nextStateName], control, args);
                        _this.emit('change', _this);
                    });
                }
            }
            var nextStateValue = _this.runState(_this.states[nextStateName], control, args);
            if (control.isActive) {
                _this.isTransitioning = false;
                _this.state = nextStateValue;
                _this.stateName = nextStateName;
                var dataChanged = _this.data !== stateData;
                if (isStateChange) {
                    _this.emit('statechange', _this);
                }
                if (dataChanged) {
                    _this.emit('datachange', _this);
                }
                _this.emit('change', _this);
                if (nextStateValue instanceof Final) {
                    _this.resolved = true;
                    _this.resolve(nextStateValue.value);
                }
            }
        };
        this.hooksState = new MachineHooksState(function () {
            _this.transition.apply(_this, __spreadArrays([_this.stateName], _this.stateArgs));
        });
        var internalPromise = new Promise(function (resolve, reject) {
            _this.resolve = resolve;
            _this.reject = reject;
        });
        this.then = internalPromise.then.bind(internalPromise);
        this["catch"] = internalPromise["catch"].bind(internalPromise);
        this["finally"] = internalPromise["finally"].bind(internalPromise);
        var emitter = new EventEmitter();
        this.on = emitter.on.bind(emitter);
        this.off = emitter.off.bind(emitter);
        this.emit = emitter.emit.bind(emitter);
        this.transition(initialState);
    }
    Machine.prototype.setData = function (newData) {
        this.data = __assign(__assign({}, this.data), newData);
        if (this.isTransitioning === false) {
            this.emit('datachange', this);
            this.emit('change', this);
        }
    };
    return Machine;
}());
export { Machine };
//# sourceMappingURL=Machine.js.map