var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
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
    var MachineHooksState = (function () {
        function MachineHooksState(transition) {
            var _this = this;
            this.transition = transition;
            this.items = [];
            this.index = 0;
            this.useHistory = false;
            this.refreshMachine = function () { return _this.transition(); };
        }
        return MachineHooksState;
    }());
    exports.MachineHooksState = MachineHooksState;
    var Hook = (function () {
        function Hook() {
        }
        return Hook;
    }());
    var StateHook = (function (_super) {
        __extends(StateHook, _super);
        function StateHook(refreshMachine, value) {
            var _this = _super.call(this) || this;
            _this.refreshMachine = refreshMachine;
            _this.value = value;
            _this.setValue = function (newVal) {
                _this.value = newVal;
                _this.refreshMachine();
            };
            _this.handleCall = function () { return [_this.value, _this.setValue]; };
            return _this;
        }
        return StateHook;
    }(Hook));
    var EffectHook = (function (_super) {
        __extends(EffectHook, _super);
        function EffectHook(refreshMachine, effect, guards) {
            var _this = _super.call(this) || this;
            _this.refreshMachine = refreshMachine;
            _this.guards = guards;
            _this.remove = function () {
                if (_this.cleanup !== undefined) {
                    _this.cleanup();
                }
            };
            _this.handleCall = function (effect, guards) {
                if (_this.guards.length !== guards.length) {
                    _this.remove();
                    _this.cleanup = effect();
                    _this.guards = guards;
                }
                for (var i = 0; i < guards.length; i++) {
                    if (Object.is(guards[i], _this.guards[i]) === false) {
                        _this.remove();
                        _this.cleanup = effect();
                        _this.guards = guards;
                        break;
                    }
                }
            };
            _this.cleanup = effect();
            return _this;
        }
        return EffectHook;
    }(Hook));
    var MemoHook = (function (_super) {
        __extends(MemoHook, _super);
        function MemoHook(refreshMachine, value, guards) {
            var _this = _super.call(this) || this;
            _this.refreshMachine = refreshMachine;
            _this.value = value;
            _this.guards = guards;
            _this.handleCall = function (value, guards) {
                if (_this.guards.length !== guards.length) {
                    _this.value = value;
                }
                for (var i = 0; i < guards.length; i++) {
                    if (Object.is(guards[i], _this.guards[i]) === false) {
                        _this.value = value;
                        break;
                    }
                }
                return _this.value;
            };
            return _this;
        }
        return MemoHook;
    }(Hook));
    exports.machineHooksStack = [];
    var getCurrentHookState = function () { return exports.machineHooksStack[exports.machineHooksStack.length - 1]; };
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
    exports.useMemo = function (value, guards) {
        if (getCurrentHookState() === undefined) {
            throw new Error('There was no hook state, this indicates a problem in Idaho.');
        }
        var _a = getCurrentHookState(), items = _a.items, index = _a.index, refreshMachine = _a.refreshMachine;
        incrementCurrentHook();
        if (items.length <= index) {
            items[index] = new MemoHook(refreshMachine, value, guards);
        }
        var hook = items[index];
        return hook.handleCall(value, guards);
    };
    exports.useHistory = function (value) {
        if (getCurrentHookState() === undefined) {
            throw new Error('There was no hook state, this indicates a problem in Idaho.');
        }
        var currentHookState = getCurrentHookState();
        currentHookState.useHistory = value;
    };
});
//# sourceMappingURL=index.js.map