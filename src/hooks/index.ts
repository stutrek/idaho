export class MachineHooksState {
    constructor(public refreshMachine: () => void) {}
    items: Hook[] = [];
    index = 0;
    useHistory = false;
}

abstract class Hook {
    abstract remove?: () => void;
    abstract dependencies?: any[];
    abstract handleCall: Function;
}

class StateDataHook<T> extends Hook {
    constructor(private refreshMachine: () => void, public value: T) {
        super();
    }
    setValue = (newVal: T) => {
        this.value = newVal;
        this.refreshMachine();
    };
    remove: undefined;
    dependencies: undefined;
    handleCall = (): [T, (newValue: T) => void] => [this.value, this.setValue];
}

class EffectHook extends Hook {
    constructor(
        private refreshMachine: () => void,
        effect: () => void | (() => void),
        public dependencies: any[]
    ) {
        super();
        this.cleanup = effect();
    }

    private cleanup: void | (() => void);

    remove = () => {
        if (typeof this.cleanup === 'function') {
            this.cleanup();
        }
    };

    handleCall = (effect: () => void | (() => void), dependencies: any[]) => {
        if (this.dependencies.length !== dependencies.length) {
            this.remove();
            this.cleanup = effect();
            this.dependencies = dependencies;
        }
        for (let i = 0; i < dependencies.length; i++) {
            if (Object.is(dependencies[i], this.dependencies[i]) === false) {
                this.remove();
                this.cleanup = effect();
                this.dependencies = dependencies;
                break;
            }
        }
    };
}

class MemoHook<T> extends Hook {
    constructor(private refreshMachine: () => void, private value: T, public dependencies: any[]) {
        super();
    }

    remove: undefined;

    handleCall = (value: T, dependencies: any[]): T => {
        if (this.dependencies.length !== dependencies.length) {
            this.value = value;
        }
        for (let i = 0; i < dependencies.length; i++) {
            if (Object.is(dependencies[i], this.dependencies[i]) === false) {
                this.value = value;
                break;
            }
        }
        return this.value;
    };
}

export const machineHooksStack: MachineHooksState[] = [];
const getCurrentHookState = () => machineHooksStack[machineHooksStack.length - 1];
const incrementCurrentHook = () => {
    const machineHook = getCurrentHookState();
    machineHook.index += 1;
};

export const useStateData = <T>(defaultValue: T): [T, (newValue: T) => void] => {
    if (getCurrentHookState() === undefined) {
        throw new Error('There was no hook state, this indicates a problem in Idaho.');
    }

    const { items, index, refreshMachine } = getCurrentHookState();
    incrementCurrentHook();
    if (items.length <= index) {
        items[index] = new StateDataHook(refreshMachine, defaultValue);
    }
    const hook = items[index] as StateDataHook<T>;
    return hook.handleCall();
};

export const useEffect = (effect: () => void | (() => void), dependencies: any[]): void => {
    if (getCurrentHookState() === undefined) {
        throw new Error('There was no hook state, this indicates a problem in Idaho.');
    }

    const { items, index, refreshMachine } = getCurrentHookState();
    incrementCurrentHook();
    if (items.length <= index) {
        items[index] = new EffectHook(refreshMachine, effect, dependencies);
    } else {
        const hook = items[index] as EffectHook;
        hook.handleCall(effect, dependencies);
    }
};

export const useMemo = <T>(value: T, dependencies: any[]) => {
    if (getCurrentHookState() === undefined) {
        throw new Error('There was no hook state, this indicates a problem in Idaho.');
    }

    const { items, index, refreshMachine } = getCurrentHookState();
    incrementCurrentHook();
    if (items.length <= index) {
        items[index] = new MemoHook(refreshMachine, value, dependencies);
    }
    const hook = items[index] as MemoHook<T>;

    return hook.handleCall(value, dependencies);
};

export const useHistory = (value: boolean) => {
    if (getCurrentHookState() === undefined) {
        throw new Error('There was no hook state, this indicates a problem in Idaho.');
    }

    const currentHookState = getCurrentHookState();
    currentHookState.useHistory = value;
};
