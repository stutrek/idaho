"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class MachineHooksState {
    constructor(refreshMachine) {
        this.refreshMachine = refreshMachine;
        this.items = [];
        this.index = 0;
        this.useHistory = false;
    }
}
exports.MachineHooksState = MachineHooksState;
class Hook {
}
class StateDataHook extends Hook {
    constructor(refreshMachine, value) {
        super();
        this.refreshMachine = refreshMachine;
        this.value = value;
        this.setValue = (newVal) => {
            this.value = newVal;
            this.refreshMachine();
        };
        this.handleCall = () => [this.value, this.setValue];
    }
}
class EffectHook extends Hook {
    constructor(refreshMachine, effect, dependencies) {
        super();
        this.refreshMachine = refreshMachine;
        this.dependencies = dependencies;
        this.remove = () => {
            if (typeof this.cleanup !== undefined) {
                this.cleanup.then(cleanUpFnOrVoid => {
                    if (typeof cleanUpFnOrVoid === 'function') {
                        cleanUpFnOrVoid();
                    }
                });
            }
        };
        this.handleCall = (effect, dependencies) => {
            if (this.dependencies.length !== dependencies.length) {
                this.remove();
                this.cleanup = new Promise(resolve => {
                    resolve(effect());
                });
                this.dependencies = dependencies;
                return;
            }
            for (let i = 0; i < dependencies.length; i++) {
                if (Object.is(dependencies[i], this.dependencies[i]) === false) {
                    this.remove();
                    this.cleanup = new Promise(resolve => {
                        resolve(effect());
                    });
                    this.dependencies = dependencies;
                    break;
                }
            }
        };
        this.dependencies = dependencies;
        this.cleanup = Promise.resolve().then(effect);
    }
}
class MemoHook extends Hook {
    constructor(refreshMachine, callback, dependencies) {
        super();
        this.refreshMachine = refreshMachine;
        this.callback = callback;
        this.dependencies = dependencies;
        this.handleCall = (cb, dependencies) => {
            if (this.dependencies.length !== dependencies.length) {
                this.value = cb();
            }
            else {
                for (let i = 0; i < dependencies.length; i++) {
                    if (Object.is(dependencies[i], this.dependencies[i]) === false) {
                        this.value = cb();
                        break;
                    }
                }
            }
            return this.value;
        };
        this.value = callback();
    }
}
exports.machineHooksStack = [];
const getCurrentHookState = () => exports.machineHooksStack[exports.machineHooksStack.length - 1];
const incrementCurrentHook = () => {
    const machineHook = getCurrentHookState();
    machineHook.index += 1;
};
exports.useStateData = (defaultValue) => {
    if (getCurrentHookState() === undefined) {
        throw new Error('There was no hook state, this indicates a problem in Idaho.');
    }
    const { items, index, refreshMachine } = getCurrentHookState();
    incrementCurrentHook();
    if (items.length <= index) {
        items[index] = new StateDataHook(refreshMachine, defaultValue);
    }
    const hook = items[index];
    return hook.handleCall();
};
exports.useEffect = (effect, dependencies) => {
    if (getCurrentHookState() === undefined) {
        throw new Error('There was no hook state, this indicates a problem in Idaho.');
    }
    const { items, index, refreshMachine } = getCurrentHookState();
    incrementCurrentHook();
    if (items.length <= index) {
        items[index] = new EffectHook(refreshMachine, effect, dependencies);
    }
    else {
        const hook = items[index];
        hook.handleCall(effect, dependencies);
    }
};
exports.useMemo = (callback, dependencies) => {
    if (getCurrentHookState() === undefined) {
        throw new Error('There was no hook state, this indicates a problem in Idaho.');
    }
    const { items, index, refreshMachine } = getCurrentHookState();
    incrementCurrentHook();
    if (items.length <= index) {
        items[index] = new MemoHook(refreshMachine, callback, dependencies);
    }
    const hook = items[index];
    return hook.handleCall(callback, dependencies);
};
exports.useHistory = (value = true) => {
    if (getCurrentHookState() === undefined) {
        throw new Error('There was no hook state, this indicates a problem in Idaho.');
    }
    const currentHookState = getCurrentHookState();
    currentHookState.useHistory = value;
};
//# sourceMappingURL=index.js.map