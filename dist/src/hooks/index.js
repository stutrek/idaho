"use strict";
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
exports.__esModule = true;
var MachineHooksState = (function () {
    function MachineHooksState(refreshMachine) {
        this.refreshMachine = refreshMachine;
        this.items = [];
        this.index = 0;
        this.useHistory = false;
    }
    return MachineHooksState;
}());
exports.MachineHooksState = MachineHooksState;
var Hook = (function () {
    function Hook() {
    }
    return Hook;
}());
var StateDataHook = (function (_super) {
    __extends(StateDataHook, _super);
    function StateDataHook(refreshMachine, value) {
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
    return StateDataHook;
}(Hook));
var EffectHook = (function (_super) {
    __extends(EffectHook, _super);
    function EffectHook(refreshMachine, effect, dependencies) {
        var _this = _super.call(this) || this;
        _this.refreshMachine = refreshMachine;
        _this.dependencies = dependencies;
        _this.remove = function () {
            if (typeof _this.cleanup === 'function') {
                _this.cleanup();
            }
        };
        _this.handleCall = function (effect, dependencies) {
            if (_this.dependencies.length !== dependencies.length) {
                _this.remove();
                _this.cleanup = effect();
                _this.dependencies = dependencies;
                return;
            }
            for (var i = 0; i < dependencies.length; i++) {
                if (Object.is(dependencies[i], _this.dependencies[i]) === false) {
                    _this.remove();
                    _this.cleanup = effect();
                    _this.dependencies = dependencies;
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
    function MemoHook(refreshMachine, value, dependencies) {
        var _this = _super.call(this) || this;
        _this.refreshMachine = refreshMachine;
        _this.value = value;
        _this.dependencies = dependencies;
        _this.handleCall = function (value, dependencies) {
            if (_this.dependencies.length !== dependencies.length) {
                _this.value = value;
            }
            for (var i = 0; i < dependencies.length; i++) {
                if (Object.is(dependencies[i], _this.dependencies[i]) === false) {
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
exports.useStateData = function (defaultValue) {
    if (getCurrentHookState() === undefined) {
        throw new Error('There was no hook state, this indicates a problem in Idaho.');
    }
    var _a = getCurrentHookState(), items = _a.items, index = _a.index, refreshMachine = _a.refreshMachine;
    incrementCurrentHook();
    if (items.length <= index) {
        items[index] = new StateDataHook(refreshMachine, defaultValue);
    }
    var hook = items[index];
    return hook.handleCall();
};
exports.useEffect = function (effect, dependencies) {
    if (getCurrentHookState() === undefined) {
        throw new Error('There was no hook state, this indicates a problem in Idaho.');
    }
    var _a = getCurrentHookState(), items = _a.items, index = _a.index, refreshMachine = _a.refreshMachine;
    incrementCurrentHook();
    if (items.length <= index) {
        items[index] = new EffectHook(refreshMachine, effect, dependencies);
    }
    else {
        var hook = items[index];
        hook.handleCall(effect, dependencies);
    }
};
exports.useMemo = function (value, dependencies) {
    if (getCurrentHookState() === undefined) {
        throw new Error('There was no hook state, this indicates a problem in Idaho.');
    }
    var _a = getCurrentHookState(), items = _a.items, index = _a.index, refreshMachine = _a.refreshMachine;
    incrementCurrentHook();
    if (items.length <= index) {
        items[index] = new MemoHook(refreshMachine, value, dependencies);
    }
    var hook = items[index];
    return hook.handleCall(value, dependencies);
};
exports.useHistory = function (value) {
    if (getCurrentHookState() === undefined) {
        throw new Error('There was no hook state, this indicates a problem in Idaho.');
    }
    var currentHookState = getCurrentHookState();
    currentHookState.useHistory = value;
};
//# sourceMappingURL=index.js.map