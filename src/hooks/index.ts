export class MachineHooksState {
    constructor(private transition: () => void) {}
    items: Hook[] = [];
    index = 0;
    useHistory = false;
    refreshMachine = () => this.transition();
}

abstract class Hook {
    abstract remove?: () => void;
    abstract guards?: any[];
    abstract handleCall: Function;
}

class StateHook<T> extends Hook {
    constructor(private refreshMachine: () => void, public value: T) {
        super();
    }
    setValue = (newVal: T) => {
        this.value = newVal;
        this.refreshMachine();
    };
    remove: undefined;
    guards: undefined;
    handleCall = (): [T, (newValue: T) => void] => [this.value, this.setValue];
}

class EffectHook extends Hook {
    constructor(
        private refreshMachine: () => void,
        effect: () => void | (() => void),
        public guards: any[]
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

    handleCall = (effect: () => void | (() => void), guards: any[]) => {
        if (this.guards.length !== guards.length) {
            this.remove();
            this.cleanup = effect();
            this.guards = guards;
        }
        for (let i = 0; i < guards.length; i++) {
            if (Object.is(guards[i], this.guards[i]) === false) {
                this.remove();
                this.cleanup = effect();
                this.guards = guards;
                break;
            }
        }
    };
}

class MemoHook<T> extends Hook {
    constructor(private refreshMachine: () => void, private value: T, public guards: any[]) {
        super();
    }

    remove: undefined;

    handleCall = (value: T, guards: any[]): T => {
        if (this.guards.length !== guards.length) {
            this.value = value;
        }
        for (let i = 0; i < guards.length; i++) {
            if (Object.is(guards[i], this.guards[i]) === false) {
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

export const useState = <T>(defaultValue: T): [T, (newValue: T) => void] => {
    if (getCurrentHookState() === undefined) {
        throw new Error('There was no hook state, this indicates a problem in Idaho.');
    }

    const { items, index, refreshMachine } = getCurrentHookState();
    incrementCurrentHook();
    if (items.length <= index) {
        items[index] = new StateHook(refreshMachine, defaultValue);
    }
    const hook = items[index] as StateHook<T>;

    return hook.handleCall();
};

export const useEffect = (effect: () => void | (() => void), guards: any[]): void => {
    if (getCurrentHookState() === undefined) {
        throw new Error('There was no hook state, this indicates a problem in Idaho.');
    }

    const { items, index, refreshMachine } = getCurrentHookState();
    incrementCurrentHook();
    if (items.length <= index) {
        items[index] = new EffectHook(refreshMachine, effect, guards);
    } else {
        const hook = items[index] as EffectHook;
        hook.handleCall(effect, guards);
    }
};

export const useMemo = <T>(value: T, guards: any[]) => {
    if (getCurrentHookState() === undefined) {
        throw new Error('There was no hook state, this indicates a problem in Idaho.');
    }

    const { items, index, refreshMachine } = getCurrentHookState();
    incrementCurrentHook();
    if (items.length <= index) {
        items[index] = new MemoHook(refreshMachine, value, guards);
    }
    const hook = items[index] as MemoHook<T>;

    return hook.handleCall(value, guards);
};

export const useHistory = (value: boolean) => {
    if (getCurrentHookState() === undefined) {
        throw new Error('There was no hook state, this indicates a problem in Idaho.');
    }

    const currentHookState = getCurrentHookState();
    currentHookState.useHistory = value;
};
